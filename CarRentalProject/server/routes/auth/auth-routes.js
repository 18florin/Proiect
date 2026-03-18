const express = require("express");
const {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
  forgotPassword,
  resetPassword,
  deleteAccount,
  updateProfileImage,
} = require("../../controllers/auth/auth-controller");
const UserModel = require("../../models/User");
const { upload } = require("../../helpers/cloudinary");

const router = express.Router();

router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/logout", logoutUser);

router.get("/check-auth", authMiddleware, async (req, res) => {
  try {
    const freshUser = await UserModel.findById(req.user.id).select(
      "-password -resetPasswordToken -resetPasswordExpires"
    );
    if (!freshUser) {
      return res
        .status(404)
        .json({ success: false, message: "User not found" });
    }
    res.json({ success: true, user: freshUser });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
});

router.post("/forgot-password", forgotPassword);
router.post("/reset-password/:token", resetPassword);

router.delete("/delete-account", authMiddleware, deleteAccount);

router.post(
  "/profile-image",
  authMiddleware,
  upload.single("image"),
  updateProfileImage
);

module.exports = router;
