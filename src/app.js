const express = require("express");
const { router: charactersRouter } = require("./routes/characters.router.js");
const { router: itemsRouter } = require("./routes/items.router.js");
// const { router: mountingRouter } = require("./routes/mounting.router.js");
const cookieParser = require("cookie-parser");
const { router: UsersRouter } = require("./routes/users.router.js");
const errorHandlingMiddleware = require("./middleware/error-handling.middleware.js");

const app = express();
const PORT = 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

const router = express.Router();

router.get("/", (req, res) => {
  return res.json({ message: "Hello, welcome to Item simulator!" });
});

app.use("/api", [router, UsersRouter, charactersRouter, itemsRouter]); // use는 미들웨러를 사용해주게 함 /api 경로로 접근하는 경우에만 json 미들웨어를 거친 뒤 router로 연결되게 함

app.use(errorHandlingMiddleware);

app.listen(PORT, () => {
  console.log(PORT, "포트로 서버가 열렸어요");
});
