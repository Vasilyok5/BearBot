import { readdirSync } from "fs";
import { join } from "path";

const config = {
    name: "girl",
    aliases: ["gai"],
    credits: "Vasilyok"
}

function onLoad() {
    const girl = readdirSync(join(global.assetsPath, "girl"));
    global.getGirlJpg = () => girl[Math.floor(Math.random() * girl.length)];
}

function onCall({ message }) {
    message.reply({ attachment: global.reader(join(global.assetsPath, "girl", global.getGirlJpg())) })
}

export default {
    onLoad,
    config,
    onCall
}
