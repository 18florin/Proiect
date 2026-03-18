const { imageUploadUtil } = require("../../helpers/cloudinary");
const Vehicle = require("../../models/Vehicle");

const handleImagesUpload = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res
        .status(400)
        .json({ success: false, message: "No files uploaded" });
    }

    const uploadPromises = req.files.map((file) => {
      const dataUri = `data:${file.mimetype};base64,${file.buffer.toString(
        "base64"
      )}`;
      return imageUploadUtil(dataUri);
    });

    const results = await Promise.all(uploadPromises);
    const urls = results.map((r) => r.secure_url || r.url);

    res.json({ success: true, urls });
  } catch (err) {
    console.error("Multiple-image upload error:", err);
    res.status(500).json({ success: false, message: "Upload failed" });
  }
};

const addVehicle = async (req, res) => {
  try {
    const {
      identifier,
      images,
      title,
      description,
      category,
      brand,
      price,
      salePrice = 0,
      isAvailable = true,
      year,
      location,
    } = req.body;

    let imageArray = [];
    if (Array.isArray(images)) {
      imageArray = images;
    } else if (typeof images === "string") {
      try {
        imageArray = JSON.parse(images);
      } catch {
        imageArray = [images];
      }
    }

    const newVehicle = new Vehicle({
      identifier,
      images: imageArray,
      title,
      description,
      category,
      brand,
      price,
      salePrice,
      isAvailable,
      year,
      location,
      averageReview: 0,
    });

    await newVehicle.save();
    return res.status(201).json({ success: true, data: newVehicle });
  } catch (e) {
    // dacă e o eroare de validare Mongoose, răspundem cu 400 Bad Request
    if (e.name === "ValidationError") {
      return res.status(400).json({ success: false, message: e.message });
    }
    // altfel logăm și trimitem 500
    console.error(e);
    return res
      .status(500)
      .json({ success: false, message: "Error occurred while adding vehicle" });
  }
};

const editVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const updateFields = { ...req.body };

    if (updateFields.images) {
      let imgs = [];
      if (Array.isArray(updateFields.images)) imgs = updateFields.images;
      else if (typeof updateFields.images === "string") {
        try {
          imgs = JSON.parse(updateFields.images);
        } catch {
          imgs = [updateFields.images];
        }
      }
      updateFields.images = imgs;
    }

    const vehicle = await Vehicle.findByIdAndUpdate(id, updateFields, {
      new: true,
    });
    if (!vehicle) {
      return res
        .status(404)
        .json({ success: false, message: "Vehicle not found" });
    }

    return res.json({ success: true, data: vehicle });
  } catch (e) {
    console.error(e);
    return res.status(500).json({
      success: false,
      message: "Error occurred while editing vehicle",
    });
  }
};

const fetchAllVehicles = async (req, res) => {
  try {
    const vehicles = await Vehicle.find({});
    res.status(200).json({ success: true, data: vehicles });
  } catch (e) {
    console.error(e);
    res
      .status(500)
      .json({ success: false, message: "Error fetching vehicles" });
  }
};

const deleteVehicle = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await Vehicle.findByIdAndDelete(id);
    if (!deleted) {
      return res
        .status(404)
        .json({ success: false, message: "Vehicle not found" });
    }
    res.json({ success: true, message: "Vehicle deleted" });
  } catch (e) {
    console.error(e);
    res.status(500).json({ success: false, message: "Error deleting vehicle" });
  }
};

const getFilteredVehicles = async (req, res) => {
  try {
    const {
      category = "",
      brand = "",
      sortBy = "price-lowtohigh",
      maxPrice,
      location = "",
    } = req.query;

    const filters = {};
    if (category) filters.category = { $in: category.split(",") };
    if (brand) filters.brand = { $in: brand.split(",") };
    if (location) filters.location = { $regex: location, $options: "i" };

    if (maxPrice != null) {
      const max = parseFloat(maxPrice);
      filters.$expr = {
        $lte: [
          {
            $cond: [{ $gt: ["$salePrice", 0] }, "$salePrice", "$price"],
          },
          max,
        ],
      };
    }

    const sort = {};
    switch (sortBy) {
      case "price-lowtohigh":
        sort.price = 1;
        break;
      case "price-hightolow":
        sort.price = -1;
        break;
      case "title-atoz":
        sort.title = 1;
        break;
      case "title-ztoa":
        sort.title = -1;
        break;
      case "year-newest":
        sort.year = -1;
        break;
      case "year-oldest":
        sort.year = 1;
        break;
      default:
        sort.price = 1;
    }

    const vehicles = await Vehicle.find(filters).sort(sort);

    res.status(200).json({
      success: true,
      data: vehicles,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

module.exports = {
  handleImagesUpload,
  addVehicle,
  editVehicle,
  fetchAllVehicles,
  deleteVehicle,
  getFilteredVehicles,
};
