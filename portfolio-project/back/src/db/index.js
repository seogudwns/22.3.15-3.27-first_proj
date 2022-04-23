import mongoose from "mongoose";
import { User } from "./models/User";
import { Certificate } from "./models/Certificate";
import { Project } from "./models/Project";
import { Education } from "./models/Education";
import { Award } from "./models/Award";
import { About } from "./models/About";
import { Other } from "./models/Other";
import { checkAndDeleteBlockedToken } from "../middlewares/TokenBlackList";

const DB_URL =
    process.env.MONGODB_URL ||
    "MongoDB 서버 주소가 설정되지 않았습니다.\n./db/index.ts 파일을 확인해 주세요.";

mongoose.connect(DB_URL);
const db = mongoose.connection;

db.on("connected", () =>
    console.log("정상적으로 MongoDB 서버에 연결되었습니다.  " + DB_URL),
    setInterval(() => checkAndDeleteBlockedToken, 86400*1000) //* 서버시작 직후 하루마다 실행됨.
    // checkAndDeleteBlockedToken() 토큰을 바로 없애고 싶으면 서버를 재시작시 주석처리를 없애고 restart를 한번 해주세요.
);
db.on("error", (error) =>
    console.error("MongoDB 연결에 실패하였습니다...\n" + DB_URL + "\n" + error),
);

export { User, Education, Award, Project, Certificate, About, Other };
