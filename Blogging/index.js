const express = require("express");
const path = require("path");
const mongoose = require("mongoose");
const cookieParser = require("cookie-parser");

const Blog = require("../models/blog");

mongoose
  .connect("mongodb://localhost:27017/bloggy")
  .then((error) => console.log("DataBase connected VIRATTTZZZ"));

// mongoose //to run on cloud
//   .connect(process.env.MONGO_URL)
//   .then((error) => console.log("DataBase connected VIRATTTZZZ"));

const userRoute = require("../routes/user");
const blogRoute = require("../routes/blog");

const app = express();
const PORT = process.env.PORT || 8001; //the Cloud generated a dynamic port on the internet to run the app

const { error } = require("console");
const { checkForAuthenticationCookie } = require("../middleware/user");

app.set("view engine", "ejs");
app.set("views", path.resolve("./views"));

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false })); //helps you parse form data from frontend
app.use(checkForAuthenticationCookie("token"));
app.use(express.static(path.resolve("./public")));

app.get("/", async (req, res) => {
  const allBlogs = await Blog.find({});
  res.render("home", {
    user: req.user,
    blogs: allBlogs,
  });
});

app.get("/", (req, res) => {
  res.render("home", {
    user: req.user,
  });
});

app.use("/user", userRoute);
app.use("/blog", blogRoute);

app.listen(PORT, () => {
  console.log(`${PORT} has started, upload the files`);
});
