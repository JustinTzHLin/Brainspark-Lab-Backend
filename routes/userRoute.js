import express from "express";
const router = express.Router();
import userController from "../controllers/userController.js";
import tokenController from "../controllers/tokenController.js";

// create user to database
router.post(
  '/signUp',
  userController.createUser,
  tokenController.issueToken,
  (req, res) => res.status(200).json(res.locals.newUser)
)

// sent registration email
router.post(
  '/confirmRegistration',
  userController.confirmRegistration,
  (req, res) => res.status(200).send('Email sent successfully')
)

// login or signup with email
router.post(
  '/emailConfirm',
  userController.confirmEmail,
  (req, res) => res.status(200).json({result: res.locals.emailResult})
)

// confirm token from registration email
router.post(
  '/tokenConfirm',
  tokenController.confirmToken,
  (req, res) => res.status(200).json({
    result: res.locals.result, useremail: res.locals.useremail
  })
)

// login with password
router.post(
  '/signIn',
  userController.verifyUser,
  tokenController.issueToken,
  (req, res) => res.status(200).json(res.locals.loggedInUser)
)

// check if user is logged in
router.post(
  '/verifyLoggedIn',
  tokenController.verifyToken,
  (req, res) => res.status(200).json({result: true})
)

export default router;