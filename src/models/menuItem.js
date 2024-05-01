const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const menuSchema = new Schema({
  title: { type: String, required: true },
  image_url: { type: String, required: true },
  price: { type: Number, required: true },
  creator: { type: String, required: true },
});

module.exports = mongoose.model("Menu", menuSchema);
