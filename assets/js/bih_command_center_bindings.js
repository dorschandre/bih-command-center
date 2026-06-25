// BIH COMMAND CENTER R2.0 — Module Bindings (Fase 1)
// ============================================================
// Ativa os 3 módulos críticos em modo dinâmico controlado:
//   MOD-01 Mission Tracker  → section#m1
//   MOD-03 BMS Dashboard    → section#m4
//   MOD-06 Blockers Board   → section#m12
//
// Comportamento:
//   LIVE:   dados reais do Supabase renderizados no módulo
//   STATIC: conteúdo HTML original preservado (fallback)
//
// Badge LIVE/STATIC é exibido no cabeçalho de cada módulo.
// O conteúdo estático original NUNCA é removido — apenas sobrescrito
// se os dados reais chegarem com sucesso.
// ============================================================

(function () {
  'use strict';

  // ── Dados de fallback ──────────────────────────────────────
  const FALLBACK_BMS = {
    f1_governanca:    100, f2_command_center: 72, f3_registry:  65,
    f4_write_layer:    45, f5_clickup:         5, f6_org_parceiras: 65,
    f7_cases:          58, f8_discovery:       65, bms_geral:   59,
    data_ref: '2026-06-20', observacoes: 'Fallback — dados estáticos (pós-Supabase Fase 1)'
  };

  const FALLBACK_BLOCKERS = [
    { codigo: 'B-01', tipo: 'EXTERNO',           status: 'ATIVO',    descricao: 'Cliente contábil estratégico — reunião pendente', plano_resolucao: 'Retomar contato comercial · proposta expirada · reagendar validação' },
    { codigo: 'B-02', tipo: 'TECNICO',            status: 'RESOLVIDO',descricao: 'Supabase Fase 1 não executada',               plano_resolucao: 'RESOLVIDO 2026-06-20 · 8 tabelas criadas · RLS ativo' },
    { codigo: 'B-03', tipo: 'TECNICO',            status: 'ATIVO',    descricao: 'Command Center R2.0 binding em construção',   plano_resolucao: 'MO-026 em execução — scripts JS em binding' },
    { codigo: 'B-04', tipo: 'GOVERNANCA',         status: 'ATIVO',    descricao: 'H-04 / parceiro PLD-FT C-01 pendente',       plano_resolucao: 'Andre contata C-01 via canal interno HQ' },
    { codigo: 'B-05', tipo: 'DECISAO_PENDENTE',   status: 'ATIVO',    descricao: 'PROGRAMA_001 agenda institucional municipal', plano_resolucao: '6 municípios target · deadline 04/07' }
  ];

  const FALLBACK_MISSIONS = [
    { mo_number: 26, mo_code: 'COMMAND_CENTER_R2_FASE1_BINDING',   status: 'ATIVA',    observacoes: 'Binding dinâmico MOD-01 · MOD-03 · MOD-06' },
    { mo_number: 25, mo_code: 'SUPABASE_FASE1_A4',                 status: 'CUMPRIDA', observacoes: 'Supabase executado e validado por Andre' },
    { mo_number: 24, mo_code: 'PLATAFORM_001_ARCHITECTURE',        status: 'CUMPRIDA', observacoes: 'Arquitetura BIH Platform V1 documentada' },
    { mo_number: 23, mo_code: 'COMMAND_CENTER_R2_READINESS',       status: 'CUMPRIDA', observacoes: '4 docs readiness commitados' },
    { mo_number: 22, mo_code: 'TERMINOLOGIA_INSTITUCIONAL',        status: 'CUMPRIDA', observacoes: 'Vocabulário institucional municipal corrigido' },
    { mo_number: 21, mo_code: 'CONSOLIDACAO_BIH',                  status: 'CUMPRIDA', observacoes: 'Status consolidado para ChatGPT' }
  ];

  // ── Helpers de renderização ────────────────────────────────
  function statusPill(status) {
    const map = {
      'ATIVA':     ['tag-gold',  'ATIVA'],
      'CUMPRIDA':  ['tag-green', 'CUMPRIDA'],
      'BLOQUEADA': ['tag-red',   'BLOQUEADA'],
      'CANCELADA': ['tag-orange','CANCELADA'],
      'ABERTA':    ['tag-gold',  'ABERTA'],
      'ATIVO':     ['tag-red',   'ATIVO'],
      'RESOLVIDO': ['tag-green', 'RESOLVIDO'],
      'EM_RESOLUCAO': ['tag-orange', 'EM RESOLUÇÃO']
    };
    const [cls, label] = map[status] || ['tag-blue', status];
    return `<span class="pill ${cls}">${label}</span>`;
  }

  function liveBadge(isLive) {
    return isLive
      ? `<span class="pill tag-green" style="font-size:10px;margin-left:8px">● LIVE</span>`
      : `<span class="pill" style="font-size:10px;margin-left:8px;background:rgba(234,179,8,.15);color:#eab308">◌ STATIC</span>`;
  }

  function injectBadge(sectionId, isLive) {
    const sec = document.getElementById(sectionId);
    if (!sec) return;
    const head = sec.querySelector('.sec-head');
    if (!head) return;
    const existing = head.querySelector('.bih-live-badge');
    if (existing) existing.remove();
    const badge = document.createElement('span');
    badge.className = 'bih-live-badge';
    badge.innerHTML = liveBadge(isLive);
    head.appendChild(badge);
  }

  // ── MOD-01: Mission Tracker ─────────────────────────────────
  async function bindMod01() {
    const sectionId = 'm1';
    const tableId   = 'bih-mod01-table';
    const data = await window.BIH_DATA.fetchMissions();
    const isLive = data.length > 0;
    injectBadge(sectionId, isLive);

    if (!isLive) return; // mantém conteúdo estático

    const rows = data.map(m => `
      <tr>
        <td class="mono">MO${String(m.mo_number).padStart(3,'0')}</td>
        <td>${(m.mo_code || '').replace(/_/g,' ')}</td>
        <td>${statusPill(m.status)}</td>
        <td class="small muted">${m.observacoes || '—'}</td>
      </tr>`).join('');

    const table = document.getElementById(tableId);
    if (table) {
      table.querySelector('tbody').innerHTML = rows;
    } else {
      // Substituir tabela estática
      const sec = document.getElementById(sectionId);
      const card = sec && sec.querySelector('.card');
      if (card) {
        card.innerHTML = `
          <table id="${tableId}">
            <thead><tr><th>Mission Order</th><th>Objetivo</th><th>Status</th><th>Observações</th></tr></thead>
            <tbody>${rows}</tbody>
          </table>`;
      }
    }
  }
  // ── MOD-03: BMS Dashboard ───────────────────────────────────
  async function bindMod03() {
    const sectionId = 'm4';
    const raw = await window.BIH_DATA.fetchLatestBMS();
    const bms = raw || FALLBACK_BMS;
    const isLive = raw !== null;
    injectBadge(sectionId, isLive);

    const fields = [
      ['F1 Governança',         'f1_governanca'],
      ['F2 Command Center',     'f2_command_center'],
      ['F3 Registry / Supabase','f3_registry'],
      ['F4 Write Layer',        'f4_write_layer'],
      ['F5 ClickUp',            'f5_clickup'],
      ['F6 Org. Parceiras',     'f6_org_parceiras'],
      ['F7 Cases Estratégicos', 'f7_cases'],
      ['F8 Discovery / Radar',  'f8_discovery'],
    ];

    const rows = fields.map(([label, key]) => {
      const val = bms[key] || 0;
      return `
        <div class="bms-row">
          <div class="bms-label">${label}</div>
          <div class="bms-bar"><div class="bms-fill" style="width:${val}%"></div></div>
          <div class="bms-val">${val}%</div>
        </div>`;
    }).join('');

    const geral = bms.bms_geral || 0;
    const html = `
      ${rows}
      <hr style="border-color:var(--border); margin:12px 0;">
      <div class="bms-row">
        <div class="bms-label"><b>BMS GERAL</b></div>
        <div class="bms-bar"><div class="bms-fill" style="width:${geral}%; background:var(--gold)"></div></div>
        <div class="bms-val"><b>${geral}%</b></div>
      </div>
      <p class="small muted" style="margin-top:8px">
        Referência: ${bms.data_ref || '—'} · ${isLive ? 'Dados ao vivo do Supabase' : 'Fallback estático — dados operacionais pós-MO-025'} · ${bms.observacoes || ''}
      </p>`;

    const sec = document.getElementById(sectionId);
    const card = sec && sec.querySelector('.card');
    if (card) card.innerHTML = html;

    // Atualizar BMS pill no header
    const pill = document.querySelector('.header .bms-pill');
    if (pill) pill.innerHTML = `BMS <span>${geral}%</span>`;

    // Atualizar sidebar
    const rel = document.querySelector('.sidebar-logo .rel');
    if (rel) rel.textContent = `● R2.0 · BMS ${geral}%`;
  }

  // ── MOD-06: Blockers Board ──────────────────────────────────
  async function bindMod06() {
    const sectionId = 'm12';
    const data = await window.BIH_DATA.fetchActiveBlockers();
    const blockers = data.length > 0 ? data : FALLBACK_BLOCKERS;
    const isLive = data.length > 0;
    injectBadge(sectionId, isLive);

    const ativos   = blockers.filter(b => b.status !== 'RESOLVIDO');
    const resolved = blockers.filter(b => b.status === 'RESOLVIDO');

    const rows = [...ativos, ...resolved].map(b => `
      <tr>
        <td class="mono">${b.codigo || '—'}</td>
        <td>${b.descricao || '—'}</td>
        <td>${statusPill(b.status)}</td>
        <td class="small muted">${b.plano_resolucao || '—'}</td>
      </tr>`).join('');

    const sec = document.getElementById(sectionId);
    const card = sec && sec.querySelector('.card');
    if (card) {
      // Atualizar tag de contagem no cabeçalho
      const head = sec.querySelector('.sec-head .tag');
      if (head) {
        head.textContent = `${ativos.length} ativo${ativos.length !== 1 ? 's' : ''}`;
        head.className = `tag ${ativos.length > 0 ? 'tag-red' : 'tag-green'}`;
      }
      card.innerHTML = `
        <table>
          <thead><tr><th>Código</th><th>Bloqueio</th><th>Status</th><th>Plano de Resolução</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>`;
    }
  }

  // ── Atualizar banner proto ───────────────────────────────────
  function updateBanner(status) {
    const banner = document.querySelector('.proto-banner');
    if (!banner) return;
    if (status === 'CLIENT_READY') {
      banner.style.background = 'linear-gradient(90deg,#1b3a5e,#1e4976)';
      banner.textContent = 'BIH COMMAND CENTER · R2.0 FASE 1 · conectado ao Supabase · dados em tempo real · 3 módulos LIVE';
    } else {
      banner.textContent = `BIH COMMAND CENTER · R1.8 FALLBACK · ${status} · dados estáticos curados`;
    }
  }

  // ── Bootstrap principal ──────────────────────────────────────
  async function bootstrap() {
    const status = window.BIH_SUPABASE_STATUS || 'UNKNOWN';
    updateBanner(status);

    // Executar bindings em paralelo
    await Promise.all([bindMod01(), bindMod03(), bindMod06()]);
    console.info('[BIH Bindings] Fase 1 concluída. Status Supabase:', status);
  }

  // Aguardar evento de status do client
  document.addEventListener('bih:supabase:status', function (e) {
    const { status } = e.detail;
    updateBanner(status);
    if (status === 'CLIENT_READY') {
      bootstrap();
    } else {
      // Fallback imediato para todos os módulos
      Promise.all([bindMod01(), bindMod03(), bindMod06()]);
    }
  });

  // Caso o client já esteja pronto quando este script carrega
  if (typeof window.BIH_SUPABASE_STATUS !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', bootstrap);
    } else {
      bootstrap();
    }
  }

})();
