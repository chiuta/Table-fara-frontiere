// Table fără frontiere 1.2.6 — preferințe corupte. Rulare: node prefs.test.mjs <dir>   (rețea blocată, file://)
import {createRequire} from "module"; const require = createRequire("/opt/node-tools/package.json"); const {chromium} = require("playwright");
let fails = 0; const check = (n, c, x) => { c ? console.log("  ok  " + n) : (fails++, console.log("FAIL  " + n + (x !== undefined ? "  -> " + JSON.stringify(x) : ""))); };
const b = await chromium.launch({executablePath: "/opt/pw-browsers/chromium"});
async function run(v) {
  const ctx = await b.newContext(); await ctx.route(/^https?:/, r => r.abort());
  await ctx.addInitScript(s => localStorage.setItem("table-fara-frontiere.prefs", s), v);
  const p = await ctx.newPage(); const errs = []; p.on("pageerror", e => errs.push(String(e)));
  await p.goto("file://" + process.argv[2] + "/index.html"); await p.waitForTimeout(700);
  const r = await p.evaluate(() => ({theme: document.documentElement.dataset.theme, size: document.documentElement.dataset.size, diff: ui.diff, pressed: [...document.querySelectorAll("#diffSeg button")].filter(x => x.getAttribute("aria-pressed") === "true").length}));
  await ctx.close(); return {r, errs};
}
let o = await run(JSON.stringify({theme: "zzz", size: "zzz", diff: "zzz"}));
check("valori necunoscute: temă/mărime rămân valide", ["dark", "light"].includes(o.r.theme) && ["small", "normal", "large"].includes(o.r.size), o.r);
check("dificultate necunoscută: un buton este selectat", o.r.pressed === 1 && ["incepator", "mediu", "avansat", "expert"].includes(o.r.diff), o.r);
o = await run(JSON.stringify({theme: "light", size: "large", diff: "expert"}));
check("valori valide sunt păstrate", o.r.theme === "light" && o.r.size === "large" && o.r.diff === "expert", o.r);
for (const v of ["null", "5", "[1]", "{"]) { o = await run(v); check("fără erori: " + v, o.errs.length === 0 && o.r.pressed === 1, o); }
await b.close(); console.log(fails ? fails + " eșecuri" : "toate trecute"); process.exit(fails ? 1 : 0);
