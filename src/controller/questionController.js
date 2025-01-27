import CategoryModel from "../models/category.js";
import QuestionModel from "../models/question.js";
import UserSubmissionModel from "../models/userSubmission.js";
import catchAsync from "../utils/catchAsync.js";
import responseSend from "../utils/sendResponse.js";
import csvParser from "csv-parser";
import fs from "fs";

class QuestionController {
  constructor() {
    this.questionList = catchAsync(this.questionList.bind(this));
    this.questionCreateUpdate = catchAsync(
      this.questionCreateUpdate.bind(this)
    );
    this.questionDelete = catchAsync(this.questionDelete.bind(this));
    this.questionDetail = catchAsync(this.questionDetail.bind(this));
    this.submitAnswer = catchAsync(this.submitAnswer.bind(this));
    this.searchQuestion = catchAsync(this.searchQuestion.bind(this));
    this.uploadQuestions = catchAsync(this.uploadQuestions.bind(this));
  }

  async questionList(req, res) {
    const { categoryId } = req.params;

    const questions = await QuestionModel.find({ category: categoryId });

    if (!questions) {
      return responseSend(res, 404, "No questions found against this category");
    }

    return responseSend(res, 200, "Questions fetched successfully", questions);
  }

  async questionCreateUpdate(req, res) {
    const { id, title, category, options, correctAnswer } = req.body;

    if (!title || !category || !options || !correctAnswer) {
      return responseSend(res, 400, "All fields are required");
    }

    const validCategory = await CategoryModel.countDocuments({ _id: category });

    if (!validCategory) {
      return responseSend(res, 404, "Category not found");
    }

    if (id) {
      const question = await QuestionModel.findById(id);
      if (!question) {
        return responseSend(res, 404, "Question not found");
      }
      question.title = title;
      question.category = category;
      question.options = options;
      question.correctAnswer = correctAnswer;
      await question.save().then((response) => {
        return responseSend(
          res,
          200,
          "Question updated successfully",
          response
        );
      });
    } else {
      await QuestionModel.create({
        title,
        category,
        options,
        correctAnswer,
      }).then((response) => {
        return responseSend(
          res,
          201,
          "Question created successfully",
          response
        );
      });
    }
  }

  async questionDelete(req, res) {
    const { questionId } = req.params;

    if (!questionId) {
      return responseSend(res, 400, "Question Id is required");
    }

    const question = await QuestionModel.findOne({ _id: questionId });

    if (!question) {
      return responseSend(res, 404, "Question not found");
    }

    await QuestionModel.deleteOne({ _id: questionId }).then(() => {
      return responseSend(res, 200, "Question deleted successfully");
    });
  }

  async questionDetail(req, res) {
    const { questionId } = req.params;

    if (!questionId) {
      return responseSend(res, 400, "Question Id is required");
    }

    const questionDetails = await QuestionModel.findOne({ _id: questionId });

    if (!questionDetails) {
      return responseSend(res, 404, "Question not found");
    }

    return responseSend(
      res,
      200,
      "Question fetched successfully",
      questionDetails
    );
  }

  async submitAnswer(req, res) {
    const { question, answer } = req.body;

    if (!question || !answer) {
      return responseSend(res, 400, "Question and Answer are required");
    }

    const validQuestion = await QuestionModel.findOne({ _id: question });
    if (!validQuestion) {
      return responseSend(res, 404, "Question not found");
    }

    const alreadySubmitted = await UserSubmissionModel.countDocuments({
      questionId: question,
      userId: req.user._id,
    });

    if (alreadySubmitted > 0) {
      return responseSend(
        res,
        400,
        "You have already submitted the answer for this question"
      );
    }

    await UserSubmissionModel.create({
      questionId: question,
      submittedAnswer: answer,
      userId: req.user._id,
    }).then((response) => {
      return responseSend(res, 201, "Answer submitted successfully", response);
    });
  }

  async searchQuestion(req, res) {
    const { searchTerm } = req.query;

    if (!searchTerm) {
      return responseSend(res, 400, "Search term is required");
    }

    const data = await QuestionModel.aggregate([
      {
        $match: {
          title: {
            $regex: searchTerm,
            $options: "i",
          },
        },
      },
      {
        $lookup: {
          from: "usersubmissions",
          localField: "_id",
          foreignField: "questionId",
          as: "submissions",
          pipeline: [
            {
              $lookup: {
                from: "users",
                localField: "userId",
                foreignField: "_id",
                as: "userId",
              },
            },
            {
              $unwind: {
                path: "$userId",
                preserveNullAndEmptyArrays: false,
              },
            },
            {
              $addFields: {
                adjustedTime: {
                  $dateToString: {
                    date: "$createdAt",
                    format: "%Y-%m-%d %H:%M:%S",
                    timezone: "$userId.timezone",
                  },
                },
              },
            },
            {
              $project: {
                submittedAnswer: "$submittedAnswer",
                user: "$userId.name",
                userTimezone: "$userId.timezone",
                submissionTime: "$adjustedTime",
              },
            },
          ],
        },
      },
      {
        $project: {
          question: "$title",
          submissions: "$submissions",
        },
      },
    ]);

    return responseSend(res, 200, "Questions fetched successfully", data);
  }

  async uploadQuestions(req, res) {
    const { file } = req;

    if (!file) {
      return res.status(400).json({ error: "CSV file is required" });
    }

    const questions = [];
    const errors = [];

    fs.createReadStream(file.path)
      .pipe(csvParser())
      .on("data", (row) => {
        const { title, category, options, correctAnswer } = row;

        if (!title || !category || !options || !correctAnswer) {
          errors.push({
            row,
            error:
              "All fields (title, category, options, correctAnswer) are required.",
          });
          return;
        }

        const parsedOptions = options.split(",").map((opt) => opt.trim());

        if (parsedOptions.length < 2) {
          errors.push({ row, error: "At least two options are required." });
          return;
        }

        questions.push({
          title,
          category,
          options: parsedOptions,
          correctAnswer,
        });
      })
      .on("end", async () => {
        if (questions.length === 0) {
          return responseSend(res, 400, "No valid questions found", errors);
        }

        const validQuestions = [];
        for (const question of questions) {
          const category = await CategoryModel.findById(question.category);
          if (!category) {
            errors.push({
              question,
              error: `Category with ID ${question.category} does not exist.`,
            });
          } else {
            validQuestions.push(question);
          }
        }

        await QuestionModel.insertMany(validQuestions);

        return responseSend(
          res,
          201,
          "Questions uploaded successfully",
          validQuestions
        );
      });
  }
}

export default new QuestionController();
