const express = require("express");
const router = express.Router();

const {
  createMenuItem,
  getAllMenuItems,
  getMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require("../controller/menuController");
const checkAuth = require("../middleware/checkAuth");

/*  "/menus"  */
router.get("/", getAllMenuItems); // read
router.get("/:menuItemId", getMenuItem); // read

// authorization //
router.use(checkAuth);
// 보호 받는 라우터 //
router.post("/", createMenuItem); // create
router.put("/:menuItemId", updateMenuItem); // update
router.delete("/:menuItemId", deleteMenuItem); // delete

module.exports = router;
