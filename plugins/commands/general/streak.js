const config = {
    name: "streak",
    description: "Đếm ngày...",
    usage: "[start/set/relapse/stop]",
    cooldown: 5,
    permissions: [0, 1, 2],
    credits: "Vasilyok"
}

const langData = {
    "vi_VN": {
        "dataNotReady": "❎ Dữ liệu của bạn chưa sẵn sàng",
        "notStarted": "❗ Bạn chưa bắt đầu một streak nào",
        "alreadyStarted": "❗ Bạn đã bắt đầu một streak rồi",
        "invalidDays": "❎ Số ngày không hợp lệ",
        "started": "❗ Bạn đã bắt đầu một streak mới",
        "startedWithMessage": "❗ Bạn đã bắt đầu một streak mới với nội dung:\n{message}",
        "stopped": "❗ Bạn đã dừng streak của mình",
        "statusStopped": "❗ Đã dừng",
        "statusRunning": "❗ Đang chạy",
        "detailsWithMessage": "❗ Streak của bạn: {days} ngày\nNội dung: {message}\nTrạng thái: {status}",
        "details": "❗ Streak của bạn: {days} ngày\nTrạng thái: {status}",
        "set": "❗ Bạn đã đặt streak của mình thành {days} ngày",
        "relapsed": "❗ Bạn đã bắt đầu lại streak của mình",
        "alreadyStopped": " ❗Bạn đã dừng streak của mình rồi",
        "error": "❎ Đã có lỗi xảy ra"
    }
}

function msToDays(ms) {
    return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function daysToMs(days) {
    return days * (1000 * 60 * 60 * 24);
}

async function onCall({ message, args, getLang, extra, data, userPermissions, prefix }) {
    try {
        const query = args[0]?.toLowerCase();
        const userdata = data?.user?.data;

        const streakData = userdata?.streak || {};

        if (!userdata) return message.reply(getLang("dataNotReady"));

        const { start, message: streakMessage, stopped } = streakData;

        switch (query) {
            // START A NEW STREAK
            case "start": {
                if (start && !stopped) return message.reply(getLang("alreadyStarted"));

                const newStreakMessage = args.slice(1).join(" ") || null;
                const newStreakData = {
                    start: Date.now(),
                    message: newStreakMessage,
                    stopped: null
                }

                await global.controllers.Users.updateData(message.senderID, { streak: newStreakData });

                if (newStreakMessage) {
                    return message.reply(getLang("startedWithMessage", { message: newStreakMessage }));
                }
                return message.reply(getLang("started"));
            }
            // MANUALLY SET DAYS
            case "set": {
                if (!start) return message.reply(getLang("notStarted"));

                const days = parseInt(args[1]);
                if (!days || days < 1 || isNaN(days)) return message.reply(getLang("invalidDays"));

                const newStreakData = {
                    start: Date.now() - daysToMs(days),
                    message: streakMessage,
                    stopped: null
                }

                await global.controllers.Users.updateData(message.senderID, { streak: newStreakData });

                return message.reply(getLang("set", { days }));
            }
            // RELAPSE STREAK
            case "relapse": {
                if (!start) return message.reply(getLang("notStarted"));
                if (stopped) return message.reply(getLang("alreadyStopped"));

                const newStreakData = {
                    start: Date.now(),
                    message: streakMessage,
                    stopped: null
                }

                await global.controllers.Users.updateData(message.senderID, { streak: newStreakData });

                return message.reply(getLang("relapsed"));
            }
            // STOP STREAK
            case "stop": {
                if (!start) return message.reply(getLang("notStarted"));
                if (stopped) return message.reply(getLang("alreadyStopped"));

                const newStreakData = {
                    start,
                    message: streakMessage,
                    stopped: Date.now()
                }

                await global.controllers.Users.updateData(message.senderID, { streak: newStreakData });

                return message.reply(getLang("stopped"));
            }
            // SHOW STREAK DETAILS
            default: {
                if (!start) return message.reply(getLang("notStarted"));

                let esclapsed = Date.now() - start;
                let days = msToDays(esclapsed);

                if (stopped) {
                    esclapsed = stopped - start;
                    days = msToDays(esclapsed);
                }

                if (streakMessage) {
                    return message.reply(getLang("detailsWithMessage", {
                        days,
                        message: streakMessage,
                        status: stopped ? getLang("statusStopped") : getLang("statusRunning")
                    }));
                }

                return message.reply(getLang("details", {
                    days,
                    status: stopped ? getLang("statusStopped") : getLang("statusRunning")
                }));
            }
        }
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
