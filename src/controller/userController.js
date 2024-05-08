const bcrypt = require("bcryptjs");

const { HttpError, simpleServerError } = require("../models/http-error");
const User = require("../models/user");

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

  res.json({
    message: "Logged in!",
    user: existingUser.toObject({ getters: true }),
  });
};

const join = async (req, res) => {
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

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const getUsers = async (req, res) => {};

module.exports = { login, join };
