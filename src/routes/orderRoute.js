const express = require("express");
const router = express.Router();

const {
  placeOrder,
  getOrderHistory,
  resetTable,
  getBill,
  tableInit,
} = require("../controller/orderController");

/*  "/orders"  */
router.get("/demo/:quantity", tableInit);
router.post("/:tableNumber", placeOrder); // create
router.get("/:tableNumber", getOrderHistory); // read
router.delete("/:tableNumber", resetTable); // delete
router.get("/:tableNumber/bill", getBill); // read

module.exports = router;
