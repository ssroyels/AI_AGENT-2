import "dotenv/config";
import http from "http";
import app from "./app.js";
import { Server } from "socket.io";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";
import projectModel from "./models/project.model.js";
import { generateResult } from "./services/ai.service.js";
import cors from "cors";

const port = process.env.PORT || 5000;

/* -------------------------------------------------------------------------- */
/* ALLOWED ORIGINS */
/* -------------------------------------------------------------------------- */
// const ALLOWED_ORIGINS ="https://ai-agent-2-dgir.onrender.com";


/* -------------------------------------------------------------------------- */
/* EXPRESS CORS */
/* -------------------------------------------------------------------------- */
app.use(
  cors({
    origin: "*",
    credentials: true,
  })
);

/* -------------------------------------------------------------------------- */
/* HTTP SERVER */
/* -------------------------------------------------------------------------- */
const server = http.createServer(app);

/* -------------------------------------------------------------------------- */
/* SOCKET.IO SERVER */
/* -------------------------------------------------------------------------- */
const io = new Server(server, {
  cors: {
    origin: "*",
    credentials: true,
  },
});

/* -------------------------------------------------------------------------- */
/* SOCKET AUTH MIDDLEWARE */
/* -------------------------------------------------------------------------- */
io.use(async (socket, next) => {
  try {
    const token =
      socket.handshake.auth?.token ||
      socket.handshake.headers.authorization?.split(" ")[1];

    const { projectId } = socket.handshake.query;

    if (!token) {
      return next(new Error("No auth token provided"));
    }

    if (!mongoose.Types.ObjectId.isValid(projectId)) {
      return next(new Error("Invalid projectId"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    socket.user = decoded;

    const project = await projectModel.findById(projectId);
    if (!project) {
      return next(new Error("Project not found"));
    }

    socket.project = project;
    next();
  } catch (err) {
    console.error("🔴 Socket auth error:", err.message);
    next(new Error("Unauthorized socket connection"));
  }
});

/* -------------------------------------------------------------------------- */
/* SOCKET EVENTS */
/* -------------------------------------------------------------------------- */
io.on("connection", (socket) => {
  const roomId = socket.project._id.toString();
  socket.join(roomId);

  console.log("🟢 Socket connected:", socket.id);

  socket.on("project-message", async (data) => {
    const message = data.message;

    socket.broadcast.to(roomId).emit("project-message", data);

    if (message.includes("@ai")) {
      const prompt = message.replace("@ai", "").trim();
      const result = await generateResult(prompt);

      io.to(roomId).emit("project-message", {
        message: result,
        sender: { _id: "ai", email: "AI" },
      });
    }
  });

  socket.on("disconnect", () => {
    console.log("🔴 Socket disconnected:", socket.id);
    socket.leave(roomId);
  });
});

/* -------------------------------------------------------------------------- */
/* START SERVER */
/* -------------------------------------------------------------------------- */
server.listen(port, () => {
  console.log(`🚀 Server running on port ${port}`);
});
