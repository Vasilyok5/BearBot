const config = {
    name: "setmoney",
    aliases: ["setbalance", "setbal"],
    permissions: [2],
    description: "Set money of a user",
    usage: "<reply/tag/me> <amount>",
    credits: "Vasilyok"
}

const langData = {
    "vi_VN": {
        "setmoney.noTarget": "*️⃣ Trả lời tin nhắn của người khác hoặc tag một người, hoặc dùng 'me' để set tiền của bản thân",
        "setmoney.invalidAmount": "❎ Số tiền không hợp lệ",
        "setmoney.userNoData": "❎ Người dùng không tồn tại/chưa sẵn sàng",
        "setmoney.onlyOneMention": "❗ Bạn chỉ có thể tag một người",
        "setmoney.success": "✅ Thành công",
        "setmoney.failed": "❎ Thất bại"
    }
}

async function onCall({ message, args, getLang }) {
    const { type, mentions } = message;
    if (type !== "message_reply" && Object.keys(mentions).length === 0 && args[0] !== "me") return message.reply(getLang("setmoney.noTarget"));

    const { Users } = global.controllers;
    let result;
    if (type == "message_reply") {
        const { senderID: TSenderID } = message.messageReply;

        let amount = args[0];
        if (Number(amount) === NaN) return message.reply(getLang("setmoney.invalidAmount"));
        amount = amount < 0 ? 0 : amount;

        const userBalance = await Users.getMoney(TSenderID);
        if (userBalance == null) return message.reply(getLang("setmoney.userNoData"));

        result = await Users.updateData(TSenderID, { money: amount });
    } else if (args[0] === "me") {
        let amount = args[1];
        if (Number(amount) === NaN) return message.reply(getLang("setmoney.invalidAmount"));
        amount = amount < 0 ? 0 : amount;

        const userBalance = await Users.getMoney(message.senderID);
        if (userBalance == null) return message.reply(getLang("setmoney.userNoData"));

        result = await Users.updateData(message.senderID, { money: amount });
    } else {
        if (Object.keys(mentions).length > 1) return message.reply(getLang("setmoney.onlyOneMention"));
        const TSenderID = Object.keys(mentions)[0];
        const TName = mentions[TSenderID];
        const TNameLength = TName.split(" ").length;

        let amount = args[TNameLength];
        if (Number(amount) === NaN) return message.reply(getLang("setmoney.invalidAmount"));

        const userBalance = await Users.getMoney(TSenderID);
        if (userBalance == null) return message.reply(getLang("setmoney.userNoData"));

        result = await Users.updateData(TSenderID, { money: amount });
    }

    if (result) {
        message.reply(getLang("setmoney.success"));
    } else {
        message.reply(getLang("setmoney.failed"));
    }
}

export default {
    config,
    langData,
    onCall
}