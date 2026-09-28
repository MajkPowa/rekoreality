# REKOREALITY

Statický web v češtině pro rekonstrukci rodinného domu před prodejem. Bez build kroku a bez frameworku.

[Veřejný náhled na GitHub Pages](https://majkpowa.github.io/rekoreality/)

## Lokální náhled

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Otevřete `http://127.0.0.1:4173/`. Lze také otevřít `index.html` přímo. Pro písma Manrope a Instrument Serif je potřeba připojení; bez něj se použijí systémová písma.

## Stránky a cesta k žádosti

- `index.html`: nabídka, tři fáze spolupráce, fotorealistické ilustrace, modelové vypořádání a hlavní otázky.
- `poptavka.html`: jediná společná žádost; tři povinné údaje, souhlas a nepovinné podrobnosti. Vstup `?role=agent` předvybere makléře.
- `jak-to-funguje.html`: tři fáze a informace potřebné před podpisem.
- `pro-majitele.html`: přínosy, rozhodování, zástava a vhodnost domu.
- `pro-maklere.html`: rozdělení rolí a odkaz na společnou žádost.
- `kalkulacka.html`: samostatný volitelný propočet. Není podmínkou žádosti.
- `faq.html`: otázky po tématech s hledáním bez diakritiky; odpovědi lze otevřít i bez JavaScriptu.

Všechny hlavní akce vedou přímo na krátkou žádost. Staré adresy `kalkulacka.html#formular`, `pro-majitele.html#krok-za-krokem`, `#zastava`, `#kdy-ne` a `pro-maklere.html#intake` zůstávají použitelné.

## Vzhled a média

Základní styly jsou v `assets/css/style.css`, rozložení jednotlivých stránek a responzivní úpravy v `premium.css`. Formulář má `request.css`, kalkulačka `calculator.css`. Sdílené menu zajišťuje `main.js`, galerii, výběr situace a hledání v otázkách `ui.js`. Formulář a kalkulačka mají vlastní skripty. Vzhled používá krémové plochy, tmavou zelenou, čitelnou typografii a statické fotografie místo animovaných 3D maket. Stránky nenačítají Three.js, nespouštějí animované modely a neobsahují skrytý obsah čekající na animaci.

Fotografie jsou **AI ilustrace**, nikoli doložené realizace. Na stránkách jsou tak označené. Web načítá optimalizované WebP s responzivními variantami, PNG originály jsou uložené vedle nich. Přesné prompty, původ a rozměry: [assets/img/IMAGE-CREDITS.md](assets/img/IMAGE-CREDITS.md).

Původní SVG a `houses3d*.js` zůstávají v repozitáři jako starší zdroje, současné stránky je nepoužívají.

## Formulář je ukázka

**Žádost se nikam neodesílá.** Formulář to oznamuje před vyplněním i po kontrole údajů. Nezobrazuje falešné potvrzení přijetí. Klientská validace kontroluje prázdné hodnoty, obec, jméno, e-mail nebo telefon a souhlas. První chybné pole získá fokus, chyby mají vazby ARIA a textový souhrn. Nepovinné údaje nejsou podmínkou pokračování. Bez JavaScriptu zůstává tlačítko vypnuté.

Osobní údaje se neukládají do localStorage, cookies ani na server. Zůstávají v aktuálním formuláři a lze je vymazat. Pro ostré použití je nutné připojit server/CRM, zavést validaci i na serveru a skutečné úspěšné/chybové stavy. Až poté je možné změnit demo texty a povolit skutečné odesílání.

## Modelový výpočet

```text
hodnota navíc = prodejní cena − původní hodnota − investice − náklady prodeje
podíl REKO = 40 % z kladné hodnoty navíc
majiteli zbývá = původní hodnota + hodnota navíc − podíl REKO
```

Výchozí model: původní hodnota 3 800 000 Kč, investice 900 000 Kč, prodej 6 000 000 Kč, náklady prodeje 3,7 % (222 000 Kč). Hodnota navíc je 1 078 000 Kč; majiteli zbývá **4 446 800 Kč**, REKO má podíl 431 200 Kč a vrací se mu investice.

Při záporné hodnotě navíc nevzniká podíl na zisku, investice se ale nadále vypořádává a ztráta snižuje částku pro majitele. Pokud prodej nepokryje náklady, UI výslovně zobrazí schodek. Kalkulačka neuděluje zdánlivé schválení projektu. Nezahrnuje daně, hypotéku ani další individuální náklady.

## Publikace a otevřené body

Stávající hosting je GitHub Pages z větve `main`, kořen repozitáře. Push do `main` publikuje změny. Úpravy designu samy o sobě neznamenají souhlas s ostrým spuštěním služby.

Všechny stránky včetně nové poptávky mají `noindex, nofollow`. Před ostrým spuštěním zůstávají k dořešení:

1. Právní posouzení zamýšleného modelu a zajištění odpovídajícího režimu provozu.
2. Daňové a účetní nastavení včetně DPH a podílu na vytvořené hodnotě.
3. Skutečný příjem žádostí a informace o zpracování osobních údajů.
4. Identifikace provozovatele, kontakty, smluvní a reklamační podmínky.
5. Doložené realizace a případové studie, pokud mají nahradit ilustrace.

Web neslibuje garantovaný výnos, pevnou dobu prodeje ani rekonstrukci zdarma. Zástava a riziko nižšího výsledku jsou vysvětlené v obsahu.

## Revize obsahu a ověření

Texty prošly úpravou podle [no-ai-slop](https://github.com/petergyang/no-ai-slop): konkrétní popis služby místo obecných sloganů, zachování podstatných nákladů, omezení a pravidel. Kompletní desktopové a mobilní screenshoty a přehled ověření jsou v [output/design-review/REPORT.md](output/design-review/REPORT.md).
