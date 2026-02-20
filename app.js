// ====== SB Trip Planner — App Logic ======

// ——— Ratings API (Modal backend, falls back to localStorage) ———
const RATINGS_API = '/api/ratings';
let ratingsCache = {};

async function loadRatings() {
    try {
        const res = await fetch(RATINGS_API);
        if (res.ok) {
            ratingsCache = await res.json();
            return;
        }
    } catch (e) { /* API not available */ }
    // Fallback to localStorage
    ratingsCache = JSON.parse(localStorage.getItem('sb-ratings') || '{}');
}

async function saveRating(name, star) {
    // Toggle off if same star clicked
    ratingsCache[name] = ratingsCache[name] === star ? 0 : star;

    // Try API first
    try {
        const res = await fetch(RATINGS_API, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, star: ratingsCache[name] })
        });
        if (res.ok) {
            ratingsCache = await res.json();
            return;
        }
    } catch (e) { /* API not available */ }

    // Fallback to localStorage
    localStorage.setItem('sb-ratings', JSON.stringify(ratingsCache));
}

// ——— Tile Layers ———
const darkTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd', maxZoom: 19
});

const lightTiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OSM</a> &copy; <a href="https://carto.com/">CARTO</a>',
    subdomains: 'abcd', maxZoom: 19
});

// ——— Initialize Map ———
const savedTheme = localStorage.getItem('sb-map-theme') || 'dark';
const initialTiles = savedTheme === 'light' ? lightTiles : darkTiles;

const map = L.map('map', {
    zoomControl: true,
    attributionControl: true,
    layers: [initialTiles]
}).setView([34.4208, -119.6982], 13);

// ——— Theme Toggle ———
let isDark = savedTheme !== 'light';
let locations = [];
const markers = [];

function applyTheme() {
    const body = document.body;
    const icon = document.getElementById('themeIcon');

    if (isDark) {
        body.classList.remove('light-mode');
        icon.textContent = '☀️';
        map.removeLayer(lightTiles);
        darkTiles.addTo(map);
        localStorage.setItem('sb-map-theme', 'dark');
    } else {
        body.classList.add('light-mode');
        icon.textContent = '🌙';
        map.removeLayer(darkTiles);
        lightTiles.addTo(map);
        localStorage.setItem('sb-map-theme', 'light');
    }

    markers.forEach(m => { if (m.isPopupOpen()) m.openPopup(); });
}

if (!isDark) document.body.classList.add('light-mode');

document.getElementById('themeToggle').addEventListener('click', () => {
    isDark = !isDark;
    applyTheme();
});

// ——— Marker Helpers ———
function highlightMarker(activeMarker) {
    markers.forEach(m => {
        const el = m.getElement();
        if (el) {
            if (m === activeMarker) {
                el.style.opacity = '1';
                el.style.zIndex = '1000';
                el.firstElementChild.style.transform = 'scale(1.4)';
            } else {
                el.style.opacity = '0.3';
                el.style.zIndex = '400';
                el.firstElementChild.style.transform = 'scale(1)';
            }
        }
    });
}

function resetMarkers() {
    markers.forEach(m => {
        const el = m.getElement();
        if (el) {
            el.style.opacity = '1';
            el.style.zIndex = '400';
            el.firstElementChild.style.transform = 'scale(1)';
        }
    });
}

function createCircleIcon(color) {
    const borderColor = isDark ? 'rgba(255,255,255,0.9)' : 'rgba(0,0,0,0.25)';
    return L.divIcon({
        className: '',
        html: `<div style="
      width: 18px; height: 18px;
      background: ${color};
      border-radius: 50%;
      border: 2.5px solid ${borderColor};
      box-shadow: 0 0 10px ${color}88, 0 2px 8px rgba(0,0,0,0.3);
      transition: transform 0.2s;
    "></div>`,
        iconSize: [18, 18],
        iconAnchor: [9, 9],
        popupAnchor: [0, -12]
    });
}

function mapsUrl(loc) {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(loc.name + ' ' + loc.address)}`;
}

function createPopupContent(loc) {
    const bookLabel = (loc.type && loc.type.startsWith('restaurant')) ? 'Reserve' : 'Book';
    const menuBtn = loc.menu ? `<button class="link-btn link-btn-accent" onclick="openMenu('${loc.name}')">📋 View Menu</button>` : '';
    return `
    <div class="popup-type">${loc.category}</div>
    <div class="popup-title">${loc.name}</div>
    <div class="popup-desc">${loc.desc}</div>
    <div class="popup-price">💰 ${loc.price}</div>
    <div class="popup-address">📍 ${loc.address}</div>
    <div class="link-row">
      <a href="${loc.url}" target="_blank" rel="noopener" class="link-btn link-btn-primary">🔗 ${bookLabel}</a>
      ${menuBtn}
      <a href="${mapsUrl(loc)}" target="_blank" rel="noopener" class="link-btn link-btn-secondary">🗺️ Directions</a>
    </div>
  `;
}

function initMarkers() {
    locations.forEach((loc, i) => {
        const icon = createCircleIcon(loc.color);
        const marker = L.marker([loc.lat, loc.lng], { icon })
            .addTo(map)
            .bindPopup(createPopupContent(loc), { maxWidth: 280 });
        marker._locData = loc;
        marker._locIndex = i;
        markers.push(marker);
    });

    if (markers.length > 0) {
        map.fitBounds(L.featureGroup(markers).getBounds().pad(0.12));
    }
}

// ——— Menu Logic ———
function openMenu(name) {
    const loc = locations.find(l => l.name === name);
    if (!loc || !loc.menu) return;

    document.getElementById('menu-title').textContent = loc.name;
    const body = document.getElementById('menu-body');
    body.innerHTML = '<span class="menu-section-title">Signature Dishes & Highlights</span>';

    loc.menu.items.forEach(item => {
        const div = document.createElement('div');
        div.className = 'menu-item';
        div.innerHTML = `
            <div class="menu-item-name">${item.name}</div>
            <div class="menu-item-desc">${item.desc}</div>
        `;
        body.appendChild(div);
    });

    document.getElementById('full-menu-link').href = loc.menu.url;
    document.getElementById('menu-panel').classList.add('active');
}

function closeMenu() {
    document.getElementById('menu-panel').classList.remove('active');
}

// ——— Build Sidebar ———
function buildSidebar(filter) {
    const list = document.getElementById('sidebar-list');
    list.innerHTML = '';

    const groups = {
        'restaurant-star': { label: '⭐ Michelin-Starred Restaurants', items: [] },
        'restaurant-other': { label: '🍽️ Recommended & Bib Gourmand', items: [] },
        'hotel-hilton': { label: '🔹 Hilton Honors (Aspire/FN)', items: [] },
        'hotel-lux': { label: '🏨 Luxury Hotels', items: [] },
        'hotel-mid': { label: '🏡 Mid-Range & Budget Hotels', items: [] },
        'daytrip': { label: '🇩🇰 Solvang Day Trip', items: [] }
    };

    const activeTypes = Array.isArray(filter) ? filter : (filter === 'all' ? Object.keys(groups) : [filter]);

    locations.forEach((loc, i) => {
        if (activeTypes.includes(loc.type) && groups[loc.type]) {
            groups[loc.type].items.push({ loc, index: i });
        }
    });

    const sortMode = document.getElementById('sortSelect') ? document.getElementById('sortSelect').value : 'default';

    if (sortMode === 'star-desc' || sortMode === 'star-asc') {
        let allItems = [];
        Object.values(groups).forEach(g => allItems.push(...g.items));
        allItems.sort((a, b) => {
            const ra = ratingsCache[a.loc.name] || 0;
            const rb = ratingsCache[b.loc.name] || 0;
            return sortMode === 'star-desc' ? rb - ra : ra - rb;
        });
        allItems.forEach(({ loc, index }) => renderItem(list, loc, index));
    } else {
        Object.values(groups).forEach(group => {
            if (group.items.length === 0) return;
            const h2 = document.createElement('h2');
            h2.textContent = group.label;
            list.appendChild(h2);
            group.items.forEach(({ loc, index }) => renderItem(list, loc, index));
        });
    }
}

function renderItem(list, loc, index) {
    const item = document.createElement('div');
    item.className = 'legend-item';
    const currentRating = ratingsCache[loc.name] || 0;

    let starsHtml = '<span class="star-rating">';
    for (let s = 1; s <= 5; s++) {
        starsHtml += `<button class="star-btn ${s <= currentRating ? 'filled' : ''}" data-star="${s}" data-name="${loc.name}">${s <= currentRating ? '⭐' : '☆'}</button>`;
    }
    starsHtml += '</span>';

    // compact-hide class on elements that should be hidden in compact mode
    item.innerHTML = `
        <div class="legend-dot" style="background: ${loc.color}"></div>
        <div class="legend-info">
          <div class="legend-name">${loc.name} ${starsHtml}</div>
          <div class="legend-detail compact-hide">${loc.desc}</div>
          <div class="legend-price">💰 ${loc.price}</div>
          <div class="legend-address compact-hide">📍 ${loc.address}</div>
          <span class="legend-badge compact-hide badge-${loc.badge}">${loc.category}</span>
          <div class="link-row compact-hide">
            <a href="${loc.url}" target="_blank" rel="noopener" class="link-btn link-btn-primary" onclick="event.stopPropagation();">🔗 ${(loc.type && loc.type.startsWith('restaurant')) ? 'Reserve' : 'Book'}</a>
            ${loc.menu ? `<button class="link-btn link-btn-accent" onclick="event.stopPropagation(); openMenu('${loc.name}')">📋 Menu</button>` : ''}
            <a href="${mapsUrl(loc)}" target="_blank" rel="noopener" class="link-btn link-btn-secondary" onclick="event.stopPropagation();">🗺️ Map</a>
          </div>
        </div>
    `;

    // Star click handler
    item.querySelectorAll('.star-btn').forEach(btn => {
        btn.addEventListener('click', async (e) => {
            e.stopPropagation();
            await saveRating(btn.dataset.name, parseInt(btn.dataset.star));
            applyMultiFilter();
        });
    });

    item.addEventListener('click', () => {
        map.flyTo([loc.lat, loc.lng], 16, { duration: 0.8 });
        markers[index].openPopup();
        document.querySelectorAll('.legend-item').forEach(el => el.classList.remove('active'));
        item.classList.add('active');
    });
    item.addEventListener('mouseenter', () => {
        markers[index].openPopup();
        highlightMarker(markers[index]);
    });
    item.addEventListener('mouseleave', () => {
        markers[index].closePopup();
        resetMarkers();
    });
    list.appendChild(item);
}

// ——— Multi-Checkbox Filters ———
function getActiveFilters() {
    return Array.from(document.querySelectorAll('#filterGroup input[type=checkbox]:checked')).map(cb => cb.value);
}

function applyMultiFilter() {
    const active = getActiveFilters();

    markers.forEach(m => {
        if (active.includes(m._locData.type)) {
            m.addTo(map);
        } else {
            map.removeLayer(m);
        }
    });

    buildSidebar(active);

    const visible = markers.filter(m => map.hasLayer(m));
    if (visible.length > 0) {
        map.fitBounds(L.featureGroup(visible).getBounds().pad(0.15), { duration: 0.6 });
    }
}

// Wire up filter checkboxes
document.querySelectorAll('#filterGroup .filter-chip').forEach(chip => {
    const cb = chip.querySelector('input');
    chip.addEventListener('click', (e) => {
        if (e.target.tagName === 'INPUT') return;
        cb.checked = !cb.checked;
        chip.classList.toggle('checked', cb.checked);
        applyMultiFilter();
    });
    cb.addEventListener('change', () => {
        chip.classList.toggle('checked', cb.checked);
        applyMultiFilter();
    });
});

// Sort handler
document.getElementById('sortSelect').addEventListener('change', () => {
    applyMultiFilter();
});

// Compact toggle
document.getElementById('compactToggle').addEventListener('change', (e) => {
    document.getElementById('sidebar').classList.toggle('compact-mode', e.target.checked);
});

// ——— Itinerary Interactions ———
function setupItineraryInteractions() {
    document.querySelectorAll('.itinerary-slot[data-loc]').forEach(slot => {
        const locName = slot.dataset.loc;
        slot.style.cursor = 'pointer';

        slot.addEventListener('mouseenter', () => {
            const m = markers.find(mark => mark._locData.name === locName);
            if (m && map.hasLayer(m)) { m.openPopup(); highlightMarker(m); }
        });
        slot.addEventListener('mouseleave', () => {
            const m = markers.find(mark => mark._locData.name === locName);
            if (m && map.hasLayer(m)) { m.closePopup(); resetMarkers(); }
        });
        slot.addEventListener('click', () => {
            const m = markers.find(mark => mark._locData.name === locName);
            if (m && map.hasLayer(m)) { map.flyTo([m._locData.lat, m._locData.lng], 16, { duration: 0.8 }); }
        });
    });
}

// ——— Load Data ———
loadRatings().then(() => {
    fetch('locations.json')
        .then(res => res.json())
        .then(data => {
            locations = data;
            initMarkers();
            buildSidebar(getActiveFilters());
            setupItineraryInteractions();
        })
        .catch(err => {
            document.getElementById('sidebar-list').innerHTML =
                `<div class="loading-msg">⚠️ Failed to load locations: ${err.message}</div>`;
            console.error('Failed to load locations.json:', err);
        });
});

// ——— Tabs Logic ———
const tabBtns = document.querySelectorAll('.tab-btn');
const tabContents = document.querySelectorAll('.tab-content');

tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        const target = btn.dataset.tab;
        tabBtns.forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        tabContents.forEach(c => c.classList.remove('active'));
        document.getElementById(target).classList.add('active');

        if (target === 'itinerary') {
            const itLocs = Array.from(document.querySelectorAll('.itinerary-slot[data-loc]')).map(s => s.dataset.loc);
            markers.forEach(m => {
                if (itLocs.includes(m._locData.name)) { m.addTo(map); } else { map.removeLayer(m); }
            });
            const visible = markers.filter(m => map.hasLayer(m));
            if (visible.length > 0) {
                map.fitBounds(L.featureGroup(visible).getBounds().pad(0.15), { duration: 0.6 });
            }
        } else {
            applyMultiFilter();
        }
    });
});

// ——— Resizable Sidebar ———
const resizer = document.getElementById('drag-resizer');
const sidebar = document.getElementById('sidebar');
const mapContainer = document.getElementById('map');
let isResizing = false;

const savedWidth = localStorage.getItem('sidebarWidth');
const savedHeight = localStorage.getItem('sidebarHeight');
const isMobile = window.innerWidth <= 768;

if (savedWidth && !isMobile) sidebar.style.width = savedWidth;
if (savedHeight && isMobile) {
    sidebar.style.height = savedHeight;
    mapContainer.style.height = `calc(100vh - ${savedHeight})`;
}

resizer.addEventListener('mousedown', (e) => {
    isResizing = true;
    resizer.classList.add('dragging');
    document.body.style.cursor = window.innerWidth <= 768 ? 'row-resize' : 'col-resize';
    e.preventDefault();
});

document.addEventListener('mousemove', (e) => {
    if (!isResizing) return;
    const mobile = window.innerWidth <= 768;

    if (mobile) {
        const newHeight = window.innerHeight - e.clientY;
        if (newHeight >= 100 && newHeight <= window.innerHeight * 0.8) {
            const h = `${newHeight}px`;
            sidebar.style.height = h;
            mapContainer.style.height = `calc(100vh - ${h})`;
            localStorage.setItem('sidebarHeight', h);
        }
    } else {
        const newWidth = window.innerWidth - e.clientX;
        if (newWidth >= 280 && newWidth <= window.innerWidth * 0.6) {
            sidebar.style.width = `${newWidth}px`;
            localStorage.setItem('sidebarWidth', `${newWidth}px`);
        }
    }
    if (map) map.invalidateSize();
});

document.addEventListener('mouseup', () => {
    if (isResizing) {
        isResizing = false;
        resizer.classList.remove('dragging');
        document.body.style.cursor = 'default';
    }
});

window.addEventListener('resize', () => { if (map) map.invalidateSize(); });
