const mongoose = require("mongoose");

const userSchema = mongoose.Schema(
  {
    username: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, default: "Student" }, // Administrator, Student, Moderator, Staff
    enable: { type: Boolean, default: true },
    unSubscribed: [{ type: mongoose.Schema.Types.ObjectId }],
  },
  {
    versionKey: false, // Disable the "__v" field
  }
);

module.exports = mongoose.model("User", userSchema);
