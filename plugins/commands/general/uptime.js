const config = {
    name: "uptime",
    aliases: ["upt"],
    credits: "Vasilyok"
}

function onCall({ message }) {
    let uptime = global.msToHMS(process.uptime() * 1000);
    message.reply(uptime);
}


export default {
    config,
    onCall
}
