const bcrypt = require("bcryptjs");
const dotenv = require("dotenv");
const jwt = require("jsonwebtoken");

const { HttpError, simpleServerError } = require("../models/http-error");
const User = require("../models/user");
dotenv.config();

const login = async (req, res, next) => {
  const { email, password } = req.body;
  const existingUser = await User.findOne({ email: email });

  const loginError = new HttpError(
    "아이디 또는 비밀번호가 잘못되었습니다. 다시 입력해주세요",
    401
  );

  if (!existingUser) {
    return next(loginError);
  }

  let isValidPassword = false;
  try {
    isValidPassword = await bcrypt.compare(password, existingUser.password);
  } catch (err) {
    return next(loginError);
  }

  if (!isValidPassword) {
    return next(loginError);
  }

  let token;
  try {
    token = jwt.sign(
      { TK_id: existingUser.id, TK_email: existingUser.email },
      process.env.JWT_PK,
      {
        expiresIn: "24h",
      }
    );
  } catch (err) {
    const error = new HttpError(
      "로그인에 실패했습니다. 잠시후 시도해주세요",
      500
    );
    return next(error);
  }

  res.json({
    userId: existingUser.id,
    email: existingUser.email,
    token: token,
  });
};

const join = async (req, res, next) => {
  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    return next(simpleServerError);
  }

  if (existingUser) {
    const error = new HttpError("user already exist", 409);
    return next(error);
  }

  let hashedPassword;
  try {
    hashedPassword = await bcrypt.hash(password, 12);
  } catch (err) {
    return next(simpleServerError);
  }

  const createdUser = new User({
    name,
    email,
    password: hashedPassword,
    menus: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    return next(simpleServerError);
  }

  let token;
  try {
    token = jwt.sign(
      { TK_id: createdUser.id, TK_email: createdUser.email },
      process.env.JWT_PK,
      {
        expiresIn: "24h",
      }
    );
  } catch (err) {
    const error = new HttpError(
      "회원가입 오류입니다. 잠시후 시도해주세요",
      500
    );
    return next(error);
  }

  res.status(201).json({
    user: createdUser.toObject({ getters: true }),
    email: createdUser.email,
    token: token,
  });
};

const getUsers = async (req, res, next) => {};

module.exports = { login, join };
