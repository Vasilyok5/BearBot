const config = {
    name: "help",
    aliases: ["cmds", "commands"],
    version: "1.0.3",
    description: "Xem tất cả các lệnh hoặc xem chi tiết lệnh",
    usage: "[command] (optional)",
    credits: "Vasilyok"
}

const langData = {
    "vi_VN": {
        "help.list": "{list}\n\n⇒ Tổng cộng: {total} lệnh\n⇒ Sử dụng {syntax} [lệnh] để xem thêm thông tin về lệnh.",
        "help.commandNotExists": "❎ Lệnh {command} không tồn tại.",
        "help.commandDetails": `
            ⇒ Tên: {name}
            ⇒ Tên khác: {aliases}
            ⇒ Phiên bản: {version}
            ⇒ Mô tả: {description}
            ⇒ Cách sử dụng: {usage}
            ⇒ Quyền hạn: {permissions}
            ⇒ Thể loại: {category}
            ⇒ Thời gian chờ: {cooldown}
            ⇒ Người viết: {credits}
        `,
        "0": "Thành viên",
        "1": "Quản trị nhóm",
        "2": "Quản trị bot"
    }
}

function getCommandName(commandName) {
    if (global.plugins.commandsAliases.has(commandName)) return commandName;

    for (let [key, value] of global.plugins.commandsAliases) {
        if (value.includes(commandName)) return key;
    }

    return null
}

async function onCall({ message, args, getLang, userPermissions, prefix }) {
    const { commandsConfig } = global.plugins;
    const commandName = args[0]?.toLowerCase();

    if (!commandName) {
        let commands = {};
        const language = data?.thread?.data?.language || global.config.LANGUAGE || 'en_US';
        for (const [key, value] of commandsConfig.entries()) {
            if (!!value.isHidden) continue;
            if (!!value.isAbsolute ? !global.config?.ABSOLUTES.some(e => e == message.senderID) : false) continue;
            if (!value.hasOwnProperty("permissions")) value.permissions = [0, 1, 2];
            if (!value.permissions.some(p => userPermissions.includes(p))) continue;
            if (!commands.hasOwnProperty(value.category)) commands[value.category] = [];
            commands[value.category].push(value._name && value._name[language] ? value._name[language] : key);
        }

        let list = Object.keys(commands)
            .map(category => `⌈ ${category.toUpperCase()} ⌋\n${commands[category].join(", ")}`)
            .join("\n\n");

        message.reply(getLang("help.list", {
            total: Object.values(commands).map(e => e.length).reduce((a, b) => a + b, 0),
            list,
            syntax: message.args[0].toLowerCase()
        }));
    } else {
        const command = commandsConfig.get(getCommandName(commandName, commandsConfig));
        if (!command) return message.reply(getLang("help.commandNotExists", { command: commandName }));

        const isHidden = !!command.isHidden;
        const isUserValid = !!command.isAbsolute ? global.config?.ABSOLUTES.some(e => e == message.senderID) : true;
        const isPermissionValid = command.permissions.some(p => userPermissions.includes(p));
        if (isHidden || !isUserValid || !isPermissionValid)
            return message.reply(getLang("help.commandNotExists", { command: commandName }));

        message.reply(getLang("help.commandDetails", {
            name: command.name,
            aliases: command.aliases.join(", "),
            version: command.version || "1.0.0",
            description: command.description || '',
            usage: `${prefix}${commandName} ${command.usage || ''}`,
            permissions: command.permissions.map(p => getLang(String(p))).join(", "),
            category: command.category,
            cooldown: command.cooldown || 3,
            credits: command.credits || ""
        }).replace(/^ +/gm, ''));
    }
}

export default {
    config,
    langData,
    onCall
}
