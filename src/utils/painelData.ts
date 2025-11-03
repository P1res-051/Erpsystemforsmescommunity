import { apiClient } from './apiClient';

export interface ClientDto {
  // Estrutura flexível conforme origem do painel
  [key: string]: any;
}

export interface LogDto {
  [key: string]: any;
}

export interface CacheAllAggregate {
  ativos?: ClientDto[];
  expirados?: ClientDto[];
  testes?: ClientDto[];
  conversoes?: LogDto[];
  renovacoes?: LogDto[];
  usuario?: string;
  reseller?: string;
}

/**
 * Lê o agregado completo do cache do painel.
 *
 * @param cacheKey Chave `panel:data:<user>`
 * @returns Estrutura agregada contendo clientes e logs
 */
export async function getCacheAll(cacheKey: string): Promise<CacheAllAggregate> {
  return apiClient.get<CacheAllAggregate>('/api/painel/cache-all', { cache_key: cacheKey });
}

/**
 * Lista clientes ativos do cache.
 *
 * @param cacheKey Chave `panel:data:<user>`
 */
export async function getClientsActive(cacheKey: string): Promise<ClientDto[]> {
  return apiClient.get<ClientDto[]>('/api/painel/get-clients-active', { cache_key: cacheKey });
}

/**
 * Lista clientes expirados do cache.
 *
 * @param cacheKey Chave `panel:data:<user>`
 */
export async function getClientsExpired(cacheKey: string): Promise<ClientDto[]> {
  return apiClient.get<ClientDto[]>('/api/painel/get-clients-expired', { cache_key: cacheKey });
}

/**
 * Lista clientes em teste do cache.
 *
 * @param cacheKey Chave `panel:data:<user>`
 */
export async function getClientsTestes(cacheKey: string): Promise<ClientDto[]> {
  return apiClient.get<ClientDto[]>('/api/painel/get-clients-test', { cache_key: cacheKey });
}

/**
 * Aguarda o cache ficar disponível após login.
 *
 * - Tenta carregar `/cache-all` repetidamente, tratando 404/400 como ainda não pronto
 * - Útil quando a agregação roda em background após o login do painel
 *
 * @param cacheKey Chave `panel:data:<user>`
 * @param maxRetries Número máximo de tentativas (default: 10)
 * @param intervalMs Intervalo entre tentativas em ms (default: 1500)
 */
export async function waitCacheReady(
  cacheKey: string,
  maxRetries: number = 10,
  intervalMs: number = 1500,
): Promise<CacheAllAggregate | null> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const agg = await getCacheAll(cacheKey);
      if (agg && (agg.ativos?.length || agg.expirados?.length || agg.testes?.length)) {
        return agg;
      }
    } catch (err: any) {
      // 404/400 indicam ainda não pronto; continua tentando
    }
    await new Promise(res => setTimeout(res, intervalMs));
  }
  return null;
}