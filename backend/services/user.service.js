import userModel from "../models/user.model.js";

/* -------------------------------------------------------------------------- */
/* CREATE USER */
/* -------------------------------------------------------------------------- */

export const createUser = async ({ name, email, password }) => {

  if (!email || !password) {
    throw new Error("Email and password are required");
  }

  /* ---------------- CHECK USER EXISTS ---------------- */

  const existingUser = await userModel.findOne({ email });

  if (existingUser) {
    throw new Error("User already exists");
  }

  /* ---------------- HASH PASSWORD ---------------- */

  const hashedPassword = await userModel.hashPassword(password);

  /* ---------------- CREATE USER ---------------- */

  const user = await userModel.create({
    name,
    email,
    password: hashedPassword
  });

  return user;

};


/* -------------------------------------------------------------------------- */
/* GET ALL USERS */
/* -------------------------------------------------------------------------- */

export const getAllUsers = async ({ userId }) => {

  if (!userId) {
    throw new Error("User ID is required");
  }

  const users = await userModel
    .find({
      _id: { $ne: userId }
    })
    .select("-password"); // hide password

  return users;

};