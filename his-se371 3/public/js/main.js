// public/js/main.js

/* ── Navbar toggle ──────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  const toggle = document.getElementById('navToggle');
  const links  = document.getElementById('navLinks');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
  }

  /* ── Highlight active nav link ──────────────────────── */
  const path = window.location.pathname.split('/')[1] || '';
  document.querySelectorAll('.nav-link').forEach(a => {
    const href = a.getAttribute('href').replace('/', '');
    if (href === path || (href === '' && path === '')) a.classList.add('active');
  });

  /* ── Dummy-data search (search form on index page) ──── */
  const searchForm    = document.getElementById('searchForm');
  const searchResults = document.getElementById('searchResults');
  if (searchForm && searchResults && typeof dummyData !== 'undefined') {
    searchForm.addEventListener('submit', e => {
      e.preventDefault();
      const q    = document.getElementById('searchQuery').value.trim().toLowerCase();
      const type = document.getElementById('searchType').value;
      const results = dummyData.filter(item => {
        const matchQ = !q || item.name.toLowerCase().includes(q) || item.id.toLowerCase().includes(q) || item.department.toLowerCase().includes(q);
        const matchT = type === 'all' || item.type === type;
        return matchQ && matchT;
      });
      renderResults(results, q);
    });
  }

  function renderResults(data, q) {
    if (!searchResults) return;
    if (!data.length) {
      searchResults.innerHTML = `<p class="text-muted text-center mt-6">No records found${q ? ` for "<strong>${q}</strong>"` : ''}.</p>`;
      return;
    }
    searchResults.innerHTML = `
      <p class="text-muted mb-4">${data.length} record(s) found</p>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th><th>Name</th><th>Type</th>
              <th>Department</th><th>Registered</th><th>Status</th>
            </tr>
          </thead>
          <tbody>
            ${data.map(r => `
              <tr>
                <td><code>${r.id}</code></td>
                <td class="fw-700">${r.name}</td>
                <td>${r.type}</td>
                <td>${r.department}</td>
                <td>${r.date}</td>
                <td>
                  <span class="badge ${r.status === 'Active' ? 'badge-resolved' : 'badge-closed'}">${r.status}</span>
                </td>
              </tr>`).join('')}
          </tbody>
        </table>
      </div>`;
  }

  /* ── Auto-dismiss alerts ────────────────────────────── */
  document.querySelectorAll('.alert').forEach(el => {
    setTimeout(() => el.style.opacity = '0', 4500);
    setTimeout(() => el.remove(), 5000);
    el.style.transition = 'opacity 0.5s';
  });

  /* ── Confirm delete ─────────────────────────────────── */
  document.querySelectorAll('[data-confirm]').forEach(btn => {
    btn.addEventListener('click', e => {
      if (!confirm(btn.dataset.confirm)) e.preventDefault();
    });
  });
});
