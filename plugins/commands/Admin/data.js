const config = {
    name: "data",
    permissions: [2],
    credits: "Vasilyok",
    isAbsolute: true
}

const langData = {
    "vi_VN": {
        "updateSuccess": "✅ Đã cập nhật dữ liệu thành công.",
        "resetSuccess": "✅ Đã làm mới dữ liệu thành công.",
        "chooseReset": "💾 Chọn dữ liệu bạn muốn làm mới:\n1. Threads\n2. Users\n3. All",
        "threads": "⚠️ Dữ liệu tất cả các nhóm sẽ bị làm mới.",
        "users": "⚠️ Dữ liệu tất cả các thành viên sẽ bị làm mới.",
        "all": "⚠️ Tất cả dữ liệu sẽ bị làm mới.",
        "confirmReset": "\n*️⃣ React 👍 để xác nhận.",
        "invalidChoice": "❎ Lựa chọn không hợp lệ.",
        "invalidQuery": "❎ Truy vấn không hợp lệ, các truy vấn có sẵn: update, reset.",
        "error": "❎ Đã xảy ra lỗi."
    }
}

async function resetConfirm({ message, eventData, getLang }) {
    const { reaction } = message;
    const { type, chosen } = eventData;

    if (reaction != "👍") return;
    global.api.unsendMessage(message.messageID);
    if (chosen == "all") {
        global.data.users = new Map();
        global.data.threads = new Map();

        if (type == "MONGO") {
            await global.data.models.Users.deleteMany({});
            await global.data.models.Threads.deleteMany({});
        }
    } else {
        global.data[chosen] = new Map();
        if (type == "MONGO") await global.data.models[chosen.charAt(0).toUpperCase() + chosen.slice(1)].deleteMany({});
    }

    try {
        if (type == "JSON") global.updateJSON();

        message.send(getLang("resetSuccess"));
    } catch {
        message.send(getLang("error"));
    }
}

function chooseReset({ message, getLang }) {
    const { body, reply } = message;
    const choice = parseInt(body?.toLowerCase());

    if (isNaN(choice)) return reply(getLang("invalidChoice"));
    if (choice < 1 || choice > 3) return reply(getLang("invalidChoice"));

    const chosen = choice == 1 ? "threads" : choice == 2 ? "users" : "all";
    const type = global.config.DATABASE;

    reply(getLang(chosen) + getLang("confirmReset"))
        .then(_ => _.addReactEvent({ callback: resetConfirm, type, chosen }))
        .catch(e => {
            console.log(e);
            reply(getLang("error"));
        });
}

async function onCall({ message, args, getLang }) {
    const query = args[0]?.toLowerCase();

    switch (query) {
        case 'update':
            {
                if (global.config.DATABASE == "JSON") global.updateJSON();
                else if (global.config.DATABASE == "MONGO") await global.updateMONGO();

                message.reply(getLang("updateSuccess"));
                break;
            }
        case 'reset':
            {
                message
                    .reply(getLang("chooseReset"))
                    .then(_ => _.addReplyEvent({ callback: chooseReset }))
                    .catch(e => {
                        console.log(e);
                        message.reply(getLang("error"));
                    });

                break;
            }
        default:
            {
                message.reply(getLang("invalidQuery"));
                break;
            }
    }

    return;
}


export default {
    config,
    langData,
    onCall
}
