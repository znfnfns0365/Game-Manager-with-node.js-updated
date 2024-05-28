const express = require("express");
const { itemPrisma, userPrisma } = require("../utils/prisma/index.js");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();
const Items = itemPrisma.items;
const Characters = userPrisma.characters;
const Inventories = userPrisma.inventories;
const MountedItems = userPrisma.mountedItems;

/* 장착된 아이템 조회 api */
router.get("/mounting/:characterId", async (req, res, next) => {
  const characterId = +req.params.characterId; // parameter 가져오기
  const mounting = await MountedItems.findFirst({
    // character_id가 같은 객체 찾기
    where: {
      CharacterId: characterId,
    },
  });
  if (!mounting) {
    // 없으면 에러 메시지
    return res.status(404).json({ errorMessage: "조회할 캐릭터가 없습니다." });
  }

  // itemCode 기준으로 정렬
  mounting.items.sort((a, b) => {
    if (a.itemCode < b.itemCode) return -1;
    if (a.itemCode > b.itemCode) return 1;
    return 0;
  });

  return res.status(200).json(mounting.mountingLocation);
});

/* 아이템 장착 api */
router.patch("/mounting/:characterId", authMiddleware, async (req, res) => {
  const characterId = +req.params.characterId; // parameter 가져오기
  const character = await Characters.findFirst({
    // characterId와 userId가 일치하는 character 가져오기
    where: {
      characterId,
      UserId: req.user.userId,
    },
  });
  if (!character) {
    return res
      .status(404)
      .json({ errorMessage: "아이템을 장착할 캐릭터가 없습니다." });
  }

  const mounting = await MountedItems.findFirst({
    // characterId가 같은 객체 찾기 (MountedItems 모듈에서)
    where: { CharacterId: +characterId },
  });

  // 아이템 코드가 존재하는지 검사
  const { item_code } = req.body; // 장착할 아이템 갸져오기
  const item = await Items.findFirst({
    // itemCode가 같은 객체 찾기
    where: { itemCode: item_code },
  });
  if (!item) {
    // 없으면 에러 메시지
    return res
      .status(404)
      .json({ errorMessage: "장착할 아이템이 존재하지 않습니다." });
  }

  // 같은 타입 아이템이 장착되어 있는지 확인
  let mountingLocation = mounting.mountingLocation;
  const sameType = mountingLocation[item.itemType];
  if (sameType) {
    // 이미 장착되어 있다면 에러 출력
    return res
      .status(400)
      .json({ errorMessage: "동일한 아이템 타입이 장착되어 있습니다." });
  }

  // 아이템이 inventory에 존재하는지 검사
  const inventory = await Inventories.findFirst({
    // characterId와 일치하는 inventory 가져오기
    where: { CharacterId: characterId },
  });
  if (
    !inventory ||
    inventory.items[item_code] === undefined ||
    inventory.items[item_code] < 1
  ) {
    return res
      .status(400)
      .json({ errorMessage: "인벤토리에 아이템이 존재하지 않습니다." });
  }

  // MountedItems에 아이템 추가
  const { name, itemStat, itemType } = item;
  mountedItems.push({
    // item 목록에 장착할 item 추가
    itemCode: item_code,
    name,
  });
  mountingLocation[itemType] = name;
  await MountedItems.update({
    // db에 업데이트
    data: {
      items: mountedItems,
      mountingLocation,
    },
    where: {
      CharacterId: characterId,
    },
  });

  // 아이템 장착으로 인한 캐릭터 스탯 변경
  let { health, power } = character;
  if (itemStat.health) health += itemStat.health; // health를 올려주면 health 증가
  if (itemStat.power) power += itemStat.power; // power를 올려주면 power 증가
  await Characters.update({
    // db에 업데이트
    data: {
      health,
      power,
    },
    where: {
      characterId,
      UserId: req.user.userId,
    },
  });

  // inventory에서 아이템 삭제
  inventory.items[item_code]--;
  await Inventories.update({
    data: {
      items: inventory.items,
    },
    where: { CharacterId: characterId },
  });

  return res
    .status(200)
    .json({ completeMessage: "아이템 장착이 완료되었습니다." });
});

/* 아이템 탈착 api */
router.patch("/detachable/:characterId", authMiddleware, async (req, res) => {
  const characterId = +req.params.characterId; // parameter 가져오기
  const character = await Characters.findFirst({
    // characterId와 userId가 일치하는 character 가져오기
    where: {
      characterId,
      UserId: req.user.userId,
    },
  });
  if (!character) {
    return res
      .status(404)
      .json({ errorMessage: "아이템을 탈착할 캐릭터가 없습니다." });
  }

  const mounting = await MountedItems.findFirst({
    // characterId가 같은 객체 찾기 (MountedItems 모듈에서)
    where: { CharacterId: +characterId },
  });

  // 아이템 코드가 존재하는지 검사
  const { item_code } = req.body; // 장착할 아이템 갸져오기
  const item = await Items.findFirst({
    // itemCode가 같은 객체 찾기
    where: { itemCode: item_code },
  });
  if (!item) {
    // 없으면 에러 메시지
    return res
      .status(404)
      .json({ errorMessage: "탈착할 아이템이 존재하지 않습니다." });
  }

  // 아이템이 장착되어 있는지 확인
  let mountedItems = mounting.items;
  const sameItem = mountedItems.find(function (obj) {
    return obj.itemCode === +item_code;
  });
  if (!sameItem) {
    // 장착되어있지 않다면 에러 출력
    return res.status(400).json({
      errorMessage: `캐릭터에게 '${item.name}'이 존재하지 않습니다.`,
    });
  }

  // MountedItems에서 아이템 삭제
  mountedItems = mountedItems.filter((val) => {
    return val.itemCode !== item_code;
  });
  let mountingLocation = mounting.mountingLocation;
  mountingLocation[item.itemType] = false;
  await MountedItems.update({
    // db에 업데이트
    data: {
      items: mountedItems,
      mountingLocation,
    },
    where: {
      CharacterId: characterId,
    },
  });

  // 아이템 탈착으로 인한 캐릭터 스탯 변경
  const { itemStat } = item;
  let { health, power } = character;
  health -= itemStat.health ?? 0;
  power -= itemStat.power ?? 0;
  console.log(health, power);
  await Characters.update({
    data: {
      health,
      power,
    },
    where: {
      characterId,
      UserId: req.user.userId,
    },
  });

  // inventory에 아이템 추가
  let { items } = await Inventories.findFirst({
    where: { CharacterId: characterId },
  });
  items[item_code] = (items[item_code] ?? 0) + 1; // item이 존재하지 않으면 0에서 +1 시킴
  console.log(items);
  await Inventories.update({
    data: {
      items,
    },
    where: { CharacterId: characterId },
  });

  return res
    .status(200)
    .json({ completeMessage: "아이템 탈착이 완료되었습니다." });
});

exports.router = router;
