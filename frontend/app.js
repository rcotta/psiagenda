$(function () {

  // ── Mock data (agenda removida na Fase 4) ────────────────────────────────

  const agendaData = [
    { label: 'Segunda, 04/05', sessions: [
      { time: '09:00', patient: 'Carlos Lima',    type: 'Spot',   value: 'R$ 120', patientId: 2 },
      { time: '14:00', patient: 'Ana Souza',      type: 'Pacote', value: 'R$ 100', patientId: 1 },
    ]},
    { label: 'Terça, 05/05', sessions: [
      { time: '16:00', patient: 'Patrícia Gomes', type: 'Pacote', value: 'R$ 90',  patientId: 3 },
    ]},
    { label: 'Quarta, 06/05', sessions: [
      { time: '14:00', patient: 'Ana Souza',      type: 'Pacote', value: 'R$ 100', patientId: 1 },
    ]},
    { label: 'Quinta, 07/05', sessions: [
      { time: '09:00', patient: 'Carlos Lima',    type: 'Spot',   value: 'R$ 120', patientId: 2 },
    ]},
    { label: 'Sexta, 08/05', sessions: [
      { time: '16:00', patient: 'Patrícia Gomes', type: 'Pacote', value: 'R$ 90',  patientId: 3 },
    ]},
  ];

  // ── Helpers ──────────────────────────────────────────────────────────────
  function showScreen(id) {
    $('.screen').removeClass('active');
    $('#' + id).addClass('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (id === 'screen-patients-list') renderPatientList();
    if (id === 'screen-agenda')        renderAgenda();
    if (id === 'screen-profile')       fillProfileForm();
    const screensComClientes = ['screen-session', 'screen-package', 'screen-reschedule', 'screen-cancel-session', 'screen-payments'];
    if (screensComClientes.includes(id)) fillClienteSelects();
  }

  function showToast(msg) {
    $('#toast').text(msg).addClass('show');
    setTimeout(() => $('#toast').removeClass('show'), 2200);
  }

  function badge(status) {
    const cls   = { pago: 'badge-pago', pendente: 'badge-pendente', agendada: 'badge-agendada', realizada: 'badge-realizada' };
    const label = { pago: 'Pago', pendente: 'Pendente', agendada: 'Agendada', realizada: 'Realizada' };
    const key = status.toLowerCase();
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
  $('#btn-save-session').on('click', function () {
    const $patient = $('[name="patient"]', '#form-session');
    const $date    = $('[name="date"]',    '#form-session');
    const $time    = $('[name="time"]',    '#form-session');
    if (!validate([['Cliente', $patient], ['Data', $date], ['Hora', $time]])) return;

    const $value = $('[name="value"]', '#form-session');
    showSuccess({
      title: 'Sessão agendada!',
      subtitle: 'A sessão foi agendada com sucesso.',
      details: [
        ['Paciente', $patient.val()],
        ['Data',     formatDate($date.val())],
        ['Hora',     $time.val()],
        ['Valor',    $value.val() ? 'R$ ' + $value.val() : '—'],
      ],
      secondaryLabel: 'Agendar outra',
      secondaryTarget: 'screen-session',
    });
    $('#form-session')[0].reset();
  });

  // ── Save: Novo Pacote ────────────────────────────────────────────────────
  $('#btn-save-package').on('click', function () {
    const $patient = $('[name="patient"]', '#form-package');
    if (!validate([['Cliente', $patient]])) return;

    const qty       = $('[name="qty"]', '#form-package').val() || '—';
    const total     = $('[name="total"]', '#form-package').val();
    const isAvista  = $('[name="payment-condition"]:checked').val() === 'avista';
    const condition = isAvista ? 'À vista' : 'Parcelado em ' + $('[name="installments"]', '#form-package').val() + ' vezes';

    showSuccess({
      title: 'Pacote criado!',
      subtitle: 'O pacote foi registrado com sucesso.',
      details: [
        ['Paciente',   $patient.val()],
        ['Sessões',    qty],
        ['Valor total', total ? 'R$ ' + total : '—'],
        ['Pagamento',  condition],
      ],
      secondaryLabel: 'Criar outro pacote',
      secondaryTarget: 'screen-package',
    });
    $('#form-package')[0].reset();
  });

  // ── Save: Pagamentos ─────────────────────────────────────────────────────
  $('#btn-save-payments').on('click', function () {
    const patientId = $('#payments-patient-select').val();
    if (!patientId) { showToast('Selecione um cliente primeiro.'); return; }
    const p = patientById(patientId);
    showSuccess({
      title: 'Pagamentos atualizados!',
      subtitle: 'Os status foram salvos com sucesso.',
      details: [
        ['Paciente',   p.name],
        ['Registros',  p.payments.length + ' pagamento(s)'],
      ],
      secondaryLabel: 'Ver pagamentos',
      secondaryTarget: 'screen-payments',
    });
  });

  // ── Save: Remarcar Sessão ────────────────────────────────────────────────
  $('#btn-save-reschedule').on('click', function () {
    const $patient = $('#reschedule-patient-select');
    const $date    = $('[name="new-date"]', '#form-reschedule');
    const $time    = $('[name="new-time"]', '#form-reschedule');
    if (!validate([['Cliente', $patient], ['Nova data', $date], ['Nova hora', $time]])) return;

    const p = patientById($patient.val());
    showSuccess({
      title: 'Sessão remarcada!',
      subtitle: 'A sessão foi remarcada com sucesso.',
      details: [
        ['Paciente',        p ? p.name : $patient.find('option:selected').text()],
        ['Sessão anterior', p ? p.nextSession : '—'],
        ['Nova data',       formatDate($date.val())],
        ['Nova hora',       $time.val()],
      ],
      secondaryLabel: 'Remarcar outra',
      secondaryTarget: 'screen-reschedule',
    });
    $('#form-reschedule')[0].reset();
    $('#reschedule-current-session').html('<p class="muted">Selecione um cliente para ver a próxima sessão.</p>');
  });

  // ── Cancelar Sessão ──────────────────────────────────────────────────────
  $('#btn-cancel-session').on('click', function () {
    const $patient = $('#cancel-patient-select');
    if (!validate([['Cliente', $patient]])) return;
    const sessaoId = $patient.data('sessao-id');
    if (!sessaoId) { showToast('Nenhuma sessão agendada para cancelar.'); return; }

    const p = patientById($patient.val());
    const infoSessao = $('#cancel-current-session').text().replace('Próxima sessão: ', '').trim();
    showModal({
      title: 'Confirmar cancelamento',
      body: `Tem certeza que deseja cancelar a sessão de <strong>${p ? p.nome : ''}</strong> marcada para <strong>${infoSessao}</strong>?`,
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
              ['Paciente', p ? p.nome : ''],
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
    const id = $(this).val();
    if (!id) {
      $('#reschedule-current-session').html('<p class="muted">Selecione um cliente para ver a próxima sessão.</p>');
      return;
    }
    try {
      const sessoes = await apiFetch(`/sessoes/cliente/${id}`);
      const proxima = sessoes.find(s => s.status === 'agendada');
      if (proxima) {
        const dt  = proxima.dt_sessao.replace('T', ' ');
        const dia  = formatDate(dt.split(' ')[0]);
        const hora = dt.split(' ')[1]?.slice(0, 5) || '';
        $('#reschedule-current-session').html(
          `<p class="muted">Próxima sessão: <strong>${dia} – ${hora}</strong></p>`
        );
        $('#reschedule-patient-select').data('sessao-id', proxima.id);
      } else {
        $('#reschedule-current-session').html('<p class="muted">Nenhuma sessão agendada para este paciente.</p>');
        $('#reschedule-patient-select').data('sessao-id', null);
      }
    } catch (err) {
      showToast('Erro ao carregar sessões.');
    }
  });

  $('#cancel-patient-select').on('change', async function () {
    const id = $(this).val();
    if (!id) {
      $('#cancel-current-session').html('<p class="muted">Selecione um cliente para ver a próxima sessão.</p>');
      return;
    }
    try {
      const sessoes = await apiFetch(`/sessoes/cliente/${id}`);
      const proxima = sessoes.find(s => s.status === 'agendada');
      if (proxima) {
        const dt   = proxima.dt_sessao.replace('T', ' ');
        const dia  = formatDate(dt.split(' ')[0]);
        const hora = dt.split(' ')[1]?.slice(0, 5) || '';
        $('#cancel-current-session').html(
          `<p class="muted">Próxima sessão: <strong>${dia} – ${hora}</strong></p>`
        );
        $('#cancel-patient-select').data('sessao-id', proxima.id);
      } else {
        $('#cancel-current-session').html('<p class="muted">Nenhuma sessão agendada para este paciente.</p>');
        $('#cancel-patient-select').data('sessao-id', null);
      }
    } catch (err) {
      showToast('Erro ao carregar sessões.');
    }
  });

  // ── Dynamic: pagamentos por paciente ────────────────────────────────────
  $('#payments-patient-select').on('change', function () {
    const p = patientById($(this).val());
    const $tbody = $('#payments-table-body');
    if (!p) {
      $tbody.html('<tr><td colspan="5" class="table-empty">Selecione um cliente para ver os pagamentos.</td></tr>');
      return;
    }
    $tbody.html(p.payments.map(pay => `
      <tr>
        <td>${pay.date}</td>
        <td>${pay.type}</td>
        <td>${pay.value}</td>
        <td>
          <select class="status-select">
            <option ${pay.status === 'Pendente' ? 'selected' : ''}>Pendente</option>
            <option ${pay.status === 'Pago'     ? 'selected' : ''}>Pago</option>
          </select>
        </td>
        <td><input type="text" placeholder="Adicionar nota"></td>
      </tr>
    `).join(''));
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
  async function openPatientProfile(id) {
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
      showScreen('screen-patient-profile');
    } catch (err) {
      showToast(err.message || 'Erro ao carregar perfil do paciente.');
    }
  }

  // ── Agenda ───────────────────────────────────────────────────────────────
  function renderAgenda() {
    $('#agenda-container').html(agendaData.map(day => `
      <div class="agenda-day">
        <p class="agenda-day-label">${day.label}</p>
        ${day.sessions.map(s => `
          <div class="session-card">
            <span class="session-time">${s.time}</span>
            <div class="session-info">
              <div class="session-patient">${s.patient}</div>
              <div class="session-meta">${s.type} · ${s.value}</div>
            </div>
            <div class="session-actions">
              <button class="btn btn-secondary btn-sm agenda-reschedule" data-patient-id="${s.patientId}">Remarcar</button>
              <button class="btn btn-danger btn-sm agenda-cancel" data-patient-id="${s.patientId}">Cancelar</button>
            </div>
          </div>
        `).join('')}
      </div>
    `).join(''));
  }

  $(document).on('click', '.agenda-reschedule', function () {
    const id = $(this).data('patient-id');
    showScreen('screen-reschedule');
    $('#reschedule-patient-select').val(id).trigger('change');
  });

  $(document).on('click', '.agenda-cancel', function () {
    const id = $(this).data('patient-id');
    showScreen('screen-cancel-session');
    $('#cancel-patient-select').val(id).trigger('change');
  });

});
