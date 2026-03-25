const sequelize = require('./config/db');
const Student = require('./models/Student');
const Transaction = require('./models/Transaction');
const RebateRequest = require('./models/Rebate');
const Feedback = require('./models/Feedback');

async function testDatabase() {
  try {
    console.log('🔌 Connecting to Database...');
    await sequelize.authenticate();
    console.log('✅ Connection successful!\n');

    console.log('📊 TEST 1: Manager Dashboard Stats...');
    const totalStudents = await Student.count({ where: { messCardStatus: 'Active' } });
    const pendingRebates = await RebateRequest.count({ where: { status: 'Pending' } });
    console.log(`   -> Active Students: ${totalStudents}`);
    console.log(`   -> Pending Rebates: ${pendingRebates}\n`);

    console.log('💸 TEST 2: Monthly Bill for Roll No 240252...');
    const totalBill = await Transaction.sum('amount', { where: { studentRollNo: '240252' }});
    console.log(`   -> Total Bill: ₹${totalBill}\n`);

    console.log('⭐ TEST 3: Feedback Analytics...');
    const analytics = await Feedback.findAll({
      attributes: [
        'category',
        [sequelize.fn('COUNT', sequelize.col('feedbackId')), 'totalReviews'],
        [sequelize.fn('ROUND', sequelize.fn('AVG', sequelize.col('rating')), 1), 'averageRating']
      ],
      group: ['category']
    });
    console.table(analytics.map(a => a.toJSON())); 
    console.log('\n');

    console.log('🍔 TEST 4: Simulating Extra Item Purchase...');
    const purchase = await Transaction.create({
      studentRollNo: '240252',
      itemName: 'Fresh Juice',
      amount: 40.00,
      type: 'Extra Item',
      status: 'Completed',
      date: new Date()
    });
    console.log(`   -> Success! Transaction ID: ${purchase.transactionId}, Item: ${purchase.itemName}, Amount: ₹${purchase.amount}\n`);

    console.log('🎉 ALL DATABASE TESTS PASSED!');
    process.exit(0);

  } catch (error) {
    console.error('❌ TEST FAILED:', error);
    process.exit(1);
  }
}

testDatabase();