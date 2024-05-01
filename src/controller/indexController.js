const StatusCodes = require("http-status-codes");

const hello = (req, res) => {
  res.status(StatusCodes.OK).json({ message: "welcome to readyOrder API!" });
};

module.exports = {
  hello,
};
