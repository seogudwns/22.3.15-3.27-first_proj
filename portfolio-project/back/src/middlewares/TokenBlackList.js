import { Schema, model } from "mongoose";

const tokenList = new Schema({
    id: {
        type: Date,
        required: true,
        default: new Date,
    },
    Token: {
        type: String,
        required: true,
    },
});

const TokenModel = new model("token", tokenList);

//===========================================================
async function findByToken({ userToken }) {
    const award = await TokenModel.find({ Token: userToken });
    return award;
}

async function addBlockedToken({ userToken }) {
    const token = await TokenModel.create({ Token: userToken });
    return token;
}

async function checkAndDeleteBlockedToken() {
    const tokens = await TokenModel.find({});  //* TokenBlackList에 올라와있는 토큰 찾기.
    
    const deleteBlockedToken = [];
    tokens.map(token => {
        if (new Date() - token.id >21600*1000) {
            deleteBlockedToken.push(token.Token);
        }
    }); //* 실행될 때의 시간과 비교해서 6시간이 지났을 경우 삭제할 토큰의 목록을 뽑음.

    deleteBlockedToken.map(async Token => {
        await TokenModel.deleteOne({ Token });
    });  //* 토큰 삭제.
}  //* db의 index.js에서 서버에 연결이 되었을 때 기준으로 24시간마다 실행.. 
//! 1. 현재 체크하진 못함.
//! 2. 원시적인 방법이라 생각되고, 추후 더 생각해볼 것! (redis 공부해서 만들어보기.)

// ==========================================================
const addTokenBlackList = async (req,res,next) => {
    try {
        // request 헤더로부터 authorization bearer 토큰을 받음.
        const userToken = req.headers["authorization"]?.split(" ")[1] ?? "null";

        const existToken = await findByToken({ userToken });  

        if (existToken.length !== 0) {
            console.log("로그아웃 혹은 삭제한 아이디로부터 접촉한 토큰이 있습니다.");

            res.status(400).json("다시 로그인, 혹은 회원가입을 해주세요.");
            return;
        }

        next();
    } catch (error) {
        res.status(400).json({ errorMessage: error.message });
        return;
    }
};

export { TokenModel, addBlockedToken, addTokenBlackList, checkAndDeleteBlockedToken };