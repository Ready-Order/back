const StatusCodes = require("http-status-codes");

const User = require("../models/user");

const login = (req, res) => {
  res.json({ message: "this work" });
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

module.exports = { login, join };
