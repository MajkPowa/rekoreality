# REKOREALITY

Statický web v češtině pro rekonstrukci domu před prodejem a nabídku dokončených nemovitostí. Bez frameworku; výsledné HTML je uložené v repozitáři a hosting nevyžaduje build.

[Veřejný náhled na GitHub Pages](https://majkpowa.github.io/rekoreality/)

## Lokální náhled

```powershell
python -m http.server 4173 --bind 127.0.0.1
```

Otevřete `http://127.0.0.1:4173/`. Pro písmo Manrope je potřeba připojení; bez něj se použije systémové písmo.

## Stránky a dvě cesty návštěvníka

- `index.html`: nejprve služba rekonstrukce před prodejem, hned poté aktuální nabídka dvou nemovitostí; dále průběh spolupráce, modelové vypořádání a poradna.
- `nemovitosti.html`: přehled aktuální nabídky s fotografiemi, lokalitou, dispozicí, plochou, cenou a jednoduchým výběrem domů či bytů.
- `nemovitosti/hlinsko-kouty.html` a `nemovitosti/byt-karlstejn.html`: detail nemovitosti, galerie osmi fotografií, cena, parametry a přímý odkaz na konkrétní inzerát na Sreality.cz.
- `poptavka.html`: jediná společná žádost; tři povinné údaje, souhlas a nepovinné podrobnosti. Vstup `?role=agent` předvybere makléře.
- `jak-to-funguje.html`: tři fáze a informace potřebné před podpisem.
- `pro-majitele.html`: přínosy, rozhodování, zástava a vhodnost domu.
- `pro-maklere.html`: rozdělení rolí a odkaz na společnou žádost.
- `kalkulacka.html`: samostatný volitelný propočet. Není podmínkou žádosti.
- `faq.html`: otázky po tématech s hledáním bez diakritiky; odpovědi lze otevřít i bez JavaScriptu.
- `poradna/`: šest článků o rozhodování před prodejem, výběru oprav, přípravě nabídky, rozpočtu, dokumentech a dědictví.

Majitel, který chce připravit vlastní dům k prodeji, pokračuje tlačítkem „Posoudit můj dům“ na krátkou ukázkovou žádost. Zájemce o koupi otevře detail nabídky a tlačítkem „Domluvit prohlídku“ přejde na její původní inzerát na Sreality.cz. Tento odkaz je označený jako přechod na externí web; prohlídky se nevyřizují přes demo formulář REKO.

Staré adresy `kalkulacka.html#formular`, `pro-majitele.html#krok-za-krokem`, `#zastava`, `#kdy-ne` a `pro-maklere.html#intake` zůstávají použitelné.

## Vzhled a média

Vzhled používá Manrope, bílé plochy, zelené akce, čitelné parametry a skutečné fotografie. Současný společný systém a katalog jsou v `assets/css/estate.css`; vzhled stránek služby sjednocuje `service-pages.css`. Tyto soubory navazují na základní `style.css` a `premium.css`. Formulář má také `request.css`, kalkulačka `calculator.css` a poradna `journal.css`.

Sdílené menu zajišťuje `assets/js/main.js`, filtrování nabídky a zvětšování fotografií `estate.js`, výběr situace a hledání v otázkách `ui.js`. Formulář a kalkulačka mají vlastní skripty. Bez JavaScriptu zůstávají nabídky i odkazy na fotografie dostupné.

Fotografie dvou nemovitostí jsou v `assets/img/properties/`, včetně variant o šířce 768 px. Pocházejí z inzerátů dodaných zadavatelem, který nemovitosti označil jako dokončené realizace REKO Reality. Nejde o AI ilustrace. Zdroj, datum ověření a rozsah úprav uvádí [assets/img/properties/CREDITS.md](assets/img/properties/CREDITS.md); přesné URL, rozměry a popisky jsou v `content/properties.json`. Vodoznaky fotografií zůstaly zachované. Web nepřisuzuje původní prodejce týmu REKO ani nevymýšlí cenu před rekonstrukcí, délku prací či dosažené zhodnocení.

Starší AI ilustrace, SVG a `houses3d*.js` zůstávají v repozitáři jako historické zdroje. Současné stránky je nepoužívají; původ ilustrací dokumentuje [assets/img/IMAGE-CREDITS.md](assets/img/IMAGE-CREDITS.md).

## Úpravy a generování webu

Data nabídek upravujte v `content/properties.json`, obsah článků v `content/articles/*.json`. Hlavní stránku, katalog, detaily a společnou navigaci spravuje `scripts/build_site.py`; články generuje `scripts/build_articles.py`.

Po změně zdrojů spusťte z kořene repozitáře:

```powershell
python scripts/build_site.py --all
```

Příkaz vygeneruje úvod, katalog a oba detaily, sjednotí navigaci a patičku stránek služby, obnoví poradnu a sitemapu. Do commitu patří zdrojové i vygenerované soubory. Texty stránek služby se upravují v příslušném HTML; jejich navigaci a patičku následující generování přepíše společnou šablonou. Pro lokální generování stačí Python a jeho standardní knihovna; GitHub Pages spouští pouze hotové soubory.

Při změně nabídky ověřte cenu, dostupnost, parametry a cílový inzerát. Aktualizujte `verifiedAt` v datech i viditelná data ověření v šablonách `build_site.py`, která jsou nyní nastavená na 6. října 2026. Současná šablona počítá se dvěma nabídkami; rozšíření katalogu vyžaduje také upravit počty a výběr související nemovitosti v generátoru.

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

Sedm původních stránek služby včetně úvodu a poptávky má `noindex, follow`. Indexaci mají povolenou katalog, oba detaily, poradna a šest článků. Před ostrým příjmem žádostí zůstávají k dořešení:

1. Právní posouzení zamýšleného modelu a zajištění odpovídajícího režimu provozu.
2. Daňové a účetní nastavení včetně DPH a podílu na vytvořené hodnotě.
3. Skutečný příjem žádostí a informace o zpracování osobních údajů.
4. Identifikace provozovatele, kontakty, smluvní a reklamační podmínky.
5. Podklady pro případové studie, pokud mají uvádět rozsah prací, náklady a skutečný výsledek prodeje.

Web neslibuje garantovaný výnos, pevnou dobu prodeje ani rekonstrukci zdarma. Zástava a riziko nižšího výsledku jsou vysvětlené v obsahu.

## Revize obsahu a ověření

Texty vycházejí z pravidel [no-ai-slop](https://github.com/petergyang/no-ai-slop): konkrétní popis služby, zachování podstatných nákladů, omezení a pravidel. [output/design-review/REPORT.md](output/design-review/REPORT.md) a [output/seo-review/REPORT.md](output/seo-review/REPORT.md) dokumentují předchozí verzi ze září 2026; nejsou dokladem ověření nynějšího redesignu.

## Designové reference

Návrh spojuje známé uspořádání nabídek ze Sreality.cz s principy následujících oceněných webů. Ocenění patří referenčním webům a nedokládají nejvyšší konverzi ani výsledek uživatelského testování REKO Reality.

- [Mhitar Investments](https://mhitar.com/) — [CSS Design Awards, Special Kudos, 7. 2. 2023; porota 7,44/10](https://www.cssdesignawards.com/sites/mhitar-investments-lda/42871/). Převzatý princip: nabídky mají jasný stav, typ a lokalitu; služba a projekty jsou samostatně dostupné v navigaci.
- [Silver Pinewood Residences](https://silver-pinewood.com/) — [Awwwards Site of the Day, 9. 10. 2025; 7,25/10](https://www.awwwards.com/sites/silver-pinewood-residences). Převzatý princip: fotografie konkrétní nemovitosti vysvětlují interiér a zázemí, vedle obsahu je krátká cesta ke kontaktu.
- [463 West 142](https://463w142.com/) — [CSS Design Awards, Special Kudos, 7. 2. 2024; porota 7,72/10](https://www.cssdesignawards.com/sites/luxury-real-estate/45073/). Převzatý princip: podrobná prezentace dokončené nemovitosti s rozměry a vybavením. Půdorysy této reference nejsou součástí nabídek REKO.

Řazení ceny, dispozice a plochy přímo v kartách a jednotné pořadí parametrů navazují na [výzkum čitelnosti výpisů Baymard](https://baymard.com/research-articles/list-item-design-ecommerce). Jde o přenesení principů z e-commerce do realitního katalogu. Viditelná navigace a textové popisky odpovídají [heuristikám Nielsen Norman Group](https://www.nngroup.com/articles/ten-usability-heuristics/).

## Poradna a SEO

Zdrojový obsah je v `content/articles/*.json`, šablony v `scripts/build_articles.py` a styly v `assets/css/journal.css` se společnými úpravami v `estate.css`. Poradna se obnoví společným příkazem `python scripts/build_site.py --all`; samostatně ji lze vygenerovat příkazem `python scripts/build_articles.py`. Menu a patičku přebírá z `index.html`. Při podstatné aktualizaci článku přidejte `dateModified` ve formátu `YYYY-MM-DD`; `datePublished` zachovejte. Výchozí datum této série je 2026-09-28. Časy čtení se počítají z obsahu, nejde o slib přesné doby.

Každý článek má vlastní titulek, popis, canonical URL, metadata sdílení, strukturovaná data BlogPosting a BreadcrumbList, obsah s kotvami, citované primární zdroje a související články. Přehled používá CollectionPage a ItemList. Články jsou čitelné i bez JavaScriptu. Modelové výpočty jsou označené, formulář zůstává výslovně ukázkový.

[Sitemap](https://majkpowa.github.io/rekoreality/sitemap.xml) obsahuje deset indexovatelných stránek: katalog, dva detaily, poradnu a šest článků. Na projektovém GitHub Pages nemá `rekoreality/robots.txt` účinek jako soubor v kořeni hostitele; procházení nespoléhá na něj. Sitemap lze odeslat v ověřené službě Google Search Console, což tento repozitář automaticky neprovádí. Indexace ani pořadí ve vyhledávání nejsou zaručené. Při změně domény upravte `BASE` v obou generátorech, odkaz v `robots.txt` a canonical URL původních stránek služby.

Aktuální říjnový redesign, doložené reference, rozsah kontrol a náhledy všech 17 stránek: [output/redesign-2026-10-06/REPORT.md](output/redesign-2026-10-06/REPORT.md).
