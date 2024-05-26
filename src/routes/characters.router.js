const express = require("express");
const jwt = require("jsonwebtoken");
const { userPrisma } = require("../utils/prisma/index.js");
const authMiddleware = require("../middleware/auth.middleware");
const dotenv = require("dotenv");

const router = express.Router();
const Characters = userPrisma.characters;
const MountedItems = userPrisma.mountedItems;

/* 캐릭터 생성 api */
router.post("/character", authMiddleware, async (req, res, next) => {
  const { name } = req.body;
  const user = req.user;
  console.log(user);
  const sameName = await Characters.findFirst({
    // name과 동일한 이름의 character가 User에게 있는지 찾음
    where: { name, UserId: user.userId },
  });
  if (sameName) {
    // 있다면 에러 메시지 전송
    return res
      .status(400)
      .json({ errorMessage: "동일한 이름을 가진 캐릭터가 존재합니다" });
  }

  const newCharacter = await Characters.create({
    // 캐릭터 추가
    data: {
      UserId: user.userId,
      name,
      health: 500,
      power: 100,
      money: 10000,
    },
  });

  // Mountings에도 캐릭터 정보 추가
  await MountedItems.create({
    data: {
      CharacterId: newCharacter.characterId,
      items: [],
    },
  });

  return res
    .status(201)
    .json({ name, newCharacterId: newCharacter.characterId });
});

/* 캐릭터 전체 조회 api */
router.get("/character/", async (req, res, next) => {
  const charactersList = await Characters.findMany({
    select: {
      characterId: true,
      UserId: true,
      name: true,
    },
    orderBy: [
      {
        UserId: "asc", // 먼저 UserId로 정렬
      },
      {
        characterId: "asc", // UserId가 같을 경우 characterId로 정렬
      },
    ],
  });

  return res.status(200).json({ charactersList });
});

/* 캐릭터 상세 조회 api */
router.get("/character/:characterId", async (req, res, next) => {
  const characterId = +req.params.characterId; // parameter 가져오기

  let userCheck = () => {
    // 로그인 하지 않았으면 0 아니면 id return
    // const { authorization } = req.headers;
    const { authorization } = req.cookies; // 일단 쿠키로 전달받고 제출전에 headers로 변경
    if (!authorization) return 0;
    const [tokenType, token] = authorization.split(" ");
    if (tokenType !== "Bearer") return 0;
    const decodedToken = jwt.verify(token, process.env.JWT_KEY);
    const userId = +decodedToken.userId;
    if (!userId) {
      return 0;
    }
    return userId;
  };

  const ID = userCheck();

  const character = await Characters.findFirst({
    // characterId가 같은 객체 찾기
    where: { characterId },
  });

  if (!character) {
    // 없으면 에러 메시지
    return res.status(404).json({ errorMessage: "조회할 캐릭터가 없습니다." });
  }

  if (!ID || character.UserId !== ID) {
    const { name, health, power } = character; // 로그인X or 타 사용자 캐릭터 조회
    return res.status(200).json({ name, health, power });
  }
  const { name, health, power, money } = character; // 본인 캐릭터를 조회하는 경우
  return res.status(200).json({ name, health, power, money });
});

/* 캐릭터 삭제 api */
router.delete(
  "/character/:characterId",
  authMiddleware,
  async (req, res, next) => {
    const user = req.user;
    const characterId = +req.params.characterId; // parameter 가져오기

    const character = await Characters.findFirst({
      // characterId, userId가 같은 객체 찾기
      where: {
        characterId: characterId,
      },
    });
    const name = character.name;
    if (character.UserId !== user.userId) {
      // 다른 유저의 캐릭터 삭제 시도
      return res
        .status(404)
        .json({ errorMessage: "다른 사용자의 캐릭터입니다." });
    }

    if (!character) {
      // 없으면 에러 메시지
      return res
        .status(404)
        .json({ errorMessage: "삭제할 캐릭터가 없습니다." });
    }

    await Characters.delete({
      where: {
        characterId: characterId,
        UserId: user.userId,
      },
    }); // characterId, userId가 같은 객체 삭제

    // Mountings에도 캐릭터 정보 삭제
    // await Mountings.deleteMany({ character_id: deleteId });

    return res
      .status(200)
      .json({ completeMessage: `캐릭터 '${name}'을 삭제하였습니다.` });
  }
);

exports.router = router;
