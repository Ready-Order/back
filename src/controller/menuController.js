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
    return res.status(500).json(err);
  }

  res.status(StatusCodes.CREATED).json({ menuItem: createdMenuItem });
};

const getAllMenuItems = async (req, res) => {
  let menuItems;
  try {
    menuItems = await MenuItem.find();
  } catch (err) {
    console.log(err);
    console.log("😇");
    return res.status(500).json(err);
  }
  res.status(StatusCodes.OK).json(menuItems);
};

const getMenuItem = async (req, res) => {
  const { menuItemId } = req.params;

  let menuItem;
  try {
    menuItem = await MenuItem.findById(menuItemId);
  } catch (err) {
    console.log(err);
    console.log("😇");
    return res.status(500).json(err);
  }
  return res.json({ menuItem });
};

const updateMenuItem = async (req, res) => {
  const { menuItemId } = req.params;
  let { title, image_url, price } = req.body;
  price = parseInt(price);

  let menuItem;
  try {
    menuItem = await MenuItem.findById(menuItemId);
  } catch (err) {
    console.log(err);
    console.log("😇");
    return res.status(500).json(err);
  }

  menuItem.title = title;
  menuItem.image_url = image_url;
  menuItem.price = price;

  try {
    await menuItem.save();
  } catch (err) {
    console.log(err);
    console.log("😇");
    return res.status(500).json(err);
  }

  res.status(200).json({ menuItem: menuItem.toObject({ getters: true }) });
};

const deleteMenuItem = async (req, res) => {
  const { menuItemId } = req.params;

  let menuItem;
  try {
    menuItem = await MenuItem.findByIdAndDelete(menuItemId);
  } catch (err) {
    console.log(err);
    console.log("😇");
    return res.status(500).json(err);
  }

  res.status(200).json({ message: "Deleted place.", menuItemId: menuItem._id });
};

module.exports = {
  createMenuItem,
  getAllMenuItems,
  getMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
