---
layout: /src/layouts/ProjectLayout.astro
title: 'Spotify Targeted Scraper'
pubDate: 2025-07-10
description: 'A Python tool for specialized music research, identifying emerging artists globally while rigorously filtering specific demographics.'
languages: ["python", "requests", "git", "markdown"]
image:
  url: "/images/projects/spotifyscraper.webp"
  alt: "A graphic representing Spotify data filtering and exclusion."
--- 

# Spotify Targeted Scraper: Specialized Artist Discovery

This Python utility, **spotifyscraper**, was developed for highly specific music industry research. It goes beyond conventional scraping by implementing granular filters to curate a list of genuinely emerging artists based on recent activity (2024+ releases) and low follower counts (<10,000).

## 🎛️ Advanced Filtering Logic
A key feature is the extensive, multi-layer blocklist that filters out artists based on cultural, geographic, or linguistic keywords found in their names, genres, or bios, focusing the discovery pool away from predefined demographic regions (South/Southeast Asia, Africa, and Muslim communities). This demanded deep domain knowledge translated into meticulous keyword matching.

## 💾 Stateful Execution
The scraper uses JSON files (`seen_artists.json`, `inactive_artists.json`) to maintain state between runs. This prevents redundant API calls and ensures efficient processing, allowing the tool to resume searches exactly where it left off, maximizing API rate limits and optimizing build time.

## 💡 Technologies used

- **Primary Language:** Python
- **API Interaction:** Requests
- **Data Persistence:** JSON (State Management)
- **Output:** Structured Markdown generation

## 🔗 Repository
👉 [View on GitHub](https://github.com/Pronaaf2k/spotifyscraper) 

🚀 *A focused data exploration tool by Samiyeel Alim Binaaf.*