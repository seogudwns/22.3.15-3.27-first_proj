# 22.3.15-3.27-first_proj
- 앨리스에서 사용한 gitlab은 외부인이 보기가 쉽지 않아 개인 git으로 옮기게 되었습니다.

### 집중해서 한 일.
- Json Web Token의 특성상 한번 생성되었을 때 제어하기가 쉽지 않다는 문제점이 있다. 어떤 이유로 토큰이 탈취당했을 때 토큰을 탈취한 해커가 서비스상의 모든 것을 보고 
수정할 수 있었던 치명적인 문제를 unit test를 하던 중 발견하게 되었다. 프로젝트의 말미에 이 문제를 발견하게 되었기에, 3계층 구조를 약간 어겨가며 이에 대한 보안을 진행했다.
    - portfolio-project/back/src/utils/check.js 및 portfolio-project/back/src/middlewares/TokenBlackList.js 참고.
