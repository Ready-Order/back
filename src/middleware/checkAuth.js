const jwt = require("jsonwebtoken");
const dotenv = require("dotenv");

const { HttpError } = require("../models/http-error");
dotenv.config();

/* 
토큰에 있는 정보를 빼서 req에 id와 email에 넣어줍니다.
jwt 형태 = { TK_id: mongoDB_objectID, TK_email: User-email }
*/
const checkAuth = (req, res, next) => {
  try {
    const token = req.headers.authorization.split(" ")[1]; // Authorization: 'Bear TOKEN'
    if (!token) {
      throw new Error("Authentication failed!");
    }
    const decodedToken = jwt.verify(token, process.env.JWT_PK);
    req.userData = {
      TK_id: decodedToken.TK_id,
      TK_email: decodedToken.TK_email,
    };
    next();
  } catch (err) {
    const error = new HttpError("Authentication failed!", 401);
    return next(error);
  }
};

module.exports = checkAuth;
