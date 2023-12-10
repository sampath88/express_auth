const mongoose = require("mongoose");
const userSchema = new mongoose.Schema({
  firstname: {
    type: String,
    default: null,
  },
  lastname: {
    type: String,
    default: null,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
  },
  accessToken: {
    type: String,
  },
});

module.exports = mongoose.model("user", userSchema);
