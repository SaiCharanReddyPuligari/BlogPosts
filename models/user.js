const mongoose = require("mongoose");
const { createHmac, randomBytes } = require("crypto");
const { createTokenForUser } = require("../Blogging/service");

const blogUser = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    salt: {
      type: String,
    },
    profileImageURL: {
      type: String,
      // default: "../spy",
      required: true,
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["User", "Admin"],
      default: "User",
    },
  },
  { timestamps: true }
);

blogUser.pre("save", function (next) {
  //hasing the password using salt
  const user = this;

  if (!user.isModified("password")) return;

  const salt = randomBytes(16).toString();
  const hashPassword = createHmac("sha256", salt)
    .update(user.password)
    .digest("hex");

  this.salt = salt;
  this.password = hashPassword;

  next();
});

blogUser.static("matcPasswordAndGenerateToken",  async function (email, passWord) {
  const user =  await this.findOne({ email });
  if (!user) throw new Error("User not found");

  const salt = user.salt;
  const hashPassword = user.password;

  const unhashPassword = createHmac("sha256", salt) //unhash the password with salt
    .update(passWord)
    .digest("hex");

    if(hashPassword === unhashPassword) throw new Error("Password Incorrect");

   const token= createTokenForUser(user);
   return token;
});

const User = mongoose.model("user", blogUser);

module.exports = {
  User,
};
