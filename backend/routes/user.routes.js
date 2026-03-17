import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { body } from "express-validator";
import * as authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

/* -------------------------------------------------------------------------- */
/* REGISTER */
/* -------------------------------------------------------------------------- */

router.post(
  "/register",

  body("name")
    .trim()
    .isLength({ min: 3 })
    .withMessage("Name must be at least 3 characters"),

  body("email")
    .isEmail()
    .withMessage("Valid email is required"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  userController.createUserController
);

/* -------------------------------------------------------------------------- */
/* LOGIN */
/* -------------------------------------------------------------------------- */

router.post(
  "/login",

  body("email")
    .isEmail()
    .withMessage("Valid email is required"),

  body("password")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters"),

  userController.loginController
);

/* -------------------------------------------------------------------------- */
/* PROFILE */
/* -------------------------------------------------------------------------- */

router.get(
  "/profile",
  authMiddleware.authUser,
  userController.profileController
);

/* -------------------------------------------------------------------------- */
/* LOGOUT */
/* -------------------------------------------------------------------------- */

router.post(
  "/logout",
  authMiddleware.authUser,
  userController.logoutController
);

/* -------------------------------------------------------------------------- */
/* GET ALL USERS */
/* -------------------------------------------------------------------------- */

router.get(
  "/all",
  authMiddleware.authUser,
  userController.getAllUsersController
);

export default router;