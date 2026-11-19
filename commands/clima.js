// clima.js
export default {
  name: 'clima',
  description: 'Clima de un lugar',
  async handler(sock, msg, args, { from }) {
    const lugar = args.trim();
    if (!lugar) {
      await sock.sendMessage(from, { text: 'Usá: .clima Buenos Aires' }, { quoted: msg });
      return;
    }
    try {
      const geo = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(lugar)}&count=1&language=es`);
      const geoData = await geo.json();
      if (!geoData.results?.length) {
        await sock.sendMessage(from, { text: 'No encontré ese lugar.' }, { quoted: msg });
        return;
      }
      const { latitude, longitude, name, country } = geoData.results[0];
      const w = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m&timezone=auto`);
      const data = await w.json();
      const c = data.current;
      const text = `*Clima en ${name}, ${country}:*\n🌡️ ${c.temperature_2m}°C\n💧 ${c.relative_humidity_2m}%\n💨 ${c.wind_speed_10m} km/h`;
      await sock.sendMessage(from, { text }, { quoted: msg });
    } catch (e) {
      await sock.sendMessage(from, { text: 'Error al obtener el clima.' }, { quoted: msg });
    }
  }
};
