const express = require("express");
const dotenv = require("dotenv");
const mongoose = require("mongoose");

const app = express();
const apiRouter = express.Router(); // 경로 사용을 위한 라우터 사용
dotenv.config();

const indexRouter = require("./routes/indexRoute");

app.use("/api", apiRouter); // 최상위 path를 "/api"로 지정하기
apiRouter.use("", indexRouter);

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
