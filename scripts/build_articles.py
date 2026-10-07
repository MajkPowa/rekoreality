"""Render the checked-in Czech advice section. Run: python scripts/build_articles.py."""
from pathlib import Path
from html import escape, unescape
import json
import math
import re

ROOT = Path(__file__).resolve().parents[1]
BASE = 'https://majkpowa.github.io/rekoreality/'
PUBLISHED = '2026-09-28'
ORDER = [
    'rekonstrukce-domu-pred-prodejem',
    'co-opravit-pred-prodejem-domu',
    'jak-pripravit-dum-na-prodej',
    'rozpocet-rekonstrukce-domu',
    'dokumenty-k-prodeji-domu',
    'prodej-zdedeneho-domu',
]

def text(markup):
    return ' '.join(unescape(re.sub(r'<[^>]+>', ' ', markup)).split())

def load_articles():
    result = []
    for slug in ORDER:
        article = json.loads((ROOT / 'content/articles' / f'{slug}.json').read_text(encoding='utf-8'))
        assert article['slug'] == slug
        assert all(article.get(k) for k in ['title','seoTitle','description','category','lead','summary','sections'])
        ids = [section['id'] for section in article['sections']]
        assert len(set(ids)) == len(ids), f'Duplicate section ID in {slug}'
        assert all(re.fullmatch(r'[a-z0-9-]+', value) for value in ids)
        words = text(article['lead'] + ' ' + ' '.join(s['html'] for s in article['sections'])).split()
        article['wordCount'] = len(words)
        article['minutes'] = max(1, math.ceil(len(words) / 180))
        article['published'] = article.get('datePublished', PUBLISHED)
        article['modified'] = article.get('dateModified', article['published'])
        result.append(article)
    return result

def readable_date(value):
    months = ['ledna','února','března','dubna','května','června','července','srpna','září','října','listopadu','prosince']
    year, month, day = map(int, value[:10].split('-'))
    return f'{day}. {months[month - 1]} {year}'

def shared_chrome():
    source = (ROOT / 'index.html').read_text(encoding='utf-8')
    header = re.search(r'<header class="site-header">.*?</header>\s*<nav class="mobile-menu".*?</nav>', source, re.S)[0]
    footer = re.search(r'<footer class="site-footer">.*?</footer>', source, re.S)[0]
    def relative(match):
        value = match[1]
        if value.startswith(('#', 'http:', 'https:', 'mailto:')):
            return match[0]
        return f'href="../{value}"'
    header = re.sub(r'href="([^"]+)"', relative, header)
    footer = re.sub(r'href="([^"]+)"', relative, footer)
    header = header.replace('href="../poradna/"', 'href="./" aria-current="page"')
    footer = footer.replace('href="../poradna/"', 'href="./"')
    return header, footer

def head(title, description, url, graph, article=False):
    social_type = 'article' if article else 'website'
    return f'''<!doctype html>
<html lang="cs"><head>
<meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<title>{escape(title)}</title><meta name="description" content="{escape(description, quote=True)}">
<meta name="robots" content="index, follow, max-image-preview:large">
<link rel="canonical" href="{url}"><meta name="theme-color" content="#265b45">
<meta property="og:type" content="{social_type}"><meta property="og:locale" content="cs_CZ">
<meta property="og:site_name" content="REKOREALITY"><meta property="og:url" content="{url}">
<meta property="og:title" content="{escape(title, quote=True)}"><meta property="og:description" content="{escape(description, quote=True)}">
<meta property="og:image" content="{BASE}assets/img/properties/hlinsko-kouty-02.webp">
<meta property="og:image:alt" content="Kuchyně v dokončené realizaci REKO Reality v Hlinsku">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="../assets/img/favicon.svg">
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Manrope:wght@400;500;600;700;800&amp;display=swap" rel="stylesheet">
<link rel="stylesheet" href="../assets/css/style.css?v=7"><link rel="stylesheet" href="../assets/css/premium.css?v=7">
<link rel="stylesheet" href="../assets/css/journal.css?v=1">
<link rel="stylesheet" href="../assets/css/estate.css?v=20261007">
<script src="../assets/js/main.js?v=20261006" defer></script><script src="../assets/js/journal.js?v=1" defer></script>
<script type="application/ld+json">{json.dumps({'@context':'https://schema.org','@graph':graph}, ensure_ascii=False).replace('<','\\u003c')}</script>
</head>'''

def breadcrumb_schema(title=None, url=None):
    items = [{'@type':'ListItem','position':1,'name':'Úvod','item':BASE},
             {'@type':'ListItem','position':2,'name':'Poradna','item':BASE+'poradna/'}]
    if title:
        items.append({'@type':'ListItem','position':3,'name':title,'item':url})
    return {'@type':'BreadcrumbList','itemListElement':items}

def meta(article):
    return f'''<div class="story-meta"><span>{escape(article['category'])}</span><span>{article['minutes']} min čtení</span></div>'''

def card(article, number=None, prefix=''):
    number_html = f'<span class="story-number" aria-hidden="true">{number:02}</span>' if number else ''
    return f'''<article class="story-card">{number_html}{meta(article)}
<h3><a href="{prefix}{article['slug']}.html">{escape(article['title'])}</a></h3>
<p>{escape(article['description'])}</p><span class="story-arrow" aria-hidden="true">↗</span></article>'''

def build_article(article, by_slug, header, footer):
    url = BASE + 'poradna/' + article['slug'] + '.html'
    graph = [breadcrumb_schema(article['title'], url), {
        '@type':'BlogPosting', '@id':url+'#article', 'url':url, 'mainEntityOfPage':url,
        'headline':article['title'], 'description':article['description'], 'inLanguage':'cs-CZ',
        'datePublished':article['published'],
        'dateModified':article['modified'],
        'author':{'@type':'Organization','name':'REKOREALITY','url':BASE},
        'publisher':{'@type':'Organization','name':'REKOREALITY','url':BASE},
        'articleSection':article['category'], 'wordCount':article['wordCount'],
        'timeRequired':f'PT{article["minutes"]}M',
    }]
    toc = ''.join(f'<li><a href="#{s["id"]}">{escape(s["title"])}</a></li>' for s in article['sections'])
    sections = []
    for section in article['sections']:
        markup = section['html'].replace('<div class="article-table">', '<div class="article-table" tabindex="0" role="region" aria-label="Tabulka: ' + escape(section['title'], quote=True) + '">')
        sections.append(f'<section id="{section["id"]}"><h2>{escape(section["title"])}</h2>{markup}</section>')
    body = ''.join(sections)
    summary = article['summary']
    summary_html = '<ul>'+''.join(f'<li>{escape(x)}</li>' for x in summary)+'</ul>' if isinstance(summary,list) else '<p>'+escape(summary)+'</p>'
    sources = ''.join(f'<li><a href="{escape(s["url"],quote=True)}" rel="noopener">{escape(s["title"])}</a></li>' for s in article.get('sources',[]))
    sources_html = f'<section class="article-sources" aria-labelledby="sources-title"><h2 id="sources-title">Zdroje a další informace</h2><p>Odkazy na podklady k odborným tvrzením. Stav ověřený k {readable_date(article["modified"])}.</p><ul>{sources}</ul></section>' if sources else ''
    related = [by_slug[slug] for slug in article['related'] if slug in by_slug and slug != article['slug']][:2]
    related_html = ''.join(card(item) for item in related)
    title = article['seoTitle'] if 'REKOREALITY' in article['seoTitle'] else article['seoTitle']+' | REKOREALITY'
    return head(title,article['description'],url,graph,True)+f'''
<body class="journal-page article-page"><a class="skip-link" href="#main-content">Přejít k obsahu</a>{header}
<main id="main-content">
<header class="article-header shell">
<nav class="breadcrumb" aria-label="Drobečková navigace"><a href="../index.html">Úvod</a><span aria-hidden="true">/</span><a href="./">Poradna</a><span aria-hidden="true">/</span><span aria-current="page">{escape(article['title'])}</span></nav>
{meta(article)}<h1>{escape(article['title'])}</h1><p class="article-lead">{escape(article['lead'])}</p>
<div class="article-byline"><span>REKOREALITY</span><time datetime="{article['published']}">{readable_date(article['published'])}</time></div>
</header>
<div class="article-layout shell">
<aside class="article-sidebar"><nav aria-label="Obsah článku"><details class="article-toc" open><summary>Na této stránce</summary><ol>{toc}</ol></details></nav>
<a class="article-back" href="./">← Všechny články</a></aside>
<article class="article-body" aria-label="{escape(article['title'],quote=True)}">
<div class="article-answer"><span class="eyebrow">Rychlá orientace</span>{summary_html}</div>
{body}{sources_html}
<aside class="article-next-step"><span class="eyebrow">Od obecného postupu k vašemu domu</span><h2>Porovnejte si konkrétní možnosti.</h2><p>Vyzkoušejte modelový výpočet nebo si připravte údaje pro posouzení domu. Stačí obec, jméno a kontakt.</p><div><a class="btn btn--primary" href="../poptavka.html">Posoudit můj dům <span aria-hidden="true">→</span></a><a class="text-link" href="../kalkulacka.html">Otevřít kalkulačku</a></div><p class="article-demo">Formulář je zatím ukázkový a žádost neodesílá.</p></aside>
</article></div>
<section class="related-stories shell" aria-labelledby="related-title"><div class="journal-section-head"><h2 id="related-title">Související články</h2><a class="text-link" href="./">Celá poradna <span aria-hidden="true">→</span></a></div><div class="story-grid">{related_html}</div></section>
</main>{footer}</body></html>'''

def build_hub(articles, header, footer):
    featured = articles[0]
    url = BASE + 'poradna/'
    title = 'Prodej a rekonstrukce domu: poradna pro majitele | REKOREALITY'
    description = 'Praktické články o prodeji staršího domu, výběru oprav, rozpočtu, dokumentech a dědictví. Zjistěte, co připravit a podle čeho se rozhodovat.'
    graph = [breadcrumb_schema(), {'@type':'CollectionPage','@id':url+'#page','url':url,'name':title,'description':description,'inLanguage':'cs-CZ','mainEntity':{'@type':'ItemList','itemListElement':[{'@type':'ListItem','position':i+1,'name':a['title'],'url':url+a['slug']+'.html'} for i,a in enumerate(articles)]}}]
    cards = ''.join(card(article, i+2) for i,article in enumerate(articles[1:]))
    return head(title,description,url,graph)+f'''
<body class="journal-page"><a class="skip-link" href="#main-content">Přejít k obsahu</a>{header}
<main id="main-content"><section class="journal-intro shell"><nav class="breadcrumb" aria-label="Drobečková navigace"><a href="../index.html">Úvod</a><span aria-hidden="true">/</span><span aria-current="page">Poradna</span></nav>
<span class="eyebrow">Poradna pro majitele domů</span><h1>Prakticky o rekonstrukci<br> a prodeji domu.</h1><p class="lead">Co opravit, kolik do domu vložit a co připravit k prodeji. Praktické postupy pro chvíli, kdy zvažujete další krok.</p></section>
<section class="featured-story shell" aria-labelledby="featured-title"><div class="featured-copy"><span class="eyebrow">Začněte rozhodnutím o opravách</span>{meta(featured)}<h2 id="featured-title"><a href="{featured['slug']}.html">{escape(featured['title'])}</a></h2><p>{escape(featured['description'])}</p><a class="btn btn--primary" href="{featured['slug']}.html">Přečíst článek <span aria-hidden="true">→</span></a></div><figure><img src="../assets/img/properties/hlinsko-kouty-02.webp" srcset="../assets/img/properties/hlinsko-kouty-02-768.webp 768w, ../assets/img/properties/hlinsko-kouty-02.webp 1200w" sizes="(max-width: 760px) calc(100vw - 44px), 50vw" width="1200" height="799" alt="Kuchyně v dokončené realizaci REKO Reality v Hlinsku" fetchpriority="high"><figcaption>Realizace REKO Reality, Hlinsko – Kouty. Fotografie z prodejní nabídky.</figcaption></figure></section>
<section class="journal-library shell" aria-labelledby="library-title"><div class="journal-section-head"><h2 id="library-title">Další otázky před prodejem</h2><span class="journal-count">5 praktických průvodců</span></div><div class="story-grid">{cards}</div></section>
<section class="journal-help shell"><div><span class="eyebrow">Pro konkrétní dům</span><h2>Čísla pro své rozhodnutí<br><span class="ital">si můžete propočítat.</span></h2><p>Kalkulačka ukáže rozdělení prodejní ceny i dopad nižšího výnosu. Jde o model, nikoli odhad tržní ceny domu.</p></div><a class="btn btn--primary" href="../kalkulacka.html">Vyzkoušet kalkulačku <span aria-hidden="true">→</span></a></section>
</main>{footer}</body></html>'''

def build_home_preview(articles):
    cards = ''.join(card(article,prefix='poradna/') for article in [articles[0],articles[2],articles[4]])
    return f'''<!-- JOURNAL PREVIEW START -->
<section class="home-journal section shell" aria-labelledby="home-journal-title"><div class="journal-section-head"><div><span class="eyebrow">Poradna</span><h2 id="home-journal-title">Co si ujasnit <span class="ital">před prodejem domu.</span></h2></div><a class="text-link" href="poradna/">Všechny články <span aria-hidden="true">→</span></a></div><div class="story-grid">{cards}</div></section>
<!-- JOURNAL PREVIEW END -->'''

def main():
    articles = load_articles()
    header, footer = shared_chrome()
    out = ROOT / 'poradna'
    out.mkdir(exist_ok=True)
    by_slug = {article['slug']:article for article in articles}
    for article in articles:
        (out / (article['slug']+'.html')).write_text(build_article(article,by_slug,header,footer),encoding='utf-8')
    (out / 'index.html').write_text(build_hub(articles,header,footer),encoding='utf-8')
    home_path = ROOT / 'index.html'
    home = home_path.read_text(encoding='utf-8')
    preview = build_home_preview(articles)
    if '<!-- JOURNAL PREVIEW START -->' in home:
        home = re.sub(r'<!-- JOURNAL PREVIEW START -->.*?<!-- JOURNAL PREVIEW END -->',preview,home,flags=re.S)
    else:
        home = home.replace('<section class="closing-wrap shell">',preview+'\n<section class="closing-wrap shell">',1)
    home_path.write_text(home,encoding='utf-8')
    properties = json.loads((ROOT/'content/properties.json').read_text(encoding='utf-8'))['properties']
    urls = [(BASE+'nemovitosti.html',max(p['verifiedAt'] for p in properties))]
    urls += [(BASE+'nemovitosti/'+p['slug']+'.html',p['verifiedAt']) for p in properties]
    urls += [(BASE+'poradna/',max(a['modified'] for a in articles))]+[(BASE+'poradna/'+a['slug']+'.html',a['modified']) for a in articles]
    sitemap = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'+''.join(f'<url><loc>{escape(url)}</loc><lastmod>{date}</lastmod></url>\n' for url,date in urls)+'</urlset>\n'
    (ROOT/'sitemap.xml').write_text(sitemap,encoding='utf-8')
    print('Rendered advice hub and',len(articles),'articles:',sum(a['wordCount'] for a in articles),'words.')

if __name__ == '__main__':
    main()
