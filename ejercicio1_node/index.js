const http = require('http');
const os = require('os');
const process = require('process');

const config = require('./config.json');
const WHAT = Array.isArray(config.show) ? config.show : ["cpu","mem","sysUptime","nodeUptime"];

const PORT = Number(process.env.PORT) || 3000;
const INTERVAL_MS = (Number(process.env.INTERVAL) || Number(config.intervalSeconds) || 5) * 1000;

const mb = n => (n / 1024 / 1024).toFixed(1) + ' MB';
const s  = n => `${Math.floor(n)}s`;

const server = http.createServer((req, res) => {
  res.writeHead(200, {'Content-Type':'application/json'});
  res.end(JSON.stringify({ ok: true, now: new Date().toISOString() }));
});

server.listen(PORT, () => {
  console.log(`\nServer running at http://localhost:${PORT}`);
  console.log(`Node: ${process.version}`);
  console.log(`Platform: ${os.platform()} ${os.release()} (${os.arch()})`);
  console.log(`CPU cores: ${os.cpus().length}`);
  console.log(`RAM total: ${(os.totalmem()/1e9).toFixed(1)} GB\n`);
});

setInterval(() => {
  const parts = [];
  if (WHAT.includes('cpu')) {
    const { user, system } = process.cpuUsage();
    parts.push(`CPU user=${(user/1e6).toFixed(2)}s system=${(system/1e6).toFixed(2)}s`);
  }
  if (WHAT.includes('mem')) {
    const m = process.memoryUsage();
    parts.push(`MEM rss=${mb(m.rss)} heapUsed=${mb(m.heapUsed)}`);
  }
  if (WHAT.includes('sysUptime'))  parts.push(`sysUptime=${s(os.uptime())}`);
  if (WHAT.includes('nodeUptime')) parts.push(`nodeUptime=${s(process.uptime())}`);
  console.log(new Date().toISOString(), '—', parts.join(' | '));
}, INTERVAL_MS);
