const User = require("../dataBaseModel/model.js");
const jwt = require("jsonwebtoken");
const sendEmail = require("../utils/email.js");

//User signup
const signup = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    if (!(name || email || password)) {
      return res.status(400).json({
        success: false,
        msg: "All fields are required",
      });
    }

    //check for user already exist or not
    const userExist = await User.findOne({ email });

    //check for email already exist or not
    const userNameExist = await User.findOne({ name });

    if (userExist) {
      return res
        .status(400)
        .json({ msg: "User mail already exist", status: false });
    } else if (userNameExist) {
      return res
        .status(400)
        .json({ msg: "Username is already taken", status: false });
    }

    //Adding user in database
    const data = await User.create({ name, email, password });

    //Generating token
    const token = jwt.sign({ _id: data._id }, process.env.SECRET_KEY);

    //returning response with token and staus of true or false
    return res.status(201).json({
      status: true,
      msg: "Account created successfully",
      token,
    });
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, msg: "Couldn't create account", error });
  }
};

//User Login
const login = async (req, res) => {
  try {
    const { credential, password } = req.body;
    if (!password) {
      return res.status(400).json({
        msg: "Password required",
      });
    }

    //credentail can be an email or username
    var userMail = await User.findOne({ email: credential });
    var userName = await User.findOne({ name: credential });

    //if credential is wrong it is neither email nor username so we will return invalid credential
    if (userMail == null && userName == null) {
      return res
        .status(401)
        .json({ msg: "Invalid Email/Username", status: false });
    }

    //It will check whether the input is a valid email id or valid userName
    const userExist = userMail ? userMail : userName;

    if (userExist) {
      //Match password
      const isMatch = await userExist.matchPassword(password);
      if (isMatch) {
        //Generate token
        const token = await userExist.generateToken();

        res.cookie("jwt", token, {
          expires: new Date(Date.now() + 1000000000000),
        });

        res.status(201).json({
          status: true,
          token: token,
          id: userExist._id,
        });
      } else {
        return res
          .status(400)
          .json({ status: false, msg: "Invalid Credentials" });
      }
    } else {
      return res
        .status(400)
        .json({ status: false, msg: "Invalid Credentials" });
    }
  } catch (error) {
    return res
      .status(500)
      .json({ status: false, msg: "Sign in  failed!", error });
  }
};

//User forgotPassword
const forgotPassword = async (req, res) => {
  try {
    if (!req.body.email) {
      return res.json({ status: false, msg: "Email field cannot be empty!" });
    }
    const user = await User.findOne({ email: req.body.email });
    if (!user) {
      return res.status(404).json({ status: false, msg: "User not found" });
    }
    //generating random token
    const resetToken = await user.createResetPasswordToken();
    await user.save();

    //sending email
    const resetUrl = `${req.protocol}://${req.get(
      "host"
    )}/reset-password/${resetToken}`;

    //constructed a demo messg
    const message = `we have received password reset request. Please click on link to reset your password\n\n ${resetUrl}\n click on it. Valid only for 10Min`;

    await sendEmail({
      email: user.email,
      subject: "Password reset request",
      message: message,
    });

    return res.status(200).json({
      msg: "Password reset link send to email",
    });
  } catch (error) {
    const user = await User.findOne({ email: req.body.email });
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpire = undefined;
    res.status(500).json({ msg: "Error occured while sending the mail" });
  }
};

//User ResetPassword
const resetPassword = async (req, res) => {
  try {
    //hasing token
    const token = crypto
      .createHash("sha512")
      .update(req.params.token)
      .digest("hex");

    //finding a user
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetTokenExpire: { $gt: Date.now() },
    });

    //if user not found
    if (!user) {
      res
        .status(400)
        .json({ msg: "Token is invalid or expired", status: false });
    }

    //updating fields
    user.password = req.body.password;
    user.passwordResetToken = undefined;
    user.passwordResetTokenExpire = undefined;
    await user.save();
    res.status(200).json({
      msg: "Password has been successfully changed! You can now login.",
    });
  } catch (error) {
    res.status(500).json({ msg: "Password reset failed", status: false });
  }
};

module.exports = { signup, login, forgotPassword, resetPassword };
