const mongoose = require("mongoose");

const { HttpError, simpleServerError } = require("../models/http-error");
const MenuItem = require("../models/menuItem");
const User = require("../models/user");

const getMenuItemsByUserId = async (req, res, next) => {
  // 1. 카테고리 가져오기
  // 2. 동적 키 생성 및 메뉴 넣기
  const { userId } = req.params;

  // 카테고리 가져오기
  let menuItems;
  try {
    menuItems = await MenuItem.find({ creator: userId });
  } catch (err) {
    console.log(err);
    return next(simpleServerError);
  }

  let uniqueCategories = new Set();
  let menusByCategory = {};
  console.log(menuItems);
  menuItems.forEach((element) => {
    if (menusByCategory[element.category]) {
      menusByCategory[element.category].push(element);
    } else {
      menusByCategory[element.category] = [element];
    }
    uniqueCategories.add(element.category);
  });

  res.status(200).json({
    categories: [...uniqueCategories],
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
  console.log(menuItems);
  menuItems.forEach((element) => {
    uniqueCategories.add(element.category);
  });

  res.status(200).json({ categories: [...uniqueCategories] });
};

// 모든 document에 category와 available 필드를 넣기 위한 컨트롤러
const updateAllMenuItemsByUserId = async (req, res, next) => {
  const { userId } = req.params;

  let menuItems;
  try {
    menuItems = await MenuItem.find({ creator: userId });
  } catch (err) {
    console.log(err);
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
    image_url: "https://picsum.photos/200",
    tag: tag,
    creator: creator,
    category: category,
    available: available,
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
  let { title, price, image_url, tag, category, available } = req.body;
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
  getMenuItemsByUserId,
  getCategoriesByUserId,
  updateAllMenuItemsByUserId,
  createMenuItem,
  updateMenuItem,
  deleteMenuItem,
};
