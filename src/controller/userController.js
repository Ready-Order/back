const StatusCodes = require("http-status-codes");

const User = require("../models/user");

const login = async (req, res) => {
  const { email, password } = req.body;
  const existingUser = await User.findOne({ email: email });

  // email이 존재하고 비밀번호가 같으면 로그인
  console.log(existingUser);
  if (existingUser && existingUser.password === password) {
    return res.json({ message: "Logged in!" });
  } else {
    // 둘 중 하나이상 잘못되었다면
    return res.json({ message: "아이디 또는 비밀번호가 잘못되었습니다." });
  }
};

const join = async (req, res) => {
  const { name, email, password } = req.body;

  let existingUser;
  try {
    existingUser = await User.findOne({ email: email });
  } catch (err) {
    console.log(err);
    console.log("😇");
    return res.status(500).json({ message: "server error" });
  }

  if (existingUser) {
    return res.status(422).json({ message: "user already exist" });
  }

  const createdUser = new User({
    name,
    email,
    password,
    menus: [],
  });

  try {
    await createdUser.save();
  } catch (err) {
    console.log(err);
    console.log("😇");
    return res.status(500).json(err);
  }

  res.status(201).json({ user: createdUser.toObject({ getters: true }) });
};

const getUsers = async (req, res) => {};

module.exports = { login, join };
