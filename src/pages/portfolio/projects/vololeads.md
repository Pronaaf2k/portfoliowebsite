---
layout: /src/layouts/ProjectLayout.astro
title: 'VoloLeads'
pubDate: 2026-02-01
description: 'Full-stack Stripe billing for a live HTML/Tailwind site — checkout, webhooks, PostgreSQL, and automated emails on cPanel.'
languages: ["node", "javascript", "tailwind", "stripe", "postgresql", "express"]
image:
  url: "/images/projects/vololeads.png"
  alt: "VoloLeads — subscription billing on a live HTML/Tailwind website with Stripe checkout."
externalUrl: "https://vololeads.com"
---

# VoloLeads: Production Billing Stack

**VoloLeads** is a live B2B services website that needed secure subscription payments without rebuilding the frontend or exposing API keys in the browser. I delivered the full-stack integration over semester break — frontend checkout flow plus a Node/Express backend deployed on cPanel.

## The challenge

- Static site already live: **HTML, Tailwind CSS, vanilla JavaScript**
- Three subscription tiers (Starter, Growth, Scale) with Stripe Checkout
- Webhooks, confirmation emails, and billing portal — all server-side
- Test and live modes via environment variables only

## What I built

### Frontend
- Subscribe buttons wired to the API from the pricing page
- Success, cancel, and manage-subscription pages
- Promo code support at checkout
- Contact form and visitor tracking integrated with the backend

### Backend
- **Node.js / Express** API with env-based secrets
- **Stripe Checkout** sessions for three plans (including setup fee on Starter)
- Webhook handlers: `checkout.session.completed`, `invoice.paid`, subscription lifecycle events
- **PostgreSQL** for subscriptions, contact leads, and analytics
- **SMTP** confirmation emails, renewal reminders, and failed-payment notifications
- Stripe Billing Portal for self-service subscription management
- Google Sheets export API for leads and subscription sync

## Stack

| Layer | Technologies |
|-------|----------------|
| Frontend | HTML, Tailwind CSS, JavaScript |
| Backend | Node.js, Express |
| Payments | Stripe Checkout, Webhooks, Billing Portal |
| Database | PostgreSQL |
| Email | SMTP (Nodemailer) |
| Hosting | cPanel, GitHub deployment |

## Live site

👉 [vololeads.com](https://vololeads.com)

Contract / freelance delivery · Full-stack development by **Samiyeel Alim Binaaf**.
