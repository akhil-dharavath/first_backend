const express = require("express");
const cors = require('cors');
require("dotenv").config();
const dbConnection = require("./config/dbConnection");

dbConnection();
const app = express();
const PORT = process.env.PORT || 80;

app.use(express.json());
app.use(cors())

app.use("/auth", require("./routes/authentication"));
app.use("/blogs", require("./routes/blogs"));

app.listen(PORT, () => console.log("server listening on port", PORT));
