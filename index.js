const express = require("express");
const app = express();
const path = require("path");
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.use(express.json());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "/public")));
require("dotenv").config();
require("./config/database").connect();
const userRouter = require("./routes/userRouter");
app.use("/", userRouter);
app.listen(3000, () => {
  console.log(`Server is running`);
});
