const mongoose = require("mongoose");

const SavedSchema = new mongoose.Schema({
  userId: { type: mongoose.Types.ObjectId, ref: "User", required: true },
  vehicleId: { type: mongoose.Types.ObjectId, ref: "Vehicle", required: true },
});

module.exports = mongoose.model("Saved", SavedSchema);
