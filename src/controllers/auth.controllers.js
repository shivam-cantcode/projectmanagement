// import { User } from "../models/user_models.js";
// import { Apiresponse } from "../utils/api_response.js";
// import { Apierror } from "../utils/api_error.js";
// import { asyncHandler } from "../utils/aysnc.handler.js";
// import { sendemail } from "../utils/mail.js";
// const generateaccessandrefreshtoken = async (userId) => {
//   try {
//     const user = await User.findById(userId);
//     const accesstoekn = user.generateaccesstoekn();
//     const refreshtoekn = user.genrateRefreshtoken();

//     user.refreshtoken = refreshtoekn;
//     await user.save({ validateBeforeSave: false });
//     return { accesstoekn, refreshtoekn };
//   } catch (error) {
//     throw new Apierror(500, "something went wrong while generating acesstoken");
//   }
// };

// const registeruser = asyncHandler(async (res, req) => {
//   const { email, username, password, roles } = req.body;

//   const existinguser = await User.findOne({
//     $or: [{ username }, { email }],
//   });
//   if (existinguser) {
//     throw new Apierror(
//       209,
//       "User with the emai or username already exists",
//       [],
//     );
//   }
//   const user = await User.create({
//     email,
//     password,
//     username,
//     isemailverified: false,
//   });
//   const { unhased_token, hased_token, token_expiry } =
//     user.generatetemporarytoken();

//   user.emailverificationtoken = hased_token;
//   user.emailverificationtokenExpiry = token_expiry;
//   await user.save({ validateBeforeSave: false });

//   await sendemail({
//     email: user?.email,
//     subject: "Please verify your email",
//     mailgencontent: emailverificationMail(
//       user.username,
//       `${req.protocol}://${req.get("host")}/api/v1/users/verify_emial/${unhased_token}`,
//     ),
//   });

//   const created_user = await User.findById(user._id).select(
//     "-password -refreshtoken -emailverificationtoken -emailverificationtokenExpiry",
//   );
//   if (!created_user) {
//     throw (new api_error(500), "seomthing went wrong while regesting the user");
//   }
//   return res
//     .status(201)
//     .json(
//       new Apiresponse(
//         200,
//         { user: created_user },
//         "Usesr resgisred succesfully and verification email has been sent on your email",
//       ),
//     );
// });

// export { registeruser };

/*
for clearner version
*/

import { User } from "../models/user_models.js";
import { ApiResponse } from "../utils/api_response.js";
import { ApiError } from "../utils/api_error.js";
import { asyncHandler } from "../utils/async.handler.js";
import {
  sendemail,
  emailverificationMail,
  forgotpasswordMail,
} from "../utils/mail.js";
import { body } from "express-validator";
import jwt from "jsonwebtoken";
import crypto from "crypto";
const generateaccessandrefreshtoken = async (userId) => {
  try {
    const user = await User.findById(userId);

    const accesstoken = user.generateAccessToken();
    const refreshtoken = user.generateRefreshToken();

    user.refreshToken = refreshtoken;

    await user.save({ validateBeforeSave: false });

    return { accesstoken, refreshtoken };
  } catch (error) {
    throw new ApiError(
      500,
      "Something went wrong while generating access token",
    );
  }
};

const registeruser = asyncHandler(async (req, res) => {
  const { email, username, password } = req.body;

  const existinguser = await User.findOne({
    $or: [{ username }, { email }],
  });

  if (existinguser) {
    throw new ApiError(409, "User with email or username already exists");
  }

  const user = await User.create({
    email,
    password,
    username,
    isEmailVerified: false,
  });

  const { unhashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationTokenExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  // send email
  await sendemail({
    email: user.email,
    subject: "Please verify your email",
    mailgencontent: emailverificationMail(
      user.username,
      `${req.protocol}://${req.get(
        "host",
      )}/api/v1/users/verify_email/${unhashedToken}`,
    ),
  });

  const created_user = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry",
  );

  if (!created_user) {
    throw new ApiError(500, "Something went wrong while registering the user");
  }

  return res
    .status(201)
    .json(
      new ApiResponse(
        201,
        { user: created_user },
        "User registered successfully and verification email has been sent",
      ),
    );
});

const login = asyncHandler(async (req, res) => {
  const { email, password, username } = req.body;
  if (!email) {
    throw new ApiError(400, "Please provide email ");
  }
  const user = await User.findOne({ email });

  if (!user) {
    throw new ApiError(400, "User not found");
  }

  const isPasswordvalid = await user.isPasswordCorrect(password);
  if (!isPasswordvalid) {
    throw new ApiError(400, "Invalid password");
  }
  const { accesstoken, refreshtoken } = await generateaccessandrefreshtoken(
    user._id,
  );
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry",
  );
  const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  };
  return res
    .status(200)
    .cookie("accessToken", accesstoken, cookieOptions)
    .cookie("refreshToken", refreshtoken, cookieOptions)
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,
          accessToken: accesstoken,
          refreshToken: refreshtoken,
        },
        "User logged in successfully",
      ),
    );
});
const logoutUser = asyncHandler(async (req, res) => {
  await User.findByIdAndUpdate(
    req.user._id,
    {
      $set: {
        refreshToken: null,
      },
    },
    {
      new: true,
    },
  );
  const options = {
    httpOnly: true,
    secure: true,
  };
  return res
    .status(200)
    .clearCookie("accessToken", options)
    .clearCookie("refreshToken", options)
    .json(new ApiResponse(200, {}, "User logged out successfully"));
});

const getCurrentUser = asyncHandler(async (req, res) => {
  return res
    .status(200)
    .json(new ApiResponse(200, { user: req.user }, "Success"));
});

const verfiyEmail = asyncHandler(async (req, res) => {
  const { verificationToken } = req.params;
  if (!verificationToken) {
    throw new ApiError(400, "Email verification token is missing ");
  }

  let hashedToken = crypto
    .createHash("sha256")
    .update(verificationToken)
    .digest("hex");

  const user = await User.findOne({
    emailVerificationToken: hashedToken,
    emailVerificationTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid email verification token or expired");
  }

  user.emailVerificationToken = undefined;
  user.emailVerificationTokenExpiry = undefined;

  user.isEmailVerified = true;
  await user.save({ validateBeforeSave: false });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        { isEmailVerified: true },
        "Email verified successfully",
      ),
    );
});
const resendEmailverification = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user?._id);
  if (!user) {
    throw new ApiError(404, "User not found");
  }
  if (user.isEmailVerified) {
    throw new ApiError(400, "Email already verified");
  }
  const { unhashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.emailVerificationToken = hashedToken;
  user.emailVerificationTokenExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  await sendemail({
    email: user.email,
    subject: "Please verify your email",
    mailgencontent: emailverificationMail(
      user.username,
      `${req.protocol}://${req.get(
        "host",
      )}/api/v1/users/verify_email/${unhashedToken}`,
    ),
  });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Verification email has been sent on your email",
      ),
    );
});
const refreshAccesstoken = asyncHandler(async (req, res) => {
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;
  if (!incomingRefreshToken) {
    throw new ApiError(400, "Unauthorized access");
  }
  try {
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );
    const user = await User.findById(decodedToken?._id);
    if (!user) {
      throw new ApiError(401, "invalid refresh token access");
    }
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, " refresh toekn expired");
    }
    const cookieOptions = {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
    };
    const { accesstoken, refreshtoken: newRefreshToken } =
      await generateaccessandrefreshtoken(user._id);

    user.refreshToken = newRefreshToken;
    await user.save();

    return res
      .status(200)
      .cookie("accessToken", accesstoken, cookieOptions)
      .json(
        new ApiResponse(
          200,
          { accesstoken, refreshToken: newRefreshToken },
          "Access token refreshed successfully",
        ),
      );
  } catch (error) {
    throw new ApiError(401, "Invalid refresh toekn ");
  }
});
const forgotPasswordrequeset = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });
  if (!user) {
    throw new ApiError(400, "User not found");
  }
  const { unhashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.passwordResetToken = hashedToken;
  user.passwordResetTokenExpiry = tokenExpiry;

  await user.save({ validateBeforeSave: false });

  await sendemail({
    email: user.email,
    subject: "Please verify your email",
    mailgencontent: forgotPasswordMail(
      user.username,
      `${req.protocol}://${req.get(
        "host",
      )}/api/v1/users/reset_password/${unhashedToken}`,
    ),
  });
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Verification email has been sent on your email",
      ),
    );
});

const resetForgotpassword = asyncHandler(async (req, res) => {
  const { resetToken } = req.params;
  const { password } = req.body;

  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetTokenExpiry: { $gt: Date.now() },
  });

  if (!user) {
    throw new ApiError(400, "Invalid token or token expired");
  }

  user.passwordResetToken = undefined;
  user.passwordResetTokenExpiry = undefined;

  user.password = password;

  await user.save();

  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset successfully"));
});
const changeCurrentPassword = asyncHandler(async (req, res) => {
  const { oldPassword, newPassword } = req.body;
  const user = await User.findById(req.user?._id);
  const isPasswordvalid = await user.isPasswordCorrect(oldPassword);
  if (!isPasswordvalid) {
    throw new ApiError(400, "Invalid old password");
  }
  user.password = newPassword;
  await user.save();
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});
export {
  registeruser,
  login,
  logoutUser,
  getCurrentUser,
  verfiyEmail,
  resendEmailverification,
  refreshAccesstoken,
  forgotPasswordrequeset,
  changeCurrentPassword,
  resetForgotpassword,
};

// const getCurrentUser = asyncHandler(async (req, res) => {});
