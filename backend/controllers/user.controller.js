import userModel from "../models/user.model.js";
import * as userService from "../services/user.service.js";
import { validationResult } from "express-validator";
import redisClient from "../services/redis.service.js";

/* -------------------------------------------------------------------------- */
/* REGISTER */
/* -------------------------------------------------------------------------- */

export const createUserController = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {
    const { name, email, password } = req.body;

    const user = await userService.createUser({ name, email, password });

    const token = await user.generateJWT();

    const userObj = user.toObject();
    delete userObj.password;

    res.status(201).json({
      user: userObj,
      token
    });

  } catch (error) {
    res.status(400).json({
      error: error.message
    });
  }
};


/* -------------------------------------------------------------------------- */
/* LOGIN */
/* -------------------------------------------------------------------------- */

export const loginController = async (req, res) => {

  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  try {

    const { email, password } = req.body;

    const user = await userModel
      .findOne({ email })
      .select("+password");

    if (!user) {
      return res.status(401).json({
        error: "Invalid credentials"
      });
    }

    const isMatch = await user.isValidPassword(password);

    if (!isMatch) {
      return res.status(401).json({
        error: "Invalid credentials"
      });
    }

    const token = await user.generateJWT();

    const userObj = user.toObject();
    delete userObj.password;

    res.status(200).json({
      user: userObj,
      token
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: "Login failed"
    });

  }

};


/* -------------------------------------------------------------------------- */
/* PROFILE */
/* -------------------------------------------------------------------------- */

export const profileController = async (req, res) => {

  res.status(200).json({
    user: req.user
  });

};


/* -------------------------------------------------------------------------- */
/* LOGOUT */
/* -------------------------------------------------------------------------- */

export const logoutController = async (req, res) => {

  try {

    const token =
      req.cookies?.token ||
      req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(400).json({
        error: "Token missing"
      });
    }

    /* ---------------- BLACKLIST TOKEN ---------------- */

    await redisClient.set(
      token,
      "logout",
      "EX",
      60 * 60 * 24
    );

    res.status(200).json({
      message: "Logged out successfully"
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: "Logout failed"
    });

  }

};


/* -------------------------------------------------------------------------- */
/* GET ALL USERS */
/* -------------------------------------------------------------------------- */

export const getAllUsersController = async (req, res) => {

  try {

    const loggedInUser = await userModel.findOne({
      email: req.user.email
    });

    const allUsers = await userService.getAllUsers({
      userId: loggedInUser._id
    });

    res.status(200).json({
      users: allUsers
    });

  } catch (err) {

    console.log(err);

    res.status(500).json({
      error: err.message
    });

  }

};