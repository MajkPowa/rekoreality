# REKO Reality — redesign a ověření, 6. října 2026

## Co se změnilo

Úvod nejprve vysvětluje rekonstrukci nemovitosti před prodejem. Druhá sekce představuje aktuální nabídku dvou dokončených realizací: dům v Hlinsku a byt v Karlštejně. Majitel pokračuje k posouzení vlastního domu; kupující k detailu a domluvě prohlídky přes konkrétní inzerát na Sreality.cz.

Web má sjednocenou navigaci, bílý a zelený vizuální systém, písmo Manrope, kratší servisní stránky, nový katalog s filtry a dva detaily s fotogalerií, cenou a standardizovanými parametry. Poradna a šest článků zůstávají součástí stejného webu. Skutečné fotografie nahrazují dřívější AI ilustrace ve veřejných stránkách; jejich původ eviduje `assets/img/properties/CREDITS.md`.

## Ověřené designové reference

| Reference a doložené ocenění | Použitý princip |
| --- | --- |
| [Mhitar Investments — CSS Design Awards, Special Kudos, 7.44/10, 7. 2. 2023](https://www.cssdesignawards.com/sites/mhitar-investments-lda/42871/) | Výrazná fotografie, přehledná prezentace konkrétních projektů a jejich stavu. |
| [Silver Pinewood Residences — Awwwards, Site of the Day, 7.25/10, 9. 10. 2025](https://www.awwwards.com/sites/silver-pinewood-residences) | Fotografie a prostorová hierarchie, krátké texty a viditelné navazující kroky. |
| [463 West 142 — CSS Design Awards, Special Kudos, 7.72/10, 7. 2. 2024](https://www.cssdesignawards.com/sites/luxury-real-estate/45073/) | Konkrétní informace o dispozici a plochách u jednotlivých nemovitostí. |

Ocenění dokládají hodnocení designových porot, nikoli nejvyšší konverzi nebo provedené testování s českými zájemci. Použité UX zásady vycházejí také z [Baymard: informace v přehledu produktů](https://baymard.com/research-articles/product-listing-information) a [NN/g: heuristiky použitelnosti](https://www.nngroup.com/articles/ten-usability-heuristics/). Přenesení principů e-commerce výpisu do nabídky nemovitostí je naše návrhová volba. Obsah používá konkrétní formulace podle [no-ai-slop](https://github.com/petergyang/no-ai-slop).

## Kontrola

- V prohlížeči zkontrolováno všech 17 veřejných stránek při šířkách 1440, 768, 390 a 320 px. Žádné vodorovné přetékání celé stránky. Při 320 px je jedna široká článková tabulka samostatně vodorovně posuvná.
- Uloženy celostránkové screenshoty všech 17 stránek pro desktop a mobil. Prošly samostatnou vizuální kontrolou. Naměřené údaje jsou v `browser-checks.json` a `responsive-checks.json`.
- Ověřeny všechny obrázky zobrazené ve výpisech a detailech; 16 fotografií má dvě responzivní velikosti. Žádný chybějící lokální asset.
- Statická kontrola: 851 interních odkazů a asset referencí, 67 kotev, žádné chybějící cíle ani duplicitní ID, platné ARIA vazby, jeden hlavní nadpis na každé stránce.
- Ceny a všech 21 parametrů obou nabídek souhlasí se zdrojovými daty. Údaje jsou označené datem ověření a odkazy na původní inzeráty.
- Filtr bytů zobrazí jednu nabídku, aktualizuje počet i URL a zůstává zvolený po obnovení stránky. Návrat na všechny nabídky funguje.
- Galerie: otevření, další/předchozí fotografie, šipky klávesnice, zavření Escape a návrat fokusu na původní tlačítko.
- Mobilní menu: otevření, zavření Escape a návrat fokusu. Opravena příliš těsná hlavička na mobilu; navigace má viditelný text Menu / Zavřít.
- FAQ: dotaz `zastava` najde dvě odpovědi; neexistující dotaz zobrazí srozumitelný prázdný stav.
- Žádost: prázdný formulář označí čtyři požadovaná pole včetně souhlasu a zaměří první chybu; platné testovací údaje vedou výslovně k neodeslanému demo výsledku. Vymazání odstraní vyplněné hodnoty. Kliknutí na text souhlasu funguje.
- Kalkulačka: výchozí model dává majiteli 4 446 800 Kč. Při prodejní ceně 4 000 000 Kč dává 2 952 000 Kč, odměna REKO z kladného rozdílu je 0 Kč a ztráta je výslovně uvedená. Obnovení příkladu funguje.
- JavaScript prošel syntaktickou kontrolou. Opakované generování webu nemění výstup. `git diff --check` bez chyb.
- Sitemap obsahuje 10 indexovatelných URL se správnými canonical adresami. Deset JSON-LD bloků je syntakticky validních.

Všechny náhledy byly znovu pořízené po posledních vizuálních úpravách. Velmi dlouhé mobilní screenshoty mohou mít za koncem stránky prázdný pás z exportu.

## Provozní stav

Formulář posouzení zůstává ukázkový a neodesílá žádosti. Prohlídky aktuálních nemovitostí vedou na veřejný inzerát příslušné nemovitosti. Sedm původních servisních stránek zachovává `noindex, follow`; katalog, dva detaily a sedm stránek poradny umožňují indexaci. Ceny a dostupnost se mohou po datu ověření změnit.

## Náhledy

- [Úvod desktop](index-desktop.jpg) · [Úvod mobil](index-mobile.jpg)
- [Nabídka desktop](nemovitosti-desktop.jpg) · [Nabídka mobil](nemovitosti-mobile.jpg)
- [Hlinsko desktop](nemovitosti--hlinsko-kouty-desktop.jpg) · [Hlinsko mobil](nemovitosti--hlinsko-kouty-mobile.jpg)
- [Karlštejn desktop](nemovitosti--byt-karlstejn-desktop.jpg) · [Karlštejn mobil](nemovitosti--byt-karlstejn-mobile.jpg)

Ostatní screenshoty jsou pojmenované podle příslušné URL se zakončením `-desktop.jpg` nebo `-mobile.jpg`.
