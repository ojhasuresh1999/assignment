import UserModel from "../models/user.js";
import catchAsync from "../utils/catchAsync.js";
import sendEmail from "../utils/emailService.js";
import responseSend from "../utils/sendResponse.js";
import jwt from "jsonwebtoken";

class UserController {
  constructor() {
    this.signup = catchAsync(this.signup.bind(this));
    this.verifyEmail = catchAsync(this.verifyEmail.bind(this));
    this.login = catchAsync(this.login.bind(this));
    this.viewProfile = catchAsync(this.viewProfile.bind(this));
    this.updateProfile = catchAsync(this.updateProfile.bind(this));
  }

  async signup(req, res) {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return responseSend(res, 400, "All fields are required", null);
    }

    const existingUser = await UserModel.findOne({ email: email });

    if (existingUser) {
      return responseSend(res, 400, "User already exists", null);
    }

    await UserModel.create({ name, email, password }).then(async (user) => {
      const userDetails = {
        ...user._doc,
        password: undefined,
        isVerified: undefined,
      };

      await sendEmail({ name: user.name, email: user.email });
      return responseSend(res, 201, "User created successfully", userDetails);
    });
  }

  async verifyEmail(req, res) {
    const { email } = req.query;

    if (!email) {
      return responseSend(res, 400, "Email is required", null);
    }

    const user = await UserModel.findOne({ email: email }).select("isVerified");
    if (!user) {
      return responseSend(res, 404, "User not found", null);
    }

    if (user.isVerified)
      return responseSend(res, 409, "You are already verified...");

    await UserModel.updateOne({ email: email }, { isVerified: true }).then(
      () => {
        return responseSend(res, 200, "Email verified successfully", null);
      }
    );
  }

  async login(req, res) {
    const { email, password } = req.body;

    if (!email || !password) {
      return responseSend(res, 400, "All fields are required", null);
    }

    const user = await UserModel.findOne({ email: email });
    if (!user) {
      return responseSend(res, 404, "User not found", null);
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return responseSend(res, 400, "Invalid credentials", null);
    }

    const isVerified = user.isVerified;
    if (!isVerified) {
      return responseSend(res, 401, "Please verify your email...", null);
    }

    const token = jwt.sign({ _id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    const userDetails = {
      ...user._doc,
      password: undefined,
      isVerified: undefined,
      token,
    };

    return responseSend(res, 200, "User logged in successfully", userDetails);
  }

  async viewProfile(req, res) {
    console.log("🚀 ~ viewProfile ~ :", req.user);

    const user = await UserModel.findById(req.user._id);
    if (!user) {
      return responseSend(res, 404, "User not found", null);
    }

    const isVerified = user.isVerified;

    if (!isVerified) {
      return responseSend(res, 401, "Please verify your email...", null);
    }

    const userDetails = {
      ...user._doc,
      password: undefined,
      isVerified: undefined,
    };

    return responseSend(res, 200, "User profile", userDetails);
  }

  async updateProfile(req, res) {
    const user = await UserModel.findById(req.user._id);
    if (!user) {
      return responseSend(res, 404, "User not found", null);
    }

    const isVerified = user.isVerified;

    if (!isVerified) {
      return responseSend(res, 401, "Please verify your email...", null);
    }

    const { name } = req.body;
    const profilePicture = req.file ? req.file.path : user.profilePicture;

    await UserModel.findByIdAndUpdate(
      req.user._id,
      { name, profilePicture },
      { new: true }
    ).then((updatedUser) => {
      const userDetails = {
        ...updatedUser._doc,
        password: undefined,
        isVerified: undefined,
      };

      return responseSend(
        res,
        200,
        "Profile updated successfully",
        userDetails
      );
    });
  }
}

export default new UserController();
