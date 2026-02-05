import mongoose from "mongoose";

const VoteSchema = new mongoose.Schema(
  {
    valentineId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    // voterIp: {
    //   type: String,
    //   required: true,
    //   trim: true,
    // },

    deviceId: {
      type: String,
      trim: true,
      default: null,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Vote", VoteSchema);