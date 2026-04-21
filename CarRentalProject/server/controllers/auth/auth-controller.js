require("dotenv").config();

const crypto = require("crypto");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../../models/User");
const { imageUploadUtil } = require("../../helpers/cloudinary");
const {
  sendConfirmationEmail,
  sendSuspiciousLoginAlert,
  sendPasswordResetEmail,
} = require("../../helpers/sendEmail");

// 🔐 REGISTER
const registerUser = async (req, res) => {
  const { userName, email, password } = req.body;

  try {
    const checkUser = await User.findOne({ email });

    if (checkUser) {
      return res.json({
        success: false,
        message: "User already exists!",
      });
    }

    const hashPassword = await bcrypt.hash(password, 12);

    const newUser = new User({
      userName,
      email,
      password: hashPassword,
    });

    await newUser.save();
    await sendConfirmationEmail(email, userName);

    res.json({
      success: true,
      message: "Registration successful",
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: e.message,
    });
  }
};

// 🔐 LOGIN (🔥 FIX CRITIC)
const loginUser = async (req, res) => {
  const { email, password } = req.body;

  try {
    const checkUser = await User.findOne({ email });

    if (!checkUser) {
      return res.json({
        success: false,
        message: "User doesn't exist",
      });
    }

    // 🔒 account lock
    if (checkUser.lockUntil && checkUser.lockUntil > Date.now()) {
      const secondsLeft = Math.ceil((checkUser.lockUntil - Date.now()) / 1000);

      return res.json({
        success: false,
        message: `Too many attempts. Try again in ${secondsLeft}s`,
      });
    }

    const isMatch = await bcrypt.compare(password, checkUser.password);

    if (!isMatch) {
      checkUser.wrongLoginAttempts = (checkUser.wrongLoginAttempts || 0) + 1;

      if (checkUser.wrongLoginAttempts >= 5) {
        checkUser.lockUntil = new Date(Date.now() + 30000);
        await sendSuspiciousLoginAlert(checkUser.email, checkUser.userName);
        checkUser.wrongLoginAttempts = 0;
      }

      await checkUser.save();

      return res.json({
        success: false,
        message: "Incorrect password",
      });
    }

    // 🔄 reset lock
    checkUser.wrongLoginAttempts = 0;
    checkUser.lockUntil = undefined;
    await checkUser.save();

    // 🔥 GENERATE TOKEN
    const token = jwt.sign(
      {
        id: checkUser._id,
        role: checkUser.role,
      },
      process.env.JWT_SECRET_KEY,
      { expiresIn: "1d" },
    );

    // 🔥 IMPORTANT: return token in JSON
    res.json({
      success: true,
      message: "Logged in successfully",
      user: {
        id: checkUser._id,
        email: checkUser.email,
        role: checkUser.role,
        userName: checkUser.userName,
      },
      token, // 🔥 ESENȚIAL
    });
  } catch (e) {
    res.status(500).json({
      success: false,
      message: e.message,
    });
  }
};

// 🔐 LOGOUT
const logoutUser = (req, res) => {
  res.json({
    success: true,
    message: "Logged out",
  });
};

// 🔐 AUTH MIDDLEWARE (🔥 FIX COMPLET)
const authMiddleware = (req, res, next) => {
  // 🔥 suportă ambele
  const token = req.cookies?.token || req.headers.authorization?.split(" ")[1];

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: "Invalid token",
    });
  }
};

// 🔐 FORGOT PASSWORD
const forgotPassword = async (req, res) => {
  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const token = crypto.randomBytes(20).toString("hex");

    user.resetPasswordToken = token;
    user.resetPasswordExpires = Date.now() + 3600000;

    await user.save();

    await sendPasswordResetEmail(user.email, user.userName, token);

    res.json({
      success: true,
      message: "Reset email sent",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// 🔐 RESET PASSWORD
const resetPassword = async (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;

  try {
    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.json({
        success: false,
        message: "Invalid or expired token",
      });
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.json({
      success: true,
      message: "Password reset successful",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// 🔐 DELETE ACCOUNT
const deleteAccount = async (req, res) => {
  try {
    await User.findByIdAndDelete(req.user.id);

    res.json({
      success: true,
      message: "Account deleted",
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

// 🔐 PROFILE IMAGE
const updateProfileImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.json({
        success: false,
        message: "No file provided",
      });
    }

    const b64 = Buffer.from(req.file.buffer).toString("base64");
    const dataUrl = `data:${req.file.mimetype};base64,${b64}`;

    const { url } = await imageUploadUtil(dataUrl);

    const user = await User.findById(req.user.id);
    user.profileImage = url;
    await user.save();

    res.json({
      success: true,
      data: url,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: err.message,
    });
  }
};

module.exports = {
  registerUser,
  loginUser,
  logoutUser,
  authMiddleware,
  forgotPassword,
  resetPassword,
  deleteAccount,
  updateProfileImage,
};
