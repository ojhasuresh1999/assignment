import { Router } from "express";
import QuestionController from "../controller/questionController.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/FileUploader.js";

const router = Router();

router.post(
  "/bulk-upload",
  upload.single("file"),
  QuestionController.uploadQuestions
);
router.get("/search", QuestionController.searchQuestion);
router.get("/:categoryId", QuestionController.questionList);
router.post("/", QuestionController.questionCreateUpdate);
router.delete("/:questionId", QuestionController.questionDelete);
router.get("/details/:questionId", QuestionController.questionDetail);
router.patch("/", QuestionController.questionCreateUpdate);
router.post("/submit-answer", auth, QuestionController.submitAnswer);

export default router;
