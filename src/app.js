const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const app = express();
const router = express.Router(); // 경로 사용을 위한 라우터 사용
router.use(express.json()); // body 사용 설정
dotenv.config();

// 사용자 정의 라우트 가져오기
const indexRouter = require("./routes/indexRoute");
const menuRouter = require("./routes/menuRoute");
const userRouter = require("./routes/userRoute");

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept, Authorization"
  );
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PATCH, DELETE");

  next();
});

app.use("/api", router); // 최상위 path를 "/api"로 지정하기

router.use("", indexRouter); // hello world
router.use("/menus", menuRouter); // menu 관련 라우팅 (메뉴 CRUD)
router.use("/users", userRouter); // users 관련 라우팅 (로그인, 로그아웃)

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
