import { Schema, model } from "mongoose";

const userSubmissionSchema = new Schema(
  {
    questionId: {
      type: Schema.Types.ObjectId,
      ref: "Question",
      required: [true, "Question is required"],
    },
    submittedAnswer: {
      type: String,
      required: [true, "Answer is required"],
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: [true, "User is required"],
    },
  },
  {
    timestamps: true,
  }
);

const UserSubmissionModel = model("UserSubmission", userSubmissionSchema);

export default UserSubmissionModel;
