const bcrypt = require('bcryptjs');
const db = require('./db');

async function seedUsers() {
  try {

    const shiftPass = await bcrypt.hash('shift123', 10);
    const hodPass = await bcrypt.hash('hod123', 10);
    const superPass = await bcrypt.hash('super123', 10);
    const hrPass = await bcrypt.hash('hr123', 10);
    const adminPass = await bcrypt.hash('admin123', 10);

    const [result] = await db.query(`
      INSERT INTO users
      (name, email, password, role)
      VALUES
      ('Ramesh Kumar', 'shift@pims.com', '${shiftPass}', 'shift_incharge'),

      ('Suresh Gupta', 'hod@pims.com', '${hodPass}', 'hod'),

      ('Mahesh Singh', 'super@pims.com', '${superPass}', 'superintendent'),

      ('Dinesh Sharma', 'hr@pims.com', '${hrPass}', 'hr'),

      ('Admin User', 'admin@pims.com', '${adminPass}', 'admin')
    `);

    console.log('Insert Result:');
    console.log(result);

    const [users] = await db.query(
      'SELECT id,name,email,role FROM users'
    );

    console.log('\nUsers Found:');
    console.table(users);

    console.log('\nDemo Users Inserted Successfully');

    process.exit();

  } catch (err) {

    console.log('ERROR OCCURRED');
    console.log(err);

    process.exit();

  }
}

seedUsers();