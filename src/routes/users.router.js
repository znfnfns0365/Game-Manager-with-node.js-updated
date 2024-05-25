const express = require("express");
const jwt = require("jsonwebtoken");
const { userPrisma } = require("../utils/prisma/index.js");
const bcrypt = require("bcrypt");

const router = express.Router();

/** 사용자 회원가입 API **/
router.post("/sign-up", async (req, res, next) => {
  try {
    const { email, password, name } = req.body;
    const isExistUser = await userPrisma.users.findFirst({
      where: { email },
    });
    if (isExistUser) {
      console.log(isExistUser.email);
      return res
        .status(409)
        .json({ errorMessage: "이미 존재하는 이메일입니다." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await userPrisma.Users.create({
      data: {
        email,
        password: hashedPassword,
        name,
      },
    });

    return res
      .status(201)
      .json({ message: "회원가입이 완료되었습니다.", user });
  } catch (err) {
    next(err);
  }
});

/* 로그인 API */
router.post("/sign-in", async (req, res, next) => {
  const { email, password } = req.body;

  const user = await userPrisma.users.findFirst({ where: { email } });
  if (!user) {
    return res
      .status(401)
      .json({ errorMessage: "존재하지 않는 이메일입니다." });
  }

  if (!(await bcrypt.compare(password, user.password))) {
    return res
      .status(401)
      .json({ errorMessage: "비밀번호가 일치하지 않습니다." });
  }

  const token = jwt.sign(
    {
      userId: user.userId,
    },
    "It's the Secret Key of Kim-Dong-Heon's item_simulator_updated version!!",
    { expiresIn: "1h" }
  );

  res.cookie("authorization", `Bearer ${token}`); // 일단 쿠키로 전달하고 제출 전에 주석처리
  return res.status(200).json({ message: "로그인 성공했습니다.", token });
});

/* 회원 탈퇴 API */

exports.router = router;
