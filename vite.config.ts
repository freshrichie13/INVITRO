import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import { MercadoPagoConfig, Preference } from 'mercadopago';

export default defineConfig(({ mode }) => {
    const env = loadEnv(mode, '.', '');
    
    return {
      server: {
        port: 3000,
        host: '0.0.0.0',
        // Plugin para simular la API de Vercel localmente
        proxy: {}, // Empty proxy to satisfy some configurations if needed
      },
      plugins: [
        react(),
        {
          name: 'api-simulator',
          configureServer(server) {
            server.middlewares.use(async (req, res, next) => {
              if (req.url === '/api/create-preference' && req.method === 'POST') {
                let body = '';
                req.on('data', chunk => { body += chunk.toString(); });
                req.on('end', async () => {
                  try {
                    const { firstName, lastName, email } = JSON.parse(body);
                    
                    // Inicializar Mercado Pago con el token del .env
                    const client = new MercadoPagoConfig({ 
                      accessToken: env.MP_ACCESS_TOKEN || '' 
                    });
                    const preference = new Preference(client);

                    const appUrl = 'http://localhost:3000';

                    const result = await preference.create({
                      body: {
                        items: [{
                          id: 'entrada-evento',
                          title: 'Entrada — ESTÁS MIRANDO EN RADIANES',
                          quantity: 1,
                          unit_price: 550,
                          currency_id: 'MXN',
                        }],
                        payer: { name: firstName, surname: lastName, email: email },
                        back_url: {
                          success: `https://invitro-radianes.vercel.app/?payment=success`,
                          failure: `https://invitro-radianes.vercel.app/?payment=failure`,
                          pending: `https://invitro-radianes.vercel.app/?payment=pending`,
                        },
                        // auto_return desactivado en local para evitar error 500 de validación
                      }
                    });

                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ init_point: result.init_point }));
                  } catch (error: any) {
                    console.error('Error detallado de MP:', error);
                    res.statusCode = 500;
                    res.setHeader('Content-Type', 'application/json');
                    res.end(JSON.stringify({ 
                      error: error.message || 'Error en el servidor local',
                      details: error.response?.data || error.cause || error
                    }));
                  }
                });
                return;
              }
              next();
            });
          }
        }
      ],
      define: {
        'process.env.API_KEY': JSON.stringify(env.GEMINI_API_KEY),
        'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY)
      },
      resolve: {
        alias: {
          '@': path.resolve(__dirname, '.'),
        }
      }
    };
});
