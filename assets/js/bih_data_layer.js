// BIH COMMAND CENTER — Data Layer
// ============================================================
// Funções de leitura do Supabase para cada módulo do Command Center.
// Todas as funções retornam arrays (nunca lançam exceção para o chamador).
// Timeout: 5 segundos por query.
//
// NOTA DE SEGURANÇA RLS:
//   As políticas RLS da Fase 1 permitem leitura apenas para `authenticated`.
//   Com a anon key sem JWT, as queries retornarão array vazio [].
//   Isso é comportamento esperado — os módulos farão fallback para dados estáticos.
//   Para leitura real via anon: criar política RLS anon em missão futura
//   (MISSION_ORDER: ajuste_rls_leitura_anon_command_center).
// ============================================================

(function () {
  'use strict';

  const TIMEOUT_MS = 5000;

  // Wrapper com timeout e tratamento de erro
  async function queryWithTimeout(queryFn) {
    try {
      const result = await Promise.race([
        queryFn(),
        new Promise((_, reject) =>
          setTimeout(() => reject(new Error('Timeout Supabase após 5s')), TIMEOUT_MS)
        )
      ]);
      if (result.error) {
        console.warn('[BIH Data] Query error:', result.error.message);
        return [];
      }
      return result.data || [];
    } catch (err) {
      console.warn('[BIH Data] Query falhou:', err.message);
      return [];
    }
  }

  // Guard: retorna false se client não disponível
  function clientReady() {
    return window.BIH_CLIENT != null;
  }

  // ── MOD-01: Mission Tracker ──────────────────────────────
  // Retorna as últimas 20 missões ordenadas por data de criação
  async function fetchMissions() {
    if (!clientReady()) return [];
    return queryWithTimeout(() =>
      window.BIH_CLIENT
        .from('bih_missions')
        .select('mo_number, mo_code, status, branch, commit_hash, bms_anterior, bms_posterior, observacoes, created_at')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(20)
    );
  }

  // ── MOD-03: BMS Dashboard ────────────────────────────────
  // Retorna o registro BMS mais recente
  async function fetchLatestBMS() {
    if (!clientReady()) return null;
    const rows = await queryWithTimeout(() =>
      window.BIH_CLIENT
        .from('bih_bms')
        .select('data_ref, f1_governanca, f2_command_center, f3_registry, f4_write_layer, f5_clickup, f6_org_parceiras, f7_cases, f8_discovery, bms_geral, observacoes')
        .eq('is_active', true)
        .order('data_ref', { ascending: false })
        .limit(1)
    );
    return rows.length > 0 ? rows[0] : null;
  }

  // ── MOD-03: BMS History (sparkline) ─────────────────────
  // Retorna últimos 10 registros BMS para histórico
  async function fetchBMSHistory() {
    if (!clientReady()) return [];
    return queryWithTimeout(() =>
      window.BIH_CLIENT
        .from('bih_bms')
        .select('data_ref, bms_geral')
        .eq('is_active', true)
        .order('data_ref', { ascending: false })
        .limit(10)
    );
  }

  // ── MOD-06: Blockers Board ───────────────────────────────
  // Retorna bloqueadores ativos (status != RESOLVIDO)
  async function fetchActiveBlockers() {
    if (!clientReady()) return [];
    return queryWithTimeout(() =>
      window.BIH_CLIENT
        .from('bih_blockers')
        .select('codigo, tipo, descricao, plano_resolucao, status, created_at')
        .eq('is_active', true)
        .neq('status', 'RESOLVIDO')
        .order('created_at', { ascending: false })
    );
  }

  // ── Futuras funções (Fase 2+) ────────────────────────────
  // fetchDecisions() → bih_decisions
  // fetchArtifacts() → bih_artifacts
  // fetchCommits()   → bih_commits
  // fetchCouncil()   → bih_council_records
  // fetchCompliance()→ bih_compliance_status

  // Expor no namespace global BIH
  window.BIH_DATA = {
    fetchMissions,
    fetchLatestBMS,
    fetchBMSHistory,
    fetchActiveBlockers
  };

})();
