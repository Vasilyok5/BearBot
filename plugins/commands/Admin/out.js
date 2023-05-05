const config = {
    name: "out",
    aliases: ["leave"],
    description: "Leave the group/all groups, please note that the out all will not include the message request/spam group",
    usage: "[groupID/all]",
    cooldown: 5,
    permissions: [2],
    credits: "Vasilyok",
    isAbsolute: true
}

const langData = {
    "vi_VN": {
        "noThreadToOut": "❎ Không có nhóm nào để rời.",
        "invalidThreadIDs": "❎ ID nhóm không hợp lệ.",
        "confirm": "*️⃣ React 👍 để xác nhận.",
        "moderator": "Quản trị Bot",
        "out": "⚠️ THÔNG BÁO ⚠️\n\n🥺 Bot đã được nhận lệnh rời khỏi nhóm!\n*️⃣ Liên hệ {authorName} để biết thêm chi tiết.",
        "successOut": "✅ Đã rời khỏi {successCount} nhóm.",
        "failOut": "❎ Không thể rời khỏi nhóm:\n{fail}",
        "error": "❎ Đã có lỗi xảy ra, vui lòng thử lại sau."
    }
}

function out(threadID) {
    return new Promise(resolve => {
        global.api.removeUserFromGroup(global.botID, threadID, err => {
            if (err) {
                console.error(err);
                return resolve(null);
            };
            resolve(true);
        })
    })
}

async function verifyAccess({ message, getLang, eventData, data }) {
    try {
        const { reaction, userID } = message;
        if (reaction != "👍") return;

        let threadIDs = eventData.threadIDs;

        const isHavingCurrentThreadID = threadIDs.some(threadID => threadID == message.threadID);
        if (isHavingCurrentThreadID) {
            threadIDs = threadIDs.filter(threadID => threadID != message.threadID);
            threadIDs.push(message.threadID);
        }

        let authorName = data?.user?.info?.name || getLang("moderator");

        const fail = [];
        for (const threadID of threadIDs) {
            await message.send({
                body: getLang("out", { authorName }),
                mentions: [{ tag: authorName, id: userID }]
            }, threadID);

            const result = await out(threadID);
            if (result == null) fail.push(threadID);

            global.sleep(500);
        }

        const sendTarget = isHavingCurrentThreadID && !fail.some(threadID => threadID == message.threadID) ? userID : null;

        const successCount = threadIDs.length - fail.length;

        await message.send(getLang("successOut", { successCount }), sendTarget);
        if (fail.length > 0) await message.send(getLang("failOut", { fail: fail.join("\n") }), sendTarget);

        return;
    } catch (e) {
        console.error(e);
        return message.send(getLang("error"));
    }
}

async function onCall({ message, args, getLang }) {
    try {
        const input = args[0]?.toLowerCase();
        const threadIDs = [];

        if (input == "all") {
            const threadList = (await global.api.getThreadList(100, null, ["INBOX"]) || [])
                .filter(thread =>
                    thread.threadID != message.threadID &&
                    thread.isGroup &&
                    thread.isSubscribed
                );

            if (threadList.length == 0) return message.reply(getLang("noThreadToOut"));

            threadIDs.push(...threadList.map(thread => thread.threadID));
        } else if (args.length > 0) {
            const inputThreadIDs =
                args
                    .map(threadID => threadID.replace(/[^0-9]/g, ""))
                    .filter(arg => arg.length >= 16 && !isNaN(arg));

            if (inputThreadIDs.length == 0) return message.reply(getLang("invalidThreadIDs"));

            threadIDs.push(...inputThreadIDs);
        } else {
            threadIDs.push(message.threadID);
        }


        return message
            .reply(getLang("confirm"))
            .then(_ => _.addReactEvent({ threadIDs, callback: verifyAccess }))
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
