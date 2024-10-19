import jwt from "jsonwebtoken";
const SECRET_KEY = process.env.JWT_SECRET;

const tokenController = {};

/*
 * ISSUE TOKEN
 */
tokenController.issueToken = (req, res, next) => {
  console.log("In tokenController.issueToken");
  const { userId, email } = res.locals;
  console.log(SECRET_KEY)
  // Issue token
  const token = jwt.sign(
    { userId: userId, email: email},
    SECRET_KEY,
    { expiresIn: '1h' }
  );
  console.log(token);

  // Store the token in HTTP-only cookie
  res.cookie('brainspark-lab_user', token, {
    secure: true,
    sameSite: "none",
    expires: new Date(Date.now() + 60 * 60 * 1000),
  });

  const shortenedToken = token.slice(-10)
  console.log(`Token from cookie: ...${shortenedToken}`);

  return next();
};


/*
 * VERIFY TOKEN
 */
tokenController.verifyToken = (req, res, next) => {
  console.log("In tokenController.verifyToken");
  const token = req.cookies['brainspark-lab_user']; // Destructure from cookies

  // Check token
  if (!token) {
    return next({
      log: `tokenController.verifyToken: ERROR: 'A token is required for authentication'`,
      status: 403,
      message: { error: 'Error occurred in tokenController.verifyToken'}
  })}

  // Shorten the console log
  const shortenedToken = token.slice(-10);
  console.log(`Token from cookie: ...${shortenedToken}`);

  // Verify token, extract userId and username
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    console.log('Token verified.');
    res.locals.userId = decoded.userId;
    res.locals.email = decoded.email;
    return next();
  } catch (err) {
    return next({
      log: `tokenController.verifyToken: ERROR: 'Invalid token'`,
      status: 401,
      message: { error: 'Error occurred in tokenController.verifyToken'}
  })}
};

/*
 *  CONFIRM TOKEN
 */
tokenController.confirmToken = (req, res, next) => {
  console.log("In tokenController.confirmToken");
  const { token } = req.body;
  
  // Shorten the console log
  const shortenedToken = token.slice(-10);
  console.log(`Token from email: ...${shortenedToken}`);

  // Check token
  if (!token) {
    return next({
      log: `tokenController.confirmToken: ERROR: 'A token is required for signup'`,
      status: 403,
      message: { error: 'Error occurred in tokenController.confirmToken'}
  })}

  // Verify token, extract userId and username
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    console.log('Token verified.');
    res.locals.useremail = decoded.useremail;
    return next();
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      return next({
        log: `tokenController.confirmToken: ERROR: 'Token expired'`,
        status: 401,
        message: { error: 'Error occurred in tokenController.confirmToken', type: 'token_expired' }
    })}
    return next({
      log: `tokenController.confirmToken: ERROR: 'Invalid token'`,
      status: 401,
      message: { error: 'Error occurred in tokenController.confirmToken'}
  })}
};

// Export
export default tokenController;