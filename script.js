// ── DOM references ──────────────────────────────────────────
const searchInput  = document.getElementById('searchInput');
const searchBtn    = document.getElementById('searchBtn');
const showAllBtn   = document.getElementById('showAllBtn');
const phoneGrid    = document.getElementById('phoneGrid');
const loader       = document.getElementById('loader');
const errorMsg     = document.getElementById('errorMsg');
const resultsInfo  = document.getElementById('resultsInfo');
const modal        = document.getElementById('modal');
const modalOverlay = document.getElementById('modalOverlay');
const modalClose   = document.getElementById('modalClose');
const modalContent = document.getElementById('modalContent');

const BASE_URL = 'https://openapi.programming-hero.com/api';

// ── Utility: show / hide loader ──────────────────────────────
function showLoader()  { loader.classList.remove('hidden'); }
function hideLoader()  { loader.classList.add('hidden'); }

function showError(msg) {
  errorMsg.textContent = msg;
  errorMsg.classList.remove('hidden');
}
function hideError() { errorMsg.classList.add('hidden'); }

// ── Fetch phones list by search query ───────────────────────
async function fetchPhones(query) {
  const res  = await fetch(`${BASE_URL}/phones?search=${encodeURIComponent(query)}`);
  if (!res.ok) throw new Error('Failed to fetch phones.');
  const json = await res.json();
  return json.data || [];
}

// ── Fetch single phone detail ────────────────────────────────
async function fetchPhoneDetail(slug) {
  const res  = await fetch(`${BASE_URL}/phone/${slug}`);
  if (!res.ok) throw new Error('Could not load phone details.');
  const json = await res.json();
  return json.data || null;
}

// ── Render cards to grid ─────────────────────────────────────
function renderCards(phones) {
  phoneGrid.innerHTML = '';

  if (!phones.length) {
    phoneGrid.innerHTML = `
      <div class="empty-state">
        <span class="big-icon">📵</span>
        <h3>No phones found</h3>
        <p>Try a different search term, or hit <strong>Show All</strong>.</p>
      </div>`;
    resultsInfo.classList.add('hidden');
    return;
  }

  resultsInfo.textContent = `${phones.length} result${phones.length !== 1 ? 's' : ''} found`;
  resultsInfo.classList.remove('hidden');

  phones.forEach(phone => {
    const card = document.createElement('div');
    card.className = 'phone-card';
    card.innerHTML = `
      <div class="card-img-wrap">
        <img src="${phone.image}" alt="${phone.phone_name}" loading="lazy"
             onerror="this.src='https://via.placeholder.com/120x160?text=No+Image'"/>
      </div>
      <div class="card-body">
        <div class="card-brand">${phone.brand || 'Unknown'}</div>
        <div class="card-name">${phone.phone_name}</div>
        <div class="card-slug">${phone.slug}</div>
        <div class="card-btn">View Details →</div>
      </div>`;
    card.addEventListener('click', () => openModal(phone.slug));
    phoneGrid.appendChild(card);
  });
}

// ── Search handler ───────────────────────────────────────────
async function handleSearch() {
  const query = searchInput.value.trim();
  if (!query) {
    showError('Please enter a search term.');
    return;
  }
  hideError();
  showLoader();
  phoneGrid.innerHTML = '';
  resultsInfo.classList.add('hidden');

  try {
    const phones = await fetchPhones(query);
    renderCards(phones);
  } catch (err) {
    showError(err.message);
  } finally {
    hideLoader();
  }
}

// ── Show All handler (default: samsung) ─────────────────────
async function handleShowAll() {
  hideError();
  showLoader();
  phoneGrid.innerHTML = '';
  resultsInfo.classList.add('hidden');
  searchInput.value = '';

  // The API requires a search term; use common brands to get a broad set
  const queries = ['samsung', 'apple', 'oppo', 'xiaomi', 'nokia'];
  try {
    const results = await Promise.all(queries.map(q => fetchPhones(q)));
    // Flatten and deduplicate by slug
    const seen   = new Set();
    const phones = results.flat().filter(p => {
      if (seen.has(p.slug)) return false;
      seen.add(p.slug);
      return true;
    });
    renderCards(phones);
  } catch (err) {
    showError(err.message);
  } finally {
    hideLoader();
  }
}

// ── Modal: open with phone details ──────────────────────────
async function openModal(slug) {
  modalContent.innerHTML = '<div class="loader" style="padding:40px 0"><div class="spinner"></div><p>Loading…</p></div>';
  modal.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  try {
    const phone = await fetchPhoneDetail(slug);
    if (!phone) throw new Error('No data returned.');
    renderModal(phone);
  } catch (err) {
    modalContent.innerHTML = `<p style="color:#ff8080;text-align:center;padding:40px 0">⚠ ${err.message}</p>`;
  }
}

function closeModal() {
  modal.classList.add('hidden');
  document.body.style.overflow = '';
}

// ── Render detailed info inside modal ───────────────────────
function renderModal(phone) {
  const ms  = phone.mainFeatures  || {};
  const os  = phone.others        || {};
  const img = phone.image         || '';
  const name = phone.name         || 'Unknown Phone';
  const brand = phone.brand       || '';

  // helpers
  const val = (v) => v
    ? `<span class="spec-value">${Array.isArray(v) ? v.join(', ') : v}</span>`
    : `<span class="no-data-badge">N/A</span>`;

  // release status
  const releasedNote = phone.releaseDate
    ? `<div class="modal-release-note">📅 Released: ${phone.releaseDate}</div>`
    : '';

  const notYetReleased = (phone.releaseDate === null || phone.releaseDate === undefined)
    ? `<div class="modal-release-note" style="color:#e8ff47;border-color:rgba(232,255,71,0.3);background:rgba(232,255,71,0.05)">⚡ Release date not confirmed yet</div>`
    : '';

  modalContent.innerHTML = `
    <div class="modal-img-wrap">
      <img src="${img}" alt="${name}"
           onerror="this.src='https://via.placeholder.com/120x160?text=No+Image'"/>
    </div>
    <div class="modal-brand">${brand}</div>
    <div class="modal-title">${name}</div>

    <div class="spec-grid">
      <div class="spec-item">
        <div class="spec-label">Storage</div>
        ${val(ms.storage)}
      </div>
      <div class="spec-item">
        <div class="spec-label">RAM</div>
        ${val(ms.memory)}
      </div>
      <div class="spec-item">
        <div class="spec-label">Display</div>
        ${val(ms.displaySize)}
      </div>
      <div class="spec-item">
        <div class="spec-label">Chipset</div>
        ${val(ms.chipSet)}
      </div>
      <div class="spec-item">
        <div class="spec-label">Battery</div>
        ${val(ms.battery)}
      </div>
      <div class="spec-item">
        <div class="spec-label">Camera</div>
        ${val(ms.mainCamera)}
      </div>
      <div class="spec-item">
        <div class="spec-label">OS</div>
        ${val(os.os)}
      </div>
      <div class="spec-item">
        <div class="spec-label">Sensors</div>
        ${val(os.sensors)}
      </div>
      ${ms.wlan ? `
      <div class="spec-item">
        <div class="spec-label">Wi-Fi</div>
        ${val(ms.wlan)}
      </div>` : ''}
      ${ms.bluetooth ? `
      <div class="spec-item">
        <div class="spec-label">Bluetooth</div>
        ${val(ms.bluetooth)}
      </div>` : ''}
    </div>

    ${releasedNote}
    ${!releasedNote ? notYetReleased : ''}
  `;
}

// ── Event listeners ──────────────────────────────────────────
searchBtn.addEventListener('click', handleSearch);
showAllBtn.addEventListener('click', handleShowAll);
modalClose.addEventListener('click', closeModal);
modalOverlay.addEventListener('click', closeModal);

searchInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') handleSearch();
});

// ── Initial load: show samsung phones as default ─────────────
(async () => {
  showLoader();
  try {
    const phones = await fetchPhones('samsung');
    renderCards(phones);
  } catch (err) {
    showError(err.message);
  } finally {
    hideLoader();
  }
})();
