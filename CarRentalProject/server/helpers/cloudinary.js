const cloudinary = require("cloudinary").v2;
const multer = require("multer");
const streamifier = require("streamifier");

cloudinary.config({
  cloud_name: "dggnumfpd",
  api_key: "434455368977282",
  api_secret: "_G6bIyc-q74GLbLHZZeyJt4ghgE",
});

const storage = multer.memoryStorage();

async function imageUploadUtil(file) {
  const result = await cloudinary.uploader.upload(file, {
    resource_type: "auto",
  });

  return result;
}

function uploadBufferToCloudinary(buffer, options = {}) {
  return new Promise((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      {
        resource_type: "auto",
        ...options,
      },
      (error, result) => {
        if (error) return reject(error);
        resolve(result);
      },
    );

    streamifier.createReadStream(buffer).pipe(stream);
  });
}

const upload = multer({
  storage,
  limits: {
    fileSize: 200 * 1024 * 1024,
  },
});

module.exports = { upload, imageUploadUtil, uploadBufferToCloudinary };
