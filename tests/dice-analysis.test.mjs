// Table fără frontiere 2.0.0 — analiza zarurilor: câte din cele 36 de aruncări ale adversarului lovesc poziția aleasă.
// Rulare: node tests/dice-analysis.test.mjs [dir]   (rețea blocată, file://)
import {createRequire} from "module"; const require = createRequire(process.env.PW_ROOT || import.meta.url); const {chromium} = require("playwright");
let fails = 0; const check = (n, c, x) => { c ? console.log("  ok  " + n) : (fails++, console.log("FAIL  " + n + (x !== undefined ? "  -> " + JSON.stringify(x) : ""))); };
const b = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || undefined, args: ["--no-sandbox"]});
for (const loc of ["ro-RO", "en-US", "de-DE"]) {
  const ctx = await b.newContext({locale: loc, viewport: {width: 1200, height: 900}}); await ctx.route(/^https?:/, r => r.abort());
  const p = await ctx.newPage(); const errs = []; let native = 0; p.on("pageerror", e => errs.push(String(e))); p.on("dialog", d => { native++; d.dismiss(); });
  await p.goto("file://" + (process.argv[2] || process.cwd()) + "/index.html"); await p.waitForTimeout(800);
  const r = await p.evaluate(() => {
    const mk = (key, put) => { const s = newGame(key); for (let q = 1; q <= 24; q++) s.points[q] = {top: 0, n: 0, trapped: 0}; s.bar = {1: 0, "-1": 0}; put(s); return s; };
    const place = (s, pt, c, n) => { s.points[pt] = {top: c, n, trapped: 0}; };
    // alb (1) merge 24->1, negru (-1) 1->24; blot alb la 10, negru la 4: distanța 6 => 17 aruncări
    const A = mk("backgammon", s => { place(s, 10, 1, 1); place(s, 4, -1, 1); place(s, 20, 1, 2); place(s, 22, -1, 2); });
    const B = mk("backgammon", s => { place(s, 5, 1, 1); place(s, 4, -1, 1); place(s, 20, 1, 2); place(s, 22, -1, 2); });
    const C = mk("backgammon", s => { place(s, 3, 1, 2); place(s, 20, -1, 2); });  // fără contact: negru e deja dincolo
    const D = mk("backgammon", s => { place(s, 10, 1, 2); place(s, 4, -1, 1); place(s, 20, 1, 2); place(s, 22, -1, 2); }); // punct închis, fără blot
    const out = {a: shotInfo(A, 1).n, b: shotInfo(B, 1).n, c: shotInfo(C, 1) && shotInfo(C, 1).n, d: shotInfo(D, 1).n, race: shotInfo(newGame("fevga"), 1)};
    // DOM
    startVariant("backgammon"); ui.human = 1; ui.busy = false; ui.awaitRoll = false; A.turn = 1; ui.state = A;
    const mv = {from: 20, to: 19, die: 1}; ui.turnCtx = {played: [mv], seqs: [{moves: [mv], state: A}, {moves: [{from: 20, to: 14, die: 6}], state: D}], subRoll: [1, 6]};
    ui.turnCtx.played = [{from: 20, to: 14, die: 6}]; ui.turnCtx.seqs[1].moves = [{from: 20, to: 14, die: 6}]; ui.state = D;
    renderDiceAn();
    const box = document.getElementById("diceAn");
    out.shown = !box.classList.contains("hidden"); out.txt = document.getElementById("daTxt").textContent; out.marks = box.querySelectorAll(".dagrid i.h").length;
    ui.state = A; ui.turnCtx.played = [mv]; ui.turnCtx.seqs[0].state = A; renderDiceAn();
    out.txt2 = document.getElementById("daTxt").textContent; out.marks2 = box.querySelectorAll(".dagrid i.h").length; out.aria = document.getElementById("daGrid").getAttribute("aria-label");
    return out;
  });
  check(loc + ": blot la distanța 6 = 17/36", r.a === 17, r);
  check(loc + ": blot adiacent (1) = 11/36", r.b === 11, r.b);
  check(loc + ": fără contact = 0", r.c === 0 && r.d === 0, r);
  check(loc + ": familie cursă => fără analiză de lovire (null)", r.race === null, r.race);
  check(loc + ": panou afișat; poziție sigură cu mesaj", r.shown && r.marks === 0 && /\S/.test(r.txt), r);
  check(loc + ": poziție cu blot: 17 celule marcate și text cu 17", r.marks2 === 17 && /17/.test(r.txt2) && /17/.test(r.aria || ""), r);
  check(loc + ": fără erori / alerte native", errs.length === 0 && native === 0, {errs, native});
  await ctx.close();
}
await b.close(); console.log(fails ? fails + " eșecuri" : "toate trecute"); process.exit(fails ? 1 : 0);
