import { Router } from "express";

import {
  getTasks,
  createTask,
  getTaskById,
  updateTask,
  deleteTask,
  createSubTask,
  updateSubTask,
  deleteSubTask,
} from "../controllers/task.controller.js";

import { verifyJWT } from "../middllewares/auth.middleware.js";

const router = Router();

router.use(verifyJWT);

router.route("/project/:projectId").get(getTasks).post(createTask);

router.route("/:taskId").get(getTaskById).put(updateTask).delete(deleteTask);

router.route("/:taskId/subtasks").post(createSubTask);

router.route("/subtasks/:subTaskId").put(updateSubTask).delete(deleteSubTask);

export default router;
