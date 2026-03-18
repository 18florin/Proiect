const Saved = require("../../models/Saved");

async function getSaved(req, res) {
  try {
    const list = await Saved.find({ userId: req.params.userId }).populate(
      "vehicleId"
    );
    res.json({ success: true, data: list.map((i) => i.vehicleId) });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

async function addSaved(req, res) {
  const { userId, vehicleId } = req.body;
  try {
    const exists = await Saved.findOne({ userId, vehicleId });
    if (!exists) await new Saved({ userId, vehicleId }).save();
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

async function removeSaved(req, res) {
  const { userId, vehicleId } = req.body;
  try {
    await Saved.deleteOne({ userId, vehicleId });
    res.json({ success: true });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Server error" });
  }
}

module.exports = { getSaved, addSaved, removeSaved };
