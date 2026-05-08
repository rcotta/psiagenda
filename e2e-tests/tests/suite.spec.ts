import { test, Page } from '@playwright/test';

// Intervalo entre trocas de tela — altere PSIAGENDA_DELAY_MS no ambiente ou edite aqui
const DELAY_MS = parseInt(process.env.PSIAGENDA_DELAY_MS ?? '1000', 10);
const FIELD_DELAY_MS = Math.round(DELAY_MS / 4);

// ── Fixtures ──────────────────────────────────────────────────────────────────

const USUARIO = { login: 'renata', password: 'Psi@2026' };

const PACIENTE_1 = { nome: 'Machado de Assis',  telefone: '(21) 92293-4942', email: 'cubasdobras@example.com' };
const PACIENTE_2 = { nome: 'Clarice Lispector', telefone: '(81) 98545-4942', email: 'estreladahora@example.com' };
const PACIENTE_3 = { nome: 'Lima Barreto',       telefone: '(21) 88334-1393', email: 'polis.e.carpos@example.com' };
const PACIENTE_4 = { nome: 'Graciliano Ramos',   telefone: '(82) 88293-0012', email: 'viventes@example.com' };

// ── Helpers de data ───────────────────────────────────────────────────────────

function toInputDate(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function getMonday(date: Date): Date {
  const d = new Date(date);
  const dow = d.getDay();
  d.setDate(d.getDate() - (dow === 0 ? 6 : dow - 1));
  d.setHours(0, 0, 0, 0);
  return d;
}

const hoje             = (() => { const d = new Date(); d.setHours(0, 0, 0, 0); return d; })();
const semanaAtual      = getMonday(hoje);
const semanaAtualPlus2 = new Date(semanaAtual.getTime() + 2 * 86_400_000);  // +2 dias = quarta
const hojePlus1        = new Date(hoje.getTime() + 86_400_000);             // +1 dia

// ── Helpers de navegação ──────────────────────────────────────────────────────

// Pausa configurável — chamada antes de qualquer ação que muda de tela
async function pause(page: Page): Promise<void> {
  await page.waitForTimeout(DELAY_MS);
}

// Aguarda a tela ficar ativa e faz uma pausa para visualização
async function waitForScreen(page: Page, screenId: string): Promise<void> {
  await page.waitForSelector(`#${screenId}.active`);
  await page.waitForTimeout(DELAY_MS);
}

// Preenche um campo e espera DELAY_MS/4 para visualização
async function fillField(page: Page, selector: string, value: string): Promise<void> {
  await page.fill(selector, value);
  await page.waitForTimeout(FIELD_DELAY_MS);
}

// ── Teste principal ───────────────────────────────────────────────────────────

test('fluxo completo PsiAgenda', async ({ page }) => {

  // Indicador visual de clique — aparece como círculo laranja no vídeo
  await page.addInitScript(() => {
    document.addEventListener('mousedown', (e) => {
      const dot = document.createElement('div');
      dot.style.cssText = [
        'position:fixed',
        `left:${e.clientX - 18}px`,
        `top:${e.clientY - 18}px`,
        'width:36px',
        'height:36px',
        'background:rgba(255,120,0,0.5)',
        'border:2px solid rgba(255,255,255,0.85)',
        'border-radius:50%',
        'pointer-events:none',
        'z-index:2147483647',
        'opacity:0.9',
        'transition:transform 0.3s ease-out,opacity 0.3s ease-out',
      ].join(';');
      document.body.appendChild(dot);
      requestAnimationFrame(() => {
        dot.style.transform = 'scale(1.6)';
        dot.style.opacity = '0';
      });
      setTimeout(() => dot.remove(), 400);
    });
  });

  // 1. Login
  await page.goto('/');
  await waitForScreen(page, 'screen-login');

  await fillField(page, '[name="login"]', USUARIO.login);
  await fillField(page, '[name="password"]', USUARIO.password);
  await pause(page);
  await page.click('#login-form button[type="submit"]');
  await waitForScreen(page, 'screen-home');

  // 2. Cadastro de Pacientes
  await pause(page);
  await page.locator('#screen-home [data-target="screen-patient"]').click();
  await waitForScreen(page, 'screen-patient');

  type Paciente = { nome: string; telefone: string; email: string };
  const pacientes: [Paciente, boolean][] = [
    [PACIENTE_1, false],
    [PACIENTE_2, false],
    [PACIENTE_3, false],
    [PACIENTE_4, true],
  ];

  for (const [paciente, isLast] of pacientes) {
    await fillField(page, '#form-patient [name="name"]',  paciente.nome);
    await fillField(page, '#form-patient [name="phone"]', paciente.telefone);
    await fillField(page, '#form-patient [name="email"]', paciente.email);
    await pause(page);
    await page.click('#btn-save-patient');
    await waitForScreen(page, 'screen-success');

    if (isLast) {
      await pause(page);
      await page.locator('#screen-success [data-target="screen-home"]').click();
      await waitForScreen(page, 'screen-home');
    } else {
      await pause(page);
      await page.click('#success-secondary-btn'); // "Cadastrar outro"
      await waitForScreen(page, 'screen-patient');
    }
  }

  // 3. Nova Sessão — PACIENTE_1, SEMANA_ATUAL+2 às 13:00, R$ 150,00
  await pause(page);
  await page.locator('#screen-home [data-target="screen-session"]').click();
  await waitForScreen(page, 'screen-session');

  await page.waitForSelector('#form-session select[name="patient"] option[value]:not([value=""])', { state: 'attached' });
  await page.selectOption('#form-session select[name="patient"]', { label: PACIENTE_1.nome });
  await page.waitForTimeout(FIELD_DELAY_MS);
  await fillField(page, '#form-session [name="date"]',  toInputDate(semanaAtualPlus2));
  await fillField(page, '#form-session [name="time"]',  '13:00');
  await fillField(page, '#form-session [name="value"]', '150,00');
  await pause(page);
  await page.click('#btn-save-session');
  await waitForScreen(page, 'screen-success');
  await pause(page);
  await page.locator('#screen-success [data-target="screen-home"]').click();
  await waitForScreen(page, 'screen-home');

  // 4. Novo Pacote — PACIENTE_2, Qua 15:00, 10 sessões, R$ 950,00
  await pause(page);
  await page.locator('#screen-home [data-target="screen-package"]').click();
  await waitForScreen(page, 'screen-package');

  await page.waitForSelector('#form-package select[name="patient"] option[value]:not([value=""])', { state: 'attached' });
  await page.selectOption('#form-package select[name="patient"]', { label: PACIENTE_2.nome });
  await page.waitForTimeout(FIELD_DELAY_MS);
  await page.selectOption('#form-package select[name="freq-num"]',  '1');
  await page.waitForTimeout(FIELD_DELAY_MS);
  await page.selectOption('#form-package select[name="freq-unit"]', 'semana(s)');
  await page.waitForTimeout(FIELD_DELAY_MS);
  await page.locator('#form-package .weekdays label').filter({ hasText: 'Qua' }).click();
  await page.waitForTimeout(FIELD_DELAY_MS);
  await fillField(page, '#form-package [name="time"]',  '15:00');
  await fillField(page, '#form-package [name="qty"]',   '10');
  await fillField(page, '#form-package [name="total"]', '950,00');
  await pause(page);
  await page.click('#btn-save-package');
  await waitForScreen(page, 'screen-success');
  await pause(page);
  await page.locator('#screen-success [data-target="screen-home"]').click();
  await waitForScreen(page, 'screen-home');

  // 5. Pagamentos — PACIENTE_2, primeira linha: hoje + Pago + observação
  await pause(page);
  await page.locator('#screen-home [data-target="screen-payments"]').click();
  await waitForScreen(page, 'screen-payments');

  await page.waitForSelector('#payments-patient-select option[value]:not([value=""])', { state: 'attached' });
  await page.selectOption('#payments-patient-select', { label: PACIENTE_2.nome });
  await page.waitForTimeout(FIELD_DELAY_MS);
  await page.waitForSelector('#payments-table-body tr[data-pag-id]');

  const primeiraLinha = page.locator('#payments-table-body tr[data-pag-id]').first();
  await primeiraLinha.locator('.pag-dt-pagamento').fill(toInputDate(hoje));
  await page.waitForTimeout(FIELD_DELAY_MS);
  await primeiraLinha.locator('.status-select').selectOption('realizado');
  await page.waitForTimeout(FIELD_DELAY_MS);
  await primeiraLinha.locator('.pag-notas').fill('Pago com PIX no banco Bradesco');
  await pause(page);
  await page.click('#btn-save-payments');
  await waitForScreen(page, 'screen-success');
  await pause(page);
  await page.locator('#screen-success [data-target="screen-home"]').click();
  await waitForScreen(page, 'screen-home');

  // 6. Agenda → próxima semana → primeira sessão → Remarcar → HOJE+1 às 09:00
  await pause(page);
  await page.locator('#screen-home [data-target="screen-agenda"]').click();
  await waitForScreen(page, 'screen-agenda');

  await page.waitForSelector('#btn-agenda-next');
  await pause(page);
  await page.click('#btn-agenda-next');
  await page.waitForSelector('.agenda-reschedule');
  await page.waitForTimeout(DELAY_MS);

  await pause(page);
  await page.locator('.agenda-reschedule').first().click();
  await waitForScreen(page, 'screen-reschedule');

  await page.waitForSelector('#reschedule-session-select');
  await fillField(page, '#form-reschedule [name="new-date"]', toInputDate(hojePlus1));
  await fillField(page, '#form-reschedule [name="new-time"]', '09:00');
  await pause(page);
  await page.click('#btn-save-reschedule');
  await waitForScreen(page, 'screen-success');
  await pause(page);
  await page.locator('#screen-success [data-target="screen-home"]').click();
  await waitForScreen(page, 'screen-home');

  // 7. Agenda → primeira sessão → Marcar como Realizada → voltar ao painel
  await pause(page);
  await page.locator('#screen-home [data-target="screen-agenda"]').click();
  await waitForScreen(page, 'screen-agenda');

  await page.waitForSelector('.agenda-finalizar');
  await pause(page);
  await page.locator('.agenda-finalizar').first().click();
  await page.waitForTimeout(DELAY_MS);

  await pause(page);
  await page.locator('#screen-agenda .link-back').click();
  await waitForScreen(page, 'screen-home');
});
