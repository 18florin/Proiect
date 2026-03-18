const Vehicle = require("../../models/Vehicle");

const getFilteredVehicles = async (req, res) => {
  try {
    const {
      category = "",
      brand = "",
      sortBy = "price-lowtohigh",
      maxPrice = "",
      location = "",
      page = 1,
    } = req.query;

    const filters = {};
    if (category) {
      filters.category = { $in: category.split(",") };
    }
    if (brand) {
      filters.brand = { $in: brand.split(",") };
    }
    if (location) {
      filters.location = { $regex: location, $options: "i" };
    }
    if (maxPrice) {
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

    const perPage = 10;
    const pageNum = Math.max(1, parseInt(page, 10));
    const skip = (pageNum - 1) * perPage;

    const [total, vehicles] = await Promise.all([
      Vehicle.countDocuments(filters),
      Vehicle.find(filters).sort(sort).skip(skip).limit(perPage),
    ]);

    res.status(200).json({
      success: true,
      data: vehicles,
      pagination: {
        total,
        page: pageNum,
        pages: Math.ceil(total / perPage),
      },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({
      success: false,
      message: "Some error occurred",
    });
  }
};

const getVehicleDetails = async (req, res) => {
  try {
    const { id } = req.params;
    const vehicle = await Vehicle.findById(id);
    if (!vehicle) {
      return res.status(404).json({
        success: false,
        message: "Vehicle not found!",
      });
    }
    res.status(200).json({
      success: true,
      data: vehicle,
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
  getFilteredVehicles,
  getVehicleDetails,
};
