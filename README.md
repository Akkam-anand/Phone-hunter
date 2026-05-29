# Phone Hunter 📱

A clean, fast phone search app built with vanilla HTML, CSS, and JavaScript.

## What it does

- Search any phone by brand or model name using the Programming Hero Phone API
- Click a card to see detailed specs (storage, RAM, display, battery, chipset, camera, OS)
- **Show All** loads phones from multiple popular brands at once
- Page loads with Samsung phones by default so it's never empty

## How I built it

**API used:** `https://openapi.programming-hero.com/api`
- `/phones?search=query` → returns list of matching phones
- `/phone/:slug` → returns full specs for one phone

**JS concepts used:**
- `fetch()` with `async/await` for all API calls
- `Promise.all()` to load multiple brands in parallel for Show All
- DOM manipulation (`createElement`, `innerHTML`, `classList`) to build cards dynamically
- Event listeners on buttons, input (Enter key), and modal overlay for close
- `onerror` fallback on images for broken links
- IIFE to auto-load default phones on page start

**CSS highlights:**
- CSS custom properties (variables) for consistent theming
- CSS Grid with `auto-fill` for responsive card layout
- `@keyframes` for card fade-in, spinner, and modal pop-in animations

## How to run

Just open `index.html` in any browser. No build step, no dependencies.

## Live demo

[Hosted link here]

## Screenshots

[Add screenshots here]
