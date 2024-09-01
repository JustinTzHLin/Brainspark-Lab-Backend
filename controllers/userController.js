import bcrypt from "bcryptjs";
import pgDB from '../databases/pgDB.js';
const SALT_WORK_FACTOR = 10;

const userController = {};

/*
 * Verify User
 */
userController.verifyUser = async (req, res, next) => {
  console.log("In userController.verifyUser");

  // Destructure from prior middleware
  const { username, password } = req.body;
  try {

    // Query database for existing user with input username
    const verifyUserSQL = `SELECT * FROM users WHERE username=$1;`;
    const userData = await pgDB.query(verifyUserSQL, [username]);
    console.log('userData:', userData.rows);

    // Return error when usrename isn't existed
    if (userData.rows.length === 0) {
      console.log('User not existed.');
      return res.status(404).json({ err: 'User not found.' });
    }

    // Compare password using bcrypt
    const comparePasswordResult = await bcrypt.compare(password, userData.rows[0].password);
    if (comparePasswordResult) {

      // Update lest visited time after logging in
      const updateLastVisitedSQL = 'UPDATE users SET last_visited=CURRENT_TIMESTAMP WHERE username=$1 Returning *;';
      const newUserData = await pgDB.query(updateLastVisitedSQL, [username]);
      console.log('newUserData:', newUserData.rows);
      
      // Generate variables for next middleware
      res.locals.loggedInUser = newUserData.rows[0];
      res.locals.username = newUserData.rows[0].username;
      res.locals.userId = newUserData.rows[0].id;
      return next();
    } else {

      // Return error when password doesn't match
      console.log('Password is not valid');
      return res.status(401).json({ err: 'Invalid credentials.' });
    }
  } catch (err) {
    return next({
      log: `userController.verifyUser: ERROR ${err}`,
      status: 500,
      message: { error: 'Error occurred in userController.verifyUser'}
  })}
};

/*
 * Create User
 */
// userController.createUser = async (req, res, next) => {
//   console.log("In userController.createUser");

//   // Destructure from prior middleware
//   const { username, password, email } = req.body;
//   try {

//     // Query database for existing user with input username
//     const uniqueUserSQL = `SELECT * FROM users WHERE username=$1 AND oauth_provider=$2;`;
//     const uniqueUserData = await pgDB.query(uniqueUserSQL, [username, 'none']);
//     console.log('uniqueUserData:', uniqueUserData.rows[0]);
  
//     // Return error when usrename existed
//     if (uniqueUserData.rows.length !== 0) {
//       console.log('User existed.');
//       return next({
//         log: 'username was not unique',
//         status: 500,
//         message: { err: 'username already exists in database'}
//       })
//     }

//     // Hash password using bcrypt
//     const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // Create new user
//     const createUserSQL = 'INSERT INTO users(username, password, email) VALUES($1, $2, $3) Returning *;';
//     const newUserData = await pgDB.query(createUserSQL, [username, hashedPassword, email]);
//     console.log('newUserData:', newUserData.rows[0]);

//     // Generate variables for next middleware
//     res.locals.newUser = newUserData.rows[0];
//     res.locals.userId = newUserData.rows[0].id;
//     res.locals.username = newUserData.rows[0].username;
//     return next();
//   } catch (err) {
//     return next({
//       log: `userController.createUser: ERROR ${err}`,
//       status: 500,
//       message: { error: 'Error occurred in userController.createUser.'}
//     });
//   }
// };

// Export
export default userController;