const config = {
    name: "delmsg",
    aliases: ["deletemsg", "delmessage", "deletemessage"],
    description: "delete group message",
    usage: "[all]",
    cooldown: 3,
    permissions: [2],
    credits: "Vasilyok",
    isAbsolute: true
}

const langData = {
    "vi_VN": {
        "confirmDeleteThis": "*️⃣ React 👍 để xác nhận xóa toàn bộ tin nhắn trong nhóm này.",
        "noThread": "❎ Không có nhóm nào để xóa tin nhắn.",
        "confirmDeleteAll": "*️⃣ React 👍 để xác nhận xóa toàn bộ tin nhắn của toàn bộ các nhóm (không bao gồm nhóm hiện tại).",
        "chooseThread": "=== INBOX ===\n\n{INBOX}\n\n=== PENDING ===\n\n{PENDING}\n\n=== SPAM ===\n\n{SPAM}\n\n🔢 Nhập số thứ tự của nhóm để xóa tin nhắn (cách nhau bởi dấu cách).\n*️⃣ Hoặc nhập all để xóa tin nhắn của tất cả các nhóm (không bao gồm nhóm hiện tại).",
        "invalidIndexes": "❎ Số thứ tự không hợp lệ.",
        "confirmDelete": "*️⃣ React 👍 để xác nhận xóa toàn bộ tin nhắn của nhóm có ID sau:\n{choosenThreadID}",
        "successDelete": "✅ Đã xóa thành công!",
        "error": "❎ Đã có lỗi xảy ra, vui lòng thử lại sau."
    }
}

async function confirm({ message, getLang, eventData }) {
    const { targetIDs } = eventData;
    let targetSendID = targetIDs.some(item => item == message.threadID) ? message.userID : message.threadID;
    try {

        global.api.deleteThread(targetIDs, err => {
            if (err) {
                console.error(err);
                return message.send(getLang("error"), targetSendID);
            } else {
                return message.send(getLang("successDelete"), targetSendID);
            }
        });

    } catch (e) {
        console.error(e);
        return message.send(getLang("error"), targetSendID);
    }
}

async function choose({ message, getLang, eventData }) {
    try {
        const { targetIDs } = eventData;

        const choosenThreadID = [];
        const indexes = message.body.split(" ")[0] == "all" ? targetIDs.map((_, index) => index) :
            message.body.split(" ")
                .filter(item => item && !isNaN(item) && item > 0)
                .map(item => parseInt(item - 1));

        for (let index of indexes) {
            if (index < targetIDs.length) choosenThreadID.push(targetIDs[index]);
        }

        if (choosenThreadID.length == 0) return message.reply(getLang("invalidIndexes"));

        return message
            .reply(getLang("confirmDelete", { choosenThreadID: choosenThreadID.join("\n") }))
            .then(_ => _.addReactEvent({ callback: confirm, targetIDs: choosenThreadID }))
            .catch(e => {
                if (e.message) {
                    console.error(e.message);
                    return message.reply(getLang("error"));
                }
            });
    } catch (e) {
        console.error(e);
        return message.reply(getLang("error"));
    }
}

async function onCall({ message, args, getLang }) {
    try {
        const { threadID } = message;

        if (args[0] == "this") {
            return message
                .reply(getLang("confirmDeleteThis"))
                .then(_ => _.addReactEvent({ callback: confirm, targetIDs: [message.threadID] }))
                .catch(e => {
                    if (e.message) {
                        console.error(e.message);
                        return message.reply(getLang("error"));
                    }
                });
        }

        let INBOX = (await global.api.getThreadList(100, null, ["INBOX"])) || [];
        let SPAM = (await global.api.getThreadList(100, null, ["OTHER"])) || [];
        let PENDING = (await global.api.getThreadList(100, null, ["PENDING"])) || [];

        INBOX = INBOX.filter(thread => thread.isGroup && thread.threadID != threadID);
        SPAM = SPAM.filter(thread => thread.isGroup && thread.threadID != threadID);
        PENDING = PENDING.filter(thread => thread.isGroup && thread.threadID != threadID);

        const ALL = [...INBOX, ...SPAM, ...PENDING];

        if (ALL.length == 0) return message.reply(getLang("noThread"));

        if (args[0] == "all") {
            return message
                .reply(getLang("confirmDeleteAll"))
                .then(_ => _.addReactEvent({ callback: confirm, targetIDs: ALL.map(thread => thread.threadID) }))
                .catch(e => {
                    if (e.message) {
                        console.error(e.message);
                        return message.reply(getLang("error"));
                    }
                });
        }

        return message
            .reply(getLang("chooseThread", {
                INBOX: INBOX.map((thread, index) => `${index + 1}. ${thread.name} (${thread.threadID})`).join("\n"),
                SPAM: SPAM.map((thread, index) => `${index + INBOX.length + 1}. ${thread.name} (${thread.threadID})`).join("\n"),
                PENDING: PENDING.map((thread, index) => `${index + INBOX.length + SPAM.length + 1}. ${thread.name} (${thread.threadID})`).join("\n")
            }))
            .then(_ => _.addReplyEvent({ callback: choose, targetIDs: ALL.map(thread => thread.threadID) }))
            .catch(e => {
                if (e.message) {
                    console.error(e.message);
                    return message.reply(getLang("error"));
                }
            });
    } catch (e) {
        console.error(e);
        return message.reply(getLang("error"));
    }
}

export default {
    config,
    langData,
    onCall
}
