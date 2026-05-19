import { body } from "express-validator";
import { AvailableRoles } from "../utils/constants.js";

const userRegisterValidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("email is required")
      .isEmail()
      .withMessage("email is not valid"),

    body("username")
      .trim()
      .notEmpty()
      .withMessage("username is required")
      .isLowercase()
      .withMessage("username must be lowercase")
      .isLength({ min: 3 })
      .withMessage("Username must be at least 3 characters long"),

    body("password")
      .trim()
      .notEmpty()
      .withMessage("password is required")
      .isLength({ min: 6 })
      .withMessage("password must be at least 6 characters long"),

    body("Fullname").optional().trim().notEmpty(),
  ];
};

const userLoginValidator = () => {
  return [
    body("email").optional().isEmail().withMessage("Email is not valid"),
    body("password").notEmpty().withMessage("Password is required"),
  ];
};

const userChangecurrentPassowrdValidator = () => {
  return [
    body("oldpassword").notEmpty().withMessage("oldpassword is required"),
    body("newpassword").notEmpty().withMessage("newpassword is required"),
  ];
};
const userChangeForgotPassowrdValidator = () => {
  return [
    body("email")
      .notEmpty()
      .withMessage("email is required")
      .isEmail()
      .withMessage("email is not valid"),
  ];
};
const useresetForgotPassowrdValidator = () => {
  return [body("newPassowrd").notEmpty().withMessage("passowrd is required")];
};
const createProjectValidator = () => {
  return [
    body("name").notEmpty().withMessage("name is required"),
    body("description").optional(),
  ];
};
const addMemberToProjectvalidator = () => {
  return [
    body("email")
      .trim()
      .notEmpty()
      .withMessage("email is required")
      .isEmail()
      .withMessage("email is not valid"),
    body("role")
      .notEmpty()
      .withMessage("role is required")
      .isIn(AvailableRoles)
      .withMessage("role is not valid"),
  ];
};
export {
  userRegisterValidator,
  userLoginValidator,
  userChangecurrentPassowrdValidator,
  useresetForgotPassowrdValidator,
  userChangeForgotPassowrdValidator,
  createProjectValidator,
  addMemberToProjectvalidator,
};
