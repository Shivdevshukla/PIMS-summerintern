const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost',
  user: 'pims_user',
  password: 'pims123',
});

connection.connect((err) => {

  if (err) {
    console.log(err);
  } else {
    console.log('Connected Successfully');
  }

});
