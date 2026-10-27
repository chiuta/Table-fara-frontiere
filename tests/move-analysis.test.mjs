// Table fără frontiere 2.1.0 — analiza mutărilor + variantele românești evidențiate. Rulare: node tests/move-analysis.test.mjs [dir]   (rețea blocată, file://)
import {createRequire} from "module"; import path from "node:path"; const require = createRequire(process.env.PW_ROOT || import.meta.url); const {chromium} = require("playwright");
let fails = 0; const check = (n, c, x) => { c ? console.log("  ok  " + n) : (fails++, console.log("FAIL  " + n + (x !== undefined ? "  -> " + JSON.stringify(x) : ""))); };
const b = await chromium.launch({executablePath: process.env.CHROMIUM_PATH || undefined, args: ["--no-sandbox"]});
for (const loc of ["en-US", "ro-RO"]) {
  const ctx = await b.newContext({locale: loc, viewport: {width: 1200, height: 900}}); const net = []; await ctx.route(/^https?:/, r => { net.push(r.request().url()); r.abort(); });
  const p = await ctx.newPage(); const errs = []; p.on("pageerror", e => errs.push(String(e)));
  await p.goto("file://" + path.resolve(process.argv[2] || process.cwd(), "index.html")); await p.waitForTimeout(800);
  console.log("== " + loc);
  // --- variante românești evidențiate ---
  const ro = await p.evaluate(() => ({cards: [...document.querySelectorAll(".card.ro")].map(c => c.querySelector("h2").textContent), badges: document.querySelectorAll(".card.ro .badge.ro-b").length, panel: !!document.getElementById("roPanel") && document.getElementById("roPanel").textContent, nonRo: document.querySelectorAll(".card:not(.ro) .badge.ro-b").length, btns: [...document.querySelectorAll("#roPanel [data-play]")].map(x => x.dataset.play)}));
  check("exact cele 2 variante românești au cardul evidențiat (table_ro, table_duse)", ro.cards.length === 2 && ro.badges === 2 && ro.nonRo === 0 && ro.btns.join() === "table_ro,table_duse", ro);
  check("panoul românesc spune că «table mijlocite» sunt de confirmat și nu sunt implementate", /mijlocite/.test(ro.panel) && /(confirmat|confirmed|nu este implementat|not implemented)/i.test(ro.panel), ro.panel);
  check("«table mijlocite» nu a fost adăugată ca variantă jucabilă", await p.evaluate(() => !Object.keys(VARIANTS).some(k => /mijloc/i.test(k))));
  // --- motorul de analiză ---
  const A = await p.evaluate(() => {
    const out = {};
    for (const key of ["table_ro", "backgammon", "plakoto", "fevga", "misere"]) {
      if (!VARIANTS[key]) { out[key] = {skip: true}; continue; }
      const s = newGame(key); s.firstMove = false; const c = s.turn || 1;
      const roll = [3, 1]; const {seqs} = genTurns(s, roll);
      const states = seqs.map(sq => ({sq, v: evaluate(sq.state, c)})).sort((x, y) => x.v - y.v);
      const worst = states[0].sq, bestStatic = states[states.length - 1].sq;
      const rW = analyzeTurn(seqs, worst.state, c), rW2 = analyzeTurn(seqs, worst.state, c), rB = analyzeTurn(seqs, bestStatic.state, c);
      const all = []; const uniq = new Set(); for (const sq of seqs) { if (uniq.has(boardSig(sq.state))) continue; uniq.add(boardSig(sq.state)); all.push(analyzeTurn(seqs, sq.state, c)); }
      const zero = all.filter(r => r.loss === 0).length, ranks = all.map(r => r.rank).filter(x => x === 1).length;
      out[key] = {n: seqs.length, uniq: uniq.size, worst: [rW.grade, rW.loss, rW.rank], same: JSON.stringify(rW) === JSON.stringify(rW2), bestLoss: rB.loss, minLoss: Math.min(...all.map(r => r.loss)), zero, ranks, bestLen: rW.best.length, nonneg: all.every(r => r.loss >= 0)};
    }
    return out;
  });
  for (const [k, r] of Object.entries(A)) { if (r.skip) continue;
    check(k + ": analiza e determinist și pierderile sunt ≥ 0", r.same && r.nonneg, r);
    check(k + ": cel puțin o alegere are pierdere 0 (cea mai bună) și rangul 1", r.minLoss === 0 && r.zero >= 1 && r.ranks >= 1, r);
    check(k + ": cea mai slabă alegere statică nu e «cea mai bună» când există alternative (" + r.uniq + " poziții)", r.uniq < 2 || r.worst[2] > 1 || r.worst[1] === 0, r); }
  // poziție în care există o singură continuare => „forced”
  const F = await p.evaluate(() => {
    const s = newGame("table_ro"); for (let q = 1; q <= 24; q++) s.points[q] = {top: 0, n: 0, trapped: 0}; s.bar = {1: 0, "-1": 0};
    const ap = s.paths[1][10]; s.points[ap] = {top: 1, n: 1, trapped: 0}; s.off = {1: 14, "-1": 0}; s.points[s.paths[-1][5]] = {top: -1, n: 15, trapped: 0};
    s.turn = 1; s.firstMove = false; const {seqs} = genTurns(s, [2, 3]); const r = analyzeTurn(seqs, seqs[0].state, 1);
    return {n: seqs.length, forced: r.forced, grade: r.grade, loss: r.loss};
  });
  check("tură cu o singură poziție finală posibilă: «forced», pierdere 0", F.forced === true && F.loss === 0 && F.grade === "best", F);
  // calibrare: pe o poziție clar proastă (piesă lăsată la lovit) pierderea trebuie să fie mare
  const G = await p.evaluate(() => {
    const s = newGame("table_ro"); for (let q = 1; q <= 24; q++) s.points[q] = {top: 0, n: 0, trapped: 0}; s.bar = {1: 0, "-1": 0}; s.off = {1: 0, "-1": 0};
    const P = (c, i, n) => { s.points[s.paths[c][i]] = {top: c, n, trapped: 0}; };
    P(1, 12, 2); P(1, 20, 2); P(1, 8, 1); P(1, 3, 2); P(-1, 14, 3); P(-1, 4, 2); P(-1, 10, 2);
    s.turn = 1; s.firstMove = false; const {seqs} = genTurns(s, [4, 2]);
    const rs = seqs.map(sq => analyzeTurn(seqs, sq.state, 1)).filter(Boolean); const ls = rs.map(r => r.loss);
    return {n: seqs.length, max: Math.max(...ls), min: Math.min(...ls), grades: [...new Set(rs.map(r => r.grade))].sort()};
  });
  check("pe o poziție cu alternative, pierderile diferă (min 0, max > 0) și apar cel puțin 2 calificative", G.min === 0 && G.max > 0 && G.grades.length >= 2, G);
  // --- UI: se joacă tururi reale (zaruri aleatoare) până apar 2 analize ---
  await p.evaluate(() => startVariant("table_ro"));
  const t0 = Date.now(); let done = false;
  while (Date.now() - t0 < 120000 && !done) {
    done = await p.evaluate(() => {
      if (ui.anList.length >= 2) return true;
      if (ui.opening || ui.busy) { const r = document.getElementById("btnRoll"); if (!r.disabled && ui.opening) r.click(); return false; }
      if (ui.state && ui.state.turn === ui.human) {
        const r = document.getElementById("btnRoll"), d = document.getElementById("btnDone"), mv = document.querySelector("#moveList button");
        if (d && !d.disabled) { d.click(); return false; }
        if (ui.awaitRoll && !r.disabled) { r.click(); return false; }
        if (mv && ui.turnCtx && !ui.turnCtx.rolling) { mv.click(); return false; }
      }
      return false;
    });
    await p.waitForTimeout(120);
  }
  check("după tururi reale, lista de analize are ≥ 2 intrări", done, await p.evaluate(() => ui.anList.length));
  const dom = await p.evaluate(() => ({li: document.querySelectorAll("#anList li").length, last: document.getElementById("anLast").textContent, sum: document.getElementById("anSum").textContent, vis: getComputedStyle(document.getElementById("anBox")).display}));
  check("panoul de analiză afișează intrările, ultima tură și rezumatul", dom.li >= 2 && /\d/.test(dom.last) && (dom.sum.length > 5 || ui_forcedOnly(dom)), dom);
  // comutator: oprit => nu se mai adaugă analize
  await p.evaluate(() => document.getElementById("anSwitch").click());
  const n1 = await p.evaluate(() => ({an: ui.an, pref: JSON.parse(localStorage.getItem("table-fara-frontiere.prefs")).an, len: ui.anList.length}));
  check("comutatorul oprește analiza și se salvează în preferințe", n1.an === false && n1.pref === false, n1);
  // preferință coruptă pentru 'an' nu strică pornirea
  check("fără erori de pagină", errs.length === 0, errs); check("0 cereri de rețea", net.length === 0, net);
  await ctx.close();
}
function ui_forcedOnly(d) { return /singura|only|une seule/i.test(d.last); }
await b.close(); console.log(fails ? fails + " eșecuri" : "toate trecute"); process.exit(fails ? 1 : 0);
