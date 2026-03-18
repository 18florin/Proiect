const Address = require("../../models/Address");

async function fetchAllAddress(req, res) {
  try {
    const userId = req.user.id;
    const list = await Address.find({ userId });
    return res.status(200).json({ success: true, data: list });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

async function addAddress(req, res) {
  try {
    const userId = req.user.id;
    const { address, city, pincode, phone, notes } = req.body;
    if (!address || !city || !pincode || !phone) {
      return res.status(400).json({ success: false, message: "Invalid data" });
    }
    const newAddr = new Address({
      userId,
      address,
      city,
      pincode,
      phone,
      notes,
    });
    await newAddr.save();
    return res.status(201).json({ success: true, data: newAddr });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

async function editAddress(req, res) {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;
    const updates = req.body;
    const updated = await Address.findOneAndUpdate(
      { _id: addressId, userId },
      updates,
      { new: true }
    );
    if (!updated) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    return res.json({ success: true, data: updated });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

async function deleteAddress(req, res) {
  try {
    const userId = req.user.id;
    const { addressId } = req.params;
    const deleted = await Address.findOneAndDelete({ _id: addressId, userId });
    if (!deleted) {
      return res.status(404).json({ success: false, message: "Not found" });
    }
    return res.json({ success: true, message: "Deleted" });
  } catch (e) {
    console.error(e);
    return res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = {
  fetchAllAddress,
  addAddress,
  editAddress,
  deleteAddress,
};
