const mongoose = require("mongoose");

const connect = async () => {
  try {
    await mongoose.connect(process.env.DB_CONNECTION_STRING);
    console.log("connected to database");
  } catch (error) {
    console.log("trouble connecting database", error);
  }
};
module.exports = connect;
