const router = require("express")();
const {
  signup,
  login,
  resetPassword,
  forgotPassword,
} = require("../Controller/user");
const { authenticateUser } = require("../Middleware/auth");

/**Post Method */

router.route("/signup").post(signup);
//it will first authenticate for available token
router.route("/login").post(authenticateUser, login);
router.route("/reset-password/:token").patch(resetPassword);
router.route("/forgotPassword").post(forgotPassword);

module.exports = router;
