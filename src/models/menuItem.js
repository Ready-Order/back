const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const menuSchema = new Schema({
  title: { type: String, required: true },
  image_url: { type: String, required: true },
  price: { type: Number, required: true },
  tag: { type: String, required: false },
  creator: { type: mongoose.Types.ObjectId, required: true, ref: "User" },
  categoty: { type: String, required: false },
  available: { type: Boolean, default: true },
});

module.exports = mongoose.model("Menu", menuSchema);
