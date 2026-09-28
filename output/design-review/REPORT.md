# REKOREALITY — revize designu a obsahu

28. září 2026 · lokální pracovní verze

[Otevřít web](../../index.html) · [Prohlédnout všechny screenshoty](index.html)

## Co se změnilo

Texty všech sedmi stránek prošly revizí podle [no-ai-slop](https://github.com/petergyang/no-ai-slop). Skill je zaměřený na psaní: odstranili jsme obecné slogany, dramatické fragmenty a opakované ujišťování. Zachovali jsme konkrétní informace o financování oprav, zástavě, nákladech a riziku nižšího výsledku. Kontrola proti `eval.md` prošla; žádné nové statistiky, reference ani obchodní garance nebyly doplněny.

Každá stránka má rozložení podle svého účelu. Úvod pracuje s fotografiemi a příkladem vypořádání, průběh spolupráce s časovou osou, stránka majitelů s výběrem situace a stránka makléřů s rozdělením odpovědností. Časté otázky mají hledání bez diakritiky a podporu běžných skloňovaných výrazů.

Žádost má tři základní údaje, volbu e-mailu nebo telefonu a nepovinný popis domu. Kalkulačka přijímá přímé částky i posuvníky, vysvětluje rozdělení ceny a zobrazuje scénáře nižšího i vyššího prodeje. Fotografie lze zvětšit a procházet klávesnicí. Drobné texty byly zvětšeny a navigace upravena pro úzké displeje.

## Screenshoty

Finální snímky pocházejí z Chromu při šířkách 1440 a 390 CSS px. Zachycují skutečně vykreslený web.

| Stránka | Desktop | Mobil |
| --- | --- | --- |
| Úvod | [Celá stránka](index-desktop.png) | [Celá stránka](index-mobile.png) |
| Jak to funguje | [Celá stránka](jak-to-funguje-desktop.png) | [Celá stránka](jak-to-funguje-mobile.png) |
| Pro majitele | [Celá stránka](pro-majitele-desktop.png) | [Celá stránka](pro-majitele-mobile.png) |
| Pro makléře | [Celá stránka](pro-maklere-desktop.png) | [Celá stránka](pro-maklere-mobile.png) |
| Kalkulačka | [Celá stránka](kalkulacka-desktop.png) | [Celá stránka](kalkulacka-mobile.png) |
| Časté otázky | [Celá stránka](faq-desktop.png) | [Celá stránka](faq-mobile.png) |
| Žádost | [Celá stránka](poptavka-desktop.png) | [Celá stránka](poptavka-mobile.png) |

## Ověření

- Sedm stránek při šířkách 320, 390, 767, 990 a 1440 CSS px: bez vodorovného přetékání. Kontrolovány také spodní části stránek.
- 255 lokálních odkazů a zdrojů včetně kotev a `srcset`: bez chyb. Žádná duplicitní ID.
- Formulář: prázdné údaje, souhrn chyb, přesun fokusu, e-mail, telefon, přehled údajů, úprava a vymazání. Vstup pro makléře předvybere správnou roli.
- Kalkulačka: výchozí výsledek 4 446 800 Kč, nižší prodejní cena, schodek, osmimístný výsledek, neplatný vstup a obnova příkladu. Částky a jejich význam zůstávají čitelné i při 320 px.
- Menu a galerie: otevření, zavření klávesou Escape a návrat fokusu. Výběr situace podporuje šipky. Hledání otázek zvládá dotaz „zastava“, prázdný výsledek i reset.
- Aktivní JavaScript prošel kontrolou syntaxe, konzole při finální prohlídce nehlásila chyby ani varování. `git diff --check` prošel.

## Stav před spuštěním

Web je lokální prototyp. Formulář údaje neodesílá ani neukládá; příjem žádostí vyžaduje připojení serveru nebo CRM. Fotografie jsou označené AI ilustrace, nikoli doložené realizace. Další body před ostrým spuštěním jsou uvedeny v hlavním README.
