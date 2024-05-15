const mongoose = require("mongoose");
const uniqueValidator = require("mongoose-unique-validator");

const Schema = mongoose.Schema;

const orderDetailSchema = new Schema({
  menuItemId: { type: mongoose.Types.ObjectId, required: true, ref: "Menu" },
  quantity: { type: Number, required: true },
});

const orderSchema = new Schema({
  tableNumber: { type: Number, require: true, unique: true },
  orders: [orderDetailSchema],
  bill: { type: Map, of: Number, default: new Map([["price", 0]]) }, // key값이 유동적이라면 Map을 사용해야 한다고 한다.
});

orderSchema.plugin(uniqueValidator);

/* 
Bill :{
  menuItemId : totalQuantity,
  menuItemId : totalQuantity
}
*/
module.exports = mongoose.model("Order", orderSchema);
