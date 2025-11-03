import { useState, useEffect, useCallback, useRef } from 'react';

interface AuthData {
  cache_key: string;
  phpsessid: string;
  resellerid: string;
}

interface RefreshConfig {
  enabled: boolean;
  interval: number; // em milissegundos (default: 5 minutos = 300000ms)
}

export function useAutoRefresh(
  onDataUpdate: (data: any) => void,
  config: RefreshConfig = { enabled: true, interval: 5 * 60 * 1000 }
) {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [authData, setAuthData] = useState<AuthData | null>(null);
  
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const isRefreshingRef = useRef(false);

  // Carregar dados de autenticação do localStorage
  useEffect(() => {
    const loadAuthData = () => {
      try {
        const cache_key = localStorage.getItem('cache_key');
        const phpsessid = localStorage.getItem('phpsessid');
        const resellerid = localStorage.getItem('resellerid');

        if (cache_key && phpsessid && resellerid) {
          setAuthData({ cache_key, phpsessid, resellerid });
        }
      } catch (err) {
        console.log('💾 Sessão não encontrada');
      }
    };

    loadAuthData();
  }, []);

  // Função principal de busca de dados
  const fetchPainelData = useCallback(async () => {
    if (!authData?.cache_key) {
      console.log('⏳ Aguardando autenticação...');
      return;
    }

    // Prevenir múltiplas chamadas simultâneas
    if (isRefreshingRef.current) {
      console.log('Refresh já em andamento, ignorando chamada duplicada');
      return;
    }

    isRefreshingRef.current = true;
    setIsRefreshing(true);
    setError(null);

    try {
      console.log('🔄 Atualizando dados do painel...', new Date().toLocaleTimeString());

      // Buscar dados do painel usando cache_key
      const response = await fetch(
        `https://automatixbest-api.automation.app.br/api/painel/cache-all?cache_key=${authData.cache_key}`,
        {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
          },
        }
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error('Sessão expirada. Faça login novamente.');
        }
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();

      // Processar dados recebidos
      const processedData = {
        ativos: data.ativos || [],
        expirados: data.expirados || [],
        testes: data.testes || [],
        conversoes: data.conversoes || [],
        renovacoes: data.renovacoes || [],
        usuario: data.usuario,
        reseller: data.reseller,
      };

      // Atualizar estado
      setLastRefresh(new Date());
      
      // Callback com dados processados
      onDataUpdate(processedData);

      console.log('✅ Dados atualizados com sucesso!', {
        ativos: processedData.ativos.length,
        expirados: processedData.expirados.length,
        testes: processedData.testes.length,
        conversoes: processedData.conversoes.length,
        renovacoes: processedData.renovacoes.length,
      });

    } catch (err: any) {
      const errorMessage = err.message || 'Erro ao atualizar dados';
      console.log('⚠️ Falha na sincronização:', errorMessage);
      setError(errorMessage);

      // Se sessão expirou, limpar dados de autenticação
      if (errorMessage.includes('Sessão expirada') || errorMessage.includes('401')) {
        localStorage.removeItem('cache_key');
        localStorage.removeItem('phpsessid');
        localStorage.removeItem('resellerid');
        setAuthData(null);
      }
    } finally {
      setIsRefreshing(false);
      isRefreshingRef.current = false;
    }
  }, [authData, onDataUpdate]);

  // Configurar timer de auto-refresh
  useEffect(() => {
    if (!config.enabled || !authData?.cache_key) {
      return;
    }

    // Buscar dados imediatamente ao configurar
    fetchPainelData();

    // Configurar intervalo de atualização
    timerRef.current = setInterval(() => {
      fetchPainelData();
    }, config.interval);

    // Cleanup
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [config.enabled, config.interval, authData, fetchPainelData]);

  // Função para atualizar manualmente
  const refreshNow = useCallback(async () => {
    await fetchPainelData();
  }, [fetchPainelData]);

  // Função para atualizar dados de autenticação
  const updateAuthData = useCallback((newAuthData: AuthData) => {
    setAuthData(newAuthData);
    localStorage.setItem('cache_key', newAuthData.cache_key);
    localStorage.setItem('phpsessid', newAuthData.phpsessid);
    localStorage.setItem('resellerid', newAuthData.resellerid);
  }, []);

  // Função para limpar autenticação
  const clearAuth = useCallback(() => {
    localStorage.removeItem('cache_key');
    localStorage.removeItem('phpsessid');
    localStorage.removeItem('resellerid');
    setAuthData(null);
    
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  return {
    isRefreshing,
    lastRefresh,
    error,
    authData,
    refreshNow,
    updateAuthData,
    clearAuth,
  };
}
