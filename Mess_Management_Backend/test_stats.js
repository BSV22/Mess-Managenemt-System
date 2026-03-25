require('dotenv').config();
const db_controller = require('./src/models/db_controller');

async function test() {
  try {
    const stats = await db_controller.getManagerDashboardStats();
    console.log('Stats:', JSON.stringify(stats, null, 2));
  } catch (e) {
    console.error('Error:', e.message);
  }
  process.exit(0);
}
test();
