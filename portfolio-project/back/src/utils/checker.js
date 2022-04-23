import { UserModel } from "../db/schemas/user";
import { Education, Award, Project, Certificate, About, Other } from "../db";


function checkPieceWord(pieceword, List) {
    return List.join("____").includes(pieceword);
}  //* TF 리턴.

const mvps = [Education, Award, Project, Certificate, About, Other];
//=============================================================

class Checker {
    static async checkChild({ user_id }) {
        return mvps.map(async Model => {
            await Model.find({ user_id });
        });
    }   //! 어디쓰면 좋을까? 추후 기능업데이트를 할 때 넣으면 좋긴 하겠지..?.. 쓰지는 않지만 잘 작동하고 만들어졌기에 남김.

    static async deleteChild({ user_id }) {
        mvps.map(async Model => {
            await Model.removeAllByUserId({ user_id });
        });
        return "사용자가 쓴 모든 게시글이 삭제되었습니다.";
    }  //* 각 mvp에 있는 user_id를 가진 모든 게시글을 삭제하는 기능.. 완성.

    static async findAllAndFilteredByCondition(pieceword, Model) {
        const userList = await UserModel.find(); //* user를 그대로 받는 이유는 추후 filter에 그대로 리턴을 하기 위함.. true인 것만 반환.
        //! const modelTitle = []; 여기에 빼면 안되는 이유는 push한 값이 그대로 쌓이기 때문에 리셋이 안됨..
        let filteredUserList;

        if (Model === "education") {
            const model = Education;
            filteredUserList = userList.filter(async user => {  //*유저별 구분을 위해 filter 사용.
                const modelTitle = [];
                await model.findByUserId({ user_id: user.id })  //* user의 아이디를 가진 모델을 불러옴. 
                    .map(data => modelTitle.push(data.title));  //* modelTitle에 넣은 후,
                return checkPieceWord(pieceword, modelTitle);  //* 여기에 pieceword가 들어가있을 경우 True를 리턴하게 함으로써 필터를 만듦.
            });
        } else if (Model === 'award') {
            const model = Award;
            filteredUserList = userList.filter(async user => {
                const modelTitle = [];
                await model.findByUserId({ user_id: user.id }) 
                    .map(data => modelTitle.push(data.title));
                return checkPieceWord(pieceword, modelTitle);
            });
        } else if (Model === 'project') {
            const model = Project;
            filteredUserList = userList.filter(async user => {
                const modelTitle = [];
                await model.findByUserId({ user_id: user.id })
                    .map(data => modelTitle.push(data.title));
                return checkPieceWord(pieceword, modelTitle);
            });
        } else if (Model === 'certificate') {
            const model = Certificate;
            filteredUserList = userList.filter(async user => {
                const modelTitle = [];
                await model.findByUserId({ user_id: user.id })
                    .map(data => modelTitle.push(data.title));
                return checkPieceWord(pieceword, modelTitle);
            });
        } else if (Model === 'about') {
            const model = About;
            filteredUserList = userList.filter(async user => {
                const modelTitle = [];
                await model.findByUserId({ user_id: user.id })
                    .map(data => modelTitle.push(data.title));
                return checkPieceWord(pieceword, modelTitle);
            });
        } else if (Model === 'other') {
            const model = Other;

            //* 1. user에 따라 게시글의 제목배열 따기.
            //* 2. 반환된 제목 배열에 원하는 조각이 있으면 return 1, 없으면 0 반환.
            //* 3. 1일시 filteredUserList에 추가.
            // const userList = await UserModel.find();
            // let filteredUserList;  //! 요기 두개는 위에 이미 선언한 것, 만든 후 지우기.
            
            let UserIdList = [];  //! 임시이름.
            let filteredUserIdList = [];  //! 임시이름.

            userList.forEach(user => UserIdList.push(user.id));
            // console.log('UserIdList = ',UserIdList); # done.

            UserIdList.forEach(async user_id => {
                let models;
                await model.findByUserId({ user_id }).then(dbdata => models = dbdata);
                if (models.length !== 0) {
                    models.forEach(data => {
                        if (data.title.includes(pieceword)) {
                            console.log(data);
                            console.log('(추가전)',data.user_id);
                            if (!filteredUserIdList.includes(data.user_id)) {
                                console.log('추가!');
                                filteredUserIdList.push(data.user_id);
                            }
                        }
                    });
                }
                console.log('여기에서는 잘 찍힘',filteredUserIdList);
                //! 여기서는 인지가 되는데 아래서는 왜 공백이..?..
            });
            console.log('이게 왜 인지가 안되지??',filteredUserIdList);

                // //? WANTED : TF를 반환해주는 checkPieceWord를 통해 filter로 걸러진 유저만 pick.. but,
                // //! TF로 return까지 잘 되었는데 왜 filter가 안먹히는걸까..?.. ==> typed.. 읽어보고 바꿔주기 + 함수로 묶어서 적용할 것!!!
                //return false; 
            // });
        } 
        console.log('넘겨주기!');
        return filteredUserList;
    }
    //TODO : 검색기능 구현.
}

export { Checker };