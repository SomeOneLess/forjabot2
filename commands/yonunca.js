// yonunca.js
const FRASES = [
  'me masturbé pensando en alguien del grupo',
  'envié un nude sin querer',
  'tuve sexo en un lugar público',
  'mentí sobre mi experiencia sexual',
  'me excitó un audio de voz',
  'fantaseé con alguien de este chat',
  'usé juguetes',
  'tuve un trío',
  'me grabaron sin que me diera cuenta',
  'me vine solo con la imaginación'
];

export default {
  name: 'yonunca',
  description: 'Yo nunca nunca',
  async handler(sock, msg, args, { from }) {
    const f = FRASES[Math.floor(Math.random() * FRASES.length)];
    await sock.sendMessage(from, { text: `Yo nunca nunca ${f}` }, { quoted: msg });
  }
};
