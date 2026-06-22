/* ===== State ===== */
const state = {
  loggedIn: false,
  currentPage: 'dashboard',
  requests: [...DATA.requests],
  tasks: [...DATA.tasks],
  requestIdCounter: DATA.requests.length + 1,
};

/* ===== DOM refs ===== */
const $ = (s, p = document) => p.querySelector(s);
const $$ = (s, p = document) => [...p.querySelectorAll(s)];

/* ===== Login ===== */
$('#login-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const email = $('#email').value.trim();
  const pass = $('#password').value.trim();
  if (email === 'admin@petipro.fr' && pass === 'demo1234') {
    state.loggedIn = true;
    $('#login-screen').classList.add('hidden');
    $('#app').classList.remove('hidden');
    initApp();
  } else {
    alert('Email ou mot de passe incorrect. Essayez admin@petipro.fr / demo1234');
  }
});

$('#logout-btn').addEventListener('click', () => {
  state.loggedIn = false;
  $('#app').classList.add('hidden');
  $('#login-screen').classList.remove('hidden');
  $('#email').value = '';
  $('#password').value = '';
});

/* ===== Init App ===== */
function initApp() {
  setDate();
  renderPage('dashboard');
  setupNavigation();
  setupModal();
  setupTasks();
  setupRequestsFilter();
  setupCharts();
}

function setDate() {
  const d = new Date();
  $('#date-display').textContent = d.toLocaleDateString('fr-FR', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
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
  // Mobile toggle
  $('#sidebar-toggle').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
  $('#mobile-toggle').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
  // Close sidebar on nav click (mobile)
  $$('.nav-item').forEach((item) => {
    item.addEventListener('click', () => {
      if (window.innerWidth <= 768) $('#sidebar').classList.remove('open');
    });
  });
}

function renderPage(name) {
  state.currentPage = name;
  // Nav
  $$('.nav-item').forEach((n) => n.classList.toggle('active', n.dataset.page === name));
  // Pages
  $$('.page').forEach((p) => p.classList.remove('active'));
  const target = $(`#page-${name}`);
  if (target) target.classList.add('active');
  // Title
  const titles = { dashboard: 'Vue d\'ensemble', requests: 'Demandes', tasks: 'Tâches', performance: 'Performance', pricing: 'Tarifs' };
  $('#page-title').textContent = titles[name] || name;
  // Refresh data on specific pages
  if (name === 'requests') renderRequestsTable();
  if (name === 'tasks') renderTasks();
  if (name === 'dashboard') renderRecentRequests();
  if (name === 'performance') renderPerformanceChart();
}

/* ===== Charts ===== */
let chartRequests, chartStatus, chartPerformance;

function setupCharts() {
  // Dashboard chart
  const ctx1 = $('#chart-requests').getContext('2d');
  chartRequests = new Chart(ctx1, {
    type: 'line',
    data: getRequestsChartData(7),
    options: getLineOpts(),
  });
  $('#dashboard-chart-period').addEventListener('change', (e) => {
    const days = parseInt(e.target.value);
    chartRequests.data = getRequestsChartData(days);
    chartRequests.update();
  });

  // Status pie
  const ctx2 = $('#chart-status').getContext('2d');
  const statusCounts = getStatusCounts();
  chartStatus = new Chart(ctx2, {
    type: 'doughnut',
    data: {
      labels: ['Nouveau', 'En cours', 'Résolu'],
      datasets: [{
        data: [statusCounts.nouveau, statusCounts['en cours'], statusCounts.résolu],
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

  // Performance chart
  chartPerformance = null;
  renderPerformanceChart();
}

function getRequestsChartData(days) {
  const count = Math.min(days, 7);
  const labels = DATA.weeklyStats.labels.slice(-count);
  const resolved = DATA.weeklyStats.resolved.slice(-count);
  const newReq = DATA.weeklyStats.newRequests.slice(-count);
  return {
    labels,
    datasets: [
      {
        label: 'Résolues',
        data: resolved,
        borderColor: '#10b981',
        backgroundColor: 'rgba(16,185,129,0.08)',
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
      {
        label: 'Nouvelles',
        data: newReq,
        borderColor: '#3b82f6',
        backgroundColor: 'rgba(59,130,246,0.08)',
        fill: true,
        tension: 0.35,
        pointRadius: 4,
        pointHoverRadius: 6,
      },
    ],
  };
}

function getLineOpts() {
  return {
    responsive: true,
    plugins: { legend: { position: 'top', labels: { usePointStyle: true, padding: 16, font: { size: 12 } } } },
    scales: {
      y: { beginAtZero: true, grid: { color: 'rgba(0,0,0,0.04)' }, ticks: { stepSize: 2 } },
      x: { grid: { display: false } },
    },
  };
}

function getStatusCounts() {
  const counts = { nouveau: 0, 'en cours': 0, résolu: 0 };
  state.requests.forEach((r) => { counts[r.status] = (counts[r.status] || 0) + 1; });
  return counts;
}

function renderPerformanceChart() {
  if (!chartPerformance && !$('#chart-performance')) return;
  const ctx = $('#chart-performance').getContext('2d');
  if (chartPerformance) { chartPerformance.destroy(); }
  chartPerformance = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: DATA.weeklyStats.labels,
      datasets: [
        {
          label: 'Résolues',
          data: DATA.weeklyStats.resolved,
          backgroundColor: 'rgba(16,185,129,0.7)',
          borderRadius: 6,
        },
        {
          label: 'Nouvelles',
          data: DATA.weeklyStats.newRequests,
          backgroundColor: 'rgba(59,130,246,0.7)',
          borderRadius: 6,
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
}

/* ===== Requests ===== */
function renderRecentRequests() {
  const tbody = $('#recent-requests-table');
  const recent = state.requests.slice(0, 4);
  tbody.innerHTML = recent.map((r) => `
    <tr>
      <td><strong>${esc(r.client)}</strong></td>
      <td>${esc(r.subject)}</td>
      <td><span class="status status-${r.status.replace(/\s/g, '-')}">${esc(r.status)}</span></td>
      <td>${formatDate(r.date)}</td>
    </tr>
  `).join('');
}

function renderRequestsTable() {
  const tbody = $('#requests-table');
  const filter = $('#requests-filter').value;
  const query = $('#requests-search').value.toLowerCase();
  let items = state.requests;
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
  // Update badge
  const pending = state.requests.filter((r) => r.status !== 'résolu').length;
  $('#requests-badge').textContent = pending;
}

function setupRequestsFilter() {
  $('#requests-filter').addEventListener('change', renderRequestsTable);
  $('#requests-search').addEventListener('input', renderRequestsTable);
}

/* ===== Modal ===== */
let modalMode = 'request';

function setupModal() {
  $('#add-request-btn').addEventListener('click', () => openModal());
  $('#modal-close').addEventListener('click', closeModal);
  $('#modal-cancel').addEventListener('click', closeModal);
  $('#modal-overlay').addEventListener('click', (e) => {
    if (e.target === e.currentTarget) closeModal();
  });
  $('#modal-form').addEventListener('submit', (e) => {
    e.preventDefault();
    if (modalMode === 'request') saveRequest();
  });
}

function openModal(data = null) {
  $('#modal-overlay').classList.add('open');
  if (data) {
    $('#modal-title').textContent = 'Modifier la demande';
    $('#modal-client').value = data.client;
    $('#modal-subject').value = data.subject;
    $('#modal-priority').value = data.priority;
    $('#modal-status').value = data.status;
  } else {
    $('#modal-title').textContent = 'Nouvelle demande';
    $('#modal-form').reset();
    $('#modal-priority').value = 'moyenne';
    $('#modal-status').value = 'nouveau';
  }
}

function closeModal() {
  $('#modal-overlay').classList.remove('open');
}

function saveRequest() {
  const client = $('#modal-client').value.trim();
  const subject = $('#modal-subject').value.trim();
  const priority = $('#modal-priority').value;
  const status = $('#modal-status').value;
  state.requests.unshift({
    id: state.requestIdCounter++,
    client,
    subject,
    priority,
    status,
    date: todayStr(),
  });
  closeModal();
  renderRequestsTable();
  renderRecentRequests();
  updateDashboardCharts();
}

window.deleteRequest = function (id) {
  if (!confirm('Supprimer cette demande ?')) return;
  state.requests = state.requests.filter((r) => r.id !== id);
  renderRequestsTable();
  renderRecentRequests();
  updateDashboardCharts();
};

function updateDashboardCharts() {
  const counts = getStatusCounts();
  chartStatus.data.datasets[0].data = [counts.nouveau, counts['en cours'], counts.résolu];
  chartStatus.update();
}

/* ===== Tasks ===== */
function setupTasks() {
  $('#add-task-btn').addEventListener('click', () => {
    const title = prompt('Nom de la tâche :');
    if (!title || !title.trim()) return;
    const desc = prompt('Description (optionnelle) :') || '';
    state.tasks.unshift({
      id: Date.now(),
      title: title.trim(),
      desc,
      priority: 'moyenne',
      done: false,
    });
    renderTasks();
  });
}

function renderTasks() {
  const container = $('#tasks-container');
  container.innerHTML = state.tasks.map((t) => `
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
  // Update badge
  const pending = state.tasks.filter((t) => !t.done).length;
  $('#tasks-badge').textContent = pending;
}

window.toggleTask = function (id) {
  const task = state.tasks.find((t) => t.id === id);
  if (task) { task.done = !task.done; renderTasks(); }
};

window.deleteTask = function (id) {
  if (!confirm('Supprimer cette tâche ?')) return;
  state.tasks = state.tasks.filter((t) => t.id !== id);
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

function todayStr() {
  const d = new Date();
  return d.toISOString().slice(0, 10);
}
