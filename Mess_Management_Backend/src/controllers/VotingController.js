const Vote = require('../models/Vote');
const Menu = require('../models/Menu');
const { authenticateToken, requireStudent } = require('./AuthController');

// Submit a vote for a menu item
const submitVote = async (req, res) => {
  try {
    const rollNo = req.user.rollNo;
    const { menuId, voteType } = req.body;

    if (!menuId || !['up', 'down'].includes(voteType)) {
      return res.status(400).json({
        success: false,
        message: 'Valid menuId and voteType (up/down) are required.'
      });
    }

    // Check if menu exists
    const menu = await Menu.findByPk(menuId);
    if (!menu) {
      return res.status(404).json({
        success: false,
        message: 'Menu item not found.'
      });
    }

    // Create vote
    const vote = await Vote.create({
      studentRollNo: rollNo,
      menuId,
      voteType
    });

    // Update vote count on menu
    if (voteType === 'up') {
      menu.voteCount += 1;
    } else {
      menu.voteCount -= 1;
    }
    await menu.save();

    res.status(201).json({
      success: true,
      message: 'Vote submitted successfully.',
      data: vote
    });
  } catch (error) {
    console.error('Error submitting vote:', error);

    if (error.message === 'Student has already voted on this menu item.') {
      return res.status(400).json({
        success: false,
        message: error.message
      });
    }

    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};

// Get voting results for a specific date
const getVotingResults = async (req, res) => {
  try {
    const { date } = req.params;

    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required.'
      });
    }

    const menus = await Menu.findAll({
      where: { date },
      attributes: ['menuId', 'date', 'mealType', 'items', 'voteCount'],
      order: [['mealType', 'ASC']]
    });

    // For each menu, get vote breakdown
    const results = await Promise.all(
      menus.map(async (menu) => {
        const votes = await Vote.findAll({
          where: { menuId: menu.menuId },
          attributes: ['voteType']
        });

        const upVotes = votes.filter(v => v.voteType === 'up').length;
        const downVotes = votes.filter(v => v.voteType === 'down').length;

        return {
          menuId: menu.menuId,
          date: menu.date,
          mealType: menu.mealType,
          items: menu.items.split(','),
          totalVotes: upVotes + downVotes,
          upVotes,
          downVotes,
          netVotes: menu.voteCount
        };
      })
    );

    res.status(200).json({
      success: true,
      data: results
    });
  } catch (error) {
    console.error('Error fetching voting results:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};

// Get student's voting history
const getStudentVotes = async (req, res) => {
  try {
    const rollNo = req.user.rollNo;

    const votes = await Vote.findAll({
      where: { studentRollNo: rollNo },
      include: [{
        model: Menu,
        attributes: ['date', 'mealType', 'items']
      }],
      order: [['createdAt', 'DESC']]
    });

    const formattedVotes = votes.map(vote => ({
      voteId: vote.voteId,
      menuId: vote.menuId,
      date: vote.Menu?.date,
      mealType: vote.Menu?.mealType,
      items: vote.Menu?.items?.split(',') || [],
      voteType: vote.voteType,
      createdAt: vote.createdAt
    }));

    res.status(200).json({
      success: true,
      data: formattedVotes
    });
  } catch (error) {
    console.error('Error fetching student votes:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};

// Check if student has already voted on a menu
const checkVoteStatus = async (req, res) => {
  try {
    const rollNo = req.user.rollNo;
    const { menuId } = req.params;

    if (!menuId) {
      return res.status(400).json({
        success: false,
        message: 'menuId parameter is required.'
      });
    }

    const existingVote = await Vote.findOne({
      where: {
        studentRollNo: rollNo,
        menuId
      }
    });

    res.status(200).json({
      success: true,
      data: {
        hasVoted: !!existingVote,
        voteType: existingVote?.voteType || null
      }
    });
  } catch (error) {
    console.error('Error checking vote status:', error);
    res.status(500).json({
      success: false,
      message: 'Internal server error.'
    });
  }
};

module.exports = {
  submitVote,
  getVotingResults,
  getStudentVotes,
  checkVoteStatus
};
