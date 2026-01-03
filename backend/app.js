import express from "express";
import morgan from "morgan";
import connect from "./db/db.js";
import userRoutes from "./routes/user.routes.js";
import projectRoutes from "./routes/project.routes.js";
import aiRoutes from "./routes/ai.routes.js";
import cookieParser from "cookie-parser";
import cors from "cors";

connect();

const app = express();

/* -------------------------------------------------------------------------- */
/* CORS CONFIG (PRODUCTION SAFE) */
/* -------------------------------------------------------------------------- */
const ALLOWED_ORIGINS = [
  "http://localhost:5173",
  "https://ai-agent-2-1.onrender.com",
  "https://ai-agent-2-dgir.onrender.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      // allow REST tools like Postman
      if (!origin) return callback(null, true);

      if (ALLOWED_ORIGINS.includes(origin)) {
        return callback(null, true);
      }

      return callback(new Error("Not allowed by CORS"));
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  })
);

/* -------------------------------------------------------------------------- */
/* MIDDLEWARES */
/* -------------------------------------------------------------------------- */
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

/* -------------------------------------------------------------------------- */
/* HEALTH CHECK */
/* -------------------------------------------------------------------------- */
app.get("/", (req, res) => {
  res.send("🚀 AI Agent API is live!");
});

/* -------------------------------------------------------------------------- */
/* ROUTES */
/* -------------------------------------------------------------------------- */
app.use("/users", userRoutes);
app.use("/projects", projectRoutes);
app.use("/ai", aiRoutes);

export default app;
