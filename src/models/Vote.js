import mongoose from "mongoose";

const VoteSchema = new mongoose.Schema(
  {
    valentineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    deviceId: {
      type: String,
      trim: true,
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

VoteSchema.index({ deviceId: 1 }, { unique: true });

export default mongoose.model("Vote", VoteSchema);
