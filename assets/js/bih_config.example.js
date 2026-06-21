// BIH COMMAND CENTER — Supabase Config (EXEMPLO)
// ============================================================
// INSTRUÇÃO: Copiar este arquivo para bih_config.js (mesmo diretório)
// e substituir os placeholders pelos valores reais do projeto Supabase.
//
// REGRA DE SEGURANÇA:
//   - bih_config.js está no .gitignore — NUNCA commitar com valores reais
//   - Apenas bih_config.example.js (sem valores) é versionado
//   - SERVICE_ROLE KEY nunca vai aqui — uso exclusivo server-side
//   - ANON KEY é pública por design Supabase, mas mantida local nesta fase
// ============================================================

const BIH_SUPABASE_CONFIG = {
  url:      "SUPABASE_URL_AQUI",       // ex: https://xyzxyzxyz.supabase.co
  anonKey:  "SUPABASE_ANON_KEY_AQUI"  // anon/public key — nunca a service_role
};

// Exportar para uso pelo bih_supabase_client.js
if (typeof window !== 'undefined') {
  window.BIH_SUPABASE_CONFIG = BIH_SUPABASE_CONFIG;
}
