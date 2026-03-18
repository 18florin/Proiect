const express = require("express");
const { authMiddleware } = require("../../controllers/auth/auth-controller");
const {
  addAddress,
  fetchAllAddress,
  editAddress,
  deleteAddress,
} = require("../../controllers/shop/address-controller");

const router = express.Router();

router.use(authMiddleware);

router.post("/", addAddress);

router.get("/", fetchAllAddress);

router.put("/:addressId", editAddress);

router.delete("/:addressId", deleteAddress);

module.exports = router;
