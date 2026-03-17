import { Router } from "express";
import { body, param } from "express-validator";
import * as projectController from "../controllers/project.controller.js";
import * as authMiddleware from "../middleware/auth.middleware.js";

const router = Router();

/* -------------------------------------------------------------------------- */
/* CREATE PROJECT */
/* -------------------------------------------------------------------------- */

router.post(
  "/create",
  authMiddleware.authUser,

  body("name")
    .trim()
    .notEmpty()
    .withMessage("Project name is required"),

  projectController.createProject
);

/* -------------------------------------------------------------------------- */
/* GET ALL PROJECTS */
/* -------------------------------------------------------------------------- */

router.get(
  "/all",
  authMiddleware.authUser,
  projectController.getAllProject
);

/* -------------------------------------------------------------------------- */
/* ADD USERS TO PROJECT */
/* -------------------------------------------------------------------------- */

router.put(
  "/add-user",
  authMiddleware.authUser,

  body("projectId")
    .notEmpty()
    .withMessage("Project ID is required"),

  body("users")
    .isArray({ min: 1 })
    .withMessage("Users must be a non-empty array"),

  body("users.*")
    .isString()
    .withMessage("Each user must be a valid userId"),

  projectController.addUserToProject
);

/* -------------------------------------------------------------------------- */
/* GET PROJECT BY ID */
/* -------------------------------------------------------------------------- */

router.get(
  "/:projectId",
  authMiddleware.authUser,

  param("projectId")
    .notEmpty()
    .withMessage("Project ID is required"),

  projectController.getProjectById
);

/* -------------------------------------------------------------------------- */
/* UPDATE FILE TREE */
/* -------------------------------------------------------------------------- */

router.put(
  "/file-tree",
  authMiddleware.authUser,

  body("projectId")
    .notEmpty()
    .withMessage("Project ID is required"),

  body("fileTree")
    .isObject()
    .withMessage("fileTree must be an object"),

  projectController.updateFileTree
);

export default router;