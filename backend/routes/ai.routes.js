import { Router } from "express";
import { body } from "express-validator";
import * as aiController from "../controllers/ai.controller.js";
import * as authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

/* -------------------------------------------------------------------------- */
/* GENERATE AI RESULT */
/* -------------------------------------------------------------------------- */

router.post(
  "/generate",

  authMiddleware.authUser,

  body("prompt")
    .isString()
    .isLength({ min: 1 })
    .withMessage("Prompt is required"),

  aiController.getResult
);

export default router;