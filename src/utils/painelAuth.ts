import { apiClient } from './apiClient';

export interface PainelLoginResponse {
  phpsessid: string;
  cache_key: string;
  resellerid: string;
}

export interface PainelCredentials {
  username: string;
  password: string;
}

/**
 * Executa login no painel e persiste chaves úteis em `localStorage`.
 *
 * - NÃO chama `execute-all` explicitamente; o backend executa em background
 *   após o login, conforme instruído.
 * - Persiste `panel_cache_key`, `panel_reseller_id` e `panel_phpsessid`.
 *
 * @param creds Credenciais do painel (usuário/senha)
 * @returns Objeto com `phpsessid`, `cache_key` e `resellerid`
 */
export async function painelLogin(creds: PainelCredentials): Promise<PainelLoginResponse> {
  const res = await apiClient.post<PainelLoginResponse>('/api/painel/login', {
    username: creds.username,
    password: creds.password,
  });

  // Persistência local para uso subsequente
  try {
    if (res.cache_key) localStorage.setItem('panel_cache_key', res.cache_key);
    if (res.resellerid) localStorage.setItem('panel_reseller_id', res.resellerid);
    if (res.phpsessid) localStorage.setItem('panel_phpsessid', res.phpsessid);
  } catch (e) {
    console.warn('Falha ao persistir chaves do painel no localStorage:', e);
  }

  return res;
}