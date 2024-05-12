const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const orderDetailSchema = new Schema({
  meneItemId: { type: mongoose.Types.ObjectId, required: true, ref: "Menu" },
  quantity: { type: Number, required: true },
});

const orderSchema = new Schema({
  number: { type: Number, require: true },
  orders: [orderDetailSchema],
});

module.exports = mongoose.model("Order", orderSchema);
