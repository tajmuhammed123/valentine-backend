import mongoose from "mongoose";

const VoteSchema = new mongoose.Schema(
  {
    valentineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
      index: true,
    },

    voterIp: {
      type: String,
      trim: true,
      default: null,
    },

    deviceId: {
      type: String,
      trim: true,
      required: true,
      unique: true,
      immutable: true,
      index: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Vote", VoteSchema);