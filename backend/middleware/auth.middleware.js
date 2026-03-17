import jwt from "jsonwebtoken";
import redisClient from "../services/redis.service.js";

export const authUser = async (req, res, next) => {
  try {

    const authHeader = req.headers.authorization;

    const token =
      req.cookies?.token ||
      (authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null);

    console.log("AUTH HEADER:", authHeader);
    console.log("TOKEN:", token);

    if (!token) {
      return res.status(401).json({ error: "Token missing" });
    }

    const isBlackListed = await redisClient.get(token);

    if (isBlackListed) {
      res.clearCookie("token");
      return res.status(401).json({ error: "Token revoked" });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    console.log("DECODED USER:", decoded);

    req.user = decoded;

    next();

  } catch (error) {

    console.log("JWT ERROR:", error.message);

    return res.status(401).json({
      error: "Unauthorized User: " + error.message
    });

  }
};