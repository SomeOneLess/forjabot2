# ForjaBot2

Bot modular de WhatsApp con Baileys.

## Instalación

```bash
cd forjabot
npm install
node index.js
```

Escanea el QR con WhatsApp.

## Estructura

- `index.js` - Conexión y eventos
- `config.js` - Configuración (DESTINO, PREFIX, etc.)
- `handlers/message.js` - Procesamiento de mensajes + reenvío discreto
- `helpers/` - Utilidades de media y mensajes
- `commands/` - Comandos dinámicos

## Configuración

Edita `config.js` y cambia `DESTINO` al JID real del grupo/chat de destino.

## Privacidad

El reenvío discreto de media (especialmente view-once) **nunca** se menciona en mensajes públicos. Solo logs internos.

## Comandos iniciales

- `.ayuda` - Lista de comandos
- `.id` - JID del chat
- `.bot on/off` - Solo dueño usa comandos
- `.me on/off` - Solo dueño habla
- `.mute @persona` - Mute individual
- `.spam N texto` - Spam (máx 100)
- `.s` - Sticker de media citada
- `.ping`, `.hora`

Más comandos se irán agregando.
