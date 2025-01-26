import { Router } from "express";
import {
  createUpdateCategory,
  getCategories,
  deleteCategory,
  viewCategory,
  detailsWithQuestionCount,
} from "../controller/categoryController.js";

const router = Router();

router
  .get("/list", getCategories)
  .post("/create-update", createUpdateCategory)
  .delete("/delete/:id", deleteCategory)
  .get("/details-with-question-count", detailsWithQuestionCount)
  .get("/:id", viewCategory);

export default router;
