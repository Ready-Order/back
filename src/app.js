const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");
const cors = require("cors");
const path = require("path");
const fs = require("fs");
const app = express();
const router = express.Router(); // 경로 사용을 위한 라우터 사용
router.use(express.json()); // body 사용 설정
dotenv.config({ path: path.join(__dirname, "../.env") });

// 사용자 정의 라우트 가져오기
const indexRouter = require("./routes/indexRoute");
const menuRouter = require("./routes/menuRoute");
const userRouter = require("./routes/userRoute");
const orderRouter = require("./routes/orderRoute");

// 허용할 도메인 목록
const allowedOrigins = [
  "https://ready-order.swdev.kr",
  "http://localhost:3000",
  "http://ready-order.shop:335",
];
// CORS 설정
const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true);
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg =
        "The CORS policy for this site does not allow access from the specified Origin.";
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true,
};
app.use(cors(corsOptions));

app.use("/api", router); // 최상위 path를 "/api"로 지정하기

router.use(
  "/src/uploads/images",
  express.static(path.join(__dirname, "uploads", "images"))
); // 이미지 업로드 경로 설정

router.use("/", indexRouter); // hello world
router.use("/menus", menuRouter); // menu 관련 라우팅 (메뉴 CRUD)
router.use("/users", userRouter); // users 관련 라우팅 (로그인, 로그아웃)
router.use("/orders", orderRouter); // orders 관련 라우팅 (주문하기, 주문내역)

// React SPA 라우팅 설정
app.use(express.static(path.join(__dirname, "../build"))); // react SPA 경로
app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "../build", "index.html"));
});

// 오류 처리 미들웨어
app.use((error, req, res, next) => {
  if (req.file) {
    fs.unlink(req.file.path, (err) => {
      console.log(err);
    });
  }
  if (res.headerSent) {
    return next(error);
  }
  res.status(error.code || 500);
  res.json({ message: error.message || "An unknown error occurred!" });
});

// mongoose db연결
mongoose
  .connect(process.env.MONGODB_URL)
  .then(() => {
    app.listen(process.env.PORT, () => {
      console.log(`server port is ${process.env.PORT}`);
    });
  })
  .catch((err) => {
    console.log(err);
  });
