# Poradna REKOREALITY — kontrola 28. 9. 2026

Šest původních českých článků, přehled poradny a výběr tří článků na úvodní stránce. Text článků včetně úvodů má dohromady 4 314 slov bez navigace, shrnutí a souvisejících odkazů. Témata mají odlišný účel: rozhodnutí o investici, volba oprav, příprava nabídky, sestavení rozpočtu, dokumenty a zděděný dům.

## Obsah

- Odborná tvrzení odkazují přímo na primární zdroje ČSÚ, ČKAIT, SZÚ, SÚIP, MPO, ČÚZK, gov.cz, NKČR a Finanční správy.
- Nezávislá revize všech šesti textů a přepočet obou číselných příkladů. Rozdíl 390 000 Kč, hranice 4 810 000 Kč i financování 1 080 000 Kč odpovídají zadaným vstupům.
- Vlastní financování je odlišené od spolupráce s investorem. Nejsou uvedené garance, vymyšlené reference ani neověřené statistiky.
- AI ilustrace a ukázkový formulář zůstávají označené.

## Technická kontrola

Read-only kontrola všech 14 produkčních HTML: 567 interních odkazů, 48 odkazů na soubory a responzivní obrázky, 79 fragmentů a 72 vazeb na ID bez závad. Každá stránka má právě jeden H1 a vlastní title i description.

Všech sedm JSON-LD bloků je validních. Údaje šesti BlogPosting odpovídají zobrazeným článkům; poradna má CollectionPage a ItemList. Canonical, OG URL a sitemap respektují cestu `/rekoreality/`. Sitemap obsahuje sedm povolených canonical URL, starší stránky služby zůstávají `noindex, follow`. Kořenový `https://majkpowa.github.io/robots.txt` při kontrole vracel 404. Projektový robots.txt není náhradou souboru v kořeni hostitele. Sitemap nebyla odeslána do Search Console; indexace se netvrdí.

## Prohlížeč a responzivita

Všechny nové stránky byly nasnímané celé v Chrome při nastavení viewportu 1440 × 1000 a 390 × 844. Změřená šířka dokumentu odpovídala dostupné šířce, bez nechtěného vodorovného posuvu. Všechny obrázky se načetly. Vizuální kontrola sedmi stránek na obou šířkách bez překryvů nebo oříznutého obsahu. Tabulky mají vlastní posuv a klávesnicový fokus pro úzké obrazovky.

Úvod, poradna a článek o rozpočtu byly navíc ověřené při šířkách 320, 767, 990 a 1101 px. Menu funguje i v rozšířeném tabletovém rozmezí; při návratu na desktop se zavře a odemkne posun stránky. Ověřeno rozbalení mobilního obsahu článku, skok na výpočet a přechody z poradny do kalkulačky i z článku na formulář s viditelným demo oznámením. Konzole bez zachycených chyb a varování.

## Kompletní screenshoty

| Stránka | Desktop | Mobil |
| --- | --- | --- |
| Poradna | [náhled](index-desktop.png) | [náhled](index-mobile.png) |
| Rekonstrukce před prodejem | [náhled](rekonstrukce-domu-pred-prodejem-desktop.png) | [náhled](rekonstrukce-domu-pred-prodejem-mobile.png) |
| Co opravit | [náhled](co-opravit-pred-prodejem-domu-desktop.png) | [náhled](co-opravit-pred-prodejem-domu-mobile.png) |
| Příprava domu | [náhled](jak-pripravit-dum-na-prodej-desktop.png) | [náhled](jak-pripravit-dum-na-prodej-mobile.png) |
| Rozpočet | [náhled](rozpocet-rekonstrukce-domu-desktop.png) | [náhled](rozpocet-rekonstrukce-domu-mobile.png) |
| Dokumenty | [náhled](dokumenty-k-prodeji-domu-desktop.png) | [náhled](dokumenty-k-prodeji-domu-mobile.png) |
| Zděděný dům | [náhled](prodej-zdedeneho-domu-desktop.png) | [náhled](prodej-zdedeneho-domu-mobile.png) |

[Úvod s výběrem článků](home-desktop.png). Měření: [všechny nové stránky](layout-checks.json), [další šířky](breakpoint-checks.json).
