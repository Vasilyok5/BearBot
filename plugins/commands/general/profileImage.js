import { join } from 'path';

const config = {
    name: "avatar",
    aliases: ["avt", "profileImage"],
    description: "Lấy ảnh đại diện của người khác",
    usage: "<reply/tag/none>",
    credits: "Vasilyok"
}

const langData = {
    "vi_VN": {
        "profileImage.noData": "❌ Không có dữ liệu...",
        "profileImage.error": "❌ Đã xảy ra lỗi"
    }
}

async function onCall({ message, getLang }) {
    const { type, mentions } = message;
    const { Users } = global.controllers;
    let targetIDs = [];

    try {
        if (type == "message_reply") {
            targetIDs.push(message.messageReply.senderID);
        } else if (Object.keys(mentions).length >= 1) {
            targetIDs = Object.keys(mentions);
            if (targetIDs.length > 10) return message.reply(getLang("profileImage.noData"));
        } else {
            targetIDs.push(message.senderID);
        }

        let allPaths = [];
        const allData = (await Users.getAll(targetIDs) || []).filter(e => e && e.userID && e.info?.thumbSrc);
        if (allData.length == 0) return message.reply(getLang("profileImage.noData"));

        for (const userData of allData) {
            const { userID, info } = userData;
            const tempPath = join(global.cachePath, `_avt${userID}${Date.now()}.png`);

            await global.downloadFile(tempPath, info.thumbSrc);
            allPaths.push(tempPath);

            if (allPaths.length >= 10) continue;
        }

        if (allPaths.length == 0) return message.reply(getLang("profileImage.noData"));

        await message.reply({
            attachment: allPaths.map(e => global.reader(e))
        });

        for (const path of allPaths) {
            try {
                global.deleteFile(path);
            } catch (e) {
                console.error(e);
            }
        }
    } catch (e) {
        console.error(e);
        message.reply(getLang("profileImage.error"));
    }
}

export default {
    config,
    langData,
    onCall
}
