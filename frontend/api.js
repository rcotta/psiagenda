const API_BASE = 'http://localhost:8000';

const state = {
  token: localStorage.getItem('psiagenda_token') || null,
  usuario: null,
  clientes: [],
};

async function apiFetch(path, opts = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (state.token) headers['Authorization'] = `Bearer ${state.token}`;
  if (opts.headers) Object.assign(headers, opts.headers);

  const res = await fetch(API_BASE + path, { ...opts, headers });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    const err = new Error(body.detail || `Erro ${res.status}`);
    err.status = res.status;
    throw err;
  }

  return res.json();
}

async function loadClientes() {
  state.clientes = await apiFetch('/clientes/');
  return state.clientes;
}
