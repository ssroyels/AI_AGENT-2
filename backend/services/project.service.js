import projectModel from "../models/project.model.js";
import mongoose from "mongoose";

/* -------------------------------------------------------------------------- */
/* CREATE PROJECT */
/* -------------------------------------------------------------------------- */

export const createProject = async ({ name, userId }) => {

  if (!name) {
    throw new Error("Project name is required");
  }

  if (!userId) {
    throw new Error("UserId is required");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid userId");
  }

  try {

    const project = await projectModel.create({
      name,
      users: [userId]
    });

    return project;

  } catch (error) {

    if (error.code === 11000) {
      throw new Error("Project name already exists");
    }

    throw error;
  }
};


/* -------------------------------------------------------------------------- */
/* GET ALL PROJECTS FOR USER */
/* -------------------------------------------------------------------------- */

export const getAllProjectByUserId = async ({ userId }) => {

  if (!userId) {
    throw new Error("UserId is required");
  }

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error("Invalid userId");
  }

  const projects = await projectModel
    .find({ users: userId })
    .populate("users", "-password")
    .lean();

  return projects;
};


/* -------------------------------------------------------------------------- */
/* ADD USERS TO PROJECT */
/* -------------------------------------------------------------------------- */

export const addUsersToProject = async ({ projectId, users, userId }) => {

  if (!projectId) throw new Error("projectId is required");

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid projectId");
  }

  if (!Array.isArray(users) || users.length === 0) {
    throw new Error("Users array is required");
  }

  if (users.some((id) => !mongoose.Types.ObjectId.isValid(id))) {
    throw new Error("Invalid userId(s)");
  }

  if (!userId) {
    throw new Error("userId is required");
  }

  /* ---------------- VERIFY USER BELONGS TO PROJECT ---------------- */

  const project = await projectModel.findOne({
    _id: projectId,
    users: userId
  });

  if (!project) {
    throw new Error("User does not belong to this project");
  }

  /* ---------------- ADD USERS ---------------- */

  const updatedProject = await projectModel.findByIdAndUpdate(
    projectId,
    {
      $addToSet: {
        users: { $each: users }
      }
    },
    {
      new: true
    }
  ).populate("users", "-password");

  return updatedProject;
};


/* -------------------------------------------------------------------------- */
/* GET PROJECT BY ID */
/* -------------------------------------------------------------------------- */

export const getProjectById = async ({ projectId }) => {

  if (!projectId) {
    throw new Error("projectId is required");
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid projectId");
  }

  const project = await projectModel
    .findById(projectId)
    .populate("users", "-password")
    .lean();

  return project;
};


/* -------------------------------------------------------------------------- */
/* UPDATE FILE TREE */
/* -------------------------------------------------------------------------- */

export const updateFileTree = async ({ projectId, fileTree }) => {

  if (!projectId) {
    throw new Error("projectId is required");
  }

  if (!mongoose.Types.ObjectId.isValid(projectId)) {
    throw new Error("Invalid projectId");
  }

  if (!fileTree) {
    throw new Error("fileTree is required");
  }

  const project = await projectModel.findByIdAndUpdate(
    projectId,
    { fileTree },
    { new: true }
  );

  return project;
};