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

router.post(
  '/signIn',
  userController.verifyUser,
  tokenController.issueToken,
  (req, res) => res.status(200).json(res.locals.loggedInUser)
)

export default router;