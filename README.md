# CRM Leads

CRM Comercial Multicanal, Softphone VoIP con Twilio WebRTC, Bandeja de WhatsApp y Motor de Email Marketing. Construido con **Next.js 14**, **Twilio**, **Resend**, **Checkly Cloud** y **MongoDB Atlas**, optimizado para despliegue en **Vercel**.

## Stack

- **Frontend**: Next.js 14 (App Router) + Tailwind CSS
- **VoIP**: Twilio Voice SDK (WebRTC, Opus 16kbps — optimizado para datos móviles)
- **WhatsApp**: Twilio WhatsApp Business API
- **DB**: MongoDB Atlas (free tier M0)
- **Auth**: NextAuth.js (credentials)
- **Deploy**: Vercel Hobby (gratis)

## Configuración Rápida

### 1. Clonar y configurar

```bash
git clone <repo>
cd lead
cp .env.example .env.local
# Editar .env.local con tus credenciales
```

### 2. Twilio Console — Configuración manual requerida

1. **Crear TwiML Application**:
   - Console → Voice → TwiML Apps → Create New App
   - Voice Request URL: `https://tu-app.vercel.app/api/twilio/voice`
   - Status Callback URL: `https://tu-app.vercel.app/api/twilio/voice/status`
   - Copiar el App SID → `TWILIO_TWIML_APP_SID`

2. **Crear API Key**:
   - Console → API Keys → Create API Key (tipo Standard)
   - Copiar Key SID → `TWILIO_API_KEY`
   - Copiar Secret → `TWILIO_API_SECRET`

3. **Asignar TwiML App al número**:
   - Console → Phone Numbers → tu número → Voice Configuration
   - Seleccionar tu TwiML App

4. **Configurar WhatsApp Sender**:
   - Console → Messaging → Senders → WhatsApp Senders
   - Webhook URL: `https://tu-app.vercel.app/api/whatsapp/webhook`

### 3. MongoDB Atlas

1. Crear cuenta en [mongodb.com/atlas](https://mongodb.com/atlas)
2. Crear cluster M0 (gratis)
3. Crear usuario de base de datos
4. Copiar connection string → `MONGODB_URI`
5. Whitelist IP: `0.0.0.0/0` (para Vercel serverless)

### 4. Deploy en Vercel

```bash
npm install -g vercel
vercel --prod
# Configurar variables de entorno en Vercel Dashboard
```

### 5. Desarrollo local

```bash
npm install
npm run dev
# Abrir http://localhost:3000
```

Para webhooks Twilio en local, usar [ngrok](https://ngrok.com):
```bash
ngrok http 3000
# Usar la URL ngrok en Twilio Console
```

## Credenciales por defecto

```
Email: admin@lead.com
Password: changeme123
```

**⚠️ Cambiar en `.env.local`**:
```
ADMIN_EMAIL=tu@email.com
ADMIN_PASSWORD=contraseña-segura
```

## Características

- ☎️ Softphone VoIP (llamadas entrantes y salientes)
- 💬 WhatsApp inbox unificado
- 👥 CRM básico de contactos/leads
- 📊 Historial de llamadas con duración
- 📶 Indicador de calidad de red en tiempo real
- 📱 Mobile responsive (funciona en celular con 4G)
- 🔒 Autenticación segura con NextAuth.js

## Optimización de datos móviles

El softphone usa `maxAverageBitrate: 16000` (16kbps) que reduce el consumo de datos de ~18MB/hora a **~7MB/hora** manteniendo calidad de voz suficiente para trabajar.

## Escalabilidad

- **1 agente** (fase actual): Funciona sin configuración adicional
- **2-10 agentes**: Agregar sistema de usuarios con roles
- **50-100 agentes**: Agregar Twilio TaskRouter + Upstash Redis + completar Trust Hub en Twilio

## Costo estimado (1 agente)

| Servicio | Costo |
|---------|-------|
| Vercel Hobby | $0 |
| MongoDB Atlas M0 | $0 |
| Twilio número | ~$1/mes |
| Twilio llamadas (~600 min/mes) | ~$23/mes |
| WhatsApp (1K conv gratis) | $0 |
| **Total** | **~$24/mes** |
