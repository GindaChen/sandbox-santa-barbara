# Santa Barbara Trip Planner — Project Log

## What Is This?
An interactive trip planner for **Feb 27 – Mar 1, 2026** in Santa Barbara, built as a static Leaflet.js map with a JSON data backend.

**Live:** https://gindachen.github.io/sandbox-santa-barbara/

---

## Key Decisions Made

### 🍽️ Restaurants (10 total)
| Name | Category | Price | Status |
|------|----------|-------|--------|
| **Caruso's** | Michelin ⭐ + 🌿 Green Star | $195–295/pp | ✅ **RESERVED Sat Feb 28, 5PM, 2 guests** |
| Silvers Omakase | Michelin ⭐ | $235/pp | Book via Tock |
| Sushi by Scratch: Montecito | Michelin ⭐ | $185/pp | Book via Tock |
| Yoichi's | Michelin Recommended | $155–180/pp | |
| The Lark | Michelin Recommended | $30–60/pp | |
| Bettina | Bib Gourmand | $25–45/pp | |
| Loquita | Bib Gourmand | $40–70/pp | Spanish tapas |
| Corazón Cocina | Bib Gourmand | $20–40/pp | Public Market |
| Sama Sama Kitchen | Bib Gourmand | $30–60/pp | 20% auto-grat |
| SB Shellfish Co. | Local Favorite | $25–60/pp | Stearns Wharf |

### 🏨 Hotels — Hilton Honors (Aspire Credit)
| Name | Pet Fee | Parking | Price |
|------|---------|---------|-------|
| Hilton SB Beachfront | $75/stay | $42 self / $50 valet | from $309 |
| The Leta Goleta | **$0** | Free | from $189 |
| Hilton Garden Inn Goleta | $75 | $15/day | from $160 |
| Hampton Inn Goleta | $75 | Free | from $155 |

### 🏨 Hotels — Luxury
| Name | Pet Fee | Parking | Price |
|------|---------|---------|-------|
| Kimpton Canary | $0 (all pets) | $55 valet | from $309 |
| Hotel Californian | has fee | $55 valet | from $474 |
| El Encanto | has fee | $40 valet | from $557 |
| Rosewood Miramar | $250 | $90 valet (mandatory) | from $1,200 |
| Mar Monte (Hyatt) | has fee | $48 valet | from $250 |

### 🏨 Hotels — Mid-Range / Budget
| Name | Pet Fee | Parking | Price |
|------|---------|---------|-------|
| Hotel Santa Barbara | **$0** | $30 valet | from $149 |
| Blue Sands Inn | has fee | Free | from $109 |
| Inn at East Beach | has fee | Free | from $89 |
| Marina Beach Motel | has fee | Free | from $125 |
| Best Western Pepper Tree | has fee | Free | from $122 |

---

## Important Notes

### Caruso's Dress Code
> Collared shirt required for men. No hoodies, athletic wear, beachwear, sneakers, caps, shorts, or flip-flops.

### Caruso's Cancellation
> Cancel 24hr+ ahead or **$100/person no-show fee**. CC required to hold.

---

## Features Built
- Interactive Leaflet.js map with dark/light mode
- Sidebar with filter buttons (Michelin Star, Recommended, Hilton/Aspire, Luxury, Mid-Range)
- 📋 "View Menu" slide-out panel with signature dishes for all restaurants
- 🔗 Reserve/Book + 🗺️ Google Maps direction links
- 📕 小红书 (Xiaohongshu) reference links section
- Parking fees and pet fees for all hotels
- Auto-deploy via GitHub Actions on push to `main`

## Tech Stack
- HTML/CSS/JS (single page, no framework)
- Leaflet.js + CARTO tiles
- GitHub Pages (replaced Modal)

## Repo
- **GitHub:** https://github.com/GindaChen/sandbox-santa-barbara
- **Working dir:** `/Users/mike/.gemini/antigravity/playground/golden-curiosity/`
- **Deploy dir:** `/Users/mike/.gemini/antigravity/playground/sandbox-santa-barbara/`
