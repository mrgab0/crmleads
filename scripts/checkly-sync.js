const fs = require('fs');
const path = require('path');
const https = require('https');

const ACCOUNT_ID =
  process.env.CHECKLY_ACCOUNT_ID || 'f2caf3ea-620a-49e2-86ef-a8cd7955ee45';
const API_KEY =
  process.env.CHECKLY_API_KEY || 'cu_e18c54f4d2fc49bd9776964803abf5e5';

const CHECK_NAME = 'Lead Softphone - Visual Eyes & CRM Suite';

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
  console.log(`[Checkly Sync] Conectando a cuenta: ${ACCOUNT_ID}...`);

  const specPath = path.join(__dirname, '..', 'checkly', 'lead-softphone-eyes.spec.js');
  if (!fs.existsSync(specPath)) {
    console.error(`No se encontró el archivo de especificación en: ${specPath}`);
    process.exit(1);
  }

  const scriptContent = fs.readFileSync(specPath, 'utf8');

  // 1. Obtener lista de checks existentes
  const checks = await checklyRequest('/v1/checks', 'GET');
  const existing = checks.find((c) => c.name === CHECK_NAME);

  const checkPayload = {
    name: CHECK_NAME,
    checkType: 'BROWSER',
    frequency: 60,
    activated: true,
    muted: false,
    locations: ['us-east-1'],
    script: scriptContent,
    runtimeId: '2024.02',
    tags: ['lead-softphone', 'visual-eyes', 'crm'],
    doubleCheck: true,
  };

  let checkId;
  if (existing) {
    console.log(`[Checkly Sync] Actualizando check existente ID: ${existing.id}...`);
    const updated = await checklyRequest(`/v1/checks/${existing.id}`, 'PUT', checkPayload);
    checkId = updated.id;
    console.log(`[Checkly Sync] ✅ Check actualizado exitosamente.`);
  } else {
    console.log(`[Checkly Sync] Creando nuevo Browser Check en Checkly Cloud...`);
    const created = await checklyRequest('/v1/checks', 'POST', checkPayload);
    checkId = created.id;
    console.log(`[Checkly Sync] ✅ Check creado exitosamente con ID: ${created.id}`);
  }

  // Guardar metadata local
  const metaPath = path.join(__dirname, '..', 'checkly', 'checkly-meta.json');
  fs.writeFileSync(
    metaPath,
    JSON.stringify({ checkId, checkName: CHECK_NAME, updatedAt: new Date().toISOString() }, null, 2)
  );

  console.log(`[Checkly Sync] Metadata guardada en: ${metaPath}`);
}

main().catch((err) => {
  console.error('[Checkly Sync] Error:', err.message);
  process.exit(1);
});
