// import express from "express";
// import cors from "cors";

// const app = express();
// app.use(express.json({ limit: "16kb" }));
// app.use(express.urlencoded({ extended: true, limit: "16kb" }));
// app.use(express.static("public"));

// //cors
// app.use(
//   cors({
//     origin: process.nextTick.CORS_ORIGIN?.spli(",") || "http://localhost:5173",
//     credentials: true,
//     methods: ["GET", "POST", "OUT", "PATCH", "DELETE", "OPTIONS"],
//     allowedHeaders: ["content-type", "authorization"],
//   }),
// );
// //import thr routes
// import healthcheckRouter from "./routes/health.routes.js";
// import authRouter from "./routes/auth.routes.js";

// app.use("/api/v1/healthcheck", healthcheckRouter);
// app.use("/api/v1/auth", authRouter);

// app.get("/", (req, res) => {
//   res.send("Hello World!");
// });

// export default app;

/*
for clearner version
*/

import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

// Middlewares
app.use(express.json({ limit: "16kb" }));

app.use(
  express.urlencoded({
    extended: true,
    limit: "16kb",
  }),
);

app.use(express.static("public"));
app.use(cookieParser());

// CORS
const corsOrigins = process.env.CORS_ORIGIN === "*" 
  ? "*" 
  : process.env.CORS_ORIGIN?.split(",") || ["http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:5176"];

app.use(
  cors({
    origin: corsOrigins,

    credentials: true,

    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],

    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);
// Import routes
import healthcheckRouter from "./routes/health.routes.js";
import authRouter from "./routes/auth.routes.js";
import projectRouter from "./routes/project.routes.js";

import taskRouter from "./routes/task.routes.js";

// Routes
app.use("/api/v1/healthcheck", healthcheckRouter);

app.use("/api/v1/auth", authRouter);
app.use("/api/v1/users", authRouter);
app.use("/api/v1/projects", projectRouter);

app.get("/", (req, res) => {
  res.send("Hello World!");
});
app.use("/api/v1/tasks", taskRouter);

app.use((err, req, res, next) => {
  return res.status(err.statusCode || 500).json({
    success: false,
    message: err.message || "Internal server error",
    errors: err.errors || [],
    stack: process.env.NODE_ENV === "development" ? err.stack : undefined,
  });
});

export default app;
