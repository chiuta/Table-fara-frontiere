# Changelog — Table fără frontiere

Format: [SemVer](https://semver.org/lang/ro/) MAJOR.MINOR.PATCH. Istoricul versiunilor 1.x se află în secțiunea „Istoric / Changelog” din `README.ro.md`.

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
