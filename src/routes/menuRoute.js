const express = require("express");
const router = express.Router();

const {
  createMenuItem,
  getAllMenuItems,
  getMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require("../controller/menuController");

/*  "/menus"  */
router.post("/", createMenuItem); // create
router.get("/", getAllMenuItems); // read
router.get("/:menuItemId", getMenuItem); // read
router.put("/:menuItemId", updateMenuItem); // update
router.delete("/:menuItemId", deleteMenuItem); // delete

module.exports = router;
