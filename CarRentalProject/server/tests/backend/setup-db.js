const { MongoMemoryServer } = require("mongodb-memory-server");
const mongoose = require("mongoose");
let mongod;

module.exports.connect = async () => {
  // ---- NO storageEngine override here! ----
  mongod = await MongoMemoryServer.create({
    binary: { version: "6.0.14" },
  });
  const uri = mongod.getUri();
  await mongoose.connect(
    uri /*, you can pass mongoose options here if needed */
  );
};

module.exports.clearDatabase = async () => {
  const { collections } = mongoose.connection;
  for (const key in collections) {
    await collections[key].deleteMany({});
  }
};

module.exports.closeDatabase = async () => {
  await mongoose.connection.dropDatabase();
  await mongoose.connection.close();
  await mongod.stop();
};
