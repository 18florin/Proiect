const express = require("express");
const {
  getSaved,
  addSaved,
  removeSaved,
} = require("../../controllers/shop/saved-controller");
const router = express.Router();

router.get("/:userId", getSaved);
router.post("/add", addSaved);
router.delete("/remove", removeSaved);

module.exports = router;
