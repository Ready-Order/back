const mongoose = require("mongoose");

const { HttpError, simpleServerError } = require("../models/http-error");
const MenuItem = require("../models/menuItem");
const User = require("../models/user");

const getMenuItemsByUserId = async (req, res, next) => {
  // by id
  const { userId } = req.params;

  let menuItems;
  try {
    menuItems = await MenuItem.find({ creator: userId });
  } catch (err) {
    return next(simpleServerError);
  }
  res.status(200).json(menuItems);
};

/* 
need jwt 
jwt 형태 = req -> { TK_id: mongoDB_objectID, TK_email: User-email }
*/
const createMenuItem = async (req, res, next) => {
  const { title, price, image_url, creator, tag } = req.body;
  const createdMenuItem = new MenuItem({
    title: title,
    price: price,
    image_url: "https://picsum.photos/200",
    tag: tag,
    creator,
  });

  if (createdMenuItem.creator !== req.userData.TK_id) {
    const error = new HttpError("Not your property", 403);
    return next(error);
  }

  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    return next(simpleServerError);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction(); // 세션을 이용해서 트랙색션을 사용한다
    await createdMenuItem.save({ session: sess });
    user.menuItems.push(createdMenuItem);
    await user.save({ session: sess });
    await sess.commitTransaction(); // commit Transaction을 사용해야 진짜 db에 저장된다.
  } catch (err) {
    return next(simpleServerError);
  }

  res.status(201).json({ menuItem: createdMenuItem });
};

const updateMenuItem = async (req, res, next) => {
  const { menuItemId } = req.params;
  let { title, image_url, price, tags } = req.body;
  price = parseInt(price);

  let menuItem;
  try {
    menuItem = await MenuItem.findById(menuItemId);
  } catch (err) {
    return next(simpleServerError);
  }

  if (menuItem.creator !== req.userData.TK_id) {
    const error = new HttpError("Not your property", 403);
    return next(error);
  }

  menuItem.title = title;
  menuItem.image_url = image_url;
  menuItem.price = price;
  menuItem.tags = tags;

  try {
    await menuItem.save();
  } catch (err) {
    return next(simpleServerError);
  }

  res.status(200).json({ menuItem: menuItem.toObject({ getters: true }) });
};

const deleteMenuItem = async (req, res, next) => {
  const { menuItemId } = req.params;

  let menuItem;
  try {
    menuItem = await MenuItem.findById(menuItemId).populate("creator"); // creator와 ref되어 있는 도큐먼트
  } catch (err) {
    return next(simpleServerError);
  }

  if (menuItem.creator !== req.userData.TK_id) {
    const error = new HttpError("Not your property", 403);
    return next(error);
  }

  try {
    const sess = await mongoose.startSession();
    sess.startTransaction();
    await menuItem.deleteOne({ session: sess });
    menuItem.creator.menuItems.pull(menuItemId);
    await menuItem.creator.save({ session: sess });
    await sess.commitTransaction();
  } catch (err) {
    return next(simpleServerError);
  }

  res.status(200).json({ message: "Deleted place.", menuItemId: menuItem._id });
};

module.exports = {
  createMenuItem,
  getMenuItemsByUserId,
  updateMenuItem,
  deleteMenuItem,
};
