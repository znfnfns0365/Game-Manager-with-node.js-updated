import mongoose from "mongoose";
import dotenv from "dotenv";

const connect = () => {
  dotenv.config();
  const id = process.env.ID;
  const pw = process.env.PW;
  mongoose
    .connect(
      `mongodb+srv://${id}:${pw}@express-mongo.8eld6sd.mongodb.net/?retryWrites=true&w=majority&appName=express-mongo`,
      {
        dbName: "game-manager",
      }
    )
    .then(() => console.log("MongoDB 연결에 성공하였습니다."))
    .catch((err) => console.log(`MongoDB 연결에 실패하였습니다. ${err}`));
};

mongoose.connection.on("error", (err) => {
  console.error("MongoDB 연결 에러", err);
});

export default connect;
