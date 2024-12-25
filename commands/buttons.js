const ytdl = require("ytdl-core");
const fs = require("fs");
const path = require("path");

async function handleButton(client, message) {
    const buttonId = message.message.buttonsResponseMessage.selectedButtonId;
    const [type, url] = buttonId.split("-");

    const outputPath = path.join(__dirname, "../download_youtube");
    if (!fs.existsSync(outputPath)) fs.mkdirSync(outputPath);

    const fileName = `${Date.now()}.${type === "audio" ? "mp3" : "mp4"}`;
    const filePath = path.join(outputPath, fileName);

    const stream = ytdl(url, { filter: type === "audio" ? "audioonly" : "video" });
    const writeStream = fs.createWriteStream(filePath);
    stream.pipe(writeStream);

    writeStream.on("finish", async () => {
        await client.sendMessage(message.key.remoteJid, {
            text: `✅ Aqui está o seu ${type}!`,
            [type === "audio" ? "audio" : "video"]: { url: filePath }
        });
    });
}

module.exports = { handleButton };