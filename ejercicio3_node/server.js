const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const PORT = process.env.PORT || 3000;
const DICT_PATH = path.join(__dirname, 'words.txt');


let DICT = [];
try {
  const txt = fs.readFileSync(DICT_PATH, 'utf8');
  DICT = txt.split(/\r?\n/).map(w => w.trim()).filter(Boolean);
  if (DICT.length === 0) {
    console.error('El diccionario está vacío. Añade palabras a words.txt');
    process.exit(1);
  }
} catch (err) {
  console.error('No se pudo leer words.txt. Asegúrate de que existe en la misma carpeta.');
  process.exit(1);
}


function pickWords(n) {
  const max = DICT.length;
  const N = Math.max(1, Math.min(Number(n) || 4, max));
  const used = new Set();
  const out = [];
  while (out.length < N) {
    const i = Math.floor(Math.random() * max);
    if (!used.has(i)) { used.add(i); out.push(DICT[i]); }
  }
  return out;
}

function formatPassword(words) {
  return words.join('-');
}

const server = http.createServer((req, res) => {

  const url = new URL(req.url, `http://${req.headers.host}`);
  const xParam = url.searchParams.get('x');

  const words = pickWords(xParam);
  const password = formatPassword(words);

  res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
  res.end(`
    <!doctype html>
    <html lang="es">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Ejercicio 3 – Contraseña</title>
        <style>
          body{font-family:system-ui,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:680px;margin:48px auto;padding:0 16px;line-height:1.5}
          .pwd{font-size:1.8rem;font-weight:800;letter-spacing:.5px}
          a{color:#0a58ca;text-decoration:none} a:hover{text-decoration:underline}
          code{background:#f3f4f6;padding:.15rem .35rem;border-radius:.35rem}
        </style>
      </head>
      <body>
        <h1>Tu contraseña aleatoria con palabras raras</h1>
        <p class="pwd">${password}</p>
        <hr/>
        <p><strong>¿Quieres cambiar el número de palabras (X)?</strong> Añade <code>?x=6</code> al final de la URL.</p>
        <p>Ejemplos: <a href="/?x=3">/?x=3</a> · <a href="/?x=6">/?x=6</a> · <a href="/?x=8">/?x=8</a></p>
        <p style="opacity:.75">Si no indicas <code>x</code>, usaré 4 por defecto.</p>
      </body>
    </html>
  `);
});

server.listen(PORT, () => {
  console.log(`Servidor escuchando en http://localhost:${PORT}`);
});
