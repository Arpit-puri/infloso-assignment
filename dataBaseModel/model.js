const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const crypto = require("crypto");
const jwt = require("jsonwebtoken");

//SCHEMA SETUP
const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    require: true,
  },
  email: {
    type: String,
    required: [true, "Please provide a unique email"],
    unique: true,
  },
  // virtual field for storing the hashed version of our password on the server side
  password: {
    type: String,
    required: [true, "Please provide a password"],
    unique: false,
  },
  passwordResetToken: String,
  passwordResetTokenExpire: Date,
  tokens: [
    {
      token: {
        type: String,
        required: true,
      },
    },
  ],
});

//creating intance methods

UserSchema.methods.generateToken = async function () {
  try {
    const token = jwt.sign({ _id: this._id }, process.env.SECRET_KEY);
    this.tokens = this.tokens.concat({ token: token });
    await this.save();
    return token;
  } catch (err) {
    console.log("Error while generating token");
    return resizeBy.status(500).send(err);
  }
};
UserSchema.pre("save", async function (next) {
  if (this.isModified("password")) {
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
  }
  next();
});

UserSchema.methods.matchPassword = async function (password) {
  const data = await bcrypt.compare(password, this.password);
  return data;
};

UserSchema.methods.createResetPasswordToken = async function () {
  const resetToken = crypto.randomBytes(20).toString("hex");
  this.passwordResetToken=crypto.createHash("sha512").update(resetToken).digest("hex");
  this.passwordResetTokenExpire = Date.now() + 10 * 60 * 1000;
  return resetToken;
};

const hostPerson = mongoose.model("User", UserSchema);

module.exports = hostPerson;
