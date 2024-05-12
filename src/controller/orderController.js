const mongoose = require("mongoose");

const { HttpError, simpleServerError } = require("../models/http-error");
const MenuItem = require("../models/menuItem");
const Order = require("../models/order");

const placeOrder = (req, res, next) => {
  return res.json("placeOrder");
};

const getOrderHistory = (req, res, next) => {
  return res.json("getOrderHistory");
};

const resetTable = (req, res, next) => {
  return res.json("resetTable");
};

const getBill = (req, res, next) => {
  return res.json("getBill");
};

module.exports = {
  placeOrder,
  getOrderHistory,
  resetTable,
  getBill,
};
