import jwt from "jsonwebtoken";
import redisClient from "../services/redis.service.js";

export const authUser = async (req, res, next) => {
  try {

    /* -------------------------------------------------------------------------- */
    /* TOKEN EXTRACT */
    /* -------------------------------------------------------------------------- */

    const authHeader = req.headers.authorization;

    let token =
      req.cookies?.token ||
      (authHeader && authHeader.startsWith("Bearer ")
        ? authHeader.split(" ")[1]
        : null);

    if (!token) {
      return res.status(401).json({
        error: "Unauthorized: Token missing"
      });
    }

    /* -------------------------------------------------------------------------- */
    /* CHECK REDIS BLACKLIST */
    /* -------------------------------------------------------------------------- */

    let isBlackListed = null;

    try {
      isBlackListed = await redisClient.get(token);
    } catch (err) {
      console.log("Redis error (ignored):", err.message);
    }

    if (isBlackListed) {
      res.clearCookie("token");

      return res.status(401).json({
        error: "Unauthorized: Token revoked"
      });
    }

    /* -------------------------------------------------------------------------- */
    /* VERIFY JWT */
    /* -------------------------------------------------------------------------- */

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    if (!decoded) {
      return res.status(401).json({
        error: "Unauthorized: Invalid token"
      });
    }

    req.user = decoded;

    next();

  } catch (error) {

    console.log("Auth Error:", error.message);

    return res.status(401).json({
      error: "Unauthorized User"
    });

  }
};