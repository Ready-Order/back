class HttpError extends Error {
  constructor(message, errorCode) {
    super(message); // Error에 일단 값을 다 넣자
    this.code = errorCode; // http 상태코드도 같이 보내줬으면 한다.
  }
}

const simpleServerError = new HttpError("서버가 . 잠시후 시도해주세요.", 500);

module.exports = {
  HttpError,
  simpleServerError,
};
