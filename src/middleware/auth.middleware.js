const jwt = require("jsonwebtoken");
const { userPrisma } = require("../utils/prisma/index.js");

module.exports = async function (req, res, next) {
  try {
    // const { authorization } = req.headers;
    const { authorization } = req.cookies; // 일단 쿠키로 전달받고 제출전에 headers로 변경
    const [tokenType, token] = authorization.split(" ");

    if (tokenType !== "Bearer")
      throw new Error("토큰 타입이 일치하지 않습니다.");

    const decodedToken = jwt.verify(
      token,
      "It's the Secret Key of Kim-Dong-Heon's item_simulator_updated version!!"
    );
    const userId = +decodedToken.userId;

    if (!userId) {
      throw new Error("로그인 정보가 필요합니다.");
    }

    const user = await userPrisma.users.findFirst({
      where: { userId },
    });

    if (!user) throw new Error("토큰 사용자가 존재하지 않습니다.");

    req.user = user;

    next();
  } catch (error) {
    res.clearCookie("authorization");
    switch (error.name) {
      case "TokenExpiredError": // 토큰이 만료되었을 때 발생하는 에러
        return res.status(401).json({ errorMessage: "토큰이 만료되었습니다." });
      case "JsonWebTokenError": // 토큰 검증이 실패했을 때, 발생하는 에러
        return res
          .status(401)
          .json({ errorMessage: "토큰 인증에 실패하였습니다." });
      default:
        return res.status(401).json({
          errorMessage: error.errorMessage ?? "비 정상적인 요청입니다.",
        });
    }
  }
};

// const authMiddleware = require("./middleware/auth.middleware");
