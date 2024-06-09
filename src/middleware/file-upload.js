const multer = require("multer");
const { v1: uuidv1 } = require("uuid");

const MIME_TYPE_MAP = {
  "image/png": "png",
  "image/jpeg": "jpeg",
  "image/jpg": "jpg",
}; //도우미 상수
//multer는 40개 업로드된 파일에서 인식한 MIME 타입 정보 제공하는데, MIME타입 매핑으로 알맞은 확장자 판별

const fileUpload = multer({
  limits: { fileSize: 1000000 }, //용량제한
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      //저장될 경로 지정
      cb(null, "src/uploads/images");
    },
    filename: (req, file, cb) => {
      const ext = MIME_TYPE_MAP[file.mimetype];
      if (ext) {
        const filename = uuidv1() + "." + ext;
        console.log("Generated UUID Filename:", filename); // UUID 파일 이름을 콘솔에 출력
        cb(null, filename);
      } else {
        cb(new Error("Invalid mime type"));
      }
    },
  }), //storage키, 이 키로 데이터가 저장될 위치를 제어합니다
  fileFilter: (req, file, cb) => {
    const isValid = !!MIME_TYPE_MAP[file.mimetype];
    //!! 연산자가 앞에 옴으로써 undefined나 null을 false로 반환, 위 타입에 있는 경우 true반환
    let error = isValid ? null : new Error("유효하지 않은 mime타입");
    cb(error, isValid);
    //두번째 인수는 파일 수용 여부를 알려주는 boolian값으로 isValid값을 전달.
  },
  //multer 스토리지 드라이버가 필요, 내장된 스토리지 드라이버있음
  //요청객체 req, 추출된 파일 file, 작업 완료 후 호출하는 콜백 cb
});
//함수의 결과는 Multer가 제공하는 실제 fileUpload미들웨어
//express 미들웨어 체인에 사용할 수 있느 미들웨어가됨.

module.exports = fileUpload; //미들웨어 객체를 내보냄. 다른 파일에서도 사용할 수 있게됨.

//사용하려면
//const fileUpload = require("../middleware/file-upload");
//다른 미들웨어 사용하기전에 이렇게 지정
// router.post (
//     "/signup",
//     fileUpload.single('image'),
//     [

//     ],

//이 단계를 통해 다른 단계로 진행하기 전 multer에게 들어오는 요청 상에 있는 해당 image 키 상의 이미지 혹은 파일을 추출하도록 지시
