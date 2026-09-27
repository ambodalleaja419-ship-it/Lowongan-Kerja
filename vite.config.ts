import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, Plugin } from 'vite';
import dotenv from 'dotenv';
import { handleParseJob, sendTelegramNotification } from './src/server/apiHandler';

dotenv.config();

function apiPlugin(): Plugin {
  return {
    name: 'api-server-middleware',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        if (!req.url?.startsWith('/api/')) {
          return next();
        }

        // Helper to parse JSON body
        const readBody = () =>
          new Promise<any>((resolve) => {
            let body = '';
            req.on('data', chunk => (body += chunk));
            req.on('end', () => {
              try {
                resolve(body ? JSON.parse(body) : {});
              } catch {
                resolve({});
              }
            });
          });

        res.setHeader('Content-Type', 'application/json');

        if (req.url === '/api/health' && req.method === 'GET') {
          res.statusCode = 200;
          return res.end(
            JSON.stringify({
              status: 'ok',
              gemini_configured: Boolean(process.env.GEMINI_API_KEY),
              telegram_bot_configured: Boolean(process.env.TELEGRAM_BOT_TOKEN),
              supabase_configured: Boolean(process.env.VITE_SUPABASE_URL),
              time: new Date().toISOString(),
            })
          );
        }

        if (req.url === '/api/ai/parse-job' && req.method === 'POST') {
          try {
            const body = await readBody();
            const { rawText } = body;
            if (!rawText || typeof rawText !== 'string' || rawText.trim().length < 10) {
              res.statusCode = 400;
              return res.end(
                JSON.stringify({
                  error: 'Teks lowongan terlalu pendek atau tidak valid.',
                })
              );
            }

            const result = await handleParseJob(rawText);
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, result }));
          } catch (error: any) {
            console.error('[API Parse Error]:', error);
            res.statusCode = 500;
            return res.end(
              JSON.stringify({
                error: error?.message || 'Gagal memproses lowongan dengan AI.',
              })
            );
          }
        }

        if (req.url === '/api/applications/notify' && req.method === 'POST') {
          try {
            const body = await readBody();
            const { application } = body;
            if (!application) {
              res.statusCode = 400;
              return res.end(JSON.stringify({ error: 'Missing application data' }));
            }

            const text =
              `🔔 <b>LAMARAN BARU DITERIMA!</b>\n\n` +
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
            res.statusCode = 200;
            return res.end(JSON.stringify({ success: true, sent }));
          } catch (error: any) {
            res.statusCode = 500;
            return res.end(JSON.stringify({ error: error?.message }));
          }
        }

        next();
      });
    },
  };
}

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss(), apiPlugin()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

