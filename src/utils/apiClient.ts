/**
 * Provedor HTTP baseado em fetch para integração com a API AutonomyX.
 *
 * - Lê `VITE_API_BASE_URL` se definido; caso contrário, usa
 *   `https://automatixbest-api.automation.app.br` como padrão.
 * - Anexa automaticamente `Authorization: Bearer <auth_token>` se existir
 *   em `localStorage`.
 */
export class ApiClient {
  private baseUrl: string;

  /**
   * Cria uma instância do cliente com `baseUrl` resolvida.
   */
  constructor() {
    const envUrl = (import.meta as any)?.env?.VITE_API_BASE_URL;
    this.baseUrl = envUrl || 'https://automatixbest-api.automation.app.br';
  }

  /**
   * Monta cabeçalhos padrão e aplica autorização se disponível.
   *
   * @returns Cabeçalhos prontos para requisição
   */
  private defaultHeaders(): HeadersInit {
    const token = localStorage.getItem('auth_token');
    const headers: Record<string, string> = {
      'accept': 'application/json',
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
    return headers;
  }

  /**
   * Concatena `baseUrl` com um caminho relativo e, se necessário,
   * serializa parâmetros de consulta.
   *
   * @param path Caminho relativo, ex: `/api/painel/cache-all`
   * @param query Parâmetros de consulta (opcional)
   * @returns URL absoluta
   */
  private buildUrl(path: string, query?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(path, this.baseUrl);
    if (query) {
      Object.entries(query).forEach(([k, v]) => {
        if (v !== undefined && v !== null) url.searchParams.set(k, String(v));
      });
    }
    return url.toString();
  }

  /**
   * Executa uma requisição GET tipada.
   *
   * @param path Caminho relativo
   * @param query Parâmetros de consulta
   * @returns Corpo JSON tipado
   */
  async get<T>(path: string, query?: Record<string, string | number | boolean | undefined>): Promise<T> {
    const url = this.buildUrl(path, query);
    const res = await fetch(url, {
      method: 'GET',
      headers: this.defaultHeaders(),
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`GET ${path} falhou (${res.status}): ${text}`);
    }
    return res.json() as Promise<T>;
  }

  /**
   * Executa uma requisição POST tipada.
   *
   * @param path Caminho relativo
   * @param body Corpo JSON
   * @param query Parâmetros de consulta
   * @returns Corpo JSON tipado
   */
  async post<T>(path: string, body?: unknown, query?: Record<string, string | number | boolean | undefined>): Promise<T> {
    const url = this.buildUrl(path, query);
    const headers = {
      ...this.defaultHeaders(),
      'content-type': 'application/json',
    };
    const res = await fetch(url, {
      method: 'POST',
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
    if (!res.ok) {
      const text = await res.text().catch(() => '');
      throw new Error(`POST ${path} falhou (${res.status}): ${text}`);
    }
    return res.json() as Promise<T>;
  }
}

/**
 * Singleton simples para uso prático.
 */
export const apiClient = new ApiClient();