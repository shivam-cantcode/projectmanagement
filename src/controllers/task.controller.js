import { User } from "../models/user_models.js";
import { Project } from "../models/project.models.js";
import { Task } from "../models/task.models.js";
import { SubTask } from "../models/subtask.models.js";
import { ApiResponse } from "../utils/api_response.js";
import { ApiError } from "../utils/api_error.js";
import { asyncHandler } from "../utils/async.handler.js";
import mongoose from "mongoose";
import { AvailableRoles, userroleenum } from "../utils/constants.js";

const getTasks = asyncHandler(async (req, res) => {
  const { projectId } = req.params;

  const page = Number(req.query.page) || 1;

  const limit = Number(req.query.limit) || 10;

  const skip = (page - 1) * limit;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }

  // Authorization check
  if (project.createdBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized");
  }

  const tasks = await Task.aggregate([
    {
      $match: {
        project: new mongoose.Types.ObjectId(projectId),
      },
    },
    {
      $sort: { createdAt: -1 },
    },
    {
      $skip: skip,
    },
    {
      $limit: limit,
    },
    {
      $lookup: {
        from: "users",
        localField: "assignedTo",
        foreignField: "_id",
        as: "assignedTo",
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "subtasks",
        localField: "_id",
        foreignField: "task",
        as: "subtasks",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "createdBy",
              foreignField: "_id",
              as: "createdBy",
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              createdBy: {
                $arrayElemAt: ["$createdBy", 0],
              },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        assignedTo: {
          $arrayElemAt: ["$assignedTo", 0],
        },
      },
    },
  ]);

  const totalTasks = await Task.countDocuments({
    project: new mongoose.Types.ObjectId(projectId),
  });

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        tasks,
        pagination: {
          totalTasks,
          currentPage: page,
          totalPages: Math.ceil(totalTasks / limit),
          limit,
        },
      },
      "Tasks fetched successfully",
    ),
  );
});
const createTask = asyncHandler(async (req, res) => {
  const { title, description, assignedTo, status } = req.body;

  const { projectId } = req.params;

  const project = await Project.findById(projectId);

  if (!project) {
    throw new ApiError(404, "Project not found");
  }
  if (!assignedTo) {
    throw new ApiError(400, "assignedTo is required");
  }

  const assigneeUser = await User.findOne({ email: assignedTo });
  if (!assigneeUser) {
    throw new ApiError(404, "Assignee user not found with that email");
  }

  const files = req.files || [];

  const attachments = files.map((file) => ({
    url: `${process.env.SERVER_URL}/images/${file.filename}`,
    mimetype: file.mimetype,
    size: file.size,
  }));

  const task = await Task.create({
    title,
    description: description,
    project: new mongoose.Types.ObjectId(projectId),
    assignedTo: assigneeUser._id,
    status,
    assignedBy: new mongoose.Types.ObjectId(req.user._id),
    attachments: attachments,
  });

  return res
    .status(201)
    .json(new ApiResponse(201, task, "Task created successfully"));
});

const getTaskById = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(taskId),
      },
    },
    {
      $lookup: {
        from: "users",
        localField: "assignedTo",
        foreignField: "_id",
        as: "assignedTo",
        pipeline: [
          {
            $project: {
              _id: 1,
              username: 1,
              fullName: 1,
              avatar: 1,
            },
          },
        ],
      },
    },
    {
      $lookup: {
        from: "subtasks",
        localField: "_id",
        foreignField: "task",
        as: "subtasks",
        pipeline: [
          {
            $lookup: {
              from: "users",
              localField: "createdBy",
              foreignField: "_id",
              as: "createdBy",
              pipeline: [
                {
                  $project: {
                    _id: 1,
                    username: 1,
                    fullName: 1,
                    avatar: 1,
                  },
                },
              ],
            },
          },
          {
            $addFields: {
              createdBy: {
                $arrayElemAt: ["$createdBy", 0],
              },
            },
          },
        ],
      },
    },
    {
      $addFields: {
        assignedTo: {
          $arrayElemAt: ["$assignedTo", 0],
        },
      },
    },
  ]);

  if (!task || task.length === 0) {
    throw new ApiError(404, "Task not found");
  }
  return res
    .status(200)
    .json(new ApiResponse(200, task[0], "Task fetched successfully"));
});

const updateTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const { title, description, assignedTo, status } = req.body;

  const task = await Task.findById(taskId);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }
  if (task.assignedBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized");
  }

  Object.assign(task, {
    title: title ?? task.title,
    description: description ?? task.description,
    status: status ?? task.status,
    assignedTo: assignedTo
      ? new mongoose.Types.ObjectId(assignedTo)
      : task.assignedTo,
  });

  await task.save();

  return res
    .status(200)
    .json(new ApiResponse(200, task, "Task updated successfully"));
});

const deleteTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;

  const task = await Task.findByIdAndDelete(taskId);

  if (!task) {
    throw new ApiError(404, "Task not found");
  }
  if (task.assignedBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized");
  }

  await SubTask.deleteMany({
    task: taskId,
  });

  return res
    .status(200)
    .json(new ApiResponse(200, task, "Task deleted successfully"));
});

const createSubTask = asyncHandler(async (req, res) => {
  const { taskId } = req.params;
  const { title } = req.body;
  const task = await Task.findById(taskId);
  if (!task) {
    throw new ApiError(404, "Task not found");
  }

  const suntask = await SubTask.create({
    title,
    task: new mongoose.Types.ObjectId(taskId),
    createdBy: new mongoose.Types.ObjectId(req.user._id),
  });
  return res
    .status(201)
    .json(new ApiResponse(201, suntask, "SubTask created successfully"));
});

const updateSubTask = asyncHandler(async (req, res) => {
  const { subTaskId } = req.params;
  const { taskId, isCompleted } = req.body;
  const subtask = await SubTask.findById(subTaskId);
  if (!subtask) {
    throw new ApiError(404, "SubTask not found");
  }
  const parentTask = await Task.findById(subtask.task);

  if (parentTask.assignedBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized");
  }

  Object.assign(subtask, {
    isCompleted: isCompleted ?? subtask.isCompleted,
  });

  await subtask.save();

  return res
    .status(200)
    .json(new ApiResponse(200, subtask, "SubTask updated successfully"));
});

const deleteSubTask = asyncHandler(async (req, res) => {
  const { subTaskId } = req.params;

  const subtask = await SubTask.findByIdAndDelete(subTaskId);

  if (!subtask) {
    throw new ApiError(404, "Subtask not found");
  }
  const parentTask = await Task.findById(subtask.task);

  if (parentTask.assignedBy.toString() !== req.user._id.toString()) {
    throw new ApiError(403, "You are not authorized");
  }

  return res
    .status(200)
    .json(new ApiResponse(200, subtask, "Subtask deleted successfully"));
});

export {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  createSubTask,
  updateSubTask,
  deleteSubTask,
};
