const jwt = require("jsonwebtoken");
const User = require("../dataBaseModel/model.js");

module.exports.verifyRefreshToken = async (refreshToken) => {

  const user = jwt.verify(refreshToken, process.env.REFRESH_TOKEN);

  const check = User.findById(user._id);

  if (!check) {
    console.log("false token");
    return new Error("Invalid Token");
  } else {
    return user;
  }

  return;
};
