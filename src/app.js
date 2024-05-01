const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const app = express();
const router = express.Router(); // 경로 사용을 위한 라우터 사용
dotenv.config();

// 라우트 가져오기
const indexRouter = require("./routes/indexRoute");
const menuRouter = require("./routes/menuRoute");

app.use("/api", router); // 최상위 path를 "/api"로 지정하기
router.use("", indexRouter); // hello world
router.use("/menus", menuRouter); // menu 관련 라우팅

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
