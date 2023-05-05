const config = {
    name: "simi",
    version: "1.1.0",
    description: "trò chuyện với simi",
    usage: "[text]",
    cooldown: 3,
    permissions: [0, 1, 2],
    credits: "Vasilyok"
}

import axios from 'axios';

const langData = {
    "vi_VN": {
        "on": "✅ Simi đã được bật",
        "off": "✅ Simi đã được tắt",
        "alreadyOn": "✅ Simi đã được bật",
        "alreadyOff": "✅ Simi đã được tắt",
        "missingInput": "❗ Vui lòng nhập nội dung cần trò chuyện với Simi",
        "noResult": "❌ Simi không hiểu bạn đang nói gì :(",
        "error": "❌ Có lỗi xảy ra, vui lòng thử lại sau"
    }
}

function onLoad() {
    if (!global.hasOwnProperty("simi")) global.simi = {};
}

async function onCall({ message, args, getLang, userPermissions }) {
    const input = args.join(" ");
    if (!input) return message.reply(getLang("missingInput"));

    if (input == "on" || input == "off")
        if (!userPermissions.includes(1)) return;

    if (input == "on") {
        if (global.simi.hasOwnProperty(message.threadID)) return message.reply(getLang("alreadyOn"));
        global.simi[message.threadID] = true;

        return message.reply(getLang("on"));
    } else if (input == "off") {
        if (!global.simi.hasOwnProperty(message.threadID)) return message.reply(getLang("alreadyOff"));
        delete global.simi[message.threadID];

        return message.reply(getLang("off"));
    }
    if (global.simi.hasOwnProperty(message.threadID)) return;

    global
        const url = `https://tuanxuong.com/api/simsimi/index.php?text=${encodeURIComponent(input)}`
        let response
        try{
            response = await fetch(url).then(res => res.json())
        }
        catch(e) {
            return message.reply(getLang("error"))
        }
        message.reply(response.response)
}

export default {
    config,
    onLoad,
    langData,
    onCall
}
