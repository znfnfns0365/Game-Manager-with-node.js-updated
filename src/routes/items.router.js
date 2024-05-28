const express = require("express");
const { itemPrisma, userPrisma } = require("../utils/prisma/index.js");

const router = express.Router();
const Items = itemPrisma.items;
const MountedItems = userPrisma.mountedItems;
/* 아이템 생성 api */
router.post("/item", async (req, res, next) => {
  const { item_name, item_code, item_stat, item_price, item_type } = req.body;

  const sameName = await Items.findFirst({
    where: {
      name: item_name,
    },
  }); // item_name과 동일한 이름의 item이 있는지 찾음
  if (sameName) {
    // 있다면 에러 메시지 전송
    return res
      .status(400)
      .json({ errorMessage: "동일한 이름의 아이템이 존재합니다" });
  }

  const sameCode = await Items.findFirst({
    where: {
      itemCode: item_code,
    },
  }); // item_name과 동일한 이름의 item이 있는지 찾음
  if (sameCode) {
    // 있다면 에러 메시지 전송
    return res
      .status(400)
      .json({ errorMessage: "동일한 item_code의 아이템이 존재합니다" });
  }

  // itemType이 유효한 지 검사
  console.log(item_type);
  if (
    !["hat", "armor", "pants", "shoes", "accessories", "weapon"].includes(
      item_type.toLowerCase()
    )
  ) {
    return res
      .status(400)
      .json({ errorMessage: "아이템 타입이 유효하지 않습니다" });
  }

  const newItem = await Items.create({
    data: {
      itemCode: item_code,
      name: item_name,
      itemStat: item_stat,
      cost: item_price,
      itemType: item_type.toLowerCase(),
    },
  });

  return res.status(201).json({ newItem });
});

/* 아이템 목록 조회 api */
router.get("/item/", async (req, res, next) => {
  let itemList = await Items.findMany({
    select: {
      itemCode: true,
      name: true,
      cost: true,
    },
    orderBy: {
      itemId: "asc", // itemId로 정렬
    },
  });

  itemList = itemList.map((item) => ({
    // 출력 형식 변경
    item_code: item.itemCode,
    item_name: item.name,
    item_price: item.cost,
  }));

  return res.status(200).json(itemList);
});

/* 아이템 상세 조회 api */
router.get("/item/:itemCode", async (req, res, next) => {
  const getCode = +req.params.itemCode; // parameter 가져오기
  const item = await Items.findFirst({
    // itemCode가 같은 객체 찾기
    where: { itemCode: getCode },
  });

  if (!item) {
    // 없으면 에러 메시지
    return res.status(404).json({ errorMessage: "조회할 아이템이 없습니다." });
  }

  const { itemCode, name, itemStat, cost, itemType } = item; // 출력할 정보들 구조 분해 할당
  return res.status(200).json({
    item_code: itemCode,
    item_name: name,
    item_stat: itemStat,
    item_price: cost,
    item_type: itemType,
  });
});

/* 아이템 수정 api */
router.patch("/item/:itemCode", async (req, res, next) => {
  const { item_name, item_stat } = req.body; // 수정할 정보 갸져오기
  const itemCode = +req.params.itemCode; // parameter(바꿀 아이템 code) 가져오기
  const item = await Items.findFirst({
    // itemCode가 같은 객체 찾기
    where: { itemCode: itemCode },
  });

  if (!item) {
    // 없으면 에러 메시지
    return res.status(404).json({ errorMessage: "수정할 아이템이 없습니다." });
  }

  // 장착하고 있는 캐릭터가 있다면 에러 메시지 출력
  let mounting = false;
  const mount = await MountedItems.findMany();
  mount.forEach((obj) => {
    const mounted = obj.items.find(function (arr) {
      // 장착되어있는 item_code 아이템 불러오기
      return arr.itemCode == itemCode;
    });
    if (mounted) {
      mounting = true;
      return false;
    }
  });
  if (mounting) {
    return res
      .status(400)
      .json({ errorMessage: "아이템이 장착되어 있어 수정할 수 없습니다." });
  }

  await Items.update({
    data: {
      name: item_name,
      itemStat: item_stat,
    },
    where: {
      itemId: item.itemId,
      itemCode,
    },
  });

  return res.status(200).json({ completeMessage: "수정이 완료되었습니다." });
});

exports.router = router;
