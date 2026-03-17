import express from "express";
import morgan from "morgan";
import connect from "./db/db.js";
import userRoutes from "./routes/user.routes.js";
import projectRoutes from "./routes/project.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";

/* -------------------------------------------------------------------------- */
/* DATABASE CONNECT */
/* -------------------------------------------------------------------------- */

connect();

const app = express();

/* -------------------------------------------------------------------------- */
/* ALLOWED ORIGINS */
/* -------------------------------------------------------------------------- */

const allowedOrigins = [
  "http://localhost:5173",
  "https://ai-agent-2-1.onrender.com",
  "https://ai-agent-2-dgir.onrender.com",
];

/* -------------------------------------------------------------------------- */
/* CORS CONFIG */
/* -------------------------------------------------------------------------- */

app.use(
  cors({
    origin: function (origin, callback) {

      if (!origin) return callback(null, true);

      if (allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("CORS not allowed"));
      }

    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"]
  })
);

/* -------------------------------------------------------------------------- */
/* MIDDLEWARES */
/* -------------------------------------------------------------------------- */

app.use(morgan("dev"));
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* -------------------------------------------------------------------------- */
/* HEALTH CHECK */
/* -------------------------------------------------------------------------- */

app.get("/", (req, res) => {
  res.status(200).json({
    status: "OK",
    message: "🚀 AI Agent API is running"
  });
});

/* -------------------------------------------------------------------------- */
/* ROUTES */
/* -------------------------------------------------------------------------- */

app.use("/users", userRoutes);
app.use("/projects", projectRoutes);
app.use("/ai", aiRoutes);

/* -------------------------------------------------------------------------- */
/* GLOBAL ERROR HANDLER */
/* -------------------------------------------------------------------------- */

app.use((err, req, res, next) => {

  console.error("Server Error:", err.message);

  res.status(err.status || 500).json({
    success: false,
    message: err.message || "Internal Server Error"
  });

});

export default app;