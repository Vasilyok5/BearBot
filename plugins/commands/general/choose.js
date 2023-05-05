const config = {
    name: "choose",
    usage: "option1 | option2 | option3 | ...",
    description: "Chọn 1 trong các lựa chọn",
    cooldown: 5,
    credits: "Vasilyok"
}

const langData = {
    "vi_VN": {
        "choose.atLeast2Options": "❗ Ít nhất 2 tùy chọn là cần thiết"
    }
}

function onCall({ message, args, getLang }) {
    const options = args.join(" ").split("|");
    if (options.length < 2) return message.reply(getLang("choose.atLeast2Options"));

    const index = global.random(0, options.length - 1);
    message.reply(`⇒ ${options[index]?.trim() || "┐(￣ヘ￣)┌"}`);
}

export default {
    config,
    langData,
    onCall
}
