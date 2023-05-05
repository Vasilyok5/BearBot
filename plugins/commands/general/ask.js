const config = {
    name: "ask",
    aliases: ["askgpt"],
    description: "hỏi chatgpt",
    usage: "[text]",
    cooldown: 3,
    permissions: [0, 1, 2],
    credits: "Vasilyok"
}

import axios from 'axios';
const apiKey = "";

const langData = {
    "vi_VN": {
        "missingInput": "❌ Vui lòng nhập nội dung cần hỏi.",
        "error": "❌ Có lỗi xảy ra, vui lòng thử lại sau ít phút.",
        "invalidToken": "❌ Vui lòng kiểm tra lại token.",
        "isProcessing": "❌ Bot đang xử lý, vui lòng thử lại sau."
    }
}

async function onCall({ message, args, getLang }) {
    const input = args.join(" ");
    if (!input) return message.reply(getLang("missingInput"))

    axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: input }],
        max_tokens: 2048
    }, {
        headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${apiKey}`
        }
    }).then(res => {
        if (!String(res.status).startsWith('2')) {
            if (String(res.status).startsWith('5'))
                return message.reply(getLang("error"))
                
            return message.reply(getLang("invalidToken")) 
        }

        const output = res.data.choices[0].message.content

        return message.reply(output)
    }).catch(error => {
        console.error(error)
    })

    // args: Arguments, if /example 1 2 3, args = ["1", "2", "3"]
    // getLang: Get language from langData
    // extra: Extra property from config.plugins.json
    // data { user, thread }
    // userPermissions: User permissions (0: Member, 1: Admin, 2: Bot Admin)
    // prefix: Prefix used
}

export default {
    config,
    langData,
    onCall
}
