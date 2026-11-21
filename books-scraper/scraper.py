"""
Portfolio Sample: polite web scraper for books.toscrape.com (a public sandbox built for scraping practice).
Extracts the first 3 listing pages, validates and deduplicates the records,
and writes the clean data to books_sample.csv.
"""

import csv
import re
import time
from urllib.parse import urljoin

import requests
from bs4 import BeautifulSoup

BASE_URL = "https://books.toscrape.com/catalogue/"
PAGE_TEMPLATE = "https://books.toscrape.com/catalogue/page-{}.html"
OUTPUT_CSV = "books_sample.csv"
HEADERS = {"User-Agent": "PortfolioSampleScraper/1.0 (practice site, polite delay)"}
RATING_MAP = {"One": 1, "Two": 2, "Three": 3, "Four": 4, "Five": 5}


def parse_price(raw_price: str) -> float:
    """Extract a numeric float from a currency string like '£51.77'."""
    match = re.search(r"(\d+(?:\.\d+)?)", raw_price)
    if not match:
        raise ValueError(f"Invalid price format: {raw_price}")
    return float(match.group(1))


def scrape_page(session: requests.Session, page_num: int) -> list[dict]:
    """Fetch and parse a single catalogue listing page."""
    url = PAGE_TEMPLATE.format(page_num)
    response = session.get(url, headers=HEADERS, timeout=15)
    response.raise_for_status()
    response.encoding = "utf-8"  # the site is UTF-8; avoids a garbled £ sign

    soup = BeautifulSoup(response.text, "html.parser")
    articles = soup.select("article.product_pod")
    records = []

    for item in articles:
        title_el = item.select_one("h3 a")
        price_el = item.select_one("p.price_color")
        avail_el = item.select_one("p.instock.availability")
        star_el = item.select_one("p.star-rating")

        if not (title_el and price_el and avail_el and star_el):
            continue

        title = title_el.get("title", "").strip()
        rel_href = title_el.get("href", "").strip()
        product_url = urljoin(BASE_URL, rel_href)
        price = parse_price(price_el.get_text(strip=True))
        availability = avail_el.get_text(strip=True)

        star_classes = star_el.get("class", [])
        rating = next((RATING_MAP[c] for c in star_classes if c in RATING_MAP), 0)

        # Validate required fields before keeping the row
        if title and price > 0 and 1 <= rating <= 5 and product_url:
            records.append(
                {
                    "title": title,
                    "price_gbp": price,
                    "star_rating": rating,
                    "availability": availability,
                    "product_url": product_url,
                }
            )

    return records


def main() -> None:
    seen_urls = set()
    clean_rows = []

    with requests.Session() as session:
        for page in range(1, 4):
            try:
                print(f"Scraping page {page} of 3...")
                page_rows = scrape_page(session, page)
                for row in page_rows:
                    if row["product_url"] not in seen_urls:
                        seen_urls.add(row["product_url"])
                        clean_rows.append(row)
            except requests.RequestException as exc:
                print(f"[WARN] Failed to fetch page {page}: {exc}")
            if page < 3:
                time.sleep(1.0)  # polite 1-second delay between requests

    if not clean_rows:
        print("No valid records collected.")
        return

    fieldnames = ["title", "price_gbp", "star_rating", "availability", "product_url"]
    with open(OUTPUT_CSV, mode="w", newline="", encoding="utf-8") as csv_file:
        writer = csv.DictWriter(csv_file, fieldnames=fieldnames)
        writer.writeheader()
        writer.writerows(clean_rows)

    avg_price = sum(r["price_gbp"] for r in clean_rows) / len(clean_rows)
    print(f"Done! Saved {len(clean_rows)} unique validated rows to {OUTPUT_CSV}.")
    print(f"Summary: average price = £{avg_price:.2f} | unique URLs = {len(seen_urls)}")


if __name__ == "__main__":
    main()
