---
layout: /src/layouts/MarkdownPostLayout.astro
title: Spotifyscraper Architecting a Highly Selective Music Discovery Engine
author: Samiyeel Alim Binaaf
description: "A technical review of implementing multi-layered demographic exclusion filters and state management for scalable music artist discovery using the Spotify API in Python."
image:
  url: "/images/blogimage.webp"
  alt: "Abstract image representing data filtering and categorization."
pubDate: 2025-07-15
tags:
  [
    "Python", "Data-Scraping", "API-Integration", "State-Management", "Data-Filtering"
  ]
languages: ["python", "requests", "markdown"]
---

The **Spotifyscraper** project was born from the need for highly specific, high-precision artist identification on Spotify. This required solving two major technical hurdles: maintaining efficiency across multiple scraping runs, and implementing a rigorous, multi-faceted exclusion system.

## 💾 Optimizing for Scale and Efficiency

Dealing with the vast Spotify catalog and strict API rate limits necessitated a strategy to avoid redundant work.

### Stateful Processing via JSON

To ensure idempotency and prevent revisiting artists already processed (whether they were active or inactive), we implemented a state management layer using two JSON files: `seen_artists.json` and `inactive_artists.json`.

```python
# Function to load previously processed IDs
def load_seen_ids():
    if os.path.exists(SEEN_FILE):
        with open(SEEN_FILE, "r", encoding="utf-8") as f:
            return set(json.load(f))
    return set()

# Combine both sets to skip these artists in new searches
already_seen = seen_ids.union(inactive_ids)