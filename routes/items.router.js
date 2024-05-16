import express from "express";
import Items from "../schemas/items.schema.js";

const router = express.Router();

/* 아이템 생성 api */
router.post("/item", async (req, res, next) => {
  const { item_name, item_code, item_stat } = req.body;

  const sameName = await Items.findOne({ item_name }).exec(); // item_name과 동일한 이름의 item이 있는지 찾음
  if (sameName) {
    // 있다면 에러 메시지 전송
    return res.status(400).json({ errorMessage: "동일한 이름이 존재합니다" });
  }

  const newItem = new Items({
    item_code,
    item_name,
    item_stat,
  });

  await newItem.save();

  return res.status(201).json({ newItem });
});

/* 아이템 목록 조회 api */
router.get("/item/", async (req, res, next) => {
  const itemsList = await Items.find().sort("item_code").exec(); // item_code로 내림차순 정렬

  const arr = [];
  itemsList.forEach((item) => {
    // 배열에 code, name만 담기
    const { item_code, item_name } = item;
    arr.push({ item_code, item_name });
  });
  return res.status(200).json(arr);
});

/* 아이템 상세 조회 api */
router.get("/item/:itemCode", async (req, res, next) => {
  const itemCode = req.params.itemCode; // parameter 가져오기
  const item = await Items.findOne({
    // item_code가 같은 객체 찾기
    item_code: itemCode,
  }).exec();

  if (!item) {
    // 없으면 에러 메시지
    return res.status(404).json({ errorMessage: "조회할 아이템이 없습니다." });
  }

  const { item_code, item_name, item_stat } = item; // 출력할 정보들 구조 분해 할당
  return res.status(200).json({ item_code, item_name, item_stat });
});

/* 아이템 수정 api */
router.patch("/item/:itemCode", async (req, res, next) => {
  const { item_name, item_stat } = req.body; // 수정할 정보 갸져오기

  const itemCode = req.params.itemCode; // parameter(바꿀 아이템 code) 가져오기
  const item = await Items.findOne({
    // item_code가 같은 객체 찾기
    item_code: itemCode,
  }).exec();

  if (!item) {
    // 없으면 에러 메시지
    return res.status(404).json({ errorMessage: "수정할 아이템이 없습니다." });
  }

  item.item_name = item_name;
  item.item_stat = item_stat;
  await item.save();

  return res.status(200).json({ completeMessage: "수정이 완료되었습니다." });
});

export default router;
