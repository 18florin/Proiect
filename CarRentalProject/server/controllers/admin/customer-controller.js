const User = require("../../models/User");

exports.searchCustomers = async (req, res) => {
  try {
    const { search = "" } = req.query;
    const re = new RegExp(search, "i");

    const filter = {
      role: "user",
      ...(search ? { $or: [{ email: re }, { userName: re }] } : {}),
    };

    const customers = await User.find(filter)
      .select("userName email role")
      .lean();

    res.json({ success: true, data: customers });
  } catch (err) {
    console.error("Error fetching customers:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
