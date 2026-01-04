import jwt from "jsonwebtoken";
import redisClient from "../services/redis.service.js";

export const authUser = async (req, res, next) => {
  try {
    // ✅ Safely extract token
    const authHeader = req.headers.authorization;
    console.log(authHeader)
    const token =
      req.cookies?.token ||
      (authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null);

        console.log(token)

    if (!token) {
      return res.status(401).json({ error: "Unauthorized User: Token missing" });
    }
    console.log("satyam bhai", token)

    // ✅ Check blacklist
    const isBlackListed = await redisClient.get(token);
    if (isBlackListed) {
      res.clearCookie("token");
      return res.status(401).json({ error: "Unauthorized User: Token revoked" });
    }

    // ✅ Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;

    next();
  } catch (error) {
    console.error("Auth Error:", error.message);
    return res.status(401).json({ error: "Unauthorized User: Invalid token" });
  }
};
