---
layout: /src/layouts/MarkdownPostLayout.astro
title: "VoloLeads — Stripe Billing on a Static HTML Site"
author: Samiyeel Alim Binaaf
description: "How I built production subscription billing for a live HTML/Tailwind website — Stripe Checkout, webhooks, PostgreSQL, and cPanel deployment without rewriting the frontend."
image:
  url: "/images/projects/vololeads.png"
  alt: "VoloLeads pricing page with Stripe-powered subscription checkout."
pubDate: 2026-02-15
tags:
  [
    "Full-Stack",
    "Stripe",
    "Node.js",
    "PostgreSQL",
    "Payments",
    "SaaS"
  ]
languages: ["node", "express", "stripe", "postgresql", "javascript", "tailwind"]
---

## Overview

**VoloLeads** is a live B2B services site that needed subscription payments without migrating to React or Next.js. The constraint was real: keep the existing **HTML, Tailwind CSS, and vanilla JavaScript** frontend, and add secure billing entirely on the server.

This post covers the architecture I shipped — from the pricing page "Subscribe" button to confirmation emails and self-service billing.

## Why not client-side Stripe?

Stripe **secret keys must never live in the browser**. The frontend only calls our API; the backend creates Checkout sessions, verifies webhooks, and writes to PostgreSQL.

```
Browser → POST /api/billing/checkout → Express → Stripe Checkout URL
Stripe → webhook → Express → PostgreSQL + SMTP email
```

## Backend design

The API is **Node.js / Express** with environment-based configuration:

- **Checkout sessions** for three plans (Starter, Growth, Scale), including setup fees where needed
- **Webhook handlers** for `checkout.session.completed`, `invoice.paid`, subscription updates, and failed payments
- **PostgreSQL** for subscriptions, contact form leads, and visitor events
- **SMTP** for confirmation, renewal reminders, and failed-payment notifications
- **Stripe Billing Portal** so customers manage subscriptions without support tickets

Promo codes, contact forms, and Google Sheets export were added as the product iterated after the first release.

## Frontend integration

On the static site, subscribe buttons fetch a session URL from the API and redirect to Stripe Checkout. Success, cancel, and manage-subscription pages handle the return flow. No framework — just fetch, redirect, and clear UX copy.

## Deployment

Everything runs on **cPanel**: Node app for the API, static files for the site, GitHub-based deploy hooks, and separate test/live Stripe keys via `.env`.

## Takeaways

1. **Static sites can sell subscriptions** if you treat billing as a backend concern.
2. **Webhooks are the source of truth** — never trust the success page alone.
3. **Scope creep happens** — document early, ship the happy path first, then add portal, renewals, and ops tooling.

👉 Live site: [vololeads.com](https://vololeads.com)
