const StatusCodes = require("http-status-codes");

const user = require("../models/user");

const login = (req, res) => {
  res.json({ message: "this work" });
};
const join = (req, res) => {
  res.json({ message: "this work" });
};

module.exports = { login, join };
