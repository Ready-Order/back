const express = require("express");
const router = express.Router();
const fileUpload = require("../middleware/file-upload");
const {
  getMenuItemsByUserId,
  getCategoriesByUserId,
  updateAllMenuItemsByUserId,
  createMenuItem,
  updateAvailable,
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
router.post("/", fileUpload.single("image"), createMenuItem); // create
router.put("/:menuItemId/available", updateAvailable); // update
router.put("/:menuItemId", updateMenuItem); // update
router.delete("/:menuItemId", deleteMenuItem); // delete

module.exports = router;
