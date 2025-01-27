import { Router } from "express";
import CategoryController from "../controller/categoryController.js";

const router = Router();

router
  .get("/list", CategoryController.getCategories)
  .post("/create-update", CategoryController.createUpdateCategory)
  .delete("/delete/:id", CategoryController.deleteCategory)
  .get(
    "/details-with-question-count",
    CategoryController.detailsWithQuestionCount
  )
  .get("/:id", CategoryController.viewCategory);

export default router;
