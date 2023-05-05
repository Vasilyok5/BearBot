const config = {
    name: "trans",
    aliases: ['translate', 'dich'],
    description: "Dịch ngôn ngữ.",
    usage: '[lang] [text]',
    credits: 'Vasilyok'
}

const langData = {
    'vi_VN': {
        "trans.error.noText": "❗ Vui lòng nhập văn bản cần dịch.",
        "trans.error.unknown": "❎ Đã xảy ra lỗi",
        "trans.success": "{from} => {to}:\n{translation}"
    }
}

const supportedLangs = ["sq", "af", "ar", "bn", "bs", "my", "ca", "hr", "cs", "da", "nl", "en", "et", "fil", "fi", "fr", "de", "el", "gu", "hi", "hu", "is", "id", "it", "ja", "kn", "km", "ko", "la", "lv", "ml", "mr", "ne", "nb", "pl", "pt", "ro", "ru", "sr", "si", "sk", "es", "sw", "sv", "ta", "te", "th", "tr", "uk", "ur", "vi"];

function onCall({ message, args, getLang, data }) {
    const { reply, type } = message;

    const langInput = args[0]?.toLowerCase();
    const threadLang = (data?.thread?.data?.language || global.config.LANGUAGE)?.slice(0, 2);
    const targetLang = langInput || threadLang;
    const lang_to = supportedLangs.includes(targetLang) ? targetLang : "en";
    const text = type == "message_reply" ? message.messageReply.body : supportedLangs.includes(langInput) ? args.slice(1).join(" ") : args.join(" ");

    if (!text) return reply(getLang('trans.error.noText'));

    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang_to}&dt=t&q=${encodeURIComponent(text)}`;
    GET(url)
        .then(res => {
            const translation = res.data[0].map(item => item[0]).join("");
            const lang_from = res.data[2];
            reply(getLang('trans.success', { from: lang_from, to: lang_to, translation }));
        })
        .catch(err => {
            console.error(err);
            reply(getLang('trans.error.unknown'));
        });

    return;
}

export default {
    config,
    langData,
    onCall
}
