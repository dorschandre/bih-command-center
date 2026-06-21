// BIH COMMAND CENTER — Supabase Client
// ============================================================
// Inicializa o client Supabase para uso exclusivo de leitura
// no frontend do Command Center R2.0.
//
// REGRAS DE SEGURANÇA:
//   - Usa apenas a anon key (pública por design)
//   - SERVICE_ROLE KEY nunca fica aqui — jamais
//   - Toda escrita ocorre via service_role em ambiente seguro (fora do browser)
//   - RLS garante que anon não acessa dados sem autenticação
//
// DEPENDÊNCIA: bih_config.js (não versionado — criado localmente por Andre)
// Se bih_config.js não existir → BIH_CLIENT permanece null → fallback estático
// ============================================================

(function () {
  'use strict';

  const SUPABASE_JS_CDN = 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/dist/umd/supabase.min.js';

  // Tenta carregar o Supabase JS SDK e inicializar o client
  function initClient() {
    if (typeof window.BIH_SUPABASE_CONFIG === 'undefined') {
      console.warn('[BIH] bih_config.js não encontrado. Command Center operando em modo STATIC.');
      window.BIH_CLIENT = null;
      window.BIH_SUPABASE_STATUS = 'CONFIG_MISSING';
      dispatchStatusEvent('CONFIG_MISSING');
      return;
    }

    const { url, anonKey } = window.BIH_SUPABASE_CONFIG;

    if (!url || url === 'SUPABASE_URL_AQUI' || !anonKey || anonKey === 'SUPABASE_ANON_KEY_AQUI') {
      console.warn('[BIH] Config com placeholders. Preencher bih_config.js com valores reais.');
      window.BIH_CLIENT = null;
      window.BIH_SUPABASE_STATUS = 'CONFIG_PLACEHOLDER';
      dispatchStatusEvent('CONFIG_PLACEHOLDER');
      return;
    }

    // Carregar SDK Supabase via CDN (somente se config válida)
    const script = document.createElement('script');
    script.src = SUPABASE_JS_CDN;
    script.onload = function () {
      try {
        const { createClient } = window.supabase;
        window.BIH_CLIENT = createClient(url, anonKey);
        window.BIH_SUPABASE_STATUS = 'CLIENT_READY';
        console.info('[BIH] Supabase client inicializado.');
        dispatchStatusEvent('CLIENT_READY');
      } catch (err) {
        console.error('[BIH] Erro ao inicializar client Supabase:', err.message);
        window.BIH_CLIENT = null;
        window.BIH_SUPABASE_STATUS = 'INIT_ERROR';
        dispatchStatusEvent('INIT_ERROR');
      }
    };
    script.onerror = function () {
      console.error('[BIH] Falha ao carregar SDK Supabase do CDN.');
      window.BIH_CLIENT = null;
      window.BIH_SUPABASE_STATUS = 'SDK_LOAD_ERROR';
      dispatchStatusEvent('SDK_LOAD_ERROR');
    };
    document.head.appendChild(script);
  }

  function dispatchStatusEvent(status) {
    document.dispatchEvent(new CustomEvent('bih:supabase:status', { detail: { status } }));
  }

  // Inicializar após DOM pronto
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initClient);
  } else {
    initClient();
  }

})();
