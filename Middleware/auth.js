const jwt = require("jsonwebtoken");
const User = require("../dataBaseModel/model.js");

const authenticateUser = async (req, res, next) => {
  try {
    //Extract token from header
    const authHeader = req.headers['authorization'];
    //split token because we want token wriiten after bearer
    const token = authHeader&&authHeader.split(' ')[1];
    //checking if token  is undefined or null
    if (!(token||authHeader)) {
        throw new Error("User Not Found").send("Token not available");
    }
    //verifying the  token using json web token
    const verify = jwt.verify(token, process.env.SECRET_KEY);
    
    //finding user throgh id in token
    const userExist = await User.findOne({
      _id: verify._id,
    });
  
    if (!userExist) {
      return res.status(403).send({ auth: false, msg: "Invalid Token" });
    }

    req.token = token;
    req.rootUser = userExist;
    req.userId = userExist._id;

    next();
  } catch (err) {
    return res.status(500).json({ msg: "Auth failed" });
  }
};

module.exports = { authenticateUser };
