// import mongoose, { Schema } from "mongoose";
// import bcrypt from "bcrypt";
// import jwt from "jsonwebtoken";
// import crypto from "crypto";

// const userschema = new Schema(
//   {
//     avatar: {
//       type: {
//         url: String,
//         localPath: String,
//       },

//       default: {
//         url: `https://placehold.co/200x200`,
//         localPath: "",
//       },
//     },
//     username: {
//       type: String,
//       required: true,
//       unqiue: true,
//       lowercase: true,
//       trim: true,
//       index: true,
//     },
//     email: {
//       type: String,
//       required: true,
//       unqiue: true,
//       lowercase: true,
//       trim: true,
//     },
//     fullName: {
//       type: String,
//       trim: true,
//     },
//     password: {
//       type: String,
//       required: [true, "passowrd is required"],
//     },
//     isEmailverfied: {
//       type: Boolean,
//       deafult: false,
//     },

//     refreshtoken: { type: String },
//     forgotpassword: {
//       type: String,
//     },
//     forgotpasswordExpiry: {
//       type: Date,
//     },
//     emailverificationtoken: {
//       type: String,
//     },
//     emailverificationtokenExpiry: {
//       type: Date,
//     },
//   },
//   {
//     timestamps: true,
//   },
// );
// userschema.pre("save", async function (next) {
//   if (!this.isModified("password")) return next();

//   this.password = await bcrypt.hash(this.password, 10);
//   next();
// });
// userschema.methods.isPasswordcorrect = async function (password) {
//   return await bcrypt.compare(password, this.password);
// };

// userschema.methods.generateaccesstoekn = function () {
//   return jwt.sign(
//     {
//       _id: this._id,
//       email: this.email,
//       username: this.username,
//     },
//     process.env.ACCESS_TOKEN_SECRET,
//     { expiresIn: process.env.ACCESS_TOKEN_SECRET },
//   );
// };

// userschema.methods.genrateRefreshtoken = function () {
//   return jwt.sign(
//     {
//       _id: this._id,
//     },
//     process.env.REFRESH_TOKEN_SECRET,
//     { expiresIn: process.env.REFRESH_TOKEN_EXPIRY },
//   );
// };

// userschema.methods.generatetemporarytoken = function () {
//   const unhased_token = crypto.randomBytes(20).toString("hex");
//   const hased_token = crypto
//     .createHash("sha256")
//     .update(unhased_token)
//     .digest("hex");

//   const token_expiry = Date.now() + 20 * 60 * 1000;
//   return { unhased_token, hased_token, token_expiry };
// };

// export const User = mongoose.model("User", userschema);

/*
for clearner version
*/

import mongoose, { Schema } from "mongoose";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import crypto from "crypto";

const userSchema = new Schema(
  {
    avatar: {
      type: {
        url: String,
        localPath: String,
      },

      default: {
        url: "https://placehold.co/200x200",
        localPath: "",
      },
    },

    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },

    fullName: {
      type: String,
      trim: true,
    },

    password: {
      type: String,
      required: [true, "Password is required"],
    },

    isEmailVerified: {
      type: Boolean,
      default: false,
    },

    refreshToken: {
      type: String,
    },

    passwordResetToken: {
      type: String,
    },

    passwordResetTokenExpiry: {
      type: Date,
    },

    emailVerificationToken: {
      type: String,
    },

    emailVerificationTokenExpiry: {
      type: Date,
    },
  },
  {
    timestamps: true,
  },
);

// Hash password before saving
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;

  this.password = await bcrypt.hash(this.password, 10);
});
// Compare password
userSchema.methods.isPasswordCorrect = async function (password) {
  return await bcrypt.compare(password, this.password);
};

// Generate Access Token
userSchema.methods.generateAccessToken = function () {
  return jwt.sign(
    {
      _id: this._id,
      email: this.email,
      username: this.username,
    },
    process.env.ACCESS_TOKEN_SECRET,
    {
      expiresIn: process.env.ACCESS_TOKEN_EXPIRY,
    },
  );
};

// Generate Refresh Token
userSchema.methods.generateRefreshToken = function () {
  return jwt.sign(
    {
      _id: this._id,
    },
    process.env.REFRESH_TOKEN_SECRET,
    {
      expiresIn: process.env.REFRESH_TOKEN_EXPIRY,
    },
  );
};

// Generate Temporary Token
userSchema.methods.generateTemporaryToken = function () {
  const unhashedToken = crypto.randomBytes(20).toString("hex");

  const hashedToken = crypto
    .createHash("sha256")
    .update(unhashedToken)
    .digest("hex");

  const tokenExpiry = Date.now() + 20 * 60 * 1000;

  return {
    unhashedToken,
    hashedToken,
    tokenExpiry,
  };
};

export const User = mongoose.model("User", userSchema);
