$(function () {

  state.currentPatientId = null;

  const SCREEN_PATH = {
    'screen-login':          '/login',
    'screen-home':           '/',
    'screen-patient':        '/pacientes/novo',
    'screen-session':        '/sessoes/nova',
    'screen-package':        '/pacotes/novo',
    'screen-payments':       '/pagamentos',
    'screen-reschedule':     '/sessoes/remarcar',
    'screen-cancel-session': '/sessoes/cancelar',
    'screen-patients-list':  '/pacientes',
    'screen-agenda':         '/agenda',
    'screen-profile':        '/perfil',
  };

  const PATH_SCREEN = Object.fromEntries(Object.entries(SCREEN_PATH).map(([s, p]) => [p, s]));

  // ── Helpers de data ─────────────────────────────────────────────────────

  const DIAS_PT = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const DIA_VAL = { dom: 0, seg: 1, ter: 2, qua: 3, qui: 4, sex: 5, sab: 6 };

  function semanaAtual() {
    const hoje = new Date();
    const dow = hoje.getDay();
    const inicio = new Date(hoje);
    inicio.setDate(hoje.getDate() - (dow === 0 ? 6 : dow - 1));
    inicio.setHours(0, 0, 0, 0);
    const fim = new Date(inicio);
    fim.setDate(inicio.getDate() + 7);
    return { inicio, fim };
  }

  function gerarDatasRecorrentes(weekdayNums, time, qty) {
    const [h, m] = (time || '09:00').split(':').map(Number);
    const datas = [];
    const cursor = new Date();
    cursor.setDate(cursor.getDate() + 1);
    cursor.setHours(0, 0, 0, 0);
    while (datas.length < qty) {
      if (weekdayNums.includes(cursor.getDay())) {
        const dt = new Date(cursor);
        dt.setHours(h, m, 0, 0);
        datas.push(dt.toISOString().slice(0, 16));
      }
      cursor.setDate(cursor.getDate() + 1);
    }
    return datas;
  }

  // ── Helpers ──────────────────────────────────────────────────────────────
  function activateScreen(id) {
    $('.screen').removeClass('active');
    $('#' + id).addClass('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (id === 'screen-patients-list') renderPatientList();
    if (id === 'screen-agenda')        renderAgenda();
    if (id === 'screen-profile')       fillProfileForm();
    const screensComClientes = ['screen-session', 'screen-package', 'screen-reschedule', 'screen-cancel-session', 'screen-payments'];
    if (screensComClientes.includes(id)) fillClienteSelects();
  }

  function showScreen(id) {
    activateScreen(id);
    if (id === 'screen-success') return;
    const path = id === 'screen-patient-profile' && state.currentPatientId
      ? `/pacientes/${state.currentPatientId}`
      : (SCREEN_PATH[id] || '/');
    history.pushState({ screen: id, patientId: state.currentPatientId }, '', path);
  }

  function showToast(msg) {
    $('#toast').text(msg).addClass('show');
    setTimeout(() => $('#toast').removeClass('show'), 2200);
  }

  function badge(status) {
    const cls   = { pendente: 'badge-pendente', finalizada: 'badge-realizada', cancelada: 'badge-cancelada', cancelada_ausencia: 'badge-cancelada', realizado: 'badge-pago' };
    const label = { pendente: 'Agendada', finalizada: 'Realizada', cancelada: 'Cancelada', cancelada_ausencia: 'Ausência', realizado: 'Pago' };
    const key = status?.toLowerCase() || '';
    return `<span class="badge ${cls[key] || ''}">${label[key] || status}</span>`;
  }

  function initials(name) {
    return name.split(' ').slice(0, 2).map(w => w[0]).join('').toUpperCase();
  }

  function formatDate(iso) {
    if (!iso) return '—';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  function patientById(id) {
    return state.clientes.find(p => p.id === +id);
  }

  async function fillClienteSelects() {
    if (!state.clientes.length) await loadClientes();
    const opts = state.clientes.map(c =>
      `<option value="${c.id}">${c.nome}</option>`
    ).join('');
    const blank = '<option value="">Selecionar cliente</option>';
    $('select[name="patient"]').html(blank + opts);
    $('#payments-patient-select').html(blank + opts);
  }

  function validate(pairs) {
    let ok = true;
    pairs.forEach(([, $input]) => {
      const empty = !$input.val() || ($input.is('select') && $input.prop('selectedIndex') === 0);
      $input.closest('.field').toggleClass('has-error', empty);
      if (empty) ok = false;
    });
    return ok;
  }

  function showSuccess(cfg) {
    $('#success-title').text(cfg.title);
    $('#success-subtitle').text(cfg.subtitle || 'Os dados foram salvos com sucesso.');
    $('#success-details').html(
      (cfg.details || []).map(([label, value]) =>
        `<div class="detail-row"><span class="label">${label}</span><span class="value">${value}</span></div>`
      ).join('')
    );
    $('#success-secondary-btn')
      .text(cfg.secondaryLabel)
      .off('click')
      .on('click', () => showScreen(cfg.secondaryTarget));
    showScreen('screen-success');
  }

  function showModal(cfg) {
    $('#modal-title').text(cfg.title);
    $('#modal-body').html(cfg.body);
    $('#modal-btn-yes')
      .text(cfg.yesLabel || 'Confirmar')
      .off('click')
      .on('click', () => { closeModal(); cfg.onConfirm(); });
    $('#modal-confirm').addClass('active');
  }

  function closeModal() {
    $('#modal-confirm').removeClass('active');
  }

  // ── Generic navigation ───────────────────────────────────────────────────
  $(document).on('click', '.nav-link', function () {
    const target = $(this).data('target');
    if (target === 'screen-login') {
      state.token = null;
      state.usuario = null;
      localStorage.removeItem('psiagenda_token');
    }
    if (target) showScreen(target);
  });

  // ── Clear validation on input ─────────────────────────────────────────────
  $(document).on('input change', 'input, select, textarea', function () {
    $(this).closest('.field').removeClass('has-error');
  });

  // ── Modal close ──────────────────────────────────────────────────────────
  $('#modal-confirm').on('click', function (e) {
    if ($(e.target).is('#modal-confirm')) closeModal();
  });
  $('#modal-btn-no').on('click', closeModal);

  // ── Login ────────────────────────────────────────────────────────────────
  $('#login-form').on('submit', async function (e) {
    e.preventDefault();
    const login = $('[name="login"]', this).val();
    const senha = $('[name="password"]', this).val();
    const $btn  = $(this).find('button[type="submit"]');
    $btn.prop('disabled', true).text('Entrando...');
    try {
      const data = await apiFetch('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ login, senha }),
      });
      state.token = data.access_token;
      localStorage.setItem('psiagenda_token', state.token);
      state.usuario = await apiFetch('/usuarios/me');
      $('#home-greeting-name').text(state.usuario.nome);
      showScreen('screen-home');
    } catch (err) {
      showToast(err.message || 'Erro ao fazer login.');
    } finally {
      $btn.prop('disabled', false).text('Entrar');
    }
  });

  // ── Save: Cadastro de Paciente ───────────────────────────────────────────
  $('#btn-save-patient').on('click', async function () {
    const $name  = $('[name="name"]',  '#form-patient');
    const $phone = $('[name="phone"]', '#form-patient');
    if (!validate([['Nome', $name], ['Telefone', $phone]])) return;
    try {
      const cliente = await apiFetch('/clientes/', {
        method: 'POST',
        body: JSON.stringify({
          nome:     $name.val(),
          telefone: $phone.val(),
          email:    $('[name="email"]', '#form-patient').val() || null,
          notas:    $('[name="notes"]', '#form-patient').val() || null,
        }),
      });
      state.clientes = [];
      showSuccess({
        title: 'Paciente cadastrado!',
        subtitle: 'O cadastro foi salvo com sucesso.',
        details: [
          ['Nome',     cliente.nome],
          ['Telefone', cliente.telefone || '—'],
          ['Email',    cliente.email    || '—'],
        ],
        secondaryLabel: 'Cadastrar outro',
        secondaryTarget: 'screen-patient',
      });
      $('#form-patient')[0].reset();
    } catch (err) {
      showToast(err.message || 'Erro ao cadastrar paciente.');
    }
  });

  // ── Save: Nova Sessão ────────────────────────────────────────────────────
  $('#btn-save-session').on('click', async function () {
    const $patient = $('[name="patient"]', '#form-session');
    const $date    = $('[name="date"]',    '#form-session');
    const $time    = $('[name="time"]',    '#form-session');
    if (!validate([['Cliente', $patient], ['Data', $date], ['Hora', $time]])) return;

    const rawVal = $('[name="value"]', '#form-session').val().replace(',', '.');
    const valor  = parseFloat(rawVal) || 0;
    const dtStr  = $date.val() + 'T' + ($time.val() || '00:00');
    const nome   = $patient.find('option:selected').text();
    try {
      await apiFetch('/sessoes/individual', {
        method: 'POST',
        body: JSON.stringify({ id_cliente: +$patient.val(), dt_sessao: dtStr, valor }),
      });
      showSuccess({
        title: 'Sessão agendada!',
        subtitle: 'A sessão foi agendada com sucesso.',
        details: [
          ['Paciente', nome],
          ['Data',     formatDate($date.val())],
          ['Hora',     $time.val()],
          ['Valor',    valor ? 'R$ ' + rawVal : '—'],
        ],
        secondaryLabel: 'Agendar outra',
        secondaryTarget: 'screen-session',
      });
      $('#form-session')[0].reset();
    } catch (err) {
      showToast(err.message || 'Erro ao agendar sessão.');
    }
  });

  // ── Save: Novo Pacote ────────────────────────────────────────────────────
  $('#btn-save-package').on('click', async function () {
    const $patient = $('[name="patient"]', '#form-package');
    if (!validate([['Cliente', $patient]])) return;

    const qty      = parseInt($('[name="qty"]', '#form-package').val()) || 1;
    const time     = $('[name="time"]', '#form-package').val() || '09:00';
    const rawTotal = $('[name="total"]', '#form-package').val().replace(',', '.');
    const valor    = parseFloat(rawTotal) || 0;
    const nome     = $patient.find('option:selected').text();

    const checkedDays = $('[name^="freq-"] input[type="checkbox"]:checked, #form-package input[type="checkbox"]:checked')
      .map((_, el) => DIA_VAL[el.value])
      .get()
      .filter(v => v !== undefined);

    if (!checkedDays.length) { showToast('Selecione ao menos um dia da semana.'); return; }

    const sessoes = gerarDatasRecorrentes(checkedDays, time, qty);
    try {
      await apiFetch('/sessoes/pacote', {
        method: 'POST',
        body: JSON.stringify({ id_cliente: +$patient.val(), sessoes, valor }),
      });
      showSuccess({
        title: 'Pacote criado!',
        subtitle: 'O pacote foi registrado com sucesso.',
        details: [
          ['Paciente',    nome],
          ['Sessões',     qty],
          ['Valor total', valor ? 'R$ ' + rawTotal : '—'],
        ],
        secondaryLabel: 'Criar outro pacote',
        secondaryTarget: 'screen-package',
      });
      $('#form-package')[0].reset();
    } catch (err) {
      showToast(err.message || 'Erro ao criar pacote.');
    }
  });

  // ── Save: Pagamentos ─────────────────────────────────────────────────────
  $('#btn-save-payments').on('click', async function () {
    const patientId = $('#payments-patient-select').val();
    if (!patientId) { showToast('Selecione um cliente primeiro.'); return; }

    const rows = $('#payments-table-body tr[data-pag-id]');
    if (!rows.length) { showToast('Nenhum pagamento para salvar.'); return; }

    const updates = rows.map((_, tr) => {
      const $tr    = $(tr);
      const id     = $tr.data('pag-id');
      const status = $tr.find('.status-select').val();
      const notas  = $tr.find('.pag-notas').val() || null;
      return apiFetch(`/pagamentos/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ status, notas }),
      });
    }).get();

    try {
      await Promise.all(updates);
      const nome = $('#payments-patient-select option:selected').text();
      showSuccess({
        title: 'Pagamentos atualizados!',
        subtitle: 'Os status foram salvos com sucesso.',
        details: [
          ['Paciente',   nome],
          ['Registros',  rows.length + ' pagamento(s)'],
        ],
        secondaryLabel: 'Ver pagamentos',
        secondaryTarget: 'screen-payments',
      });
    } catch (err) {
      showToast(err.message || 'Erro ao salvar pagamentos.');
    }
  });

  // ── Save: Remarcar Sessão ────────────────────────────────────────────────
  $('#btn-save-reschedule').on('click', async function () {
    const $patient = $('#reschedule-patient-select');
    const $date    = $('[name="new-date"]', '#form-reschedule');
    const $time    = $('[name="new-time"]', '#form-reschedule');

    const sessaoId = $patient.data('sessao-id');
    if (!sessaoId) { showToast('Selecione um cliente com sessão agendada.'); return; }
    if (!validate([['Nova data', $date], ['Nova hora', $time]])) return;

    const dtStr = $date.val() + 'T' + ($time.val() || '00:00');
    const nome  = $patient.data('cliente-nome') || $patient.find('option:selected').text();
    try {
      await apiFetch(`/sessoes/${sessaoId}/reagendar`, {
        method: 'PUT',
        body: JSON.stringify({ dt_sessao: dtStr }),
      });
      showSuccess({
        title: 'Sessão remarcada!',
        subtitle: 'A sessão foi remarcada com sucesso.',
        details: [
          ['Paciente',  nome],
          ['Nova data', formatDate($date.val())],
          ['Nova hora', $time.val()],
        ],
        secondaryLabel: 'Remarcar outra',
        secondaryTarget: 'screen-reschedule',
      });
      $('#form-reschedule')[0].reset();
      $('#reschedule-current-session').html('<p class="muted">Selecione um cliente para ver a próxima sessão.</p>');
    } catch (err) {
      showToast(err.message || 'Erro ao remarcar sessão.');
    }
  });

  // ── Cancelar Sessão ──────────────────────────────────────────────────────
  $('#btn-cancel-session').on('click', function () {
    const $patient = $('#cancel-patient-select');
    const sessaoId = $patient.data('sessao-id');
    if (!sessaoId) { showToast('Selecione um cliente com sessão agendada.'); return; }

    const nomeCliente = $patient.data('cliente-nome') || $patient.find('option:selected').text();
    const infoSessao = $('#cancel-current-session').text().replace('Próxima sessão: ', '').trim();
    showModal({
      title: 'Confirmar cancelamento',
      body: `Tem certeza que deseja cancelar a sessão de <strong>${nomeCliente}</strong> marcada para <strong>${infoSessao}</strong>?`,
      yesLabel: 'Sim, cancelar',
      onConfirm: async () => {
        const reason = $('[name="reason"]', '#form-cancel').val();
        const notas  = $('[name="notes"]',  '#form-cancel').val();
        const status = reason === 'ausência do paciente' ? 'cancelada_ausencia' : 'cancelada';
        try {
          await apiFetch(`/sessoes/${sessaoId}/cancelar`, {
            method: 'PUT',
            body: JSON.stringify({ status, notas: notas || null }),
          });
          showSuccess({
            title: 'Sessão cancelada!',
            subtitle: 'O cancelamento foi registrado.',
            details: [
              ['Paciente', nomeCliente],
              ['Sessão',   infoSessao],
              ['Motivo',   reason],
            ],
            secondaryLabel: 'Cancelar outra',
            secondaryTarget: 'screen-cancel-session',
          });
          $('#form-cancel')[0].reset();
          $('#cancel-current-session').html('<p class="muted">Selecione um cliente para ver a próxima sessão.</p>');
        } catch (err) {
          showToast(err.message || 'Erro ao cancelar sessão.');
        }
      },
    });
  });

  // ── Meu Perfil: pré-preencher ────────────────────────────────────────────
  function fillProfileForm() {
    if (!state.usuario) return;
    $('[name="name"]', '#form-profile').val(state.usuario.nome);
  }

  // ── Meu Perfil: salvar ───────────────────────────────────────────────────
  $('#btn-save-profile').on('click', async function () {
    const nome = $('[name="name"]', '#form-profile').val();
    if (!nome) { showToast('Informe o nome.'); return; }
    try {
      await apiFetch('/usuarios/me', { method: 'PUT', body: JSON.stringify({ nome }) });
      state.usuario.nome = nome;
      $('#home-greeting-name').text(nome);
      showToast('Perfil atualizado com sucesso.');
      showScreen('screen-home');
    } catch (err) {
      showToast(err.message || 'Erro ao salvar perfil.');
    }
  });

  // ── Editar paciente (placeholder) ────────────────────────────────────────
  $('#btn-edit-patient').on('click', function () {
    showToast('Edição de paciente em desenvolvimento.');
  });

  // ── Dynamic: seleção de paciente → próxima sessão ────────────────────────
  $('#reschedule-patient-select').on('change', async function () {
    const id   = $(this).val();
    const nome = $(this).find('option:selected').text();
    if (!id) {
      $('#reschedule-current-session').html('<p class="muted">Selecione um cliente para ver a próxima sessão.</p>');
      $(this).data({ 'sessao-id': null, 'cliente-nome': '' });
      return;
    }
    $(this).data('cliente-nome', nome);
    try {
      const sessoes = await apiFetch(`/sessoes/cliente/${id}`);
      const proxima = sessoes.find(s => s.status === 'pendente');
      if (proxima) {
        const dt   = proxima.dt_sessao.replace('T', ' ');
        const dia  = formatDate(dt.split(' ')[0]);
        const hora = dt.split(' ')[1]?.slice(0, 5) || '';
        $('#reschedule-current-session').html(
          `<p class="muted">Próxima sessão: <strong>${dia} – ${hora}</strong></p>`
        );
        $(this).data('sessao-id', proxima.id);
      } else {
        $('#reschedule-current-session').html('<p class="muted">Nenhuma sessão agendada para este paciente.</p>');
        $(this).data('sessao-id', null);
      }
    } catch (err) {
      showToast('Erro ao carregar sessões.');
    }
  });

  $('#cancel-patient-select').on('change', async function () {
    const id   = $(this).val();
    const nome = $(this).find('option:selected').text();
    if (!id) {
      $('#cancel-current-session').html('<p class="muted">Selecione um cliente para ver a próxima sessão.</p>');
      $(this).data({ 'sessao-id': null, 'cliente-nome': '' });
      return;
    }
    $(this).data('cliente-nome', nome);
    try {
      const sessoes = await apiFetch(`/sessoes/cliente/${id}`);
      const proxima = sessoes.find(s => s.status === 'pendente');
      if (proxima) {
        const dt   = proxima.dt_sessao.replace('T', ' ');
        const dia  = formatDate(dt.split(' ')[0]);
        const hora = dt.split(' ')[1]?.slice(0, 5) || '';
        $('#cancel-current-session').html(
          `<p class="muted">Próxima sessão: <strong>${dia} – ${hora}</strong></p>`
        );
        $(this).data('sessao-id', proxima.id);
      } else {
        $('#cancel-current-session').html('<p class="muted">Nenhuma sessão agendada para este paciente.</p>');
        $(this).data('sessao-id', null);
      }
    } catch (err) {
      showToast('Erro ao carregar sessões.');
    }
  });

  // ── Dynamic: pagamentos por paciente ────────────────────────────────────
  $('#payments-patient-select').on('change', async function () {
    const id     = $(this).val();
    const $tbody = $('#payments-table-body');
    if (!id) {
      $tbody.html('<tr><td colspan="5" class="table-empty">Selecione um cliente para ver os pagamentos.</td></tr>');
      return;
    }
    try {
      const pagamentos = await apiFetch(`/pagamentos/cliente/${id}`);
      if (!pagamentos.length) {
        $tbody.html('<tr><td colspan="5" class="table-empty">Nenhum pagamento encontrado para este cliente.</td></tr>');
        return;
      }
      $tbody.html(pagamentos.map(pag => `
        <tr data-pag-id="${pag.id}" data-status-orig="${pag.status}">
          <td>${pag.dt_vencimento ? formatDate(pag.dt_vencimento) : '—'}</td>
          <td>${pag.tipo_sessao || '—'}</td>
          <td>R$ ${pag.valor ?? '—'}</td>
          <td>
            <select class="status-select">
              <option value="pendente"  ${pag.status === 'pendente'  ? 'selected' : ''}>Pendente</option>
              <option value="realizado" ${pag.status === 'realizado' ? 'selected' : ''}>Pago</option>
              <option value="cancelado" ${pag.status === 'cancelado' ? 'selected' : ''}>Cancelado</option>
            </select>
          </td>
          <td><input type="text" class="pag-notas" placeholder="Adicionar nota" value="${pag.notas || ''}"></td>
        </tr>
      `).join(''));
    } catch (err) {
      showToast('Erro ao carregar pagamentos.');
    }
  });

  // ── Lista de Pacientes ───────────────────────────────────────────────────
  async function renderPatientList(filter) {
    if (filter === undefined) $('#patient-search').val('');
    if (!state.clientes.length) {
      try { await loadClientes(); } catch (err) { showToast('Erro ao carregar pacientes.'); return; }
    }
    const q    = (filter || '').toLowerCase();
    const list = q ? state.clientes.filter(p => p.nome.toLowerCase().includes(q)) : state.clientes;
    const $tbody = $('#patients-table-body');
    if (!list.length) {
      $tbody.html('<tr><td colspan="5" class="table-empty">Nenhum paciente encontrado.</td></tr>');
      return;
    }
    $tbody.html(list.map(p => `
      <tr data-patient-id="${p.id}">
        <td><strong>${p.nome}</strong></td>
        <td>${p.telefone || '—'}</td>
        <td>${p.email   || '—'}</td>
        <td>—</td>
        <td><button class="btn-link">Ver perfil</button></td>
      </tr>
    `).join(''));
  }

  $('#patient-search').on('input', function () {
    renderPatientList($(this).val());
  });

  $(document).on('click', '#patients-table-body tr', function () {
    const id = $(this).data('patient-id');
    if (id) openPatientProfile(+id);
  });

  // ── Perfil do Paciente ───────────────────────────────────────────────────
  async function openPatientProfile(id, { pushHistory = true } = {}) {
    state.currentPatientId = id;
    try {
      const [cliente, sessoes] = await Promise.all([
        apiFetch(`/clientes/${id}`),
        apiFetch(`/sessoes/cliente/${id}`),
      ]);
      $('#profile-back-label').text(cliente.nome);
      $('#profile-avatar').text(initials(cliente.nome));
      $('#profile-name').text(cliente.nome);
      $('#profile-contact').text([cliente.telefone, cliente.email].filter(Boolean).join('  ·  ') || '—');
      $('#profile-notes-block').html(
        cliente.notas ? `<div class="notes-block">${cliente.notas}</div>` : ''
      );
      $('#profile-sessions-tbody').html(sessoes.length
        ? sessoes.map(s => {
            const dt  = s.dt_sessao.replace('T', ' ');
            const dia  = dt.split(' ')[0];
            const hora = dt.split(' ')[1]?.slice(0, 5) || '—';
            return `<tr>
              <td>${formatDate(dia)}</td>
              <td>${hora}</td>
              <td>${s.tipo || '—'}</td>
              <td>—</td>
              <td>${badge(s.status)}</td>
            </tr>`;
          }).join('')
        : '<tr><td colspan="5" class="table-empty">Nenhuma sessão registrada.</td></tr>'
      );
      activateScreen('screen-patient-profile');
      if (pushHistory) {
        history.pushState({ screen: 'screen-patient-profile', patientId: id }, '', `/pacientes/${id}`);
      }
    } catch (err) {
      showToast(err.message || 'Erro ao carregar perfil do paciente.');
    }
  }

  // ── Agenda ───────────────────────────────────────────────────────────────
  async function renderAgenda() {
    const { inicio, fim } = semanaAtual();
    $('#agenda-container').html('<p class="muted">Carregando...</p>');
    try {
      const sessoes = await apiFetch(
        `/sessoes/agenda?inicio=${inicio.toISOString()}&fim=${fim.toISOString()}`
      );
      if (!sessoes.length) {
        $('#agenda-container').html('<p class="muted">Nenhuma sessão esta semana.</p>');
        return;
      }
      const byDay = {};
      sessoes.forEach(s => {
        const dia = s.dt_sessao.split('T')[0];
        if (!byDay[dia]) byDay[dia] = [];
        byDay[dia].push(s);
      });
      $('#agenda-container').html(
        Object.keys(byDay).sort().map(dia => {
          const d     = new Date(dia + 'T12:00:00');
          const label = `${DIAS_PT[d.getDay()]}, ${formatDate(dia)}`;
          const cards = byDay[dia].map(s => {
            const hora = s.dt_sessao.split('T')[1]?.slice(0, 5) || '—';
            return `
              <div class="session-card">
                <span class="session-time">${hora}</span>
                <div class="session-info">
                  <div class="session-patient">${s.nome_cliente || '—'}</div>
                  <div class="session-meta">${s.tipo || '—'}</div>
                </div>
                <div class="session-actions">
                  <button class="btn btn-secondary btn-sm agenda-reschedule" data-patient-id="${s.id_cliente}">Remarcar</button>
                  <button class="btn btn-danger btn-sm agenda-cancel" data-patient-id="${s.id_cliente}">Cancelar</button>
                </div>
              </div>`;
          }).join('');
          return `<div class="agenda-day"><p class="agenda-day-label">${label}</p>${cards}</div>`;
        }).join('')
      );
    } catch (err) {
      showToast('Erro ao carregar agenda.');
      $('#agenda-container').html('<p class="muted">Erro ao carregar agenda.</p>');
    }
  }

  $(document).on('click', '.agenda-reschedule', async function () {
    const id = $(this).data('patient-id');
    showScreen('screen-reschedule');
    await fillClienteSelects();
    $('#reschedule-patient-select').val(id).trigger('change');
  });

  $(document).on('click', '.agenda-cancel', async function () {
    const id = $(this).data('patient-id');
    showScreen('screen-cancel-session');
    await fillClienteSelects();
    $('#cancel-patient-select').val(id).trigger('change');
  });

  // ── Roteamento por path ──────────────────────────────────────────────────
  async function navigateToPath(path) {
    const m = path.match(/^\/pacientes\/(\d+)$/);
    if (m) { await openPatientProfile(+m[1], { pushHistory: false }); return; }
    const screen = PATH_SCREEN[path];
    activateScreen(screen || (state.token ? 'screen-home' : 'screen-login'));
  }

  window.addEventListener('popstate', async function (e) {
    const { screen, patientId } = e.state || {};
    if (screen === 'screen-patient-profile' && patientId) {
      await openPatientProfile(patientId, { pushHistory: false });
    } else if (screen) {
      activateScreen(screen);
    } else {
      await navigateToPath(location.pathname);
    }
  });

  (async function init() {
    if (state.token) {
      try {
        state.usuario = await apiFetch('/usuarios/me');
        $('#home-greeting-name').text(state.usuario.nome);
        await navigateToPath(location.pathname);
      } catch {
        state.token = null;
        localStorage.removeItem('psiagenda_token');
        activateScreen('screen-login');
      }
    } else {
      activateScreen('screen-login');
    }
    const activeId = $('.screen.active').attr('id');
    const activePath = activeId === 'screen-patient-profile' && state.currentPatientId
      ? `/pacientes/${state.currentPatientId}`
      : (SCREEN_PATH[activeId] || location.pathname);
    history.replaceState({ screen: activeId, patientId: state.currentPatientId }, '', activePath);
  })();

});
