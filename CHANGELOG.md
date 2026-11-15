# Changelog — Table fără frontiere

Format: [SemVer](https://semver.org/lang/ro/) MAJOR.MINOR.PATCH. Istoricul versiunilor 1.x se află în secțiunea „Istoric / Changelog” din `README.ro.md`.

## 2.2.1 — 2026-11-15

- New: social-sharing buttons (vertical, on the left edge; no external scripts, plain links opened only on click); the magnifier zoom and “fit screen” bar returns to the right edge, vertically centred; fixed overlapping layout at high zoom (panels sized in vh/vw no longer overflow the screen).

## 2.2.0 — 2026-11-15

- New: accessibility on every screen — the “Aa” button (text size, high contrast, no animations, readable text, underlined links, read aloud), a “Back to top” arrow and “Skip to content”; the window always fits the screen; the magnifier zoom and “fit screen” controls now sit on the left edge (fff-kit 1.6.0).

## 2.1.8 — 2026-11-15

- Nou: texturi fractale hiper-detaliate (fff-texturi 1.1.2) — fundalul și suprafețele mari (carduri, panouri, antete, butoane; filele și dialogurile ascunse la încărcare, când se deschid) primesc un material generat local (WebGL2, fără rețea și fără imagini), care se repetă fără cusătură; culorile aplicației rămân ale ei. Se oprește din dialogul „Transparență” sau cu `?notex=1`.

## 2.1.1 — 2026-11-03

Turneu și clasament Elo local (motor comun de jocuri), rezultate notate de mână

## 2.1.0 — 2026-11-02 (reîmprospătare kit)

- Nou (kit): **Sincronizare între dispozitive** (`FFF.sync`) — în dialogul «Transparență» (clic pe versiune → Copie de siguranță): conectezi două dispozitive direct (WebRTC, cod/QR, fără server și fără cont) și își schimbă datele aplicației; cea mai recentă valoare câștigă, secretele (chei API, parole) nu se trimit, ștergerile nu se propagă. Aplicarea trece prin importul kitului (confirmare, chei permise, rollback).
- Nou (kit): **Istoric local — «mașina timpului»** (`FFF.history`) — instantanee automate ale datelor (IndexedDB, fără secrete), diferență față de starea curentă și restaurare reversibilă; «Șterge datele aplicației» șterge și istoricul.
- Module adăugate: `qr`, `p2p`, `sync`, `history` (+~140 KB). Versiunea aplicației nu se schimbă.

## 2.1.0 — 2026-10-27

### Adăugat
- **Variantele românești evidențiate:** panou „Variantele românești” deasupra listei (cu butoane directe de joc pentru *Table (românesc)* și *Table pe duse (lungi)*), card cu margine aurie și insignă 🇷🇴 pentru variantele cu eticheta `ro`. Filtrul „Românești” rămâne.
- **Table mijlocite — reguli de confirmat.** Panoul spune explicit că această variantă nu este implementată: am căutat o descriere verificabilă (articole generale și regulamente de competiție în limba română) și nu am găsit-o, deci nu am inventat reguli. Va fi adăugată doar cu o sursă.
- **Analiza mutărilor:** după fiecare tură a ta, aplicația compară poziția aleasă cu celelalte poziții posibile la aceeași aruncare, folosind aceeași evaluare ca AI-ul didactic (evaluare statică + cel mai bun răspuns al adversarului, pentru cele mai bune 8 candidate și pentru alegerea ta). Arată calificativul (cea mai bună / bună / inexactă / greșeală), pierderea în puncte ale evaluării, locul și alegerea AI-ului; la sfârșit, rezumatul și pierderea medie. Este euristică, nu un motor de turneu, iar textul din aplicație o spune. Comutator „Analiză după fiecare tură” (salvat în preferințe, cheia `an`). Turele forțate (o singură poziție finală posibilă) sunt marcate ca atare.
- Texte în cele 8 limbi (fr/it/es/pt/hu/de: traduceri automate, neverificate nativ).
- Teste noi: `tests/move-analysis.test.mjs` (variante românești, analiză determinist pe 5 variante, ture forțate, calibrare, tururi reale, comutator).

### Neschimbat
- Motorul, AI-ul, analiza zarurilor (2.0.0). Offline: un singur `index.html`, fără CDN, fără urmărire, fără conturi. Hash-urile CSP ale scripturilor inline au fost recalculate.
- „Mod multiplayer local unificat” între jocuri: **planificat**, nu implementat.
