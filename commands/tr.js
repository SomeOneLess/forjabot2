// tr.js
export default {
  name: 'tr',
  description: 'Traduce de español a inglés',
  async handler(sock, msg, args, { from }) {
    const texto = args.trim();
    if (!texto) {
      await sock.sendMessage(from, { text: 'Usá: .tr texto a traducir' }, { quoted: msg });
      return;
    }
    try {
      const url = `https://api.mymemory.translated.net/get?q=${encodeURIComponent(texto)}&langpair=es|en`;
      const res = await fetch(url);
      const data = await res.json();
      const trad = data.responseData?.translatedText || 'No se pudo traducir.';
      await sock.sendMessage(from, { text: trad }, { quoted: msg });
    } catch (e) {
      await sock.sendMessage(from, { text: 'Error al traducir.' }, { quoted: msg });
    }
  }
};
