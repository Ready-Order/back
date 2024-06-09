const mongoose = require("mongoose");

const { HttpError, simpleServerError } = require("../models/http-error");
const MenuItem = require("../models/menuItem");
const Order = require("../models/order");
var { SSEClients } = require("../models/vals/SSEClients");

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

  // pos기계에 주문 정보 전달하기 ========================
  /* {tableNumber : int(tableNumber) ,bill: {bill가져오기 결과값}} */
  const posData = await getBillHandler(req, res, next);
  const SSEData = `data:{"tableNumber": ${tableNumber},"bill": ${JSON.stringify(posData)}}\n\n`;
  
  SSEClients.forEach((client, idx) => {
    client.write(SSEData);
  });

  return res.status(201).json(updatedOrder);
};

// figma 상에서는 구현이 필요없는 부분이라 보류
const getOrderHistory = (req, res, next) => {
  return res.json("getOrderHistory");
};

const resetTable = async (req, res, next) => {
  // 테이블 초기화
  let tableNumber = parseInt(req.params.tableNumber);

  let newTable = new Order({
    tableNumber: tableNumber,
    orders: [],
    bill: new Map([["price", 0]]),
  });

  // tableNumber삭제 후 새로 생성 (__v 관리를 위해)
  try {
    let deleted = await Order.deleteOne({ tableNumber: tableNumber });
    await newTable.save();
  } catch (err) {
    return next(simpleServerError);
  }

  return res
    .status(200)
    .json({ message: tableNumber + "번 테이블 초기화 완료." });
};

// Map을 Object로 변환해서 반환
const getBillHandler = async (req, res, next) => {
  const { tableNumber } = req.params;
  // 주문한 메뉴와 총 가격 가져오기
  /*
  상품이름, 단가, 수량, 금액
  []
  []
  []
  ---------------------
  총 금액 : ₩ 14,000
  */

  let order;
  try {
    order = await Order.findOne({ tableNumber: tableNumber });
  } catch (err) {
    return next(simpleServerError);
  }

  let billResult = new Map([
    ["detail", []],
    ["total", 0],
  ]);

  let bill = order.bill;
  // bill 순회하면서 billResult채우기
  for (const [menuId, quantity] of bill) {
    // price면 저장만 해요
    if (menuId === "price") {
      billResult.set("total", bill.get("price"));
    } else {
      // 데이터 가져와서 (상품이름, 단가, 수량, 금액) 순서로 detail에 넣기
      let gettedMenuItem;
      try {
        gettedMenuItem = await MenuItem.findById(menuId);
      } catch (err) {
        return next(simpleServerError);
      }
      let detailTemp = [
        gettedMenuItem.title,
        gettedMenuItem.price,
        quantity,
        gettedMenuItem.price * quantity,
        gettedMenuItem.image_url,
      ];
      billResult.get("detail").push(detailTemp);
    }
  }

  return Object.fromEntries(billResult);
};

const getBill = async (req, res, next) => {
  const BillData = await getBillHandler(req, res, next);

  return res.status(200).json(BillData);
};

/* 개발을 위한 컨트롤러 */
// 테이블 갯수 세팅하기
const tableInit = async (req, res, next) => {
  let { quantity } = req.params;
  let orders = [];
  for (let i = 1; i < quantity; i++) {
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

let total_c = 0;
const posListUpdater = (req, res, next) => {
  res.setHeader("Content-Type", "text/event-stream;charset=utf-8");
  res.setHeader("Cache-Control", "no-cache");
  res.setHeader("Connection", "keep-alive");

  res.flushHeaders();

  SSEClients.push(res);
  res.write('data:{"message":"연결 완료"}\n\n');
  console.log("inlineCounter :", ++total_c);

  console.log("arr length : ", SSEClients.length);

  req.on("close", () => {
    SSEClients = SSEClients.filter((client) => client !== res);
    console.log("inlineCounter-out :", --total_c);
    console.log("arr length :", SSEClients.length);
  });
};

module.exports = {
  placeOrder,
  getOrderHistory,
  resetTable,
  getBill,
  tableInit,
  posListUpdater,
};

/*
const eventSource = new EventSource(
  `/api/orders/pos/to`
);
*/
