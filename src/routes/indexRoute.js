import express from "express";

const router = express.Router();

import userRouter from "./userRoutes.js";
router.use("/user", userRouter);

import categoryRouter from "./categoryRoutes.js";
router.use("/category", categoryRouter);

import questionRouter from "./questionRoutes.js";
router.use("/question", questionRouter);

export default router;
