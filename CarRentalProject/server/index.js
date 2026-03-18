const mongoose = require("mongoose");
const app = require("./app");

const PORT = process.env.PORT || 5000;

// conectare normală la prod/dev
mongoose
  .connect(process.env.DATABASE_URL)
  .then(() => console.log("MongoDB connected"))
  .catch(console.error);

// pornește serverul doar când nu facem test
app.listen(PORT, () => console.log(`Server is now running on port ${PORT}`));
