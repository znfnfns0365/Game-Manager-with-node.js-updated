# 과제 설명 <br/>
기존 Node.js와 express를 활용한 게임 아이템 시뮬레이터 서비스(https://github.com/znfnfns0365/Game-Manager-with-node.js) 고도화  
(로그인/회원가입, 회원 인증 미들웨어, 에러 처리 미들웨어, 아이템 구매/판매, 인벤토리 기능, 아이템 타입(장착 위치) 추가)  
DB 변경 - mongoose를 이용한 MongoDB(NoSQL) >> Prisma를 이용한 MySQL(RDB)  

1. **암호화 방식**
    - 비밀번호를 DB에 저장할 때 Hash를 이용했는데, Hash는 단방향 암호화와 양방향 암호화 중 어떤 암호화 방식에 해당할까요? <br/>- bcrypt는 단방향 해시함수로 복호화가 불가능하다.
    - 비밀번호를 그냥 저장하지 않고 Hash 한 값을 저장 했을 때의 좋은 점은 무엇인가요? <br/>- 보안이 강화되며, 비밀번호 원본을 직접 저장하지 않기 때문에 비밀번호가 노출될 가능성이 줄어든다.
2. **인증 방식**
    - JWT(Json Web Token)을 이용해 인증 기능을 했는데, 만약 Access Token이 노출되었을 경우 발생할 수 있는 문제점은 무엇일까요? <br/>- 무단으로 토큰을 이용해 해당 사용자의 민감한 서버에 접근할 수 있으며 민감한 정보가 유출될 수 있다.
    - 해당 문제점을 보완하기 위한 방법으로는 어떤 것이 있을까요? <br/>- Access Token의 유효 기간을 짧게 설정하거나 Refresh Token을 사용할 수 있다.
3. **인증과 인가**
    - 인증과 인가가 무엇인지 각각 설명해 주세요. <br/>- 인증이란 서비스를 이용하려는 사용자가 인증된 신분을 가진 사람이 맞는지 검증하는 작업을 뜻하며 놀이공원에서 예약 정보가 자신과 일치하는지 증명한 뒤 자유 이용권을 발급받는 것으로 비유할 수 있다. <br/>- 인가란 이미 인증된 사용자가 특정 리소스에 접근하거나 특정 작업을 수행할 수 있는 권한이 있는 지를 검증하는 작업을 뜻하며 놀이공원에서 자유 이용권을 소지하고 있는지 확인하는 단계로 비유할 수 있다.
    - 위 API 구현 명세에서 인증을 필요로 하는 API와 그렇지 않은 API의 차이가 뭐라고 생각하시나요? <br/>- 아이템 구매, 판매 등 캐릭터의 정보를 수정, 추가, 삭제할 수 있는 기능에 접근하는 API들에 인증 미들웨어를 추가하였다. 인증 미들웨어가 추가되지 않은 API들은 공개적으로 접근 가능한 아이템 목록, 캐릭터 목록 등에 해당하며 다른 사용자의 정보를 제어할 수 없는 API이다.
    - 아이템 생성, 수정 API는 인증을 필요로 하지 않는다고 했지만 사실은 어느 API보다도 인증이 필요한 API입니다. 왜 그럴까요?  <br/>- 사용자들에게 모두 해당하는 정보 중에 하나이기 때문에 서버의 관리자가 아니라면 아무도 접근할 수 없게 해야하는 중요한 API이다.
4. **Http Status Code**
    - 과제를 진행하면서 사용한 Http Status Code를 모두 나열하고, 각각이 의미하는 것과 어떤 상황에 사용했는지 작성해 주세요.  <br/>- 200(요청이 성공적으로 처리됨), 201(새로운 리소스를 성공적으로 생성함), 400(요청이 잘못됨), 401(인증이 필요함), 403(해당 자원에 접근할 권한이 없을 때), 404(요청한 리소스를 찾을 수 없음), 500(서버에서 처리할 수 없는 오류)
5. **게임 경제**
    - 현재는 간편한 구현을 위해 캐릭터 테이블에 money라는 게임 머니 컬럼만 추가하였습니다.
        - 이렇게 되었을 때 어떠한 단점이 있을 수 있을까요? - 다양한 재화 유형이 추가될 수 없음(캐쉬, 포인트 등), money에 변동이 있을 때마다 테이블을 수정해야 하는 비효율성이 발생한다.
        - 이렇게 하지 않고 다르게 구현할 수 있는 방법은 어떤 것이 있을까요? - characterMoney라는 별도의 테이블을 만들어 재화에 관련된 정보들을 관리한다.
    - 아이템 구입 시에 가격을 클라이언트에서 입력하게 하면 어떠한 문제점이 있을 수 있을까요? - 서버에서 검증하지 않고, 클라이언트에서 입력한 가격 값은 쉽게 변조될 수 있어 신뢰성이 떨어진다.

## 1) ERD
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js-updated/assets/96744723/dd82b46d-9a8a-4fca-99a1-6fdfb7c820f9)


## 2) API 명세 <br/>
[https://www.notion.so/ad449a7b2c274a70ac051cf899640254?v=b6849a1405ae46b78888fee993dd0f9a&pvs=4](https://www.notion.so/b63da0faac294e8ab50aa31cbb7f5cac?pvs=4)  

## 3) API 테스트 결과 (스크린샷 첨부) <br/>

회원가입  
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js-updated/assets/96744723/ca51b77f-ff85-48a1-8d6c-d5ea1dcace97)  
회원가입(error)  
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js-updated/assets/96744723/d838af82-9f0c-48e9-884b-08ea869ead86)  
<br/><br/><br/><br/><br/>
로그인  
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js-updated/assets/96744723/05dc9771-7cec-4d7a-b0c5-1ddfad8a0d49)  
로그인(error)  
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js-updated/assets/96744723/e8bbb19d-5710-4163-b2b0-1bc5ebe088e8)  
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js-updated/assets/96744723/db539760-da8a-49f2-b098-09766bd6cae6)  
<br/><br/><br/><br/><br/>
캐릭터 생성  
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js-updated/assets/96744723/c929732e-3691-4847-8617-c41c10cceb38)
캐릭터 생성(error)  
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js-updated/assets/96744723/b0988091-f099-45e4-a96e-7b277c90a927)
<br/><br/><br/><br/><br/>
캐릭터 삭제  
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js/assets/96744723/0b9dd790-ae4d-49df-bd78-bc19c8dbc695)  
캐릭터 삭제(error)  
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js/assets/96744723/e3dff8f8-1c09-4aff-b1f9-a08f81797896)  
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js-updated/assets/96744723/c3750ffb-4319-4ded-b22f-0dfd45ac6c24)
<br/><br/><br/><br/><br/>
캐릭터 전체 조회  
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js-updated/assets/96744723/ec74255f-2257-4637-8680-409374d8aab1)  
<br/><br/><br/><br/><br/>
캐릭터 상세 조회  
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js-updated/assets/96744723/48853f3d-c4c5-4c14-9be8-30073ca60f3f)  
캐릭터 상세 조회(error)  
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js/assets/96744723/32011fe2-71fb-43bd-87e4-7b49841c1f67)  
<br/><br/><br/><br/><br/>
아이템 생성  
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js-updated/assets/96744723/e94c736a-4508-4595-a49b-19a6df7487c6)  
아이템 생성(error)  
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js-updated/assets/96744723/a7ee568f-c4c2-40f3-992d-c1b59b722424)  
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js-updated/assets/96744723/76440d6a-d86b-4519-9f8a-9fb70a64ed45)  
<br/><br/><br/><br/><br/>
아이템 전체 조회  
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js-updated/assets/96744723/ecd76494-9045-4fa7-b625-bdb3593fb0c7)  
<br/><br/><br/><br/><br/>
아이템 상세 조회  
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js-updated/assets/96744723/596fe638-b2f2-4c68-9016-c74a7854a78f)  
<br/><br/><br/><br/><br/>
아이템 상세 조회(error)  
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js-updated/assets/96744723/38d928ec-ed8f-40e9-b472-090ca6e3f0a0)  
<br/><br/><br/><br/><br/>
아이템 수정  
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js/assets/96744723/54b290ef-6255-4136-a889-99c1b4bf1651)  
아이템 수정(error)  
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js/assets/96744723/43d51ff1-7a15-44d8-97c3-b2bb6a9f24df)  
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js/assets/96744723/2fd7ab13-7d36-4041-aa07-643ee10e0a88)  
<br/><br/><br/><br/><br/>
아이템 장착 상세 조회  
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js-updated/assets/96744723/a44673b1-af11-4719-be17-ca915d8b2845)  
아이템 장착 상세 조회(error)  
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js-updated/assets/96744723/0b3b3c0f-4f62-45cf-a361-57a7b16b8278)  
<br/><br/><br/><br/><br/>
아이템 장착  
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js-updated/assets/96744723/5819b298-5af4-43a1-93bb-0afcf40efe04)  
아이템 장착(error)  
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js-updated/assets/96744723/2ce454fe-7625-49fc-b0ed-bcdb532ecb74)
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js-updated/assets/96744723/f1447aaf-7f6a-414e-994b-f958068c5278)  
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js-updated/assets/96744723/cf90aa7e-f9d0-4cec-b401-8c2bb9ecd71d)  
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js-updated/assets/96744723/ce971698-a5d1-40b7-84ea-504ceeda299d)  
<br/><br/><br/><br/><br/>
아이템 탈착  
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js-updated/assets/96744723/2bc397f7-4cd4-43da-9b11-8993aa530254)  
아이템 탈착(error)  
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js/assets/96744723/94044ae8-badf-4d74-99a9-d729e0d3c718)  
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js/assets/96744723/9b875300-c039-4f0d-bd89-2a5ba3e6ef4c)
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js/assets/96744723/48cf74ec-52fd-4554-8039-cf87ad6ad43c) 
<br/><br/><br/><br/><br/>
아이템 구매  
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js-updated/assets/96744723/fe92930c-b4e0-49ec-af77-f05cd241e980)
아이템 구매(error)  
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js-updated/assets/96744723/89f56553-e04e-4d1c-96ee-fb9767074f08)  
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js-updated/assets/96744723/8e0a395e-7103-4c1b-bc3e-49a14c22c778)  
<br/><br/><br/><br/><br/>
아이템 판매  
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js-updated/assets/96744723/e8de29c2-aa19-4224-a0ae-ef1e5c3e95ae)  
아이템 판매(error)  
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js-updated/assets/96744723/08334f5e-2233-4f68-8b5f-8193b150c798)
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js-updated/assets/96744723/6783aa42-7286-4b08-9548-a3d5bec429de)
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js-updated/assets/96744723/99d56a3b-8d68-427f-b103-22e541055685)
<br/><br/><br/><br/><br/>
인벤토리 조회  
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js-updated/assets/96744723/4c0c7212-b37d-4ac6-b74e-15ed3473edf0)  
인벤토리 조회(error)   
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js-updated/assets/96744723/e52d5fc4-5aa2-4414-9ebe-228a59171c15)  
<br/><br/><br/><br/><br/>
money +100  
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js-updated/assets/96744723/02ad70be-b5be-48b4-982f-cef78f2572aa)  
money +100(error)  
![image](https://github.com/znfnfns0365/Game-Manager-with-node.js-updated/assets/96744723/5777671f-c927-4f3d-9fd0-91ba2fcfc3e3)  
