const express = require("express");
const router = express.Router();
var { SSEClients } = require("../models/vals/SSEClients");

const {
  placeOrder,
  getOrderHistory,
  resetTable,
  getBill,
  tableInit,
  posListUpdater,
} = require("../controller/orderController");

/*  "/orders"  */
router.get("/demo/pos", (req, res, next) => {
  SSEClients.forEach((client) => {
    client.write('data: {"message":"api호출"}\n\n');
  });
  return res.json({ message: SSEClients[0] });
});
router.get("/demo/:quantity", tableInit);
router.post("/:tableNumber", placeOrder); // create
// router.get("/:tableNumber", getOrderHistory); // read
router.delete("/:tableNumber", resetTable); // delete
router.get("/:tableNumber/bill", getBill); // read
router.get("/pos/:uid", posListUpdater); // SSE를 연결하기

module.exports = router;
