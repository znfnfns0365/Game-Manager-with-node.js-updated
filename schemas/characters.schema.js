import mongoose from "mongoose";

const characterSchema = new mongoose.Schema({
  character_id: {
    type: Number,
    required: true,
  },
  name: {
    type: String,
    required: true,
  },
  health: {
    type: Number,
    required: true,
  },
  power: {
    type: Number,
    required: true,
  },
});

export default mongoose.model("Characters", characterSchema);
