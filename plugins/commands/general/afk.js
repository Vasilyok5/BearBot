const config = {
    credits: "Vasilyok"
}

const langData = {
    "vi_VN": {
        "afkOn": "✅ Bạn đã bật chế độ AFK.",
        "afkOff": "✅ Bạn đã tắt chế độ AFK.",
        "userNoData": "❎ Dữ liệu của bạn không khả dụng.",
        "error": "❎ Đã xảy ra lỗi."
    }
}

async function onCall({ message, args, getLang }) {
    const { senderID, reply } = message;

    try {
        const userData = await global.controllers.Users.getData(senderID);

        if (userData == null) return reply(getLang("userNoData"));

        const afk = userData.afk || { status: false, reason: null };

        if (afk.status) {
            afk.status = false;
            afk.reason = null;
        } else {
            afk.status = true;
            afk.reason = args.join(" ") || null;
        }

        await global.controllers.Users.updateData(senderID, { afk });

        reply(getLang(afk.status ? "afkOn" : "afkOff"));
    } catch (e) {
        console.error(e);
        reply(getLang("error"));
    }
}

export default {
    config,
    langData,
    onCall
}
