const StatusCodes = require("http-status-codes");

const MenuItem = require("../models/menuItem");

const createMenuItem = async (req, res) => {
  const { title, price, image_url } = req.body;
  const createdMenuItem = new MenuItem({
    title: title,
    price: price,
    image_url: "https://picsum.photos/200",
    creator: "kimdaekyu",
  });

  try {
    await createdMenuItem.save();
  } catch (err) {
    console.log(err);
    console.log("😇");
    return res.json(err);
  }

  res.status(StatusCodes.CREATED).json({ menuItem: createdMenuItem });
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
