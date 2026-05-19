import { Router } from "express";

import {
  addMemberToProject,
  createProject,
  deleteMember,
  deleteProject,
  getProjectMembers,
  getProjects,
  getProjectById,
  updateMemberRole,
  updateProject,
} from "../controllers/project.controllers.js";

import { validate } from "../middllewares/validator.middleware.js";

import {
  addMemberToProjectvalidator,
  createProjectValidator,
} from "../validators/index.js";

import {
  verifyJWT,
  validateProjectPermission,
} from "../middllewares/auth.middleware.js";
import { AvailableRoles, userroleenum } from "../utils/constants.js";

// console.log("validateProjectPermission:", validateProjectPermission);
// console.log("AvailableRoles:", AvailableRoles);
// console.log("getProjectMembers:", getProjectMembers);

const router = Router();

router.use(verifyJWT);

router
  .route("/")
  .get(getProjects)
  .post(createProjectValidator(), validate, createProject);

router
  .route("/:projectId")
  .get(validateProjectPermission(AvailableRoles), getProjectById)
  .put(
    validateProjectPermission([userroleenum.ADMIN]),
    createProjectValidator(),
    updateProject,
  )
  .delete(validateProjectPermission([userroleenum.ADMIN]), deleteProject);

router
  .route("/:projectId/members")
  .get(validateProjectPermission(AvailableRoles), getProjectMembers)
  .post(
    validateProjectPermission([userroleenum.ADMIN]),
    addMemberToProjectvalidator(),
    validate,
    addMemberToProject,
  );

router
  .route("/:projectId/members/:userId")
  .put(validateProjectPermission([userroleenum.ADMIN]), updateMemberRole)
  .delete(validateProjectPermission([userroleenum.ADMIN]), deleteMember);

export default router;
