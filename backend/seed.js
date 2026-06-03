const bcrypt = require('bcryptjs');
const db = require('./db');

async function seedUsers() {

  try {

    const hashedPassword = await bcrypt.hash(
      'password123',
      10
    );

    await db.query(`
      INSERT INTO users
      (name, email, password, role)
      VALUES
      ('Ramesh Kumar', 'shift@pims.com', '${hashedPassword}', 'shift_incharge'),

      ('Suresh Gupta', 'hod@pims.com', '${hashedPassword}', 'hod'),

      ('Mahesh Singh', 'super@pims.com', '${hashedPassword}', 'superintendent'),

      ('Dinesh Sharma', 'hr@pims.com', '${hashedPassword}', 'hr'),

      ('Admin User', 'admin@pims.com', '${hashedPassword}', 'admin')
    `);

    console.log('Demo Users Inserted Successfully');

    process.exit();

  } catch (err) {

    console.log(err);

    process.exit();

  }

}

seedUsers();