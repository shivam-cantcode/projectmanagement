import { User } from "../models/user_models.js";
import { ProjectMember } from "../models/projectmember.js";
import { ApiError } from "../utils/api_error.js";
import { asyncHandler } from "../utils/async.handler.js";
import jwt from "jsonwebtoken";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");
  if (!token) {
    throw new ApiError(401, "Unauthorized");
  }
  try {
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationTokenExpiry",
    );

    if (!user) {
      throw new ApiError(401, "Invalid token");
    }
    req.user = user;
    next();
  } catch (error) {
    throw new ApiError(401, "Invalid acess token");
  }
});

export const validateProjectPermission = (roles) =>
  asyncHandler(async (req, res, next) => {
    const { projectId } = req.params;

    if (!projectId) {
      throw new ApiError(400, "Project id is required");
    }

    const project = await ProjectMember.findOne({
      project: projectId,
      user: req.user._id,
    });

    if (!project) {
      throw new ApiError(401, "Project not found");
    }

    const givenRole = project.role;

    req.user.role = givenRole;

    if (!roles.includes(givenRole)) {
      throw new ApiError(
        401,
        "You do not have permission to perform this action",
      );
    }

    next();
  });
