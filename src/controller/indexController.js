const hello = (req, res) => {
  res.status(200).json({ message: "welcome to readyOrder API!" });
};

module.exports = {
  hello,
};
