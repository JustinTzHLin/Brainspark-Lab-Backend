import express from "express";
const router = express.Router();
import userController from "../controllers/userController.js";
import tokenController from "../controllers/tokenController.js";

router.post(
  '/signUp',
  userController.createUser,
  tokenController.issueToken,
  (req, res) => res.status(200).json(res.locals.newUser)
)

//test
router.post(
  '/confirmRegistration',
  userController.confirmRegistration,
  (req, res) => res.status(200).send('Email sent successfully')
)

//test
router.post(
  '/emailConfirm',
  userController.confirmEmail,
  (req, res) => res.status(200).json({result: res.locals.emailResult})
)

//test
router.post(
  '/tokenConfirm',
  tokenController.confirmToken,
  (req, res) => res.status(200).json({
    result: res.locals.result, useremail: res.locals.useremail
  })
)

router.post(
  '/signIn',
  userController.verifyUser,
  tokenController.issueToken,
  (req, res) => res.status(200).json(res.locals.loggedInUser)
)

export default router;