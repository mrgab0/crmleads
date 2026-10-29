const fs = require('fs');
const path = require('path');
const https = require('https');

const ACCOUNT_ID =
  process.env.CHECKLY_ACCOUNT_ID || 'f2caf3ea-620a-49e2-86ef-a8cd7955ee45';
const API_KEY =
  process.env.CHECKLY_API_KEY || 'cu_e18c54f4d2fc49bd9776964803abf5e5';

function checklyRequest(endpoint, method, data) {
  return new Promise((resolve, reject) => {
    const payload = data ? JSON.stringify(data) : null;
    const options = {
      hostname: 'api.checklyhq.com',
      port: 443,
      path: endpoint,
      method: method,
      headers: {
        'Content-Type': 'application/json',
        'X-Checkly-Account': ACCOUNT_ID,
        Authorization: `Bearer ${API_KEY}`,
        ...(payload ? { 'Content-Length': Buffer.byteLength(payload) } : {}),
      },
    };

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => (body += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve(parsed);
          } else {
            reject(new Error(`Checkly API Error (${res.statusCode}): ${body}`));
          }
        } catch {
          reject(new Error(`Checkly Parse Error: ${body}`));
        }
      });
    });

    req.on('error', reject);
    if (payload) req.write(payload);
    req.end();
  });
}

async function main() {
  const metaPath = path.join(__dirname, '..', 'checkly', 'checkly-meta.json');
  if (!fs.existsSync(metaPath)) {
    console.error('No se encontró checkly-meta.json. Ejecuta primero: npm run checkly:sync');
    process.exit(1);
  }

  const { checkId, checkName } = JSON.parse(fs.readFileSync(metaPath, 'utf8'));

  console.log(`[Checkly Cloud] 🎯 Disparando sesión de prueba para "${checkName}"...`);
  console.log(`[Checkly Cloud] Check ID: ${checkId}`);

  try {
    const res = await checklyRequest('/v1/check-sessions/trigger', 'POST', {
      target: {
        checkId: [checkId],
      },
      refreshCache: false,
    });

    const session = res.sessions && res.sessions[0];
    if (!session) {
      console.log('[Checkly Cloud] Sesión iniciada:', res);
      return;
    }

    console.log(`[Checkly Cloud] 🚀 Runner iniciado en: ${session.runLocations.join(', ')}`);
    console.log(`[Checkly Cloud] ID de Sesión: ${session.checkSessionId}`);
    console.log(`\n🔗 Link directo a la sesión de prueba (Screenshots & Logs):`);
    console.log(session.checkSessionLink);

    console.log('\nEsperando resultado del runner en AWS (15s)...');
    await new Promise((r) => setTimeout(r, 15000));

    const checkResults = await checklyRequest(`/v1/check-results/${checkId}?limit=1`, 'GET');
    if (checkResults && checkResults.length > 0) {
      const latest = checkResults[0];
      console.log('\n--- RESULTADO DE LA EJECUCIÓN EN LA NUBE ---');
      console.log(`Estado: ${latest.hasFailures ? '❌ FALLÓ' : '✅ PASÓ EXITOSAMENTE'}`);
      console.log(`Tiempo de respuesta: ${latest.responseTime} ms`);
      console.log(`Ubicación: ${latest.runLocation}`);

      if (latest.browserCheckResult && latest.browserCheckResult.errors) {
        console.log(`\nErrores encontrados (${latest.browserCheckResult.errors.length}):`);
        latest.browserCheckResult.errors.forEach((err, i) => {
          console.log(`  ${i + 1}. ${err.message.split('\n')[0]}`);
        });
      }
    }
  } catch (err) {
    console.error('[Checkly Cloud] Error:', err.message);
    process.exit(1);
  }
}

main().catch(console.error);
