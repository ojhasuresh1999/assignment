import { Router } from "express";
import {
  login,
  signup,
  viewProfile,
  updateProfile,
  verifyEmail,
} from "../controller/userController.js";
import auth from "../middleware/auth.js";
import upload from "../middleware/FileUploader.js";

const router = Router();

router
  .post("/signup", signup)
  .post("/login", login)
  .get("/verify-email", verifyEmail)
  .get("/profile", auth, viewProfile)
  .patch(
    "/update-profile",
    auth,
    upload.single("profilePicture"),
    updateProfile
  );

export default router;
