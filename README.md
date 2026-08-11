# REKOREALITY — web prototyp

Statický web bez build kroku. Otevřete `index.html` v prohlížeči.

**Živá verze:** <https://majkpowa.github.io/rekoreality/>

## Nasazení

Hostováno na GitHub Pages z větve `main`, složka `/` (kořen). Publikace = `git push` na `main`;
build se spustí sám a trvá zpravidla do minuty.

```bash
git add -A && git commit -m "popis změny" && git push
```

Web je **záměrně mimo vyhledávače**: každá stránka nese `<meta name="robots" content="noindex, nofollow">`.
Procházení v `robots.txt` je povolené schválně — kdyby bylo zakázané, crawler by meta tag nikdy nepřečetl
a URL by se do výsledků mohla dostat i tak. Odkaz tedy funguje komukoli, kdo ho dostane, ale web
nikdo nenajde přes Google. Před ostrým spuštěním je potřeba `noindex` ze všech `.html` odstranit.

Repozitář je veřejný, protože GitHub Pages na bezplatném účtu ze soukromého repozitáře nefungují.
Obsah včetně obchodního modelu je tedy technicky veřejně čitelný.

## Struktura

```
index.html            Úvodní stránka (hero, trust strip, proces, scénáře, bento, modelový výpočet, zástava, FAQ)
jak-to-funguje.html   10 fází s branami, rozhodovací matice, vstupní kritéria, skóre 100 b., právní rámec
pro-majitele.html     B2C stránka — co získáte, 7 kroků, vhodnost, 7 otázek před podpisem
pro-maklere.html      Partner promise, proces se SLA, nástroje, referral ekonomika, intake formulář
kalkulacka.html       Interaktivní kalkulačka vypořádání + 6krokový formulář posouzení
faq.html              14 odpovědí ve 3 skupinách + zdroje
assets/css/style.css  Design systém (tokeny, komponenty, responsivita)
assets/js/main.js     Navigace, reveal animace, carousel, akordeon, kalkulačka
assets/img/*.svg      Vektorové vizuály (zástupné za fotografie)
```

## Vizuální systém

Layout, typografie a kompozice vycházejí z dodaných referenčních maket: plovoucí tmavá nav pilulka
s logem uprostřed, hero s modrým gradientem a skleněnými kartami, pastelové gradientní panely,
bento grid, nakloněné karty v carouselu, editorial nadpisy kombinující geometrický sans s kurzívní
patkovou antikvou.

- Písma: **Poppins** (nadpisy), **Manrope** (text/UI), **Instrument Serif** kurzíva (akcenty) — z Google Fonts.
- Barvy a rádiusy jsou v `:root` v `style.css`. Tokeny z brand manuálu (`#1C211F` ink, `#F5F1E9` cream,
  `#738D7E` sage, `#E86E4D` terracotta) jsou v souboru k dispozici jako `--terracotta` a `--sage`;
  hlavní paleta ale záměrně sleduje referenční makety. Změna na brand paletu = úprava tokenů, ne šablon.

## 3D modely domů

Domy nejsou obrázky, ale procedurální 3D scény (Three.js, WebGL).

```
assets/js/houses3d.js         engine — sdílený renderer, kamera, časová osa, boot
assets/js/houses3d.lib.js     materiály (M), stavební pomocníci (U), časová osa
assets/js/houses3d.models.js  jednotlivé modely + registr MODELS
dev/preview.mjs               vývojový ASCII náhled (žádná stránka ho nelinkuje)
```

**Jeden WebGL kontext pro všechny sloty.** Engine renderuje do jednoho offscreen
framebufferu a výsledek přenáší do 2D canvasu každého slotu (`drawImage`). Renderuje
se jen to, co je právě ve výřezu; při skryté kartě se smyčka zastaví.

**Plovoucí diorama.** Scény nemají nekonečný terén — stojí na zaobleném pozemku
(`U.plot`) s měkkým stínem (`U.softShadow`) a průhledným pozadím, takže prosvítá
gradient karty. Bez toho se trávník přepaloval a vyplnil 70 % plochy.

**Fallback.** Každý slot obsahuje původní SVG jako poster. Když chybí WebGL, selže
CDN nebo prohlížeč neumí ES moduly, zůstane viditelný obrázek a nic se nerozbije.
Model se vykreslí až po prvním úspěšném snímku (`.is-live`).

**Cena:** three.js z CDN ≈ 257 kB (gzip). Verze je připnutá v importmapě v `index.html`.

### Modely

| Klíč | Slot | Meshů | Obsah |
|---|---|---|---|
| `villa` | hero | 151 | simulace před → po (viz níže) |
| `gable` | karta 1 | 113 | zděděný dům se sedlovou střechou, garáž, komín, anténa |
| `poolvilla` | karta 2 | 103 | moderní vila s bazénem, dřevo + beton |
| `bungalow` | karta 3 | 75 | přízemní bungalov s markýzou a živým plotem |
| `townvilla` | karta 4 | 114 | městská vila, cihlový sokl, kus ulice se stromořadím |
| `cube` | showcase | 86 | kubická vila s vodním prvkem |
| `aerial` | bento | 105 | ptačí pohled na pět domů, cesty, bazény, solární panely |

Nový model = přidat `build…(THREE, M, U)` do `houses3d.models.js` a zaregistrovat
ho v `MODELS` s `view` a `radius`. Kompozici lze ladit bez screenshotů:

```js
const p = await import('/dev/preview.mjs');
await p.preview('cube', { aspect: 900/620, cols: 60, rows: 16 });
```

### Simulace „před → po" v hero

Hero model má dvě fáze označené `userData.phase = 'old' | 'new'`. Engine je prolíná
vlnou, která postupuje zleva doprava — každý prvek se mění podle své pozice na ose X.
Původní dům z konce 70. let se sedlovou střechou se promění v dvoupodlažní vilu
s terasou a bazénem.

Cyklus: rozjezd 7,5 s → výdrž 3,4 s na hotovém stavu → přetočení 1,1 s. Posuvník
v hero umožňuje fázi přetáhnout ručně (tím se přehrávání pozastaví).
Při `prefers-reduced-motion` se rovnou zobrazí hotový stav a nic se nehýbe.

Obě skleněné karty jsou na simulaci navázané (`house3d:progress`):

| Postup | Hodnota | Investice | Vytvořená hodnota |
|---|---|---|---|
| 0 % | 6 500 000 Kč | 0 Kč | 0 Kč |
| 50 % | 8 000 000 Kč | 750 000 Kč | 458 500 Kč |
| 100 % | 9 500 000 Kč | 1 500 000 Kč | 1 148 500 Kč |

Čísla používají stejný vzorec jako kalkulačka (externí náklady 3,7 % z ceny), takže
hero a `kalkulacka.html` nemohou ukázat rozdílný výsledek. Karta je označená
**„Modelový příklad"** — nejde o příslib zhodnocení, což by odporovalo kapitole 12
blueprintu.

## Obrázky

`assets/img/*.svg` jsou vektorové architektonické vizuály, aby web fungoval offline a bez externích
závislostí. Pro ostrou verzi je nahraďte skutečnými fotografiemi českých domů (stejné názvy, přípona
`.jpg`/`.webp`, a v HTML upravte `src`):

| Soubor | Použití | Doporučený poměr |
|---|---|---|
| `hero-house.svg` | hero na úvodní stránce | 1600 × 760 |
| `dream-house.svg` | showcase banner (průhledné pozadí) | 900 × 620 |
| `prop-1…4.svg` | karty typových scénářů | 800 × 520 |
| `aerial.svg` | bento karta „Data z lokality" | 700 × 900 |

## Kalkulačka

Vzorec odpovídá blueprintu:

```
čistá vytvořená hodnota = kupní cena − výchozí hodnota − schválená investice − externí náklady prodeje
majitel  = výchozí hodnota + 60 % z kladné čisté hodnoty
REKO     = návrat investice + 40 % z kladné čisté hodnoty
```

Externí náklady jsou počítány jako **procento z kupní ceny** (výchozí 3,7 %), proto se prodejní minimum
počítá jako `(výchozí hodnota + investice) / (1 − sazba)` = 8 307 373 Kč pro modelový případ.
Blueprint uvádí 8 350 000 Kč, protože pracuje s fixní částkou 350 000 Kč. Obojí je konzistentní,
liší se jen model nákladů.

Při **záporné** čisté hodnotě kalkulačka nezobrazuje majiteli plnou výchozí hodnotu: schválená investice
se z kupní ceny vypořádává tak jako tak, takže majiteli zbývá `výchozí hodnota + (záporná čistá hodnota)`.
REKOREALITY v takovém případě nemá nárok na podíl ze zisku.

## Co web záměrně netvrdí

Podle kapitoly 12 blueprintu se na webu nevyskytuje „zdarma", „bez rizika", „garantujeme vyšší cenu",
„zástava je jen formalita" ani konkrétní procento zhodnocení či doba prodeje. Scénáře v carouselu jsou
označené jako **modelové**; skutečné případové studie mají nahradit až doložené pilotní projekty.

## Otevřené body před ostrým spuštěním

1. **Regulatorní stanovisko** k zákonu č. 257/2016 Sb. (odložená platba spotřebiteli zajištěná nemovitostí).
   Bez něj se web nemá spustit — je to launch gate č. 1 blueprintu.
2. Daňové a účetní memorandum včetně DPH a účtování success share.
3. Napojení formulářů na backend/CRM (nyní jen klientská demonstrace, nic se neodesílá ani neukládá).
4. Doplnit skutečné IČO, sídlo, odpovědné osoby, pojištění a reklamační proces do patičky.
5. Nahradit zástupné vizuály fotografiemi a doplnit `Organization` / `Service` / `FAQPage` schema.
