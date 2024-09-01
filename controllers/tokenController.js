import jwt from "jsonwebtoken";
const SECRET_KEY = process.env.JWT_SECRET;

const tokenController = {};

/*
 * ISSUE TOKEN
 */
tokenController.issueToken = (req, res, next) => {
  console.log("In tokenController.issueToken");
  const { userId, username } = res.locals;
  console.log(SECRET_KEY)
  // Issue token
  const token = jwt.sign(
    { userId: userId, username: username},
    SECRET_KEY,
    { expiresIn: '1h' }
  );
  console.log(token);

  // Store the token in HTTP-only cookie
  res.cookie('quiz_user', token, {
    expires: new Date(Date.now() + 60 * 60 * 1000),
    httpOnly: true, 
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
  const token = req.cookies.quiz_user; // Destructure from cookies

  // Shorten the console log
  const shortenedToken = token.slice(-10);
  console.log(`Token from cookie: ...${shortenedToken}`);

  // Check token
  if (!token) {
    return res.status(403).send('A token is required for authentication');
  }

  // Verify token, extract userId and username
  try {
    const decoded = jwt.verify(token, SECRET_KEY);
    console.log('Token verified.');
    res.locals.userId = decoded.userId;
    res.locals.username = decoded.username;
    return next();
  } catch (err) {
      return res.status(401).send('Invalid token');
  }
};


// Export
export default tokenController;