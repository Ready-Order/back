const express = require("express");
const router = express.Router();

const {
  createMenuItem,
  getMenuItemsByUserId,
  updateMenuItem,
  deleteMenuItem,
} = require("../controller/menuController");
const checkAuth = require("../middleware/checkAuth");

/*  "/menus"  */
router.get("/:userId", getMenuItemsByUserId); // read

// authorization //
router.use(checkAuth);
// 보호 받는 라우터 //
router.post("/", createMenuItem); // create
router.put("/:menuItemId", updateMenuItem); // update
router.delete("/:menuItemId", deleteMenuItem); // delete

module.exports = router;
