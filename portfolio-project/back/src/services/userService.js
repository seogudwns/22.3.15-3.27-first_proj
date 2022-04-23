import { User } from "../db"; // from을 폴더(db) 로 설정 시, 디폴트로 index.js 로부터 import함.
import { Checker } from "../utils/checker"; //*New!
import { addBlockedToken } from "../middlewares/TokenBlackList"; //*New!
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import jwt from "jsonwebtoken";



class userAuthService {
    static async addUser({ name, email, password }) {
        // 이메일 중복 확인
        const user = await User.findByEmail({ email });
        if (user) {
            const errorMessage =
                "이 이메일은 현재 사용중입니다. 다른 이메일을 입력해 주세요.";
            return { errorMessage };
        }

        // 비밀번호 해쉬화
        const hashedPassword = await bcrypt.hash(password, 10);

        // id 는 유니크 값 부여
        const id = uuidv4();
        const newUser = { id, name, email, password: hashedPassword };

        // db에 저장
        const createdNewUser = await User.create({ newUser });
        createdNewUser.errorMessage = null; // 문제 없이 db 저장 완료되었으므로 에러가 없음.

        return createdNewUser;
    }

    static async getUser({ email, password }) {
        // 이메일 db에 존재 여부 확인
        const user = await User.findByEmail({ email });
        if (!user) {
            const errorMessage =
                "해당 이메일은 가입 내역이 없습니다. 다시 한 번 확인해 주세요.";
            return { errorMessage };
        }

        // 비밀번호 일치 여부 확인
        const correctPasswordHash = user.password;
        const isPasswordCorrect = await bcrypt.compare(
            password,
            correctPasswordHash,
        );
        if (!isPasswordCorrect) {
            const errorMessage =
                "비밀번호가 일치하지 않습니다. 다시 한 번 확인해 주세요.";
            return { errorMessage };
        }

        // 로그인 성공 -> JWT 웹 토큰 생성
        const secretKey = process.env.JWT_SECRET_KEY || "jwt-secret-key";
        const token = jwt.sign({ user_id: user.id }, secretKey, {
            expiresIn: "6h",
        });

        // 반환할 loginuser 객체를 위한 변수 설정
        const id = user.id;
        const name = user.name;
        const description = user.description;
        const image_url = user.image_url;

        const loginUser = {
            token,
            id,
            email,
            name,
            description,
            image_url,
            errorMessage: null,
        };

        return loginUser;
    }

    static async getUsers() {
        const users = await User.findAll();
        return users;
    }

    static async setUser({ user_id, toUpdate }) {
        // 우선 해당 id 의 유저가 db에 존재하는지 여부 확인
        let user = await User.findById({ user_id });

        // db에서 찾지 못한 경우, 에러 메시지 반환
        if (!user) {
            const errorMessage =
                "가입 내역이 없습니다. 다시 한 번 확인해 주세요.";
            return { errorMessage };
        }

        // 업데이트 대상에 name이 있다면, 즉 name 값이 null 이 아니라면 업데이트 진행
        if (toUpdate.name) {
            const fieldToUpdate = "name";
            const newValue = toUpdate.name;
            user = await User.update({ user_id, fieldToUpdate, newValue });
        }

        if (toUpdate.password) {
            const fieldToUpdate = "password";
            const newValue = toUpdate.password;
            user = await User.update({ user_id, fieldToUpdate, newValue });
        }

        if (toUpdate.description) {
            const fieldToUpdate = "description";
            const newValue = toUpdate.description;
            user = await User.update({ user_id, fieldToUpdate, newValue });
        }

        if (toUpdate.image_url) {
            const fieldToUpdate = "image_url";
            const newValue = toUpdate.image_url;
            user = await User.update({ user_id, fieldToUpdate, newValue });
        }
        return user;
    }

    static async getUserInfo({ user_id }) {
        const user = await User.findById({ user_id });

        // db에서 찾지 못한 경우, 에러 메시지 반환
        if (!user) {
            const errorMessage =
                "해당 이메일은 가입 내역이 없습니다. 다시 한 번 확인해 주세요.";
            return { errorMessage };
        }

        return user;
    }

    static async getUsersWithRestrict({ pieceword }) {
        const searchingUser = await User.searchingByPiece({ pieceword });

        if (!searchingUser) {
            const errorMessage = "검색조건에 부합하는 유저가 없습니다.";
            return { errorMessage };
        } //* 이름으로 검색.

        return searchingUser;
    }

    static async getUsersWithRestrict2({ pieceword }) {
        const searchingUser = await User.searchingByPiece2({ pieceword });

        if (!searchingUser) {
            const errorMessage = "검색조건에 부합하는 유저가 없습니다.";
            return { errorMessage };
        } //* 이메일로 검색.

        return searchingUser;
    }

    static async getUsersWithRestrict3({ pieceword, Model }) {
        const searchingUsers = await Checker
            .findAllAndFilteredByCondition(pieceword, Model);

        if (!searchingUsers) {
            const errorMessage = "검색조건에 부합하는 유저가 없습니다.";
            return { errorMessage };
        } //* 이메일로 검색.

        return searchingUsers;
    }

    static async deleteUser({ userToken, user_id }) {
        const deletedUser = await User.deleteById({ user_id });
        await Checker.deleteChild({ user_id });  
        //* user가 아닌 각각의 mvp별로 user_id를 가진 모든 게시글을 삭제하는 기능.

        if (!deletedUser) {
            const errorMessage = "일치하는 유저가 없습니다.";
            return { errorMessage };
        }

        await addBlockedToken({ userToken }); 
        //! 애러메시지 뒤에 냅둔 이유는 만일에 대비해서 + 쓸모없는 데이터소모량을 줄이기 위함.

        return deletedUser;
    }

    static async logoutUser({ userToken }) {
        const registerBlockedToken = await addBlockedToken({ userToken });

        return registerBlockedToken;
    }
}

export { userAuthService };
