const express = require("express");
const multer = require("multer");
const path = require("path");
const { User } = require("../models/user");

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    return cb(null, path.resolve("./public/uploads/"));
  },
  filename: function (req, file, cb) {
    const fileName = `${Date.now()}-${file.originalname}`;
    cb(null, fileName);
  },
});

const upload = multer({ storage });

router.get("/signin", (req, res) => {
  res.render("signin");
});

router.get("/signup", (req, res) => {
  res.render("signup");
});

router.post("/signin", async (req, res) => {
  const { email, password } = req.body;
  try {
    const token = await User.matcPasswordAndGenerateToken(email, password);
    return res.cookie("token", token).redirect("/");
  } catch (error) {
    return res.render("signin", {
      error: "Incorrect Credentials",
    });
  }
});

router.post("/signup", upload.single("profileImage"), async (req, res) => {
  const { fullName, email, password } = req.body;
  await User.create({
    fullName,
    email,
    password,
    profileImageURL: `/uploads/${req.file.filename}`,
  });
  res.redirect("/");
});

router.get("/logout", (req, res)=>{
  res.clearCookie("token").redirect("/");
});


module.exports = router;
