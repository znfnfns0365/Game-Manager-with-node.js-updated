import express from "express";
import Mountings from "../schemas/mounting.schema.js";
import Items from "../schemas/items.schema.js";
import Characters from "../schemas/characters.schema.js";

const router = express.Router();

/* 장착된 아이템 목록 조회 api */
router.get("/mounting/", async (req, res, next) => {
  const mountingList = await Mountings.find().sort("+character_id").exec();

  return res.status(200).json({ mountingList });
});

/* 장착된 아이템 상세 조회 api */
router.get("/mounting/:characterId", async (req, res, next) => {
  const characterId = req.params.characterId; // parameter 가져오기
  const mounting = await Mountings.findOne({
    // character_id가 같은 객체 찾기
    character_id: characterId,
  }).exec();

  if (!mounting) {
    // 없으면 에러 메시지
    return res.status(404).json({ errorMessage: "조회할 캐릭터가 없습니다." });
  }

  const { mountedItems } = mounting; // 출력할 정보들 구조 분해 할당
  mountedItems.sort((a, b) => {
    // item_code로 정렬
    if (a.item_code > b.item_code) return 1;
    else if (a.item_code < b.item_code) return -1;
    return 0;
  });
  return res.status(200).json({ mountedItems });
});

/* 아이템 장착 api */
router.patch("/mounting/:characterId", async (req, res, next) => {
  const characterId = req.params.characterId; // parameter 가져오기
  const mounting = await Mountings.findOne({
    // character_id가 같은 객체 찾기 (Mountings 모듈에서)
    character_id: characterId,
  }).exec();

  if (!mounting) {
    // 없으면 에러 메시지
    return res
      .status(404)
      .json({ errorMessage: "아이템을 장착할 캐릭터가 없습니다." });
  }

  const { item_code } = req.body; // 장착할 아이템 갸져오기
  const item = await Items.findOne({
    // item_code가 같은 객체 찾기
    item_code: item_code,
  }).exec();

  if (!item) {
    // 없으면 에러 메시지
    return res
      .status(404)
      .json({ errorMessage: "장착할 아이템이 존재하지 않습니다." });
  }

  const mountedItems = mounting.mountedItems;
  const sameItem = mountedItems.find(function (obj) {
    return obj.item_code == item_code;
  });
  if (sameItem) {
    return res
      .status(400)
      .json({ errorMessage: "아이템이 이미 장착되어 있습니다." });
  }

  const { item_name, item_stat } = item;
  mounting.mountedItems.push({ item_code, item_name }); // 아이템 장착하기
  await mounting.save();

  const character = await Characters.findOne({
    // character_id가 같은 객체 찾기 (캐릭터 모듈에서)
    character_id: characterId,
  }).exec();

  if (item_stat.health) character.health += item_stat.health;
  if (item_stat.power) character.power += item_stat.power;
  character.save(); // 캐릭터에 아이템을 장착하면서 스탯이 올라감

  return res
    .status(200)
    .json({ completeMessage: "아이템 장착이 완료되었습니다." });
});

/* 아이템 탈착 api */
router.patch("/detachable/:characterId", async (req, res, next) => {
  const characterId = req.params.characterId; // parameter 가져오기
  const mounting = await Mountings.findOne({
    // character_id가 같은 객체 찾기
    character_id: characterId,
  }).exec();

  if (!mounting) {
    // 없으면 에러 메시지
    return res
      .status(404)
      .json({ errorMessage: "아이템을 탈착할 캐릭터가 없습니다." });
  }

  const { item_code } = req.body; // 장착할 아이템 갸져오기
  const item = await Items.findOne({
    // item_code가 같은 객체 찾기
    item_code: item_code,
  }).exec();

  if (!item) {
    // 없으면 에러 메시지
    return res
      .status(404)
      .json({ errorMessage: "탈착할 아이템이 존재하지 않습니다." });
  }

  const mountedItems = mounting.mountedItems;
  const sameItem = mountedItems.find(function (obj) {
    // 장착되어있는 item_code 아이템 불러오기
    return obj.item_code == item_code;
  });
  if (!sameItem) {
    // item_code와 일치하는 item이 없을 때
    const { item_name } = item;
    return res
      .status(400)
      .json({ errorMessage: `캐릭터에게 "${item_name}"이 존재하지 않습니다.` });
  }

  mountedItems.forEach((item, index) => {
    // item_code와 일치하는 아이템 삭제
    if (item.item_code === item_code) {
      mountedItems.splice(index, 1);
      return false;
    }
  });
  mounting.mountedItems = mountedItems;
  await mounting.save();

  const character = await Characters.findOne({
    // character_id가 같은 객체 찾기 (캐릭터 모듈에서)
    character_id: characterId,
  }).exec();

  const { item_stat } = item;
  if (item_stat.health) character.health -= item_stat.health;
  if (item_stat.power) character.power -= item_stat.power;
  character.save(); // 캐릭터에 아이템을 탈착하면서 스탯이 내려감

  return res
    .status(200)
    .json({ completeMessage: "아이템 탈착이 완료되었습니다." });
});

export default router;
