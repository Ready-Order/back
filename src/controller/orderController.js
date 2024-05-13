const mongoose = require("mongoose");

const { HttpError, simpleServerError } = require("../models/http-error");
const MenuItem = require("../models/menuItem");
const Order = require("../models/order");

const placeOrder = async (req, res, next) => {
  const { tableNumber } = req.params;
  const { orders } = req.body;

  let order;
  try {
    order = await Order.find({ tableNumber: tableNumber });
    order = order[0];
  } catch (err) {
    return next(simpleServerError);
  }

  // 이전 주문 기록에 현재 주문 기록 붙이기
  order.orders.push(...orders);

  // bill에 메뉴별 갯수 종합하기
  console.log(order);
  orders.forEach((val, idx) => {
    const menuQuantity = order.bill.get(val.menuItemId);
    if (menuQuantity) {
      console.log(idx + " : true");
      order.bill.set(val.menuItemId, menuQuantity + val.quantity);
    } else {
      console.log(idx + " : false");
      order.bill.set(val.menuItemId, val.quantity);
    }
  });

  console.log(order);

  // 저장...?
  let updatedOrder;
  try {
    updatedOrder = await order.save();
  } catch (err) {
    console.log(err);
    return next(simpleServerError);
  }

  return res.json(updatedOrder);
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
