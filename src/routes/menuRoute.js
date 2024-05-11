const express = require("express");
const router = express.Router();

const {
  getMenuItemsByUserId,
  getCategoriesByUserId,
  updateAllMenuItemsByUserId,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
} = require("../controller/menuController");
const checkAuth = require("../middleware/checkAuth");

// == "/menus" == //
router.get("/:userId", getMenuItemsByUserId); // read
router.get("/categories/:userId", getCategoriesByUserId); // read
router.get("/update-demo/:userId", updateAllMenuItemsByUserId); // read

// authorization //
router.use(checkAuth);
// 보호 받는 라우터 //
router.post("/", createMenuItem); // create
router.put("/:menuItemId", updateMenuItem); // update
router.delete("/:menuItemId", deleteMenuItem); // delete

module.exports = router;
