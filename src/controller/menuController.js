const mongoose = require("mongoose");
const { HttpError, simpleServerError } = require("../models/http-error");
const MenuItem = require("../models/menuItem");
const User = require("../models/user");

const CATEGORY = ["사이드", "메인", "음료", "주류", "etc", "시즌 메뉴"];

const getMenuItemsByUserId = async (req, res, next) => {
  // 1. 카테고리 가져오기
  // 2. 동적 키 생성 및 메뉴 넣기
  const { userId } = req.params;

  // 카테고리 가져오기
  console.log("userId", typeof userId, userId);
  if (userId == "undefined") {
    console.log("undefined");
    return;
  }
  try {
    menuItems = await MenuItem.find({ creator: userId });
  } catch (err) {
    console.log(err);
    return next(simpleServerError);
  }

  let uniqueCategories = new Set();
  let menusByCategory = {};
  menuItems.forEach((element) => {
    if (menusByCategory[element.category]) {
      menusByCategory[element.category].push(element);
    } else {
      menusByCategory[element.category] = [element];
    }
    uniqueCategories.add(element.category);
  });

  // res.status(200).json({
  //   categories: [...uniqueCategories],
  //   menus: menusByCategory,
  // });
  res.status(200).json({
    categories: CATEGORY,
    menus: menusByCategory,
  });
};

const getCategoriesByUserId = async (req, res, next) => {
  const { userId } = req.params;

  let menuItems;
  try {
    menuItems = await MenuItem.find({ creator: userId });
  } catch (err) {
    console.log(err);
    return next(simpleServerError);
  }

  let uniqueCategories = new Set();
  menuItems.forEach((element) => {
    uniqueCategories.add(element.category);
  });

  //res.status(200).json({ categories: [...uniqueCategories] }); // 원본
  res.status(200).json({ categories: CATEGORY }); // 카테고리 하드코딩
};

// 모든 document에 category와 available 필드를 넣기 위한 컨트롤러
const updateAllMenuItemsByUserId = async (req, res, next) => {
  const { userId } = req.params;

  let menuItems;
  try {
    menuItems = await MenuItem.find({ creator: userId });
  } catch (err) {
    return next(simpleServerError);
  }

  let uniqueCategories;
  uniqueCategories = menuItems.map((item) => item.title);

  let menuItem;
  await uniqueCategories.forEach(async (element) => {
    menuItem = await MenuItem.find({ title: element });

    menuItem[0].category = "main food";
    menuItem[0].available = true;

    try {
      await menuItem[0].save();
    } catch (err) {
      return next(simpleServerError);
    }
  });

  return getCategoriesByUserId(req, res, next);
};

/* 
라우터에 의해서 jwt가 있어야 접근할 수 있습니다.
jwt 형태 = req -> { TK_id: mongoDB_objectID, TK_email: User-email }
*/
const createMenuItem = async (req, res, next) => {
  const { title, price, image_url, creator, tag, category, available } =
    req.body;

  const createdMenuItem = new MenuItem({
    title: title,
    price: price,
    image_url: req.image_path + req.file.filename,
    tag: tag,
    creator: creator,
    category: category,
    available: available,
  });

  if (createdMenuItem.creator.toString() !== req.userData.TK_id) {
    const error = new HttpError("Not your property", 403);
    return next(error);
  }

  let user;
  try {
    user = await User.findById(creator);
  } catch (err) {
    return next(simpleServerError);
  }

  const sess = await mongoose.startSession();
  try {
    sess.startTransaction(); // 세션을 이용해서 트랙색션을 사용한다
    await createdMenuItem.save({ session: sess });
    user.menuItems.push(createdMenuItem); // user의 menuItems에 createdMenuItem객체의 id를 밀어넣는다.
    await user.save({ session: sess });
    await sess.commitTransaction(); // commit Transaction을 사용해야 진짜 db에 저장된다.
    sess.endSession();
  } catch (err) {
    await sess.abortTransaction();
    sess.endSession();
    return next(simpleServerError);
  }

  res.status(201).json({ menuItem: createdMenuItem });
};

const updateAvailable = async (req, res, next) => {
  const { menuItemId } = req.params;
  const { available } = req.body;

  let menuItem;
  try {
    menuItem = await MenuItem.findById(menuItemId);
  } catch (err) {
    console.log(err);
    return next(simpleServerError);
  }

  menuItem.available = available;

  let updatedItem;
  try {
    updatedItem = await menuItem.save();
  } catch (err) {
    console.log(err);
    return next(simpleServerError);
  }

  return res.status(200).json(updatedItem);
};

const updateMenuItem = async (req, res, next) => {
  const { menuItemId } = req.params;
  let { title, price, image_url, tag, category, available } = req.body;
  price = parseInt(price);

  let menuItem;
  try {
    menuItem = await MenuItem.findById(menuItemId);
  } catch (err) {
    return next(simpleServerError);
  }

  if (menuItem.creator.toString() !== req.userData.TK_id) {
    const error = new HttpError("Not your property", 403);
    return next(error);
  }

  menuItem.title = title;
  menuItem.image_url = image_url;
  menuItem.price = price;
  menuItem.tags = tag;
  menuItem.category = category;
  menuItem.available = available;

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
    menuItem = await MenuItem.findById(menuItemId).populate("creator"); // creator와 ref되어 있는 도큐먼트를 붙여서 가져온다.
  } catch (err) {
    return next(simpleServerError);
  }
  console.log(1);
  if (menuItem == null) {
    return next(simpleServerError);
  }
  console.log(2);

  if (menuItem.creator.id !== req.userData.TK_id) {
    const error = new HttpError("Not your property", 403);
    return next(error);
  }
  console.log(3);

  const sess = await mongoose.startSession();
  try {
    sess.startTransaction();
    await menuItem.deleteOne({ session: sess });
    menuItem.creator.menuItems.pull(menuItemId);
    await menuItem.creator.save({ session: sess });
    await sess.commitTransaction();
    sess.endSession();
  } catch (err) {
    await sess.abortTransaction();
    sess.endSession();
    return next(simpleServerError);
  }
  console.log(4);

  res.status(200).json({ message: "Deleted place.", menuItemId: menuItem._id });
};

module.exports = {
  getMenuItemsByUserId,
  getCategoriesByUserId,
  updateAllMenuItemsByUserId,
  createMenuItem,
  updateAvailable,
  updateMenuItem,
  deleteMenuItem,
};
