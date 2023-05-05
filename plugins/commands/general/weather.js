const config = {
    name: "weather",
    description: "Xem thông tin thời tiết",
    usage: "[location]",
    cooldown: 3,
    permissions: [0, 1, 2],
    credits: "Vasilyok"
}

const langData = {
    "vi_VN": {
        "missingInput": "❗ Vui lòng nhập địa điểm",
        "notFound": "❌ Không tìm thấy địa điểm",
        "results": "☁️ Thời tiết tại {name}:\n🌡️ Nhiệt độ: {temperature}°C\n🌡️Cảm giác như: {feelLikeTemperature}°C\n⌚ Thời gian: {date}\n⌚ Thời gian quan sát: {observationtime}\n*️⃣ Trạng thái: {skytext}\n💨 Tốc độ gió: {windspeed} kph\n💦 Độ ẩm: {humidity}%\n*️⃣ Áp suất: {pressure} mm",
        "error": "❌ Đã xảy ra lỗi"
    }
}

async function onCall({ message, args, getLang }) {
    try {
        const input = args.join(" ");
        if (!input) return message.reply(getLang("missingInput"));

        global
            .GET(`http://api.weatherapi.com/v1/current.json?key=2cf45ed7417d4462a32135921232704&q=${input}&aqi=no&lang=vi`)
            .then(res => {
                const current = res.data.current;
                const location = res.data.location;

                if (!current || !location) return message.reply(getLang("notFound"));

                return message.reply(getLang("results", {
                    name: location.name,
                    temperature: current.temp_c,
                    feelLikeTemperature: current.feelslike_c,
                    date: location.localtime,
                    observationtime: current.last_updated,
                    skytext: current.condition.text,
                    windspeed: current.wind_kph,
                    humidity: current.humidity,
                    pressure: current.pressure_mb
                }))
            })
            .catch(e => {
                console.error(e);
                message.reply(getLang("error"));
            });
    } catch (e) {
        console.error(e);
        message.reply(getLang("error"));
    }
}

export default {
    config,
    langData,
    onCall
}
