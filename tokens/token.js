const jwt = require("jsonwebtoken");
const User=require("../dataBaseModel/model.js")

module.exports.generateToken = async (user) => {
  try {

    const payload = { _id: user._id };
    const accessToken = jwt.sign(payload, process.env.SECRET_KEY, {
      expiresIn: "30min",
    });
    const refreshToken = jwt.sign(payload, process.env.REFRESH_TOKEN, {
      expiresIn: "30d",
    });
  
    const userToken = await User.findByIdAndUpdate(
      user._id,
      {
        $push: {
          tokens: {
            token: accessToken,
            createdAt: new Date(),
          },
        },
      },
      { new: true }
    );
    // console.log(userToken.tokens);
    return {accessToken,refreshToken};
  } catch (error) {
    // console.log(error);
    res.status(500).json({ status: false, msg: "Server error" });
  }
};
