import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { handleParseJob, sendTelegramNotification } from './src/server/apiHandler';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

// Health check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    gemini_configured: Boolean(process.env.GEMINI_API_KEY),
    telegram_bot_configured: Boolean(process.env.TELEGRAM_BOT_TOKEN),
    supabase_configured: Boolean(process.env.VITE_SUPABASE_URL),
    time: new Date().toISOString(),
  });
});

// AI Parsing endpoint
app.post('/api/ai/parse-job', async (req, res) => {
  try {
    const { rawText } = req.body;
    if (!rawText || typeof rawText !== 'string' || rawText.trim().length < 10) {
      return res.status(400).json({
        error: 'Teks lowongan terlalu pendek atau tidak valid.',
      });
    }

    const result = await handleParseJob(rawText);
    res.json({ success: true, result });
  } catch (error: any) {
    console.error('AI Parse error:', error);
    res.status(500).json({
      error: error?.message || 'Gagal memproses lowongan dengan AI.',
    });
  }
});

// Candidate Application Telegram Notification
app.post('/api/applications/notify', async (req, res) => {
  try {
    const { application } = req.body;
    if (!application) {
      return res.status(400).json({ error: 'Missing application data' });
    }

    const text = `🔔 <b>LAMARAN BARU DITERIMA!</b>\n\n` +
      `💼 <b>Posisi:</b> ${application.applied_position}\n` +
      `👤 <b>Nama:</b> ${application.full_name}\n` +
      `📍 <b>Domisili:</b> ${application.domicile}\n` +
      `🎂 <b>Usia:</b> ${application.age} tahun\n` +
      `📱 <b>Telegram:</b> ${application.telegram_username}\n` +
      (application.telegram_number ? `📞 <b>Telepon:</b> ${application.telegram_number}\n` : '') +
      `🕐 <b>Waktu:</b> ${new Date().toLocaleString('id-ID')}\n\n` +
      `Status: 🟡 <b>BARU</b>`;

    const cleanUsername = application.telegram_username.replace('@', '');
    const inlineKeyboard = {
      inline_keyboard: [
        [
          { text: '💬 Hubungi di Telegram', url: `https://t.me/${cleanUsername}` },
          { text: '📄 Minta CV', callback_data: `request_cv_${application.id}` }
        ]
      ]
    };

    const sent = await sendTelegramNotification(text, inlineKeyboard);
    res.json({ success: true, sent });
  } catch (error: any) {
    console.error('Telegram notification error:', error);
    res.status(500).json({ error: error?.message });
  }
});

// Telegram Bot Webhook endpoint
app.post('/api/telegram/webhook', async (req, res) => {
  try {
    const update = req.body;
    console.log('[Telegram Webhook Update]:', JSON.stringify(update));

    if (update.message) {
      const chatId = update.message.chat.id;
      const text = update.message.text || '';

      if (text.startsWith('/start')) {
        const welcome = `Halo Admin! 👋\n\nSelamat datang di <b>KerjaKilat Bot</b>.\n\n` +
          `Kirimkan teks lowongan kerja mentah apa saja ke sini, AI akan otomatis membaca, mengekstrak, dan merapikannya untuk dipublikasikan langsung ke website!\n\n` +
          `<b>Pilihan Menu:</b>\n` +
          `📢 Kirimkan teks loker sekarang\n` +
          `📊 Cek status website`;
        
        await sendTelegramNotification(welcome);
        return res.json({ ok: true });
      }

      // If text looks like a job post
      if (text.length > 20) {
        try {
          const parsed = await handleParseJob(text);
          if (parsed.is_valid && parsed.telegram_preview) {
            const keyboard = {
              inline_keyboard: [
                [
                  { text: '✅ PUBLIKASIKAN', callback_data: 'publish_last' },
                  { text: '✏️ EDIT', callback_data: 'edit_last' }
                ],
                [
                  { text: '🔄 PROSES ULANG', callback_data: 'reprocess_last' },
                  { text: '❌ BATAL', callback_data: 'cancel_last' }
                ]
              ]
            };
            await sendTelegramNotification(parsed.telegram_preview, keyboard);
          } else {
            const warning = `⚠️ <b>Data belum lengkap</b>\n\nInformasi yang belum ditemukan:\n` +
              parsed.missing_fields.map(f => `• ${f}`).join('\n') +
              `\n\nSilakan kirim informasi tambahan.`;
            await sendTelegramNotification(warning);
          }
        } catch (err: any) {
          await sendTelegramNotification(`⚠️ Terjadi kesalahan memproses dengan AI: ${err.message}`);
        }
      }
    }

    res.json({ ok: true });
  } catch (error: any) {
    console.error('Webhook error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Serve frontend in production
const distPath = path.join(__dirname, 'dist');
app.use(express.static(distPath));

app.get('*', (req, res) => {
  res.sendFile(path.join(distPath, 'index.html'));
});

app.listen(PORT, () => {
  console.log(`KerjaKilat server running on port ${PORT}`);
});
