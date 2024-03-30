const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

// @desc - Create a new user account.
// @route - POST /users/register
// @access - public
const register = asyncHandler(async (req, res) => {
  // check whether all required fields are entered
  const { username, email, password, role } = req.body;
  if (!username || !email || !password) {
    res.status(400).json({ message: "Please enter required fields" });
    // throw new Error("Please enter required fields");
  }
  // check user with this email already exists
  const checkUser = await User.findOne({ email });
  if (checkUser) {
    res.status(400).json({
      message: "User with this email already exists! Choose a unique email",
    });
    // throw new Error(
    //   "User with this email already exists! Choose a unique email"
    // );
  }
  const roleOfUser = role ? role : "user";
  // hash password
  const hashedPassword = await bcrypt.hash(password, 10);
  const user = await User.create({
    username,
    email,
    password: hashedPassword,
    role: roleOfUser,
  });
  if (!user) {
    res.status(500).json({ message: "Internal server Error" });
    // throw new Error("Internal server Error");
  }
  // create json web token with secret key
  const token = jwt.sign(
    { user: { username, email, role: roleOfUser, id: user._id } },
    process.env.JWT_SECRET_KEY
  );
  res.status(201).json({ token });
});

// @desc - Authenticate the user and issue an access token.
// @route - POST /users/login
// @access - public
const login = asyncHandler(async (req, res) => {
  // check whether all required fields are entered
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({ message: "Please enter required fields" });
    // throw new Error("Please enter required fields");
  }
  // check whether the entered email is registered
  const user = await User.findOne({ email });
  if (!user) {
    res.status(401).json({ message: "Invalid login credentials" });
    // throw new Error("Invalid login credentials");
  }
  if (!user.enable) {
    res.status(401).json({ message: "Invalid login credentials" });
  }
  // compare the enterd password and existing password
  const comparePassword = await bcrypt.compare(password, user.password);
  if (!comparePassword) {
    res.status(401).json({ message: "Invalid login credentials" });
    // throw new Error("Invalid login credentials");
  }
  // create json web token with secret key
  const token = jwt.sign(
    {
      user: { username: user.username, email, role: user.role, id: user._id },
    },
    process.env.JWT_SECRET_KEY
  );
  res.status(200).json({ token });
});

// @desc - Retrieve user profile information.
// @route - GET /auth/getuser
// @access - private - user access
const getUserDetails = asyncHandler(async (req, res) => {
  // check whether the user is logged in
  if (!req.user.id) {
    res.status(401).json({ message: "You are not authorized" });
    // throw new Error("You are not authorized");
  }
  // get user details
  const user = await User.findById(req.user.id).select("-password");
  res.json(user);
});

// @desc - Retrieve user profile information.
// @route - GET /auth/getall
// @access - private - Admin access
const getAllUsers = asyncHandler(async (req, res) => {
  // check whether the user is logged in
  // if (!req.user.id || req.user.role !=="Administrator") {
  //   res.status(401).json({ message: "You are not authorized" });
  // }
  // get user details
  const users = await User.find({}).select("-password");
  res.json(users);
});

// @desc - Disable a user.
// @route - PUT /auth/disable
// @access - private - Admin access
const disableUser = asyncHandler(async (req, res) => {
  // check whether the user is logged in
  if (!req.user.id) {
    res.status(401).json({ message: "You are not authorized" });
    // throw new Error("You are not authorized");
  }
  if (req.user.role !== "Administrator") {
    res.status(403).json({ message: "You have no access for this action" });
  }
  if (!req.body.user) {
    res.status(400).json({ message: "no user data has been entered" });
  }
  // get user details
  const user = await User.findByIdAndUpdate(
    req.body.user,
    { enable: false },
    { new: true }
  ).select("-password");
  if (!user) {
    res.status(400).json({ message: "Invalid user details" });
  }
  res.json(user);
});

// @desc - Enable a user.
// @route - PUT /auth/enable
// @access - private - Admin access
const enableUser = asyncHandler(async (req, res) => {
  // check whether the user is logged in
  if (!req.user.id) {
    res.status(401).json({ message: "You are not authorized" });
    // throw new Error("You are not authorized");
  }
  if (req.user.role !== "Administrator") {
    res.status(403).json({ message: "You have no access for this action" });
  }
  // get user details
  if (!req.body.user) {
    res.status(400).json({ message: "no user data has been entered" });
  }
  // get user details
  const user = await User.findByIdAndUpdate(
    req.body.user,
    { enable: true },
    { new: true }
  ).select("-password");
  if (!user) {
    res.status(400).json({ message: "Invalid user details" });
  }
  res.json(user);
});

module.exports = { register, login, getUserDetails, getAllUsers, disableUser, enableUser };
