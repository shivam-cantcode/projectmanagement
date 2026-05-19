// import { Router } from "express";
// import { registeruser } from "../controllers/auth.controllers.js";

// const router = Router();

// router.route("/register").post(registeruser);

// export default router;

/*
for clearner version
*/

import { Router } from "express";

import {
  registeruser,
  login,
  logoutUser,
  getCurrentUser,
  verfiyEmail,
  resendEmailverification,
  refreshAccesstoken,
  forgotPasswordrequeset,
  resetForgotpassword,
  changeCurrentPassword,
} from "../controllers/auth.controllers.js";

import { validate } from "../middllewares/validator.middleware.js";

import {
  userRegisterValidator,
  userLoginValidator,
  userChangeForgotPassowrdValidator,
} from "../validators/index.js";

import { verifyJWT } from "../middllewares/auth.middleware.js";

const router = Router();

router.post("/register", userRegisterValidator(), validate, registeruser);

router.post("/login", userLoginValidator(), validate, login);

router.get("/verify-email/:verificationToken", verfiyEmail);

router.post("/refresh-token", refreshAccesstoken);

router.post(
  "/forgot-password",
  userChangeForgotPassowrdValidator(),
  validate,
  forgotPasswordrequeset,
);

router.post("/reset-password/:resetToken", resetForgotpassword);

router.post("/logout", verifyJWT, logoutUser);

router.get("/current-user", verifyJWT, getCurrentUser);

router.post("/resend-email-verification", verifyJWT, resendEmailverification);

router.post("/change-password", verifyJWT, changeCurrentPassword);

export default router;
