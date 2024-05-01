const express = require("express");
const router = express.Router();

const {
  createMenuItem,
  getAllMenuItems,
  updateMenuItem,
  deleteMenuItem,
} = require("../controller/menuController");

/* /menus */
router.post("/", createMenuItem); // create
router.get("/", getAllMenuItems); // read
router.put("/", updateMenuItem); // update
router.delete("/", deleteMenuItem); // delete

module.exports = router;
