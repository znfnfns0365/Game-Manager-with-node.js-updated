const express = require("express");
const { itemPrisma, userPrisma } = require("../utils/prisma/index.js");
const authMiddleware = require("../middleware/auth.middleware");

const router = express.Router();
const Items = itemPrisma.items;
const Characters = userPrisma.characters;
const Inventories = userPrisma.inventories;

/* 아이템 구매 API */
router.patch("/store/buy/:characterId", authMiddleware, async (req, res) => {
  const characterId = +req.params.characterId;
  const character = await Characters.findFirst({
    // characterId와 userId가 일치하는 character 가져오기
    where: {
      characterId,
      UserId: req.user.userId,
    },
  });
  if (!character) {
    return res.status(404).json({ errorMessage: "캐릭터를 찾을 수 없습니다." });
  }

  const body = req.body;
  let totalCost = character.money,
    updatedItems = {},
    itemsPurchased = 0;

  for (let index in body) {
    // 여러 아이템을 살 수 있으므로 배열로 들어온 body값을 for..in 문으로 탐색
    const { item_code, count } = body[index];
    if (count === 0) continue;
    const item = await Items.findFirst({
      // itemCode가 같은 item 찾기
      where: {
        itemCode: item_code,
      },
    });
    if (!item) {
      return res.status(404).json({
        errorMessage: `item_code가 ${item_code}인 아이템을 찾을 수 없습니다.`,
      });
    }

    totalCost -= item.cost * count;
    updatedItems[item_code] = count;
    itemsPurchased += count;
  }
  if (!itemsPurchased) {
    // 아이템 구매 개수가 0개일 때
    return res
      .status(400)
      .json({ errorMessage: "아이템을 1개 이상 구매해주세요." });
  }

  if (totalCost < 0) {
    // 아이템 비용이 잔액보다 적을 때
    return res.status(400).json({ errorMessage: "잔액이 부족합니다." });
  }

  await Characters.update({
    // characters db에 업데이트
    data: {
      money: totalCost,
    },
    where: {
      characterId,
      UserId: req.user.userId,
    },
  });

  // inventories에 추가
  const inventory = await Inventories.findFirst({
    where: {
      CharacterId: characterId,
    },
  });

  if (inventory) {
    // 기존 인벤토리에 새 아이템 추가
    for (let key in updatedItems) {
      if (inventory.items[key] !== undefined) {
        // inventory에 key(itemCode)값이 있다면 value(개수)에 count를 더함
        inventory.items[key] += updatedItems[key];
      } else {
        inventory.items[key] = updatedItems[key];
      }
    }
    await Inventories.update({
      where: {
        CharacterId: characterId,
      },
      data: {
        items: inventory.items,
      },
    });
  } else {
    // 인벤토리가 존재하지 않으면 새로 생성
    await Inventories.create({
      data: {
        CharacterId: characterId,
        items: updatedItems,
      },
    });
  }

  return res.status(200).json({
    message: `아이템 ${itemsPurchased}개를 성공적으로 구매하였습니다.`,
    remainingBalance: totalCost,
  }); // 잔액을 함께 출력
});

/* 아이템 판매 API */
router.patch("/store/sell/:characterId", authMiddleware, async (req, res) => {
  const characterId = +req.params.characterId;
  const character = await Characters.findFirst({
    // characterId와 userId가 일치하는 character 가져오기
    where: {
      characterId,
      UserId: req.user.userId,
    },
  });
  if (!character) {
    return res.status(404).json({ errorMessage: "캐릭터를 찾을 수 없습니다." });
  }

  const body = req.body;
  let totalCost = character.money,
    inventory = await Inventories.findFirst({
      where: { CharacterId: characterId },
    }),
    itemsPurchased = 0;

  if (!inventory) {
    return res
      .status(400)
      .json({ errorMessage: "인벤토리에 아이템이 존재하지 않습니다!" });
  }

  for (let index in body) {
    // 여러 아이템을 팔 수 있으므로 배열로 들어온 body값을 for..in 문으로 탐색
    const { item_code, count } = body[index];
    if (count === 0) continue;
    const item = await Items.findFirst({
      // itemCode가 같은 item 찾기
      where: {
        itemCode: item_code,
      },
    });
    if (!item) {
      return res.status(404).json({
        errorMessage: `item_code가 ${item_code}인 아이템을 찾을 수 없습니다.`,
      });
    }

    // 팔 아이템이 부족하거나 없을 때
    totalCost += Math.floor(item.cost * count * 0.6); // 60% 가격 적용 후 소수점 내림
    if (
      inventory.items[item_code] === undefined ||
      inventory.items[item_code] < count
    ) {
      return res.status(400).json({
        errorMessage: `item_code가 ${item_code}인 아이템이 ${count}개 이하입니다.`,
      });
    } else inventory.items[item_code] -= count;
    itemsPurchased += count;
  }

  if (!itemsPurchased) {
    // 아이템 판매 개수가 0개일 때
    return res
      .status(400)
      .json({ errorMessage: "아이템을 1개 이상 판매해주세요." });
  }

  // characters db에 업데이트
  await Characters.update({
    data: {
      money: totalCost,
    },
    where: {
      characterId,
      UserId: req.user.userId,
    },
  });

  // Inventories db에 업데이트
  await Inventories.update({
    where: {
      CharacterId: characterId,
    },
    data: {
      items: inventory.items,
    },
  });

  return res.status(200).json({
    message: `아이템 ${itemsPurchased}개를 성공적으로 판매하였습니다.`,
    remainingBalance: totalCost,
  });
});

/* 인벤토리 조회 API */
router.get("/inventory/:characterId", authMiddleware, async (req, res) => {
  const characterId = +req.params.characterId;
  const character = await Characters.findFirst({
    // characterId와 userId가 일치하는 character 가져오기
    where: {
      characterId,
      UserId: req.user.userId,
    },
  });

  if (!character) {
    return res.status(404).json({ errorMessage: "캐릭터를 찾을 수 없습니다." });
  }

  // characterId와 일치하는 inventory 가져오기
  const inventory = await Inventories.findFirst({
    where: { CharacterId: characterId },
  });
  if (!inventory) {
    return res
      .status(400)
      .json({ errorMessage: "인벤토리에 아이템이 존재하지 않습니다!" });
  }

  // 출력 형식 변경
  let output = [];
  let itemList = inventory.items;
  for (let key in itemList) {
    const item = await Items.findFirst({
      where: {
        itemCode: +key,
      },
    });
    const obj = {
      item_code: key,
      item_name: item.name,
      count: itemList[key],
    };
    output.push(obj);
  }
  return res.status(200).json(output);
});

router.patch("/getMoney/:characterId", authMiddleware, async (req, res) => {
  const characterId = +req.params.characterId;
  const character = await Characters.findFirst({
    // characterId와 userId가 일치하는 character 가져오기
    where: {
      characterId,
      UserId: req.user.userId,
    },
  });
  if (!character) {
    return res.status(404).json({ errorMessage: "캐릭터를 찾을 수 없습니다." });
  }

  // 100원 추가해서 db에 업데이트
  character.money += 100;
  await Characters.update({
    data: {
      money: character.money,
    },
    where: {
      characterId,
      UserId: req.user.userId,
    },
  });

  return res
    .status(200)
    .json({ message: "100원을 획득하였습니다.", "현재 잔액": character.money });
});

exports.router = router;
