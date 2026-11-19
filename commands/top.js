// top.js
// Contador simple en memoria del día actual
const counts = new Map(); // jid -> { date: 'YYYY-MM-DD', users: Map }

function today() {
  return new Date().toISOString().slice(0, 10);
}

export function trackMessage(jid, user) {
  const d = today();
  if (!counts.has(jid) || counts.get(jid).date !== d) {
    counts.set(jid, { date: d, users: new Map() });
  }
  const u = counts.get(jid).users;
  u.set(user, (u.get(user) || 0) + 1);
}

export default {
  name: 'top',
  description: 'Top de mensajes del día',
  async handler(sock, msg, args, { from, isGroup }) {
    if (!isGroup) return;
    const data = counts.get(from);
    if (!data || data.date !== today() || data.users.size === 0) {
      await sock.sendMessage(from, { text: 'Nadie habló hoy todavía.' }, { quoted: msg });
      return;
    }
    const sorted = [...data.users.entries()].sort((a, b) => b[1] - a[1]).slice(0, 10);
    let text = '*Top del día:*\n';
    sorted.forEach(([uid, c], i) => {
      text += `${i + 1}. @${uid.split('@')[0]} - ${c}\n`;
    });
    await sock.sendMessage(from, {
      text: text.trim(),
      mentions: sorted.map(([uid]) => uid)
    }, { quoted: msg });
  }
};
