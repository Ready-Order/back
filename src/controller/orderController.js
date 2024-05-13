const mongoose = require("mongoose");

const { HttpError, simpleServerError } = require("../models/http-error");
const MenuItem = require("../models/menuItem");
const Order = require("../models/order");

const placeOrder = async (req, res, next) => {
  const { tableNumber } = req.params;
  const { orders } = req.body;

  let order;
  try {
    order = await Order.findOne({ tableNumber: tableNumber });
  } catch (err) {
    return next(simpleServerError);
  }

  // 이전 주문 기록에 현재 주문 기록 붙이기
  order.orders.push(...orders);

  // bill에 메뉴별 갯수 종합하기
  for (const val of orders) {
    let menuItemInfo;
    try {
      menuItemInfo = await MenuItem.findById(val.menuItemId); // 메뉴 가격을 가져오기 위해
    } catch (err) {
      console.log(err);
      return next(new HttpError("forEach안에서 발생한 오류", 500));
    }

    const originalMenuQuantity = order.bill.get(val.menuItemId); //원래 주문했던 메뉴 갯수
    const placedMenuQuantity = val.quantity;
    /* menuItemId에서 가격을 가져와서 price에 더하자 */
    if (originalMenuQuantity) {
      order.bill.set(val.menuItemId, originalMenuQuantity + placedMenuQuantity);
    } else {
      order.bill.set(val.menuItemId, placedMenuQuantity);
    }
    // bill.price에 가격 추가하기
    order.bill.set(
      "price",
      order.bill.get("price") + menuItemInfo.price * val.quantity
    );
  }

  // 저장...?
  let updatedOrder;
  try {
    updatedOrder = await order.save();
  } catch (err) {
    return next(simpleServerError);
  }

  return res.status(201).json(updatedOrder);
};

const getOrderHistory = (req, res, next) => {
  // figma 상에서는 구현이 필요없는 부분이라 보륜
  return res.json("getOrderHistory");
};

const resetTable = async (req, res, next) => {
  // 테이블 초기화
  const { tableNumber } = req.params;

  // 가져와서 초기화하기
  let currentTable;
  try {
    currentTable = await Order.findOne({ tableNumber: tableNumber });
  } catch (err) {
    next(simpleServerError);
  }
  currentTable.orders = [];
  currentTable.bill = new Map([["price", 0]]);

  try {
    await currentTable.save();
  } catch (err) {
    return next(simpleServerError);
  }
  return res
    .status(200)
    .json({ message: tableNumber + "번 테이블 초기화 완료." });
};

const getBill = (req, res, next) => {
  // 주문한 메뉴와 총 가격 가져오기
  return res.json("getBill");
};

/* 개발을 위한 컨트롤러 */
// 테이블 갯수 세팅하기
const tableInit = async (req, res, next) => {
  let orders = [];
  for (let i = 1; i < 4; i++) {
    let createdOrder = new Order({
      tableNumber: i,
      orders: [],
    });
    try {
      await createdOrder.save();
    } catch (err) {
      return next(simpleServerError);
    }
    orders.push(createdOrder);
  }
  return res.json(orders);
};

module.exports = {
  placeOrder,
  getOrderHistory,
  resetTable,
  getBill,
  tableInit,
};
