$(function () {

  // ── Mock data ────────────────────────────────────────────────────────────
  const patients = [
    {
      id: 1, name: 'Ana Souza', phone: '(11) 91234-5678', email: 'ana.souza@email.com',
      notes: 'Paciente desde jan/2025. Ansiedade generalizada.',
      nextSession: '14.05.2026 – 14:00',
      payments: [
        { date: '12.03', type: 'Spot',   value: 'R$ 100', status: 'Pendente' },
        { date: '19.03', type: 'Pacote', value: 'R$ 100', status: 'Pendente' },
        { date: '26.03', type: 'Pacote', value: 'R$ 100', status: 'Pendente' },
      ],
      sessions: [
        { date: '12.03.2026', time: '14:00', type: 'Spot',   value: 'R$ 100', status: 'realizada' },
        { date: '19.03.2026', time: '14:00', type: 'Pacote', value: 'R$ 100', status: 'realizada' },
        { date: '26.03.2026', time: '14:00', type: 'Pacote', value: 'R$ 100', status: 'realizada' },
        { date: '14.05.2026', time: '14:00', type: 'Pacote', value: 'R$ 100', status: 'agendada'  },
      ],
    },
    {
      id: 2, name: 'Carlos Lima', phone: '(21) 98765-4321', email: 'carlos.lima@email.com',
      notes: 'Depressão leve. Terapia cognitivo-comportamental.',
      nextSession: '15.05.2026 – 09:00',
      payments: [
        { date: '10.03', type: 'Spot', value: 'R$ 120', status: 'Pago' },
        { date: '17.03', type: 'Spot', value: 'R$ 120', status: 'Pago' },
      ],
      sessions: [
        { date: '10.03.2026', time: '09:00', type: 'Spot', value: 'R$ 120', status: 'realizada' },
        { date: '17.03.2026', time: '09:00', type: 'Spot', value: 'R$ 120', status: 'realizada' },
        { date: '15.05.2026', time: '09:00', type: 'Spot', value: 'R$ 120', status: 'agendada'  },
      ],
    },
    {
      id: 3, name: 'Patrícia Gomes', phone: '(31) 97654-3210', email: 'patricia.gomes@email.com',
      notes: 'Sessões quinzenais. Pacote de 10 sessões.',
      nextSession: '15.05.2026 – 16:00',
      payments: [
        { date: '05.03', type: 'Pacote', value: 'R$ 90', status: 'Pago'     },
        { date: '19.03', type: 'Pacote', value: 'R$ 90', status: 'Pago'     },
        { date: '02.04', type: 'Pacote', value: 'R$ 90', status: 'Pendente' },
      ],
      sessions: [
        { date: '05.03.2026', time: '16:00', type: 'Pacote', value: 'R$ 90', status: 'realizada' },
        { date: '19.03.2026', time: '16:00', type: 'Pacote', value: 'R$ 90', status: 'realizada' },
        { date: '02.04.2026', time: '16:00', type: 'Pacote', value: 'R$ 90', status: 'realizada' },
        { date: '15.05.2026', time: '16:00', type: 'Pacote', value: 'R$ 90', status: 'agendada'  },
      ],
    },
  ];

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
    return patients.find(p => p.id === +id);
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
  $('#btn-save-patient').on('click', function () {
    const $name  = $('[name="name"]',  '#form-patient');
    const $phone = $('[name="phone"]', '#form-patient');
    if (!validate([['Nome', $name], ['Telefone', $phone]])) return;

    showSuccess({
      title: 'Paciente cadastrado!',
      subtitle: 'O cadastro foi salvo com sucesso.',
      details: [
        ['Nome',     $name.val()],
        ['Telefone', $phone.val()],
        ['Email',    $('[name="email"]', '#form-patient').val() || '—'],
      ],
      secondaryLabel: 'Cadastrar outro',
      secondaryTarget: 'screen-patient',
    });
    $('#form-patient')[0].reset();
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

    const p = patientById($patient.val());
    showModal({
      title: 'Confirmar cancelamento',
      body: `Tem certeza que deseja cancelar a sessão de <strong>${p.name}</strong> marcada para <strong>${p.nextSession}</strong>?`,
      yesLabel: 'Sim, cancelar',
      onConfirm: () => {
        const reason = $('[name="reason"]', '#form-cancel').val();
        showSuccess({
          title: 'Sessão cancelada!',
          subtitle: 'O cancelamento foi registrado.',
          details: [
            ['Paciente', p.name],
            ['Sessão',   p.nextSession],
            ['Motivo',   reason],
          ],
          secondaryLabel: 'Cancelar outra',
          secondaryTarget: 'screen-cancel-session',
        });
        $('#form-cancel')[0].reset();
        $('#cancel-current-session').html('<p class="muted">Selecione um cliente para ver a próxima sessão.</p>');
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
  $('#reschedule-patient-select').on('change', function () {
    const p = patientById($(this).val());
    $('#reschedule-current-session').html(
      p ? `<p class="muted">Próxima sessão: <strong>${p.nextSession}</strong></p>`
        : '<p class="muted">Selecione um cliente para ver a próxima sessão.</p>'
    );
  });

  $('#cancel-patient-select').on('change', function () {
    const p = patientById($(this).val());
    $('#cancel-current-session').html(
      p ? `<p class="muted">Próxima sessão: <strong>${p.nextSession}</strong></p>`
        : '<p class="muted">Selecione um cliente para ver a próxima sessão.</p>'
    );
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
  function renderPatientList(filter) {
    if (filter === undefined) $('#patient-search').val('');
    const q    = (filter || '').toLowerCase();
    const list = q ? patients.filter(p => p.name.toLowerCase().includes(q)) : patients;
    const $tbody = $('#patients-table-body');

    if (!list.length) {
      $tbody.html('<tr><td colspan="5" class="table-empty">Nenhum paciente encontrado.</td></tr>');
      return;
    }
    $tbody.html(list.map(p => `
      <tr data-patient-id="${p.id}">
        <td><strong>${p.name}</strong></td>
        <td>${p.phone}</td>
        <td>${p.email}</td>
        <td>${p.nextSession}</td>
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
  function openPatientProfile(id) {
    const p = patientById(id);
    if (!p) return;

    $('#profile-back-label').text(p.name);
    $('#profile-avatar').text(initials(p.name));
    $('#profile-name').text(p.name);
    $('#profile-contact').text(p.phone + '  ·  ' + p.email);
    $('#profile-notes-block').html(
      p.notes ? `<div class="notes-block">${p.notes}</div>` : ''
    );
    $('#profile-sessions-tbody').html(p.sessions.map(s => `
      <tr>
        <td>${s.date}</td>
        <td>${s.time}</td>
        <td>${s.type}</td>
        <td>${s.value}</td>
        <td>${badge(s.status)}</td>
      </tr>
    `).join(''));

    showScreen('screen-patient-profile');
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
