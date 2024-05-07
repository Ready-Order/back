const StatusCodes = require("http-status-codes");
const mongoose = require("mongoose");

const MenuItem = require("../models/menuItem");
const User = require("../models/user");

const createMenuItem = async (req, res) => {
  const { title, price, image_url, creator, tags } = req.body;
  const createdMenuItem = new MenuItem({
    title: title,
    price: price,
    image_url: "https://picsum.photos/200",
    tags: tags,
    creator,
  });

  let user;

  try {
    user = await User.findById(creator);
  } catch (err) {
    console.log(err);
    console.log("😇");
    return res.status(500).json(err);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction(); // 세션을 이용해서 트랙색션을 사용한다
    await createdMenuItem.save({ session: sess });
    user.menuItems.push(createdMenuItem);
    await user.save({ session: sess });
    await sess.commitTransaction(); // commit Transaction을 사용해야 진짜 db에 저장된다.
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
  let { title, image_url, price, tags } = req.body;
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
  menuItem.tags = tags;

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
    menuItem = await MenuItem.findById(menuItemId).populate("creator");
  } catch (err) {
    console.log(err);
    console.log("😇");
    return res.status(500).json(err);
  }

  console.log(menuItem);

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await menuItem.deleteOne({ session: sess });
    menuItem.creator.menuItems.pull(menuItemId);
    await menuItem.creator.save({ session: sess });
    await sess.commitTransaction();
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
