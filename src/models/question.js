import { Schema, model } from "mongoose";

const questionSchema = new Schema(
  {
    title: {
      type: String,
      required: [true, "Title is required"],
    },
    category: {
      type: Schema.Types.ObjectId,
      ref: "Category",
      required: [true, "Category is required"],
    },
    options: [
      {
        type: String,
        required: [true, "Option is required"],
      },
    ],
    correctAnswer: {
      type: String,
      required: [true, "Correct Answer is required"],
    },
  },
  {
    timestamps: true,
  }
);

const QuestionModel = model("Question", questionSchema);

export default QuestionModel;
