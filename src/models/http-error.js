class HttpError extends Error {
  constructor(message, errorCode) {
    super(message); // Error에 일단 값을 다 넣자
    this.code = errorCode; // http 상태코드도 같이 보내줬으면 한다.
  }
}

module.exports = HttpError;
