const express = require("express");
const router = express.Router();

const { hello } = require("../controller/indexController");

router.get("/", hello);

module.exports = router;
