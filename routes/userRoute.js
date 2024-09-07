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
  '/confirm',
  userController.confirm,
  (req, res) => res.send('Email sent successfully')
)

router.post(
  '/signIn',
  userController.verifyUser,
  tokenController.issueToken,
  (req, res) => res.status(200).json(res.locals.loggedInUser)
)

export default router;