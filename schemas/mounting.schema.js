import mongoose from "mongoose";

const mountingSchema = new mongoose.Schema({
  character_id: {
    type: Number,
    required: true,
  },
  mountedItems: {
    type: Array,
    required: true,
  },
});

export default mongoose.model("mountings", mountingSchema);
