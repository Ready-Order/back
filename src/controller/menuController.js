const StatusCodes = require("http-status-codes");

const createMenuItem = (req, res) => {
  res.json({ message: "this work" });
};
const getAllMenuItems = (req, res) => {
  res.json({ message: "this work" });
};
const updateMenuItem = (req, res) => {
  res.json({ message: "this work" });
};
const deleteMenuItem = (req, res) => {
  res.json({ message: "this work" });
};

module.exports = {
  createMenuItem,
  getAllMenuItems,
  updateMenuItem,
  deleteMenuItem,
};
