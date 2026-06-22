/* ===== Config ===== */
const API_BASE = window.location.origin.includes('localhost')
  ? 'http://localhost:8000'
  : '';

const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];

let token = null;
let requestsCache = [];
let tasksCache = [];
let statsCache = null;

/* ===== API Helpers ===== */
async function api(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json', ...opts.headers };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${API_BASE}${path}`, { ...opts, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: res.statusText }));
    throw new Error(err.detail || 'Erreur serveur');
  }
  return res.json();
}

/* ===== Login ===== */
$('#login-form').addEventListener('submit', async (e) => {
  e.preventDefault();
  const email = $('#email').value.trim();
  const pass = $('#password').value.trim();
  try {
    const data = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password: pass }),
    });
    token = data.token;
    $('#login-screen').classList.add('hidden');
    $('#app').classList.remove('hidden');
    initApp();
  } catch (err) {
    alert('Email ou mot de passe incorrect.');
  }
});

$('#logout-btn').addEventListener('click', () => {
  token = null;
  requestsCache = [];
  tasksCache = [];
  statsCache = null;
  $('#app').classList.add('hidden');
  $('#login-screen').classList.remove('hidden');
  $('#email').value = '';
  $('#password').value = '';
});

/* ===== Init ===== */
async function initApp() {
  setDate();
  setupNavigation();
  setupModal();
  setupTasksUI();
  setupRequestsFilter();
  await refreshAll();
  renderPage('dashboard');
}

function setDate() {
  const d = new Date();
  $('#date-display').textContent = d.toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

async function refreshAll() {
  try {
    const [reqs, tasks, stats] = await Promise.all([
      api('/api/requests'),
      api('/api/tasks'),
      api('/api/stats'),
    ]);
    requestsCache = reqs;
    tasksCache = tasks;
    statsCache = stats;
  } catch { /* keep stale cache */ }
}

async function refreshRequests() {
  try { requestsCache = await api('/api/requests'); } catch {}
}

async function refreshTasks() {
  try { tasksCache = await api('/api/tasks'); } catch {}
}

/* ===== Navigation ===== */
function setupNavigation() {
  $$('.nav-item').forEach((item) => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const page = item.dataset.page;
      if (page) renderPage(page);
    });
  });
  $$('.card-action').forEach((link) => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const page = link.dataset.page;
      if (page) renderPage(page);
    });
  });
  $('#sidebar-toggle').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
  $('#mobile-toggle').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
  $$('.nav-item').forEach((item) => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 768) $('#sidebar').classList.remove('open');
    });
  });
}

async function renderPage(name) {
  $$('.nav-item').forEach((n) => n.classList.toggle('active', n.dataset.page === name));
  $$('.page').forEach((p) => p.classList.remove('active'));
  const target = $(`#page-${name}`);
  if (target) target.classList.add('active');
  const titles = { dashboard: 'Vue d\'ensemble', requests: 'Demandes', tasks: 'Tâches', performance: 'Performance', pricing: 'Tarifs' };
  $('#page-title').textContent = titles[name] || name;

  if (name === 'dashboard') { await refreshAll(); renderDashboard(); }
  if (name === 'requests') { await refreshRequests(); renderRequestsTable(); }
  if (name === 'tasks') { await refreshTasks(); renderTasks(); }
  if (name === 'performance') { await refreshAll(); renderPerformanceChart(); }
}

/* ===== Dashboard ===== */
function renderDashboard() {
  const s = statsCache;
  if (!s) return;

  const cards = $$('.stat-card');
  if (cards.length >= 4) {
    cards[0].querySelector('.stat-value').textContent = s.requests_month;
    cards[1].querySelector('.stat-value').textContent = s.tasks_completed;
    cards[2].querySelector('.stat-value').textContent = s.pending;
    cards[3].querySelector('.stat-value').textContent = s.rating;
  }

  renderRecentRequests();
  setupCharts();
}

function renderRecentRequests() {
  const tbody = $('#recent-requests-table');
  const recent = requestsCache.slice(0, 4);
  tbody.innerHTML = recent.map((r) => `
    <tr>
      <td><strong>${esc(r.client)}</strong></td>
      <td>${esc(r.subject)}</td>
      <td><span class="status status-${r.status.replace(/\s/g, '-')}">${esc(r.status)}</span></td>
      <td>${formatDate(r.date)}</td>
    </tr>
  `).join('');
}

/* ===== Charts ===== */
let chartRequests, chartStatus, chartPerformance;

function setupCharts() {
  const s = statsCache;
  if (!s) return;

  // Line chart
  const ctx1 = $('#chart-requests');
  if (!ctx1) return;
  if (chartRequests) chartRequests.destroy();

  chartRequests = new Chart(ctx1, {
    type: 'line',
    data: {
      labels: s.weekly_labels,
      datasets: [
        {
          label: 'Résolues', data: s.weekly_resolved,
          borderColor: '#10b981', backgroundColor: 'rgba(16,185,129,0.08)',
          fill: true, tension: 0.35, pointRadius: 4, pointHoverRadius: 6,
        },
        {
          label: 'Nouvelles', data: s.weekly_new,
          borderColor: '#3b82f6', backgroundColor: 'rgba(59,130,246,0.08)',
          fill: true, tension: 0.35, pointRadius: 4, pointHoverRadius: 6,
        },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'top', labels: { usePointStyle: true, padding: 16, font: { size: 12 } } } },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { stepSize: 2 } },
        x: { grid: { display: false } },
      },
    },
  });

  $('#dashboard-chart-period').addEventListener('change', () => {});

  // Doughnut
  const ctx2 = $('#chart-status');
  if (!ctx2) return;
  if (chartStatus) chartStatus.destroy();

  const counts = getStatusCounts();
  chartStatus = new Chart(ctx2, {
    type: 'doughnut',
    data: {
      labels: ['Nouveau', 'En cours', 'Résolu'],
      datasets: [{
        data: [counts.nouveau, counts['en cours'], counts.résolu],
        backgroundColor: ['#3b82f6', '#f59e0b', '#10b981'],
        borderWidth: 0,
      }],
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'bottom', labels: { padding: 16, usePointStyle: true, font: { size: 12 } } } },
      cutout: '65%',
    },
  });
}

function getStatusCounts() {
  const counts = { nouveau: 0, 'en cours': 0, résolu: 0 };
  requestsCache.forEach((r) => { counts[r.status] = (counts[r.status] || 0) + 1; });
  return counts;
}

function renderPerformanceChart() {
  const s = statsCache;
  if (!s || !$('#chart-performance')) return;
  const ctx = $('#chart-performance');
  if (chartPerformance) chartPerformance.destroy();

  chartPerformance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: s.weekly_labels,
      datasets: [
        { label: 'Résolues', data: s.weekly_resolved, backgroundColor: 'rgba(16,185,129,0.7)', borderRadius: 6 },
        { label: 'Nouvelles', data: s.weekly_new, backgroundColor: 'rgba(59,130,246,0.7)', borderRadius: 6 },
      ],
    },
    options: {
      responsive: true,
      plugins: { legend: { position: 'top', labels: { usePointStyle: true, padding: 16, font: { size: 12 } } } },
      scales: {
        y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { stepSize: 2 } },
        x: { grid: { display: false } },
      },
    },
  });

  // Update perf stat cards
  const resolvedEl = $('#perf-resolved');
  if (resolvedEl) resolvedEl.textContent = s.resolved_week;
  const avgEl = $('#perf-avg-time');
  if (avgEl) avgEl.textContent = s.avg_time;
  const satEl = $('#perf-satisfaction');
  if (satEl) satEl.textContent = s.satisfaction;
}

/* ===== Requests ===== */
function renderRequestsTable() {
  const tbody = $('#requests-table');
  const filter = $('#requests-filter').value;
  const query = $('#requests-search').value.toLowerCase();
  let items = requestsCache;
  if (filter !== 'all') items = items.filter((r) => r.status === filter);
  if (query) items = items.filter((r) => r.client.toLowerCase().includes(query) || r.subject.toLowerCase().includes(query));
  tbody.innerHTML = items.map((r) => `
    <tr>
      <td><strong>${esc(r.client)}</strong></td>
      <td>${esc(r.subject)}</td>
      <td><span class="priority-badge priority-${r.priority}">${esc(r.priority)}</span></td>
      <td><span class="status status-${r.status.replace(/\s/g, '-')}">${esc(r.status)}</span></td>
      <td>${formatDate(r.date)}</td>
      <td>
        <button class="action-btn" onclick="deleteRequest(${r.id})" title="Supprimer">
          <i class="fas fa-trash"></i>
        </button>
      </td>
    </tr>
  `).join('');

  const pending = requestsCache.filter((r) => r.status !== 'résolu').length;
  $('#requests-badge').textContent = pending;
}

function setupRequestsFilter() {
  $('#requests-filter').addEventListener('change', () => renderRequestsTable());
  $('#requests-search').addEventListener('input', () => renderRequestsTable());
}

async function saveRequest() {
  const client = $('#modal-client').value.trim();
  const subject = $('#modal-subject').value.trim();
  const priority = $('#modal-priority').value;
  const status = $('#modal-status').value;
  await api('/api/requests', {
    method: 'POST',
    body: JSON.stringify({ client, subject, priority, status }),
  });
  closeModal();
  await refreshRequests();
  renderRequestsTable();
  renderRecentRequests();
}

window.deleteRequest = async function (id) {
  if (!confirm('Supprimer cette demande ?')) return;
  await api(`/api/requests/${id}`, { method: 'DELETE' });
  await refreshRequests();
  renderRequestsTable();
  renderRecentRequests();
  const counts = getStatusCounts();
  if (chartStatus) {
    chartStatus.data.datasets[0].data = [counts.nouveau, counts['en cours'], counts.résolu];
    chartStatus.update();
  }
};

/* ===== Modal ===== */
function setupModal() {
  $('#add-request-btn').addEventListener('click', () => openModal());
  $('#modal-close').addEventListener('click', closeModal);
  $('#modal-cancel').addEventListener('click', closeModal);
  $('#modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  $('#modal-form').addEventListener('submit', (e) => {
    e.preventDefault();
    saveRequest();
  });
}

function openModal() {
  $('#modal-overlay').classList.add('open');
  $('#modal-title').textContent = 'Nouvelle demande';
  $('#modal-form').reset();
  $('#modal-priority').value = 'moyenne';
  $('#modal-status').value = 'nouveau';
}

function closeModal() {
  $('#modal-overlay').classList.remove('open');
}

/* ===== Tasks ===== */
function setupTasksUI() {
  $('#add-task-btn').addEventListener('click', async () => {
    const title = prompt('Nom de la tâche :');
    if (!title || !title.trim()) return;
    await api('/api/tasks', {
      method: 'POST',
      body: JSON.stringify({ title: title.trim(), desc: '' }),
    });
    await refreshTasks();
    renderTasks();
  });
}

function renderTasks() {
  const container = $('#tasks-container');
  container.innerHTML = tasksCache.map((t) => `
    <div class="task-card">
      <div class="task-header">
        <span class="task-title ${t.done ? 'done' : ''}">${esc(t.title)}</span>
        <button class="task-check ${t.done ? 'done' : ''}" onclick="toggleTask(${t.id})">
          ${t.done ? '<i class="fas fa-check"></i>' : ''}
        </button>
      </div>
      ${t.desc ? `<p class="task-desc">${esc(t.desc)}</p>` : ''}
      <div class="task-meta">
        <span class="task-priority priority-${t.priority}">${esc(t.priority)}</span>
        <button class="action-btn" onclick="deleteTask(${t.id})" title="Supprimer">
          <i class="fas fa-trash"></i>
        </button>
      </div>
    </div>
  `).join('');

  const pending = tasksCache.filter((t) => !t.done).length;
  $('#tasks-badge').textContent = pending;
}

window.toggleTask = async function (id) {
  const task = tasksCache.find((t) => t.id === id);
  if (!task) return;
  await api(`/api/tasks/${id}/toggle`, {
    method: 'PATCH',
    body: JSON.stringify({ done: !task.done }),
  });
  await refreshTasks();
  renderTasks();
};

window.deleteTask = async function (id) {
  if (!confirm('Supprimer cette tâche ?')) return;
  await api(`/api/tasks/${id}`, { method: 'DELETE' });
  await refreshTasks();
  renderTasks();
};

/* ===== Helpers ===== */
function esc(s) {
  const d = document.createElement('div');
  d.textContent = s;
  return d.innerHTML;
}

function formatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}
