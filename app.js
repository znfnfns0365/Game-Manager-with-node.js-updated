import express from "express";
import connect from "./schemas/index.js";
import charactersRouter from "./routes/characters.router.js";
import itemsRouter from "./routes/items.router.js";

const app = express();
const PORT = 3000;

connect();

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const router = express.Router();

router.get("/", (req, res) => {
  return res.json({ message: "Hello, welcome to Item simulator!" });
});

app.use("/api", [router, charactersRouter, itemsRouter]); // use는 미들웨러를 사용해주게 함 /api 경로로 접근하는 경우에만 json 미들웨어를 거친 뒤 router로 연결되게 함

app.listen(PORT, () => {
  console.log(PORT, "포트로 서버가 열렸어요");
});
