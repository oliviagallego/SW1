const http = require('http');
const https = require('https');
const cheerio = require('cheerio');

const PORT = process.env.PORT || 3000;
const TARGET = 'https://en.wikipedia.org/wiki/Web_scraping';

let history = [];
let lastRunInfo = null;

function fetchHTML(url) {
  return new Promise((resolve, reject) => {
    https.get(
      url,
      { headers: { 'User-Agent': 'SW1-scraper/1.0 (proyecto estudiante)' } },
      (res) => {
        if (res.statusCode < 200 || res.statusCode >= 300) {
          return reject(new Error('HTTP ' + res.statusCode));
        }
        let data = '';
        res.on('data', (chunk) => (data += chunk));
        res.on('end', () => resolve(data));
      }
    ).on('error', reject);
  });
}

function extractInfo(html) {
  const $ = cheerio.load(html);
  const title = $('title').first().text().trim();
  const h1 = $('h1').first().text().trim();
  const firstPara = $('p').filter((i, el) => $(el).text().trim().length > 0).first().text().trim();
  const linksCount = $('a').length;
  const headingsCount = $('h2, h3').length;

  return { title, h1, firstPara, linksCount, headingsCount };
}

async function runScrape() {
  const startedAt = new Date();
  try {
    const html = await fetchHTML(TARGET);
    const info = extractInfo(html);
    const row = {
      ts: startedAt.toISOString(),
      ...info,
    };
    history.push(row);
    if (history.length > 20) history.shift();
    lastRunInfo = { ok: true, ts: row.ts };
    console.log('Scrape OK', row.ts, '-', row.title);
  } catch (err) {
    console.error('Scrape ERROR', err.message);
    lastRunInfo = { ok: false, ts: startedAt.toISOString(), error: err.message };
  }
}

const server = http.createServer(async (req, res) => {
  if (req.url.startsWith('/refresh')) {
    await runScrape();
    res.writeHead(302, { Location: '/' });
    return res.end();
  }

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`<!doctype html>
<html lang="es">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<title>Ejercicio 4 – Web scraping</title>
<style>
  body{font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:920px;margin:40px auto;padding:0 16px;line-height:1.5}
  table{border-collapse:collapse;width:100%} th,td{border:1px solid #ddd;padding:8px;vertical-align:top}
  th{background:#f5f5f5;text-align:left}
  code{background:#f3f4f6;padding:.1rem .35rem;border-radius:.35rem}
  .meta{opacity:.75}
  .btn{display:inline-block;padding:.45rem .8rem;border:1px solid #ddd;border-radius:.5rem;text-decoration:none}
</style>
</head>
<body>
  <h1>Scraper periódico</h1>
  <p>Objetivo: <a href="${TARGET}" target="_blank" rel="noopener">${TARGET}</a></p>
  <p>
    <a class="btn" href="/refresh">⟳ Capturar ahora</a>
    <span class="meta">Se captura automáticamente cada 5 minutos.</span>
  </p>

  <h2>Último resultado</h2>
  ${history.length === 0 ? '<p class="meta">Aún no hay datos. Pulsa “Capturar ahora”.</p>' : `
    <p><strong>Título:</strong> ${escapeHtml(history[history.length-1].title)}</p>
    <p><strong>H1:</strong> ${escapeHtml(history[history.length-1].h1)}</p>
    <p><strong>Primer párrafo:</strong> ${escapeHtml(history[history.length-1].firstPara)}</p>
    <p><strong># enlaces:</strong> ${history[history.length-1].linksCount} · <strong># subtítulos (h2/h3):</strong> ${history[history.length-1].headingsCount}</p>
  `}

  <h2>Historial (máx. 20)</h2>
  <table>
    <thead><tr><th>Fecha</th><th>Título</th><th>H1</th><th>#enlaces</th><th>#h2/h3</th></tr></thead>
    <tbody>
      ${history.map(r => `
        <tr>
          <td><code>${r.ts}</code></td>
          <td>${escapeHtml(r.title)}</td>
          <td>${escapeHtml(r.h1)}</td>
          <td>${r.linksCount}</td>
          <td>${r.headingsCount}</td>
        </tr>
      `).join('')}
    </tbody>
  </table>

  <p class="meta">Última ejecución: ${
    lastRunInfo ? `${lastRunInfo.ts} ${lastRunInfo.ok ? '✅' : '❌ ' + lastRunInfo.error}` : '—'
  }</p>
</body>
</html>`);
});


function escapeHtml(s='') {
  return s.replace(/[&<>"']/g, (c) => (
    { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#39;' }[c]
  ));
}

server.listen(PORT, () => {
  console.log(`Servidor en http://localhost:${PORT}`);
});


runScrape();
setInterval(runScrape, 5 * 60 * 1000);
