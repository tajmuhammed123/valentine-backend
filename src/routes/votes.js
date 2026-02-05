import express from "express";
import mongoose from "mongoose";
import Employee from "../models/Employee.js";
import Vote from "../models/Vote.js";

const router = express.Router();

const fun = {
  needValentine: [
    "Oru try... Eni athava biriyani Kittiyalooo",
    "Kittiyal Ooty illenki Chattii",
    "Ingane okke nadanna mathiyooo",
  ],

  invalidId: [
    "That valentine ID looks fake and Cupid is unimpressed 🕵️",
    "Invalid ID because Cupid now has trust issues 🫥",
    "Nice try, that ID is not in the love database 📇",
  ],

  notFound: [
    "That valentine vanished into the mist, try again 🌫️",
    "Employee not found and Cupid checked twice 🔍",
    "Nope, that person is off the love grid 📡",
  ],

  duplicateIp: [
    "Ninakk kalaparamayittulla kazhiv undoo, ninne nalalu ariyumoo... 👀",
    "Dont try play fool with me Nikesh....",
    "Velachil edukkaruth kettooo...",
    "Oh god, You againnnn, veendum ningalooo!!!!",
    "Koutham lesham kooduthala, maappakkanam!!",
    "Ninne kandappo thanne enikk manassilayii, nee verum koothara alla looka koothara aanenn",
  ],
  missingDevice: [
    "Device ID illa, Cupid silent modeil poyi 📱",
    "Device ID vendaathath kond vote illa, sorry 😎",
    "ID kaanilla, Cupid thirichu poyi 🧾",
  ],
  duplicateDevice: [
    "Nice try 😎 Cupid is watching!",
    "Same device veendum? Cupid note eduthu 📝",
    "Ith device already vote cheythu, pooyi 👀",
  ],

  success: [
    "Ijj sundari allenn aaraa paranje... ❤️",
    "Ninnekkondonnum koottiya koodilla, nalla prayandalloo, valla panikkum podoo",
    "Enikkum ishtamaan, kalyanam kazhikkan thayyarumaan, appo enthaann vechaa..! 💍",
    "Parasparam onn cheranulla oravasaravum nammal pazhakkaruth",
    "Nokki irunnoo, ippo kittum...!",
    "Kuttyy onn manass vechaa, ee kalavara namukkoru maniyarayakkam 💘",
    "Ente nenjaake neeyalle....",
    "Porunnoo ente koode",
  ],

  adminMissing: [
    "Pha paranari nee aaroodaan evide ninnaan kalikkunnathenn orma venom? 🤨",
    "Ezheech podooo",
    "Thurakkilla makaneeee",
  ],

  adminUnauthorized: [
    "Pha paranari nee aaroodaan evide ninnaan kalikkunnathenn orma venom? 🤨",
    "Ezheech podooo",
    "Thurakkilla makaneeee",
  ],
};

const pick = (list) => list[Math.floor(Math.random() * list.length)];

function getClientIp(req) {
  const forwarded = req.headers["x-forwarded-for"];
  if (typeof forwarded === "string" && forwarded.length > 0) {
    return forwarded.split(",")[0].trim();
  }
  return req.ip || "unknown";
}

router.post("/", async (req, res, next) => {
  try {
    const { valentineId } = req.body || {};

    if (!valentineId) {
      return res.status(400).json({ error: pick(fun.needValentine) });
    }

    if (!mongoose.Types.ObjectId.isValid(valentineId)) {
      return res.status(400).json({ error: pick(fun.invalidId) });
    }

    const valentine = await Employee.findOne({ _id: valentineId, active: true });
    if (!valentine) {
      return res.status(404).json({ error: pick(fun.notFound) });
    }

    const deviceId = req.headers["x-device-id"];
    if (!deviceId) {
      return res.status(400).json({ error: pick(fun.missingDevice) });
    }

    const existing = await Vote.findOne({ deviceId });
    if (existing) {
      return res.status(403).json({ error: pick(fun.duplicateDevice) });
    }

    const clientIp = getClientIp(req);

    const vote = await Vote.create({
      valentineId,
      voterIp: clientIp,
      deviceId
    });

    res.status(201).json({
      ok: true,
      id: vote._id,
      message: pick(fun.success)
    });
  } catch (err) {
    if (err?.code === 11000) {
      return res.status(403).json({ error: pick(fun.duplicateDevice) });
    }
    next(err);
  }
});

router.get("/results", async (req, res, next) => {
  try {
    const adminPassword = process.env.ADMIN_PASSWORD || "";
    if (!adminPassword) {
      return res.status(500).json({ error: pick(fun.adminMissing) });
    }
    const provided = req.headers["x-admin-password"];
    if (!provided || provided !== adminPassword) {
      return res.status(401).json({ error: pick(fun.adminUnauthorized) });
    }

    const [totalVotes, results] = await Promise.all([
      Vote.countDocuments(),
      Vote.aggregate([
        { $group: { _id: "$valentineId", count: { $sum: 1 } } },
        {
          $lookup: {
            from: "employees",
            localField: "_id",
            foreignField: "_id",
            as: "employee"
          }
        },
        { $unwind: "$employee" },
        {
          $project: {
            _id: 0,
            valentineId: "$_id",
            name: "$employee.name",
            department: "$employee.department",
            count: 1
          }
        },
        { $sort: { count: -1, name: 1 } }
      ])
    ]);

    res.json({ totalVotes, results });
  } catch (err) {
    next(err);
  }
});

export default router;
