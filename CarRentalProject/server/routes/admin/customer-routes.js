const express = require("express");
const User = require("../../models/User");
const router = express.Router();
const {
  searchCustomers,
} = require("../../controllers/admin/customer-controller");

router.get("/", searchCustomers);

router.get("/", async (req, res) => {
  try {
    const { search = "" } = req.query;
    const re = new RegExp(search, "i");
    const filter = {
      role: "Customer",
      ...(search && { $or: [{ email: re }, { userName: re }] }),
    };
    const customers = await User.find(filter).select("-password");
    res.json({ success: true, data: customers });
  } catch (err) {
    console.error("Error fetching customers:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
});

module.exports = router;
