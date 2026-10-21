/**
 * Runner de las pruebas end-to-end de MenúStock.
 *
 * Levanta la app en un servidor local, abre tests/e2e.html en un
 * navegador headless (Edge o Chrome) y lee el resultado del DOM.
 *
 * Uso:  node tests/run.js
 */

const http = require("node:http");
const fs = require("node:fs");
const path = require("node:path");
const { spawn, execFileSync } = require("node:child_process");

const ROOT = path.resolve(__dirname, "..");
const PORT = 8123;

const BROWSERS = [
    "C:\\Program Files (x86)\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Microsoft\\Edge\\Application\\msedge.exe",
    "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe",
    "C:\\Program Files (x86)\\Google\\Chrome\\Application\\chrome.exe"
];

const MIME = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json; charset=utf-8",
    ".png": "image/png",
    ".jpg": "image/jpeg"
};

function findBrowser() {
    for (const candidate of BROWSERS) {
        if (fs.existsSync(candidate)) return candidate;
    }
    return null;
}

function startServer() {
    return new Promise(resolve => {
        const server = http.createServer((req, res) => {
            const urlPath = decodeURIComponent(req.url.split("?")[0]);
            const filePath = path.join(ROOT, urlPath === "/" ? "index.html" : urlPath);

            if (!filePath.startsWith(ROOT)) {
                res.writeHead(403).end("Forbidden");
                return;
            }

            fs.readFile(filePath, (err, data) => {
                if (err) {
                    res.writeHead(404).end("404");
                    return;
                }
                const ext = path.extname(filePath).toLowerCase();
                res.writeHead(200, { "Content-Type": MIME[ext] || "application/octet-stream" });
                res.end(data);
            });
        });

        server.listen(PORT, () => resolve(server));
    });
}

function runHeadless(browser, url) {
    return new Promise(resolve => {
        const args = [
            "--headless",
            "--disable-gpu",
            "--no-sandbox",
            "--disable-extensions",
            "--virtual-time-budget=15000",
            "--dump-dom",
            url
        ];

        const child = spawn(browser, args, { stdio: ["ignore", "pipe", "pipe"] });
        let stdout = "";
        let stderr = "";
        child.stdout.on("data", d => { stdout += d.toString(); });
        child.stderr.on("data", d => { stderr += d.toString(); });
        child.on("close", () => {
            if (process.env.SHOW_STDERR && stderr.trim()) {
                console.error("--- stderr del navegador ---");
                console.error(stderr.slice(0, 4000));
            }
            resolve(stdout);
        });
    });
}

function extractResults(dom) {
    const match = dom.match(/<pre id="out">([\s\S]*?)<\/pre>/);
    if (!match) return null;
    return match[1]
        .replace(/&lt;/g, "<")
        .replace(/&gt;/g, ">")
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")
        .replace(/&amp;/g, "&");
}

(async () => {
    const browser = findBrowser();
    if (!browser) {
        console.error("No se encontró Edge ni Chrome para correr las pruebas.");
        process.exit(1);
    }

    const server = await startServer();
    console.log(`Servidor de pruebas en http://localhost:${PORT}\n`);

    const dom = await runHeadless(browser, `http://localhost:${PORT}/tests/e2e.html`);
    server.close();

    const results = extractResults(dom);

    if (!results) {
        console.error("No se pudo leer el bloque de resultados (#out).");
        console.error(dom.slice(0, 2000));
        process.exit(1);
    }

    console.log(results);

    const failed = results.split("\n").filter(l => l.startsWith("FALLA"));
    const passed = results.split("\n").filter(l => l.startsWith("OK  "));

    console.log(`\n${passed.length} pasaron, ${failed.length} fallaron.`);
    process.exit(failed.length > 0 ? 1 : 0);
})();
