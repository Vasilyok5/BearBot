const config = {
    name: "anime",
    description: "ảnh anime",
    usage: "[category]",
    cooldown: 3,
    permissions: [0, 1, 2],
    credits: "Vasilyok"
}

const langData = {
    "vi_VN": {
        "invalidCategory": "❎ Không hợp lệ, các danh mục hiện có:\n{categories}",
        "error": "❎ Đã có lỗi xảy ra..."
    }
}

const endpoints = ["waifu", "neko", "shinobu", "megumin", "bully", "cuddle", "cry", "hug", "awoo", "kiss", "lick", "pat", "smug", "bonk", "yeet", "blush", "smile", "wave", "highfive", "handhold", "nom", "bite", "glomp", "slap", "kill", "kick", "happy", "wink", "poke", "dance", "cringe"]

async function onCall({ message, args, getLang }) {
    try {
        const input = args[0]?.toLowerCase();
        if (!endpoints.includes(input)) return message.reply(getLang("invalidCategory", { categories: endpoints.join(", ") }));

        const response = await global.GET(`https://api.waifu.pics/sfw/${input}`);
        const data = response.data;

        if (!data.url) return message.reply(getLang("error"));

        const imageStream = await global.getStream(data.url);
        await message.reply({
            attachment: [imageStream]
        });
    } catch (e) {
        console.error(e);
        message.reply(getLang("error"));
    }
}

export default {
    config,
    langData,
    onCall
}
