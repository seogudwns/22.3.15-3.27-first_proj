import is from "@sindresorhus/is";
import { Router } from "express";
import { login_required } from "../middlewares/login_required";
import { addTokenBlackList } from "../middlewares/TokenBlackList";
import { userAuthService } from "../services/userService";

const userAuthRouter = Router();

userAuthRouter.post("/register", async (req, res, next) => {
    try {
        if (is.emptyObject(req.body)) {
            throw new Error(
                "headers의 Content-Type을 application/json으로 설정해주세요",
            );
        }

        const name = req.body.name;
        const email = req.body.email;
        const password = req.body.password;

        const newUser = await userAuthService.addUser({
            name,
            email,
            password,
        });

        if (newUser.errorMessage) {
            throw new Error(newUser.errorMessage);
        }

        res.status(201).json(newUser);
    } catch (error) {
        next(error);
    }
});

userAuthRouter.post("/login", async (req, res, next) => {
    try {
        const email = req.body.email;
        const password = req.body.password;

        const user = await userAuthService.getUser({ email, password });

        if (user.errorMessage) {
            throw new Error(user.errorMessage);
        }

        res.status(200).json(user);
    } catch (error) {
        next(error);
    }
});

userAuthRouter.post("/logout", addTokenBlackList, async (req, res, next) => {
    try {
        const userToken = req.headers["authorization"]?.split(" ")[1] ?? "null";
        //* delete와 다르게 로그아웃은 정보가 삭제되는 것이 아니기 때문에 
        //* req로 받은 유저와 토큰상의 유저정보를 비교하지 않았음. 
        //* 필요시 user_id를 프론트에 요청후 비교하는 과정을 추가할 것!

        const token = await userAuthService.logoutUser({ userToken });

        if (!token) {
            const errorMessage = "...이게 일어나면 정말 이상한거임.";
            return { errorMessage }; //! 어떤 상황에서 애러가 날까?
        }

        res.status(200).json("로그아웃 성공!");
    } catch (error) {
        next(error);
    }
});

userAuthRouter.get("/list", login_required, addTokenBlackList, async (req, res, next) => {
    try {
        const users = await userAuthService.getUsers();
        res.status(200).json(users);
    } catch (error) {
        next(error);
    }
});

userAuthRouter.get("/current", login_required, addTokenBlackList, async (req, res, next) => {
    try {
        const user_id = req.currentUserId;
        const currentUserInfo = await userAuthService.getUserInfo({
            user_id,
        });

        if (currentUserInfo.errorMessage) {
            throw new Error(currentUserInfo.errorMessage);
        }

        res.status(200).json(currentUserInfo);
    } catch (error) {
        next(error);
    }
});

userAuthRouter.put("/:id", login_required, addTokenBlackList, async (req, res, next) => {
    try {
        const user_id = req.params.id;
        const name = req.body.name ?? null;
        const password = req.body.password ?? null;
        const description = req.body.description ?? null;
        const image_url = req.body.image_url ?? null;

        if (req.currentUserId !== user_id) {
            throw new Error("접근권한이 없습니다.");
        }

        const toUpdate = { name, password, description, image_url };
        const updatedUser = await userAuthService.setUser({
            user_id,
            toUpdate,
        });

        if (updatedUser.errorMessage) {
            throw new Error(updatedUser.errorMessage);
        }

        res.status(200).json(updatedUser);
    } catch (error) {
        next(error);
    }
});

userAuthRouter.get("/:id", login_required, addTokenBlackList, async (req, res, next) => {
    try {
        const user_id = req.params.id;
        const currentUserInfo = await userAuthService.getUserInfo({
            user_id,
        });

        if (currentUserInfo.errorMessage) {
            throw new Error(currentUserInfo.errorMessage);
        }

        res.status(200).json(currentUserInfo);
    } catch (error) {
        next(error);
    }
});

userAuthRouter.delete("/:id", login_required, addTokenBlackList, async (req, res, next) => {
    try {
        const user_id = req.params.id;
        const userToken = req.headers["authorization"]?.split(" ")[1] ?? "null";

        if (req.currentUserId !== user_id) {
            throw new Error("접근권한이 없습니다.");
        }

        const deletdUser = await userAuthService.deleteUser({ user_id, userToken });
        //! 토큰을 막는 것은 유저정보가 db에서 삭제되는 것과 함께 일어나야 하는 일이기 때문에 service 아래에서 진행.
        if (deletdUser.errorMessage) {
            throw new Error(deletdUser.errorMessage);
        }

        res.status(200).json(deletdUser);
    } catch (err) {
        next(err);
    }
});

userAuthRouter.get(
    "/list/:type/:pieceword",
    login_required,
    async (req, res, next) => {
        try {
            const Model = req.params.type;
            const pieceword = req.params.pieceword;

            let resultList;
            const modelName = [
                "other",
                "eaducation",
                "certificate",
                "award",
                "project",
                "about",
            ];
            if (Model === "user_name") {
                resultList = await userAuthService.getUsersWithRestrict({
                    pieceword,
                }); //* 이름검색 완료
            } else if (Model === "user_email") {
                resultList = await userAuthService.getUsersWithRestrict2({
                    pieceword,
                }); //* 이메일검색 완료
            } else if (modelName.includes(Model)) {
                resultList = await userAuthService.getUsersWithRestrict3({
                    pieceword,
                    Model,
                });  //!관계를 우선 만들어볼 것!... 그 후 삭제도 같이 바꿔볼까??
                // const errorMessage = "근시일 내로 완성될 예정입니다. 추후 업데이트를 기다려주세요.";
                // res.status(400).json(errorMessage);
            } else {
                const errorMessage = "type에 정확한 (소문자)모델명을 적어주세요.";
                
                res.status(400).json(errorMessage);
            }

            res.status(200).json(resultList);
        } catch (error) {
            next(error);
        }
    }
);

export { userAuthRouter };
