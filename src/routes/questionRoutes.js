import { Router } from "express";
import {
  questionList,
  questionCreateUpdate,
  questionDelete,
  questionDetail,
  submitAnswer,
  searchQuestion,
  uploadQuestions,
} from "../controller/questionController.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/FileUploader.js";

const router = Router();

router.post("/bulk-upload", upload.single("file"), uploadQuestions);
router.get("/search", searchQuestion);
router.get("/:categoryId", questionList);
router.post("/", questionCreateUpdate);
router.delete("/:questionId", questionDelete);
router.get("/details/:questionId", questionDetail);
router.patch("/", questionCreateUpdate);
router.post("/submit-answer", auth, submitAnswer);

export default router;
