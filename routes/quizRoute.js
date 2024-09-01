import express from "express";
const router = express.Router();
import quizController from "../controllers/quizController.js";
import tokenController from "../controllers/tokenController.js";

router.post(
  '/storeResult',
  tokenController.verifyToken,
  quizController.storeResult,
  (req, res) => res.status(200).json(res.locals.newRecord)
)

export default router;