import express from "express";
import Characters from "../schemas/characters.schema.js";

const router = express.Router();

/* 캐릭터 생성 api */
router.post("/character", async (req, res, next) => {
  const { name } = req.body;

  const sameName = await Characters.findOne({ name }).exec(); // name과 동일한 이름의 character가 있는지 찾음
  if (sameName) {
    // 있다면 에러 메시지 전송
    return res.status(400).json({ errorMessage: "동일한 이름이 존재합니다" });
  }

  const characterId = await Characters.findOne().sort("-character_id").exec(); // 가장 큰 character_id의 객체를 가져옴
  const id = characterId ? characterId.character_id + 1 : 1; // 비어있다면 1, 아니라면 가장 큰 character_id+1을 id값으로 설정

  const newCharacter = new Characters({
    // 자동으로 health, power 스탯 초기화
    character_id: id,
    name,
    health: 500,
    power: 100,
  });

  await newCharacter.save();

  return res.status(201).json({ newCharacter });
});

/* 캐릭터 전체 조회 api */
router.get("/character/", async (req, res, next) => {
  const charactersList = await Characters.find().sort("-character_id").exec();

  return res.status(200).json({ charactersList });
});

/* 캐릭터 상세 조회 api */
router.get("/character/:characterId", async (req, res, next) => {
  const characterId = req.params.characterId; // parameter 가져오기
  const character = await Characters.findOne({ // character_id가 같은 객체 찾기
    character_id: characterId,
  })
    .exec();

  if (!character) {
    // 없으면 에러 메시지
    return res.status(404).json({ errorMessage: "조회할 캐릭터가 없습니다." });
  }

  const { name, health, power } = character; // 출력할 정보들 구조 분해 할당
  return res.status(200).json({ name, health, power });
});

/* 캐릭터 삭제 api */
router.delete("/character/:characterId", async (req, res, next) => {
  const characterId = req.params.characterId; // parameter 가져오기
  const character = await Characters.findOne({ // character_id가 같은 객체 찾기
    character_id: characterId,
  })
    .exec();

  if (!character) {
    // 없으면 에러 메시지
    return res.status(404).json({ errorMessage: "삭제할 캐릭터가 없습니다." });
  }

  const deleteId = character.character_id; // 객체의 id 불러와서
  await Characters.deleteOne({ character_id: deleteId }); // character_id가 같은 객체 삭제

  return res.status(200).json({ completeMessage: "삭제가 완료되었습니다." });
});

export default router;
