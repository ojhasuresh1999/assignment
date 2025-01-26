import CategoryModel from "../models/category.js";
import QuestionModel from "../models/question.js";
import catchAsync from "../utils/catchAsync.js";
import responseSend from "../utils/sendResponse.js";

const createUpdateCategory = catchAsync(async (req, res) => {
  const { id, name } = req.body;

  if (!name) {
    return responseSend(res, 400, "Name is required");
  }

  if (id) {
    const category = await CategoryModel.findById(id);
    if (!category) {
      return responseSend(res, 404, "Category not found");
    }
    category.name = name;
    await category.save().then((response) => {
      return responseSend(res, 200, "Category updated successfully", response);
    });
  } else {
    await CategoryModel.create({ name }).then((response) => {
      return responseSend(res, 201, "Category created successfully", response);
    });
  }
});

const getCategories = catchAsync(async (req, res) => {
  const categories = await CategoryModel.find();
  return responseSend(res, 200, "Categories fetched successfully", categories);
});

const deleteCategory = catchAsync(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return responseSend(res, 400, "Id is required");
  }

  const category = await CategoryModel.findById(id);
  if (!category) {
    return responseSend(res, 404, "Category not found");
  }

  await category
    .deleteOne({
      _id: id,
    })
    .then(() => {
      return responseSend(res, 200, "Category deleted successfully");
    });
});

const viewCategory = catchAsync(async (req, res) => {
  const { id } = req.params;

  if (!id) {
    return responseSend(res, 400, "Id is required");
  }

  const category = await CategoryModel.findById(id);

  if (!category) {
    return responseSend(res, 404, "Category not found");
  }

  return responseSend(res, 200, "Category fetched successfully", category);
});

const detailsWithQuestionCount = catchAsync(async (req, res) => {
  const categories = await CategoryModel.aggregate([
    {
      $lookup: {
        from: "questions",
        localField: "_id",
        foreignField: "category",
        as: "questions",
      },
    },
    {
      $project: {
        categoryName: "$name",
        questionCount: {
          $size: "$questions",
        },
      },
    },
  ]);

  return responseSend(res, 200, "Categories with question count", categories);
});

export {
  createUpdateCategory,
  getCategories,
  deleteCategory,
  viewCategory,
  detailsWithQuestionCount,
};
