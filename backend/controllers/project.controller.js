import * as projectService from "../services/project.service.js";
import userModel from "../models/user.model.js";
import { validationResult } from "express-validator";

/* -------------------------------------------------------------------------- */
/* CREATE PROJECT */
/* -------------------------------------------------------------------------- */

export const createProject = async (req, res) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {

    const { name } = req.body;

    const loggedInUser = await userModel.findOne({
      email: req.user.email
    });

    if (!loggedInUser) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    const newProject = await projectService.createProject({
      name,
      userId: loggedInUser._id
    });

    res.status(201).json({
      project: newProject
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: err.message
    });

  }

};


/* -------------------------------------------------------------------------- */
/* GET ALL PROJECTS */
/* -------------------------------------------------------------------------- */

export const getAllProject = async (req, res) => {

  try {

    const loggedInUser = await userModel.findOne({
      email: req.user.email
    });

    if (!loggedInUser) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    const allUserProjects = await projectService.getAllProjectByUserId({
      userId: loggedInUser._id
    });

    res.status(200).json({
      projects: allUserProjects
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: err.message
    });

  }

};


/* -------------------------------------------------------------------------- */
/* ADD USER TO PROJECT */
/* -------------------------------------------------------------------------- */

export const addUserToProject = async (req, res) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  try {

    const { projectId, users } = req.body;

    const loggedInUser = await userModel.findOne({
      email: req.user.email
    });

    if (!loggedInUser) {
      return res.status(404).json({
        error: "User not found"
      });
    }

    const project = await projectService.addUsersToProject({
      projectId,
      users,
      userId: loggedInUser._id
    });

    res.status(200).json({
      project
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: err.message
    });

  }

};


/* -------------------------------------------------------------------------- */
/* GET PROJECT BY ID */
/* -------------------------------------------------------------------------- */

export const getProjectById = async (req, res) => {

  try {

    const { projectId } = req.params;

    const project = await projectService.getProjectById({
      projectId
    });

    res.status(200).json({
      project
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: err.message
    });

  }

};


/* -------------------------------------------------------------------------- */
/* UPDATE FILE TREE */
/* -------------------------------------------------------------------------- */

export const updateFileTree = async (req, res) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      errors: errors.array()
    });
  }

  try {

    const { projectId, fileTree } = req.body;

    const project = await projectService.updateFileTree({
      projectId,
      fileTree
    });

    res.status(200).json({
      project
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: err.message
    });

  }

};