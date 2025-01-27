import { Router } from "express";
import UserController from "../controller/userController.js"; // Import the UserController instance
import auth from "../middleware/auth.js";
import upload from "../middleware/FileUploader.js";

const router = Router();

router
  .post("/signup", UserController.signup)
  .post("/login", UserController.login)
  .get("/verify-email", UserController.verifyEmail)
  .get("/profile", auth, UserController.viewProfile)
  .patch(
    "/update-profile",
    auth,
    upload.single("profilePicture"),
    UserController.updateProfile
  );

export default router;
