const express = require("express");
const router = express.Router();

const { login, join } = require("../controller/userController");

/*  "/users"  */
router.post("/login", login); // create
router.post("/join", join); // read

module.exports = router;
