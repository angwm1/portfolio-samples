# Books to Scrape: Python data extraction sample

## What it does
Scrapes the first 3 catalogue pages (60 books) of [books.toscrape.com](https://books.toscrape.com), a public sandbox built for scraping practice. It converts prices to numbers, maps star ratings to 1 to 5, removes duplicates by product URL, validates every row and writes a clean `books_sample.csv`. It waits one second between requests and sends a plain User-Agent.

## Output columns (`books_sample.csv`)
- `title`: full book title
- `price_gbp`: price as a number, for example `51.77`
- `star_rating`: integer from 1 to 5
- `availability`: stock text, for example `In stock`
- `product_url`: full link to the book page

A real run on 21 Nov 2026 produced 60 unique validated rows (average price 35.00 GBP); the file is included.

## How to run
```bash
python -m venv .venv
# Windows: .venv\Scripts\activate    macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
python scraper.py
```

## About this sample
Built with AI-assisted tools, then run and checked by me. It only touches a public practice site; for real jobs I scrape public pages only, respect robots rules and rate limits, and never scrape behind a login.
