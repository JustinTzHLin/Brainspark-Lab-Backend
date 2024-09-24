import bcrypt from "bcryptjs";
import pgDB from '../configs/pgDB.js';
//test
import transporter from "../configs/mail.js";
import jwt from "jsonwebtoken";

const SALT_WORK_FACTOR = 10;

const userController = {};

/*
 * Verify User
 */
userController.verifyUser = async (req, res, next) => {
  console.log("In userController.verifyUser");

  // Destructure from prior middleware
  const { email, password } = req.body;
  try {

    // Query database for existing user with input username
    const verifyUserSQL = `SELECT * FROM users WHERE email=$1;`;
    const userData = await pgDB.query(verifyUserSQL, [email]);
    console.log('userData:', userData.rows);

    // Return error when usrename isn't existed
    if (userData.rows.length === 0) {
      console.log('User not existed.');
      return next({
        log: `userController.verifyUser: ERROR: 'User not found.'`,
        status: 404,
        message: { error: 'Error occurred in userController.verifyUser', type: 'user_not_found'}
      })
    }

    // Compare password using bcrypt
    const comparePasswordResult = await bcrypt.compare(password, userData.rows[0].password);
    if (comparePasswordResult) {

      // Update lest visited time after logging in
      const updateLastVisitedSQL = 'UPDATE users SET last_visited=CURRENT_TIMESTAMP WHERE email=$1 Returning *;';
      const newUserData = await pgDB.query(updateLastVisitedSQL, [email]);
      console.log('newUserData:', newUserData.rows);
      
      // Generate variables for next middleware
      res.locals.loggedInUser = newUserData.rows[0];
      res.locals.email = newUserData.rows[0].email;
      res.locals.userId = newUserData.rows[0].id;
      return next();
    } else {

      // Return error when password doesn't match
      console.log('Password is not valid');
      return next({
        log: `userController.verifyUser: ERROR: 'Invalid credentials.'`,
        status: 401,
        message: { error: 'Error occurred in userController.verifyUser', type: 'invalid_credentials'}
    })}
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
userController.createUser = async (req, res, next) => {
  console.log("In userController.createUser");

  // Destructure from prior middleware
  const { username, password, email } = req.body;
  if (!email) {
    return next({
      log: `userController.createUser: ERROR ${err}`,
      status: 500,
      message: { error: 'Error occurred in userController.createUser'}
  })}
  try {

    // Query database for existing user with input username
    const uniqueEmailSQL = `SELECT * FROM users WHERE email=$1 AND oauth_provider=$2;`;
    const uniqueEmailData = await pgDB.query(uniqueEmailSQL, [email, 'none']);
    console.log('uniqueEmailData:', uniqueEmailData.rows[0]);
  
    // Return error when usrename existed
    if (uniqueEmailData.rows.length !== 0) {
      console.log('Email existed.');
      return next({
        log: 'email was not unique',
        status: 500,
        message: { err: 'email already exists in database', type: 'email_already_exists'}
      })
    }

    // Hash password using bcrypt
    const salt = await bcrypt.genSalt(SALT_WORK_FACTOR);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    const createUserSQL = 'INSERT INTO users(username, password, email) VALUES($1, $2, $3) Returning *;';
    const newUserData = await pgDB.query(createUserSQL, [username, hashedPassword, email]);
    console.log('newUserData:', newUserData.rows[0]);

    // Generate variables for next middleware
    res.locals.newUser = newUserData.rows[0];
    return next();
  } catch (err) {
    return next({
      log: `userController.createUser: ERROR ${err}`,
      status: 500,
      message: { error: 'Error occurred in userController.createUser.'}
    });
  }
};

//test
userController.confirmRegistration = async (req, res, next) => {
  console.log("In userController.confirmRegistration");

  const { JWT_SECRET, FRONTEND_URL } = process.env;
  const useremail = req.body.email;
  console.log(useremail);
  const token = jwt.sign({ useremail }, JWT_SECRET, { expiresIn: '1h' });
  console.log(token);

  const mailOptions = {
    from: process.env.SMTP_EMAIL,
    to: useremail,
    subject: 'Welcome to Trivioasis!',
    text: 'Thank you for signing up!',
    html: "<h1>Welcome to Trivioasis!</h1>" +
      "<p>We're excited to have you join our community of curious minds.</p>" +
      "<p>To complete your signup and start exploring Trivioasis, please click the link below:</p>" +
      `<p><a href="${FRONTEND_URL}?token=${token}">Complete Signup</a></p>` +
      "<p>This link is only available for 1 hour. After that, you may need to request a new signup link if the original one expires.</p>" +
      "<p>If you have any questions or need assistance, please don't hesitate to contact us at trivioasis@gmail.com.</p>" +
      "<p>Happy quizzing!</p>"
  };
  try {
    const verifyEmailResult = await transporter.verify();
    console.log('verifyEmailResult:', verifyEmailResult);

    const sendEmailResult = await transporter.sendMail(mailOptions);
    console.log('sendEmailResult:', sendEmailResult);

    return next();
  } catch (err) {
    return next({
      log: `userController.confirmRegistration: ERROR ${err}`,
      status: 500,
      message: { error: 'Error occurred in userController.confirm.'}
    });
  }
}

//test
userController.confirmEmail = async (req, res, next) => {
  console.log("In userController.confirmEmail");
  
  // Destructure from prior middleware
  const { email } = req.body;
  try {

    // Query database for existing user with input email
    const uniqueEmailSQL = `SELECT * FROM users WHERE email=$1`;
    const uniqueEmailData = await pgDB.query(uniqueEmailSQL, [email]);
    console.log('uniqueEmailData:', uniqueEmailData.rows[0]);
    if (uniqueEmailData.rows.length === 0) {
      console.log('Email not existed.');
      res.locals.emailResult = 'email_not_existed';
      return next();
    } else {
      console.log('Email existed.');
      res.locals.emailResult = 'email_existed';
      return next();
    }
  } catch (err) {
    return next({
      log: `userController.confirmEmail: ERROR ${err}`,
      status: 500,
      message: { error: 'Error occurred in userController.confirmEmail.'}
    });
  }
}

// Export
export default userController;