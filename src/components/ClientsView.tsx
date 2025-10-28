import { useState } from 'react';
import { Card } from './ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Textarea } from './ui/textarea';
import { Separator } from './ui/separator';
import { Progress } from './ui/progress';
import { DashboardData } from '../App';
import { 
  Search, Filter, Users, CheckCircle, XCircle, Star, Download, 
  List, MessageCircle, MapPin, TrendingUp, Clock, ChevronLeft, 
  ChevronRight, Send, AlertCircle, Check, X, Loader2, Tag, Calendar,
  Upload, Link
} from 'lucide-react';
import { parseDate, formatDate } from '../utils/dataProcessing';
import * as XLSX from 'xlsx';

interface Props {
  data: DashboardData;
}

type ViewSection = 'lista' | 'cobranca' | 'analise' | 'localizacao' | 'historico' | 'gestor';

const COLORS = {
  fundo: '#0a0e1a',
  cardBg: '#0E1321',
  border: 'rgba(255,255,255,0.05)',
  textoPrimario: '#E6EBF5',
  textoSecundario: '#9BA6BE',
  textoTerciario: '#6B7C93',
  ativo: '#00FFA3',
  inativo: '#FF4D4D',
  roxo: '#9333ea',
  azul: '#3b82f6',
  verde: '#10b981',
  vermelho: '#ef4444',
  amarelo: '#f59e0b',
};

interface ValidationResult {
  valid: boolean;
  formatted: string;
  error?: string;
}

function validateBrazilianPhone(phone: string): ValidationResult {
  // Remove todos os caracteres não numéricos
  const cleaned = phone.replace(/\D/g, '');
  
  // Valida se começa com 55 (Brasil)
  if (!cleaned.startsWith('55')) {
    // Se não tem 55, tenta adicionar
    if (cleaned.length === 11 || cleaned.length === 10) {
      const withCountryCode = '55' + cleaned;
      return validateBrazilianPhone(withCountryCode);
    }
    return { valid: false, formatted: phone, error: 'Não possui código do país (55)' };
  }
  
  // Valida tamanho (55 + DDD 2 dígitos + número 8 ou 9 dígitos = 12 ou 13)
  if (cleaned.length !== 12 && cleaned.length !== 13) {
    return { valid: false, formatted: phone, error: 'Tamanho inválido' };
  }
  
  // Valida DDD (11-99)
  const ddd = parseInt(cleaned.substring(2, 4));
  if (ddd < 11 || ddd > 99) {
    return { valid: false, formatted: phone, error: 'DDD inválido' };
  }
  
  return { valid: true, formatted: cleaned };
}

export function ClientsView({ data }: Props) {
  const [activeSection, setActiveSection] = useState<ViewSection>('lista');
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  
  // Estados para Cobrança
  const [apiKey, setApiKey] = useState('');
  const [tagName, setTagName] = useState('');
  const [phonesList, setPhonesList] = useState('');
  const [validatedPhones, setValidatedPhones] = useState<Array<{phone: string, status: 'valid' | 'invalid', message: string}>>([]);
  const [selectedPhones, setSelectedPhones] = useState<Set<string>>(new Set());
  const [isSending, setIsSending] = useState(false);
  const [sendProgress, setSendProgress] = useState(0);
  const [sendResults, setSendResults] = useState<{success: number, failed: number, total: number} | null>(null);
  const [apiKeyValid, setApiKeyValid] = useState<boolean | null>(null);
  const [testingApiKey, setTestingApiKey] = useState(false);
  const [useTestMode, setUseTestMode] = useState(false);
  const [foundTagId, setFoundTagId] = useState<number | null>(null);
  const [currentStep, setCurrentStep] = useState<string>('');
  const [searchingTag, setSearchingTag] = useState(false);
  const [expiredPeriod, setExpiredPeriod] = useState<string>('7');

  // Estados para Link Gestor
  const [loginGestor, setLoginGestor] = useState('');
  const [senhaGestor, setSenhaGestor] = useState('');
  const [loginPainel, setLoginPainel] = useState('');
  const [senhaPainel, setSenhaPainel] = useState('');
  const [gestorPhone, setGestorPhone] = useState('');
  const [gestorLink, setGestorLink] = useState<string | null>(null);
  const [gestorLoading, setGestorLoading] = useState(false);
  const [gestorStatus, setGestorStatus] = useState<string>('');
  const [linksMapa, setLinksMapa] = useState<Record<string, string>>({});
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [clientesSemLink, setClientesSemLink] = useState<Set<string>>(new Set());
  const [demoMode, setDemoMode] = useState<boolean>(false);
  const [totalParaPesquisar, setTotalParaPesquisar] = useState<number>(0);
  const [processados, setProcessados] = useState<number>(0);
  const [scanInProgress, setScanInProgress] = useState<boolean>(false);
  const [scanLogs, setScanLogs] = useState<Array<{ ts: number; msg: string; level: 'info' | 'warn' | 'error' }>>([]);
  const [exibirSegredos, setExibirSegredos] = useState<boolean>(false);

  const logScan = (msg: string, level: 'info' | 'warn' | 'error' = 'info') => {
    const entry = { ts: Date.now(), msg, level };
    setScanLogs(prev => (prev.length > 500 ? [...prev.slice(prev.length - 500), entry] : [...prev, entry]));
    const prefix = level === 'error' ? '❌' : level === 'warn' ? '⚠️' : 'ℹ️';
    const out = `${prefix} ${new Date(entry.ts).toLocaleTimeString()} ${msg}`;
    if (level === 'error') console.error(out);
    else if (level === 'warn') console.warn(out);
    else console.log(out);
  };

  // Persistência de credenciais do Gestor/Painel
  try {
    const saved = localStorage.getItem('gestorCreds');
    if (saved && typeof saved === 'string' && saved.length > 0) {
      const obj = JSON.parse(saved);
      if (obj && typeof obj === 'object') {
        if (obj.loginGestor && !loginGestor) setLoginGestor(obj.loginGestor);
        if (obj.senhaGestor && !senhaGestor) setSenhaGestor(obj.senhaGestor);
        if (obj.loginPainel && !loginPainel) setLoginPainel(obj.loginPainel);
        if (obj.senhaPainel && !senhaPainel) setSenhaPainel(obj.senhaPainel);
      }
    }
  } catch {}

  const saveGestorCreds = () => {
    const obj = { loginGestor, senhaGestor, loginPainel, senhaPainel };
    localStorage.setItem('gestorCreds', JSON.stringify(obj));
    alert('✅ Credenciais salvas localmente.');
  };

  const clearGestorCreds = () => {
    localStorage.removeItem('gestorCreds');
    setLoginGestor(''); setSenhaGestor(''); setLoginPainel(''); setSenhaPainel('');
    alert('🗑️ Credenciais removidas.');
  };

  const callGestorWebhook = async (telefone: string): Promise<string | null> => {
    const proxyCandidates = [
      'http://127.0.0.1:8080/gestor/link-pagamento',
      'http://127.0.0.1:8081/gestor/link-pagamento',
    ];
    const headers = { 'Content-Type': 'application/json' } as Record<string, string>;
    const body = {
      telefone,
      loginGestor,
      senhaGestor,
      loginPainel,
      SenhaPainel: senhaPainel,
    } as any;
    const maskString = (s: string) => s.length <= 4 ? '****' : `${s.slice(0,2)}****${s.slice(-2)}`;
    const maskSecrets = (obj: any) => {
      try {
        const copy = JSON.parse(JSON.stringify(obj));
        if (!exibirSegredos) {
          if (copy.senhaGestor) copy.senhaGestor = maskString(String(copy.senhaGestor));
          if (copy.SenhaPainel) copy.SenhaPainel = maskString(String(copy.SenhaPainel));
        }
        return copy;
      } catch { return obj; }
    };

    // Sempre logar a requisição preparada, mesmo em modo demo
    // Tentativa em múltiplas portas para evitar conflito na 8080
    let lastError: any = null;
    for (const proxyUrl of proxyCandidates) {
      logScan(`REQ → POST ${proxyUrl}`);
    logScan(`REQ Headers: ${JSON.stringify(headers)}`);
    logScan(`REQ Body: ${JSON.stringify(exibirSegredos ? body : maskSecrets(body))}`);

    // Se em modo demo ou faltando credenciais, não chama rede
    const hasCreds = !!(loginGestor && senhaGestor && loginPainel && senhaPainel);
    if (demoMode || !hasCreds) {
      logScan(`(demo/sem credenciais) requisição não enviada para ${telefone}`, 'warn');
      return null;
    }
    try {
      const t0 = performance.now();
      const r = await fetch(proxyUrl, {
        method: 'POST',
        headers,
        body: JSON.stringify(body)
      });
      const t1 = performance.now();
      const took = Math.round(t1 - t0);
      const ct = r.headers.get('content-type') || '';
      logScan(`RESP HTTP ${r.status} content-type=${ct} (${took}ms)`);
      if (!r.ok) {
        const tx = await r.text();
        logScan(`RESP Body [erro]: ${tx.slice(0, 2000)}`, 'warn');
        lastError = { status: r.status, body: tx };
        // tentar próximo candidato (ex.: 8081) se 404 ou 5xx
        if (r.status === 404 || (r.status >= 500 && r.status <= 599)) {
          logScan(`Tentando próxima porta do proxy...`);
          continue;
        }
        return null;
      }
      // Ler texto bruto para log e tentar parsear
      const rawText = await r.text();
      logScan(`RESP Body: ${rawText.slice(0, 2000)}`);
      let j: any = null;
      try {
        j = ct.toLowerCase().includes('application/json') ? JSON.parse(rawText) : { body: rawText };
      } catch (e: any) {
        logScan(`Falha ao parsear JSON da resposta: ${e?.message || e}`, 'warn');
      }
      const tryKeys = ['Link_pagamento','link_pagamento','LinkPagamento','payment_link','url_pagamento','url','link'];
      let foundKey = '';
      let link: string | null = null;
      if (j && typeof j === 'object') {
        for (const k of tryKeys) {
          const v = j[k];
          if (typeof v === 'string' && v.trim().length > 0) { link = v.trim(); foundKey = k; break; }
        }
        // tentar campos aninhados comuns
        if (!link) {
          const nested = j?.data || j?.result || j?.payload || j?.response;
          if (nested && typeof nested === 'object') {
            for (const k of tryKeys) {
              const v = nested[k];
              if (typeof v === 'string' && v.trim().length > 0) { link = v.trim(); foundKey = `nested.${k}`; break; }
            }
          }
        }
      }
      if (link) logScan(`Link extraído (${foundKey}): ${link}`);
      else logScan(`Nenhum link encontrado na resposta. Amostra: ${JSON.stringify(j).slice(0, 500)}`, 'warn');
      return link;
    } catch (err: any) {
      logScan(`Falha de rede ao chamar proxy: ${err?.message || err}`, 'error');
      lastError = err;
      // tenta próximo candidato
      continue;
    }
    }
    if (lastError) {
      logScan(`Todas as tentativas de proxy falharam: ${typeof lastError === 'object' ? JSON.stringify(lastError) : String(lastError)}`, 'error');
    }
    return null;
  };

  // Buscar link para um telefone
  const handleBuscarLinkUnico = async () => {
    if (demoMode) {
      setGestorStatus('⚠ Modo demonstração: não busca link real.');
      setGestorLink(null);
      return;
    }
    if (!loginGestor || !senhaGestor) {
      alert('❌ Informe usuário e senha do Gestor.');
      return;
    }
    if (!loginPainel || !senhaPainel) {
      alert('❌ Informe usuário e senha do Painel.');
      return;
    }
    if (!gestorPhone.trim()) {
      alert('❌ Informe um telefone (formato 55 + DDD + número).');
      return;
    }
    const valid = validateBrazilianPhone(gestorPhone);
    if (!valid.valid) { alert(`❌ Telefone inválido: ${valid.error}`); return; }
    setGestorLoading(true); setGestorStatus('Procesando...'); setGestorLink(null);
    try {
      const link = await callGestorWebhook(valid.formatted);
      setGestorLink(link);
      setGestorStatus(link ? 'Link encontrado' : 'Sem link para este usuário');
    } catch (e: any) {
      setGestorStatus(`Erro: ${e.message}`);
    } finally {
      setGestorLoading(false);
    }
  };

  // Verificar links para todos os clientes e montar relatório
  const handleScanTodosLinks = async () => {
    // Detectar base truncada por cache antigo: avisa e cancela varredura
    const totalEsperado = (data.clientesAtivos || 0) + (data.clientesExpirados || 0);
    const totalDisponivel = allClients.length;
    if (totalDisponivel < totalEsperado) {
      alert('⚠ A base carregada parece incompleta (vindo do cache antigo). Clique em "Limpar cache" e reenvie o Excel para varrer todos os clientes.');
      return;
    }
    if (scanInProgress) {
      console.warn('Varredura já em andamento. Ignorando novo comando.');
      return;
    }
    const hasCreds = !!(loginGestor && senhaGestor && loginPainel && senhaPainel);
    const effectiveDemo = demoMode || !hasCreds;
    if (effectiveDemo) {
      console.log('🧪 Verificação em Modo Demo: sem chamadas de rede.');
    }
    const phones: string[] = [];
    // Usar filteredClients em vez de allClients para respeitar os filtros ativos
    const clientsToScan = filter === 'sem-link' ? allClients : filteredClients;
    clientsToScan.forEach(client => {
      const raw = String(client.Usuario || client.usuario || client.telefone || '').replace(/\D/g, '');
      if (raw) {
        const with55 = raw.startsWith('55') ? raw : `55${raw}`;
        phones.push(with55);
      }
    });
    const uniquePhones = Array.from(new Set(phones));
    if (uniquePhones.length === 0) {
      alert('❌ Nenhum telefone encontrado na seleção atual.');
      return;
    }
    setLinksMapa({}); setScanProgress(0); setClientesSemLink(new Set()); setScanLogs([]);
    setTotalParaPesquisar(uniquePhones.length);
    setProcessados(0);
    logScan(`Iniciando varredura. Filtro='${filter}', total únicos=${uniquePhones.length}, demo=${effectiveDemo}`);
    const mapa: Record<string, string> = {};
    const semLink = new Set<string>();
    setScanInProgress(true);
    try {
      for (let i = 0; i < uniquePhones.length; i++) {
        const ph = uniquePhones[i];
        logScan(`Processando (${i+1}/${uniquePhones.length}) ${ph}`);
        if (!effectiveDemo) {
          try {
            const link = await callGestorWebhook(ph);
            if (link) {
              mapa[ph] = link;
              setLinksMapa(prev => ({ ...prev, [ph]: link }));
              logScan(`✓ Link encontrado para ${ph}`);
            } else {
              semLink.add(ph);
              setClientesSemLink(prev => {
                const next = new Set(prev);
                next.add(ph);
                return next;
              });
              logScan(`– Sem link para ${ph}`, 'warn');
            }
          } catch {
            semLink.add(ph);
            setClientesSemLink(prev => {
              const next = new Set(prev);
              next.add(ph);
              return next;
            });
            logScan(`Erro ao processar ${ph}`, 'error');
          }
        } else {
          // Modo demo: não chama webhook, apenas marca como sem link
          semLink.add(ph);
          setClientesSemLink(prev => {
            const next = new Set(prev);
            next.add(ph);
            return next;
          });
          // Logar o corpo que seria enviado
          const demoBody = {
            telefone: ph,
            loginGestor,
            senhaGestor,
            loginPainel,
            SenhaPainel: senhaPainel,
          };
          logScan(`(demo) marcado sem link: ${ph}`);
          logScan(`(demo) REQ Body: ${JSON.stringify(exibirSegredos ? demoBody : { ...demoBody, senhaGestor: demoBody.senhaGestor ? '****' : '', SenhaPainel: demoBody.SenhaPainel ? '****' : '' })}`);
        }
        setProcessados(i + 1);
        setScanProgress(((i + 1) / uniquePhones.length) * 100);
        // Garantir processamento "um por vez" com pausa controlada
        await new Promise(r => setTimeout(r, 750));
      }
    } finally {
      setScanInProgress(false);
    }
    setLinksMapa(mapa);
    setClientesSemLink(semLink);
    logScan(`Concluído. Com link=${Object.keys(mapa).length} | Sem link=${semLink.size}`);
    alert(`✔ Varredura concluída. ${Object.keys(mapa).length} com link, ${semLink.size} sem link.`);
  };

  const exportLinksMapa = () => {
    const rows = Object.entries(linksMapa).map(([phone, link]) => ({ Telefone: phone, Link: link }));
    const ws = XLSX.utils.json_to_sheet(rows);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'LinksGestor');
    XLSX.writeFile(wb, `LinksGestor_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // (removido) Varredura Teste (10)

  const allClients = [
    ...(data.rawData?.ativos || []).map(c => ({ ...c, status: 'Ativo' })),
    ...(data.rawData?.expirados || []).map(c => ({ ...c, status: 'Expirado' })),
  ];

  // Banner persistente: detectar base truncada (cache antigo com apenas 500+500)
  const expectedTotal = (data.clientesAtivos || 0) + (data.clientesExpirados || 0);
  const isTruncated = allClients.length > 0 && allClients.length < expectedTotal;

  const filteredClients = allClients.filter(client => {
    const clientPhone = String(client.Usuario || client.usuario || client.telefone || '').replace(/\D/g, '');
    const phoneKey = clientPhone.startsWith('55') ? clientPhone : `55${clientPhone}`;
    
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'active' && client.status === 'Ativo') ||
      (filter === 'expired' && client.status === 'Expirado') ||
      (filter === 'sem-link' && clientesSemLink.has(phoneKey));
    
    const matchesSearch = !searchTerm ||
      (client.Usuario || client.usuario || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (client.Email || client.email || '').toLowerCase().includes(searchTerm.toLowerCase());

    return matchesFilter && matchesSearch;
  });

  // Paginação
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentClients = filteredClients.slice(startIndex, endIndex);

  const exportClients = (type: 'all' | 'active' | 'expired') => {
    let clientsToExport = allClients;
    let filename = 'Clientes_Todos';
    
    if (type === 'active') {
      clientsToExport = allClients.filter(c => c.status === 'Ativo');
      filename = 'Clientes_Ativos';
    } else if (type === 'expired') {
      clientsToExport = allClients.filter(c => c.status === 'Expirado');
      filename = 'Clientes_Vencidos';
    }

    const exportData = clientsToExport.map(client => {
      const raw = String(client.Usuario || client.usuario || client.telefone || '').replace(/\D/g, '');
      const phoneKey = raw.startsWith('55') ? raw : (raw ? `55${raw}` : '');
      const linkValue = phoneKey ? (linksMapa[phoneKey] || '') : '';
      return {
        'Telefone/Usuário': client.Usuario || client.usuario || '-',
        'Email': client.Email || client.email || '-',
        'Data Início': formatDate(parseDate(client.Criado_Em || client.criado_em || client.Criacao || client.criacao)),
        'Data Vencimento': formatDate(parseDate(client.Expira_Em || client.expira_em || client.Expiracao || client.expiracao)),
        'Status': client.status,
        'Link': linkValue || '-'
      };
    });

    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Clientes');
    XLSX.writeFile(wb, `${filename}_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  // Testar API-KEY do BotConversa
  const handleTestApiKey = async () => {
    if (!apiKey.trim()) {
      alert('❌ Insira uma API-KEY primeiro');
      return;
    }

    if (apiKey.trim().length < 20) {
      alert('❌ API-KEY muito curta. Verifique se copiou corretamente.');
      setApiKeyValid(false);
      return;
    }

    setTestingApiKey(true);
    setApiKeyValid(null);

    console.log('\n🔑 Testando API-KEY via Proxy...');
    console.log('API-KEY (início):', apiKey.substring(0, 15) + '...');

    try {
      const proxyUrl = 'http://localhost:8080';
      console.log(`📡 Validando com proxy: ${proxyUrl}/bc/test-key`);
      
      const response = await fetch(`${proxyUrl}/bc/test-key`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ apiKey })
      });

      console.log(`📥 Status da resposta: ${response.status}`);

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }

      const data = await response.json();
      console.log('📦 Resposta do proxy:', data);

      if (data.ok) {
        setApiKeyValid(true);
        console.log(`✅ API-KEY válida! (Modo: ${data.mode})`);
        
        if (data.mode === 'simulated') {
          alert('✅ API-KEY aceita!\n\n🧪 Modo SIMULADO ativo\n\nPara usar a API real:\n1. Feche o proxy\n2. Execute: export REAL_MODE=true\n3. Reinicie o proxy');
        }
      } else {
        setApiKeyValid(false);
        console.error('❌ API-KEY inválida');
        alert('❌ API-KEY inválida ou sem permissão.\n\nVerifique sua chave no BotConversa:\nConfigurações → Webhooks → API-KEY');
      }
    } catch (error: any) {
      console.error('❌ Erro ao testar API-KEY:', error);
      
      if (error.message?.includes('Failed to fetch')) {
        console.error('\n⚠️  PROXY NÃO ESTÁ RODANDO');
        console.error('\n💡 INICIE O PROXY:');
        console.error('1. Abra um terminal na pasta do projeto');
        console.error('2. Execute: pip install fastapi uvicorn httpx pydantic');
        console.error('3. Execute: uvicorn botconversa_proxy:app --host 0.0.0.0 --port 8080 --reload');
        console.error('4. Volte aqui e clique em "Testar" novamente');
        
        setApiKeyValid(null);
        alert('❌ Proxy não está rodando!\n\n📋 Siga os passos:\n\n1. Abra um terminal na pasta do projeto\n2. Execute:\n   pip install fastapi uvicorn httpx pydantic\n\n3. Execute:\n   uvicorn botconversa_proxy:app --host 0.0.0.0 --port 8080 --reload\n\n4. Volte aqui e teste novamente\n\n💡 O proxy elimina problemas de CORS!');
      } else {
        setApiKeyValid(false);
        alert(`❌ Erro: ${error.message}`);
      }
    }

    setTestingApiKey(false);
  };

  // Validar lista de telefones
  const handleValidatePhones = () => {
    const lines = phonesList.split('\n').filter(line => line.trim());
    const results = lines.map(line => {
      const phone = line.trim();
      const validation = validateBrazilianPhone(phone);
      
      return {
        phone: phone,
        status: validation.valid ? 'valid' as const : 'invalid' as const,
        message: validation.valid ? validation.formatted : validation.error || 'Inválido'
      };
    });
    
    setValidatedPhones(results);
    // Selecionar todos os válidos por padrão
    const validPhones = results.filter(r => r.status === 'valid').map(r => r.message);
    setSelectedPhones(new Set(validPhones));
  };

  // Toggle seleção de telefone
  const togglePhoneSelection = (phone: string) => {
    const newSelected = new Set(selectedPhones);
    if (newSelected.has(phone)) {
      newSelected.delete(phone);
    } else {
      newSelected.add(phone);
    }
    setSelectedPhones(newSelected);
  };

  // Buscar TAG por nome no BotConversa
  const handleSearchTag = async () => {
    if (!apiKey || !tagName) {
      alert('❌ Preencha a API-KEY e o nome da TAG primeiro');
      return;
    }

    setSearchingTag(true);
    setFoundTagId(null);
    setCurrentStep('Buscando TAG...');

    console.log(`\n🔍 Buscando TAG "${tagName}" via proxy...`);

    try {
      const proxyUrl = 'http://localhost:8080';
      console.log(`📡 Buscando com: POST ${proxyUrl}/bc/find-tag-by-name`);
      
      const response = await fetch(`${proxyUrl}/bc/find-tag-by-name`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ apiKey, name: tagName })
      });

      console.log(`📥 Status: ${response.status}`);

      if (response.ok) {
        const tag = await response.json();
        console.log('✅ TAG encontrada:', tag);
        setFoundTagId(tag.id);
        
        if (tag.mode === 'simulated') {
          console.log('🧪 TAG criada automaticamente no modo simulado');
        }
      } else if (response.status === 404) {
        const error = await response.json();
        console.error(`❌ ${error.detail}`);
        alert(`❌ TAG "${tagName}" não encontrada no BotConversa.\n\n📋 Para continuar:\n\n1. Acesse: BotConversa → Configurações → Etiquetas\n2. Clique em "Nova Etiqueta"\n3. Nome: ${tagName} (exatamente assim)\n4. Salve\n5. Volte aqui e clique em "🔍 Buscar TAG" novamente`);
      } else {
        const errorText = await response.text();
        throw new Error(`Erro ${response.status}: ${errorText}`);
      }
    } catch (error: any) {
      console.error('❌ Erro ao buscar TAG:', error);
      
      if (error.message?.includes('Failed to fetch')) {
        alert('❌ Proxy não está rodando!\n\nInicie o proxy primeiro:\nuvicorn botconversa_proxy:app --host 0.0.0.0 --port 8080 --reload');
      } else {
        alert(`❌ Erro ao buscar TAG: ${error.message}`);
      }
    }

    setCurrentStep('');
    setSearchingTag(false);
  };

  // Enviar TAG para BotConversa
  const handleSendTags = async () => {
    if (!apiKey || !tagName || selectedPhones.size === 0) {
      alert('❌ Preencha a API-KEY, o nome da TAG e selecione ao menos um telefone válido');
      return;
    }

    if (!useTestMode && !foundTagId) {
      alert('❌ Busque a TAG primeiro clicando em "🔍 Buscar TAG"');
      return;
    }

    setIsSending(true);
    setSendProgress(0);
    setSendResults(null);
    setCurrentStep('Preparando...');

    const phonesToSend = Array.from(selectedPhones);
    let success = 0;
    let failed = 0;

    const tagId = useTestMode ? 999 : foundTagId;

    console.log('🚀 Iniciando aplicação de TAG aos contatos...');
    console.log('📋 Configuração:', {
      tagName: tagName,
      tagId: tagId,
      totalContatos: phonesToSend.length,
      apiKey: apiKey.substring(0, 10) + '...',
      modoTeste: useTestMode
    });

    if (useTestMode) {
      console.log('⚠️  MODO DE TESTE ATIVADO - Simulando envios');
    }

    // Para cada telefone, criar subscriber e aplicar TAG via proxy
    const proxyUrl = 'http://localhost:8080';
    
    for (let i = 0; i < phonesToSend.length; i++) {
      const phone = phonesToSend[i];
      
      setCurrentStep(`📞 Processando ${i + 1}/${phonesToSend.length}: ${phone}`);
      console.log(`\n📞 [${i + 1}/${phonesToSend.length}] Processando: ${phone}`);

      try {
        // PASSO 1: Upsert subscriber (cria ou busca)
        setCurrentStep(`📞 ${i + 1}/${phonesToSend.length} - Obtendo subscriber...`);
        console.log(`📤 PASSO 1: Upsert subscriber para ${phone}...`);
        
        const subResponse = await fetch(`${proxyUrl}/bc/upsert-subscriber`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ apiKey, phone })
        });

        if (!subResponse.ok) {
          const errorText = await subResponse.text();
          throw new Error(`Erro ao upsert subscriber: ${subResponse.status} - ${errorText}`);
        }

        const subscriber = await subResponse.json();
        console.log(`✅ Subscriber: ID ${subscriber.id} (Modo: ${subscriber.mode})`);

        // PASSO 2: Associar TAG ao subscriber
        setCurrentStep(`📞 ${i + 1}/${phonesToSend.length} - Aplicando TAG...`);
        console.log(`📤 PASSO 2: Associando TAG ${tagId} ao subscriber ${subscriber.id}...`);
        
        const attachResponse = await fetch(`${proxyUrl}/bc/attach-tag`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
            apiKey, 
            subscriberId: subscriber.id, 
            tagId: tagId 
          })
        });

        if (!attachResponse.ok) {
          const errorText = await attachResponse.text();
          throw new Error(`Erro ao anexar TAG: ${attachResponse.status} - ${errorText}`);
        }

        const result = await attachResponse.json();
        console.log(`✅ TAG associada! (Modo: ${result.mode})`);
        setCurrentStep(`✅ ${i + 1}/${phonesToSend.length} - Concluído!`);
        success++;
        
      } catch (error: any) {
        console.error(`❌ Erro ao processar ${phone}:`, error.message);
        
        if (error.message?.includes('Failed to fetch')) {
          console.error('   ↳ Proxy não está rodando!');
          alert('❌ Proxy parou de responder!\n\nVerifique se o proxy ainda está rodando:\nuvicorn botconversa_proxy:app --host 0.0.0.0 --port 8080 --reload');
          setIsSending(false);
          return;
        }
        
        failed++;
      }
      
      setSendProgress(((i + 1) / phonesToSend.length) * 100);
      
      // Delay entre requisições
      if (i < phonesToSend.length - 1) {
        await new Promise(resolve => setTimeout(resolve, 100)); // proxy já tem delay interno
      }
    }

    setSendResults({ success, failed, total: phonesToSend.length });
    setCurrentStep('');
    setIsSending(false);
    
    // Log final
    console.log('\n' + '='.repeat(50));
    console.log('📊 RESULTADO FINAL' + (useTestMode ? ' (MODO TESTE)' : ''));
    console.log('='.repeat(50));
    console.log(`Total de contatos: ${phonesToSend.length}`);
    console.log(`✅ Sucesso: ${success} (${((success/phonesToSend.length)*100).toFixed(1)}%)`);
    console.log(`❌ Falhas: ${failed} (${((failed/phonesToSend.length)*100).toFixed(1)}%)`);
    console.log(`🏷️  TAG: "${tagName}" (ID: ${tagId})`);
    if (useTestMode) {
      console.log('⚠️  ATENÇÃO: Resultados simulados. Desative o Modo Teste para envio real.');
    }
    console.log('='.repeat(50));
    
    // Alerta ao usuário sobre resultados
    if (!useTestMode) {
      if (failed > 0 && failed === phonesToSend.length) {
        alert(`❌ Todos os envios falharam!\n\nPossíveis causas:\n1. CORS bloqueado pelo navegador\n2. API-KEY sem permissão\n3. Problema de rede\n\nVeja o Console (F12) para detalhes ou use o Modo de Teste.`);
      } else if (success > 0) {
        alert(`✅ Processo concluído!\n\n🏷️ TAG "${tagName}" (ID: ${tagId})\n✅ ${success} contatos marcados com sucesso${failed > 0 ? `\n⚠️ ${failed} falharam (veja Console)` : ''}\n\n📍 Acesse: BotConversa → Audiência → TAGs para verificar.`);
      }
    } else {
      alert(`🧪 Simulação concluída!\n\nTAG "${tagName}" seria criada e aplicada a ${success} contatos.\n\nDesative o Modo de Teste para envio real.`);
    }
  };

  // Carregar exemplo de telefones
  const handleLoadExample = () => {
    const examples = [
      '5511987654321',
      '5521987654321',
      '5531987654321',
      '5541987654321',
      '5551987654321'
    ];
    setPhonesList(examples.join('\n'));
  };

  // Importar contatos expirados da base
  const handleImportExpired = () => {
    if (!data) {
      alert('❌ Nenhum dado carregado. Faça upload do Excel primeiro.');
      return;
    }

    const days = parseInt(expiredPeriod);
    if (isNaN(days) || days < 1) {
      alert('❌ Período inválido. Escolha um valor entre 1 e 365 dias.');
      return;
    }

    const now = new Date();
    const cutoffDate = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);

    console.log(`\n📥 Importando clientes expirados nos últimos ${days} dias...`);
    console.log(`Data de corte: ${cutoffDate.toLocaleDateString('pt-BR')}`);

    // Filtrar clientes expirados no período
    const expiredClients = allClients.filter(client => {
      if (client.status !== 'Expirado') return false;
      
      try {
        const expirationDate = parseDate(client.vencimento);
        return expirationDate >= cutoffDate && expirationDate <= now;
      } catch {
        return false;
      }
    });

    if (expiredClients.length === 0) {
      alert(`❌ Nenhum cliente expirado encontrado nos últimos ${days} dias.`);
      return;
    }

    // Extrair telefones e formatar
    const phones: string[] = [];
    expiredClients.forEach(client => {
      if (client.telefone) {
        const phoneStr = String(client.telefone).replace(/\D/g, '');
        if (phoneStr.length >= 10) {
          // Adiciona 55 se não tiver
          const formatted = phoneStr.startsWith('55') ? phoneStr : '55' + phoneStr;
          phones.push(formatted);
        }
      }
    });

    if (phones.length === 0) {
      alert(`❌ Nenhum telefone válido encontrado nos ${expiredClients.length} clientes expirados.`);
      return;
    }

    // Remove duplicatas
    const uniquePhones = Array.from(new Set(phones));

    setPhonesList(uniquePhones.join('\n'));
    
    console.log(`✅ Importados ${uniquePhones.length} telefones únicos de ${expiredClients.length} clientes expirados`);
    alert(`✅ Importados com sucesso!\n\n📊 ${uniquePhones.length} telefones únicos\n📅 Expirados nos últimos ${days} dias\n\n👉 Clique em "Validar Números" para continuar`);
  };

  // Menu lateral
  const menuSections = [
    {
      id: 'lista' as ViewSection,
      label: 'Lista de Clientes',
      icon: List,
      description: 'Visualizar todos os clientes'
    },
    {
      id: 'cobranca' as ViewSection,
      label: 'Cobrança',
      icon: MessageCircle,
      description: 'Enviar TAG para BotConversa'
    },
    {
      id: 'analise' as ViewSection,
      label: 'Análise por Status',
      icon: TrendingUp,
      description: 'Estatísticas detalhadas'
    },
    {
      id: 'localizacao' as ViewSection,
      label: 'Localização',
      icon: MapPin,
      description: 'Distribuição geográfica'
    },
    {
      id: 'historico' as ViewSection,
      label: 'Histórico',
      icon: Clock,
      description: 'Evolução temporal'
    },
    {
      id: 'gestor' as ViewSection,
      label: 'Link Gestor',
      icon: Link,
      description: 'Gerar/validar links de pagamento'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Principais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card 
          className="p-5 border"
          style={{ 
            backgroundColor: COLORS.cardBg,
            borderColor: COLORS.border
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-slate-400 text-sm mb-1">Total de Clientes</p>
              <p className="text-white text-2xl">{((data.clientesAtivos || 0) + (data.clientesExpirados || 0)).toLocaleString('pt-BR')}</p>
            </div>
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${COLORS.azul}15` }}
            >
              <Users className="w-5 h-5" style={{ color: COLORS.azul }} />
            </div>
          </div>
        </Card>
        
        <Card 
          className="p-5 border"
          style={{ 
            backgroundColor: COLORS.cardBg,
            borderColor: COLORS.border
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-slate-400 text-sm mb-1">Assinaturas Ativas</p>
              <p className="text-white text-2xl">{data.clientesAtivos.toLocaleString('pt-BR')}</p>
              <p className="text-xs mt-1" style={{ color: COLORS.ativo }}>
                {data.taxaRetencao.toFixed(1)}% ainda assinam
              </p>
            </div>
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${COLORS.ativo}15` }}
            >
              <CheckCircle className="w-5 h-5" style={{ color: COLORS.ativo }} />
            </div>
          </div>
        </Card>
        
        <Card 
          className="p-5 border"
          style={{ 
            backgroundColor: COLORS.cardBg,
            borderColor: COLORS.border
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-slate-400 text-sm mb-1">Assinaturas Vencidas</p>
              <p className="text-white text-2xl">{data.clientesExpirados.toLocaleString('pt-BR')}</p>
              <p className="text-xs mt-1" style={{ color: COLORS.inativo }}>
                {data.churnRate.toFixed(1)}% cancelaram
              </p>
            </div>
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${COLORS.inativo}15` }}
            >
              <XCircle className="w-5 h-5" style={{ color: COLORS.inativo }} />
            </div>
          </div>
        </Card>
        
        <Card 
          className="p-5 border"
          style={{ 
            backgroundColor: COLORS.cardBg,
            borderColor: COLORS.border
          }}
        >
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <p className="text-slate-400 text-sm mb-1">Clientes Fiéis</p>
              <p className="text-white text-2xl">{data.clientesFieis.toLocaleString('pt-BR')}</p>
              <p className="text-xs mt-1" style={{ color: COLORS.roxo }}>
                Renovaram 2+ vezes
              </p>
            </div>
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${COLORS.roxo}15` }}
            >
              <Star className="w-5 h-5" style={{ color: COLORS.roxo }} />
            </div>
          </div>
        </Card>
      </div>

      {/* Container Principal com Menu Lateral */}
      <div className="flex gap-6">
        {/* Menu Lateral */}
        <Card 
          className="w-72 flex-shrink-0 border h-fit sticky top-4"
          style={{ 
            backgroundColor: COLORS.cardBg,
            borderColor: COLORS.border,
            boxShadow: 'inset 0 1px 2px rgba(255,255,255,0.05)'
          }}
        >
          <div className="p-4">
            <div className="mb-4 pb-3 border-b" style={{ borderColor: COLORS.border }}>
              <h3 className="text-white text-sm mb-1" style={{ fontWeight: 600 }}>
                Gestão de Clientes
              </h3>
              <p className="text-slate-500 text-xs">
                Central de Controle
              </p>
            </div>
            <nav className="space-y-1">
              {menuSections.map((section) => {
                const Icon = section.icon;
                const isActive = activeSection === section.id;
                return (
                  <button
                    key={section.id}
                    onClick={() => {
                      setActiveSection(section.id);
                      setCurrentPage(1); // Reset pagination
                    }}
                    className="w-full text-left px-3 py-3 rounded-lg transition-all duration-200 group relative"
                    style={{
                      backgroundColor: isActive ? `${COLORS.ativo}15` : 'transparent',
                      borderLeft: isActive ? `3px solid ${COLORS.ativo}` : '3px solid transparent',
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <Icon 
                        className="w-4 h-4 mt-0.5 flex-shrink-0" 
                        style={{ 
                          color: isActive ? COLORS.ativo : COLORS.textoSecundario
                        }}
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between mb-0.5">
                          <span 
                            className="text-sm"
                            style={{ 
                              color: isActive ? COLORS.ativo : COLORS.textoPrimario,
                              fontWeight: isActive ? 600 : 400
                            }}
                          >
                            {section.label}
                          </span>
                        </div>
                        <p 
                          className="text-[10px] leading-tight"
                          style={{ color: COLORS.textoTerciario }}
                        >
                          {section.description}
                        </p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </nav>
          </div>
        </Card>

        {/* Conteúdo Principal */}
        <div className="flex-1">
          {/* Seção: Lista de Clientes */}
          {activeSection === 'lista' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-white flex items-center gap-2">
                  <List className="w-5 h-5" style={{ color: COLORS.ativo }} />
                  <span>Lista de Clientes</span>
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  💡 Visualize, filtre e exporte seus clientes facilmente
                </p>
                {isTruncated && (
                  <div className="mt-3 p-3 rounded-lg border text-xs" style={{ backgroundColor: `${COLORS.amarelo}10`, borderColor: `${COLORS.amarelo}40` }}>
                    <div className="flex items-center justify-between gap-3">
                      <span style={{ color: COLORS.amarelo }}>
                        ⚠ A base carregada parece incompleta. Limpe o cache e reenvie o Excel para varrer todos os clientes.
                      </span>
                      <Button
                        size="sm"
                        onClick={() => { localStorage.removeItem('iptvDashboardData'); alert('Cache limpo. Recarregue a página e reenvie o arquivo Excel.'); }}
                        style={{ backgroundColor: COLORS.amarelo, color: 'black' }}
                      >
                        Limpar cache
                      </Button>
                    </div>
                  </div>
                )}
              </div>

              <Card 
                className="p-6 border"
                style={{ 
                  backgroundColor: COLORS.cardBg,
                  borderColor: COLORS.border
                }}
              >
                {/* Ações rápidas */}
                <div className="flex items-center justify-between mb-3">
                  <div />
                  <Button
                    size="sm"
                    onClick={() => { localStorage.removeItem('iptvDashboardData'); alert('Cache limpo. Recarregue a página e reenvie o arquivo Excel para carregar todos os clientes.'); }}
                    style={{ backgroundColor: 'transparent', border: `1px solid ${COLORS.border}`, color: COLORS.textoSecundario }}
                  >
                    Limpar cache de dados
                  </Button>
                </div>
                {/* Filtros */}
                <div className="flex flex-col lg:flex-row gap-4 mb-6">
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      onClick={() => { setFilter('all'); setCurrentPage(1); }}
                      size="sm"
                      style={{
                        backgroundColor: filter === 'all' ? `${COLORS.roxo}` : 'transparent',
                        color: filter === 'all' ? 'white' : COLORS.textoSecundario,
                        border: `1px solid ${filter === 'all' ? COLORS.roxo : COLORS.border}`,
                      }}
                    >
                      <Filter className="w-4 h-4 mr-2" />
                      Todos ({((data.clientesAtivos || 0) + (data.clientesExpirados || 0)).toLocaleString('pt-BR')})
                    </Button>
                    <Button
                      onClick={() => { setFilter('active'); setCurrentPage(1); }}
                      size="sm"
                      style={{
                        backgroundColor: filter === 'active' ? COLORS.verde : 'transparent',
                        color: filter === 'active' ? 'white' : COLORS.textoSecundario,
                        border: `1px solid ${filter === 'active' ? COLORS.verde : COLORS.border}`,
                      }}
                    >
                      Ativos ({data.clientesAtivos})
                    </Button>
                    <Button
                      onClick={() => { setFilter('expired'); setCurrentPage(1); }}
                      size="sm"
                      style={{
                        backgroundColor: filter === 'expired' ? COLORS.vermelho : 'transparent',
                        color: filter === 'expired' ? 'white' : COLORS.textoSecundario,
                        border: `1px solid ${filter === 'expired' ? COLORS.vermelho : COLORS.border}`,
                      }}
                    >
                      Vencidos ({data.clientesExpirados})
                    </Button>
                    <Button
                      onClick={() => { setFilter('sem-link'); setCurrentPage(1); }}
                      size="sm"
                      style={{
                        backgroundColor: filter === 'sem-link' ? COLORS.amarelo : 'transparent',
                        color: filter === 'sem-link' ? 'white' : COLORS.textoSecundario,
                        border: `1px solid ${filter === 'sem-link' ? COLORS.amarelo : COLORS.border}`,
                      }}
                    >
                      <X className="w-4 h-4 mr-2" />
                      Sem Link ({clientesSemLink.size})
                    </Button>
                  </div>
                  
                  <div className="flex gap-2 flex-wrap ml-auto">
                    <Button
                      onClick={() => exportClients('all')}
                      size="sm"
                      variant="outline"
                      style={{
                        backgroundColor: 'transparent',
                        borderColor: COLORS.border,
                        color: COLORS.textoSecundario
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exportar Todos
                    </Button>
                    <Button
                      onClick={() => exportClients('active')}
                      size="sm"
                      variant="outline"
                      style={{
                        backgroundColor: `${COLORS.verde}15`,
                        borderColor: `${COLORS.verde}40`,
                        color: COLORS.verde
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exportar Ativos
                    </Button>
                    <Button
                      onClick={() => exportClients('expired')}
                      size="sm"
                      variant="outline"
                      style={{
                        backgroundColor: `${COLORS.vermelho}15`,
                        borderColor: `${COLORS.vermelho}40`,
                        color: COLORS.vermelho
                      }}
                    >
                      <Download className="w-4 h-4 mr-2" />
                      Exportar Vencidos
                    </Button>
                  </div>
                  
                  <div className="relative flex-1 max-w-xs">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                      placeholder="Buscar cliente..."
                      value={searchTerm}
                      onChange={(e) => { setSearchTerm(e.target.value); setCurrentPage(1); }}
                      className="pl-10"
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.02)',
                        borderColor: COLORS.border,
                        color: 'white'
                      }}
                    />
                  </div>
                </div>

                {/* Tabela */}
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow 
                        className="border-b hover:bg-transparent"
                        style={{ borderColor: COLORS.border }}
                      >
                        <TableHead className="text-slate-400">Telefone/Usuário</TableHead>
                        <TableHead className="text-slate-400">Email</TableHead>
                        <TableHead className="text-slate-400">Data Início</TableHead>
                        <TableHead className="text-slate-400">Data Vencimento</TableHead>
                        <TableHead className="text-slate-400">Status</TableHead>
                        <TableHead className="text-slate-400">Link</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentClients.map((client, index) => {
                        const criadoEm = parseDate(client.Criado_Em || client.criado_em || client.Criacao || client.criacao);
                        const expiraEm = parseDate(client.Expira_Em || client.expira_em || client.Expiracao || client.expiracao);
                        const clientPhoneRaw = String(client.Usuario || client.usuario || client.telefone || '').replace(/\D/g, '');
                        const phoneKey = clientPhoneRaw.startsWith('55') ? clientPhoneRaw : (clientPhoneRaw ? `55${clientPhoneRaw}` : '');
                        const linkValue = phoneKey ? (linksMapa[phoneKey] || '') : '';
                        
                        return (
                          <TableRow 
                            key={index} 
                            className="border-b hover:bg-slate-800/30"
                            style={{ borderColor: COLORS.border }}
                          >
                            <TableCell className="text-white">
                              {client.Usuario || client.usuario || '-'}
                            </TableCell>
                            <TableCell className="text-slate-300">
                              {client.Email || client.email || '-'}
                            </TableCell>
                            <TableCell className="text-slate-300">
                              {formatDate(criadoEm)}
                            </TableCell>
                            <TableCell className="text-slate-300">
                              {formatDate(expiraEm)}
                            </TableCell>
                            <TableCell>
                              <Badge 
                                variant="outline"
                                style={{
                                  backgroundColor: client.status === 'Ativo' ? `${COLORS.ativo}15` : `${COLORS.inativo}15`,
                                  borderColor: client.status === 'Ativo' ? `${COLORS.ativo}50` : `${COLORS.inativo}50`,
                                  color: client.status === 'Ativo' ? COLORS.ativo : COLORS.inativo
                                }}
                              >
                                {client.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-slate-300 break-all">
                              {linkValue ? (
                                <a href={linkValue} target="_blank" rel="noreferrer" className="underline" style={{ color: COLORS.ativo }}>
                                  {linkValue}
                                </a>
                              ) : (
                                '-'
                              )}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>

                {/* Paginação */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-slate-400">
                      Mostrando {startIndex + 1}-{Math.min(endIndex, filteredClients.length)} de {filteredClients.length.toLocaleString('pt-BR')} clientes
                    </div>
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        disabled={currentPage === 1}
                        style={{
                          backgroundColor: 'transparent',
                          borderColor: COLORS.border,
                          color: COLORS.textoSecundario
                        }}
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </Button>
                      <div className="flex items-center gap-1">
                        {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                          let pageNum;
                          if (totalPages <= 5) {
                            pageNum = i + 1;
                          } else if (currentPage <= 3) {
                            pageNum = i + 1;
                          } else if (currentPage >= totalPages - 2) {
                            pageNum = totalPages - 4 + i;
                          } else {
                            pageNum = currentPage - 2 + i;
                          }
                          
                          return (
                            <Button
                              key={i}
                              size="sm"
                              variant="outline"
                              onClick={() => setCurrentPage(pageNum)}
                              style={{
                                backgroundColor: currentPage === pageNum ? COLORS.ativo : 'transparent',
                                borderColor: currentPage === pageNum ? COLORS.ativo : COLORS.border,
                                color: currentPage === pageNum ? 'black' : COLORS.textoSecundario,
                                minWidth: '36px'
                              }}
                            >
                              {pageNum}
                            </Button>
                          );
                        })}
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={currentPage === totalPages}
                        style={{
                          backgroundColor: 'transparent',
                          borderColor: COLORS.border,
                          color: COLORS.textoSecundario
                        }}
                      >
                        <ChevronRight className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                )}

                {filteredClients.length === 0 && (
                  <div className="text-center py-12">
                    <Search className="w-12 h-12 text-slate-600 mx-auto mb-3" />
                    <p className="text-slate-400">Nenhum cliente encontrado</p>
                    <p className="text-slate-500 text-sm">Tente ajustar os filtros ou a busca</p>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Seção: Link Gestor */}
          {activeSection === 'gestor' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-white flex items-center gap-2">
                  <Link className="w-5 h-5" style={{ color: COLORS.ativo }} />
                  <span>Link Gestor</span>
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  💡 Informe suas credenciais do Gestor e do Painel, salve e gere/verifique links de pagamento.
                </p>
              </div>

              <Card className="p-6 border" style={{ backgroundColor: COLORS.cardBg, borderColor: COLORS.border }}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h3 className="text-white text-sm mb-2" style={{ fontWeight: 600 }}>Credenciais do Gestor</h3>
                    <Input placeholder="Usuário do Gestor" value={loginGestor} onChange={e=>setLoginGestor(e.target.value)}
                      style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderColor: COLORS.border, color: 'white' }} />
                    <Input placeholder="Senha do Gestor" type="password" value={senhaGestor} onChange={e=>setSenhaGestor(e.target.value)}
                      className="mt-2" style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderColor: COLORS.border, color: 'white' }} />
                  </div>
                  <div>
                    <h3 className="text-white text-sm mb-2" style={{ fontWeight: 600 }}>Credenciais do Painel</h3>
                    <Input placeholder="Usuário do Painel" value={loginPainel} onChange={e=>setLoginPainel(e.target.value)}
                      style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderColor: COLORS.border, color: 'white' }} />
                    <Input placeholder="Senha do Painel" type="password" value={senhaPainel} onChange={e=>setSenhaPainel(e.target.value)}
                      className="mt-2" style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderColor: COLORS.border, color: 'white' }} />
                  </div>
                </div>

                <div className="mt-4 flex gap-2">
                  <Button onClick={saveGestorCreds} size="sm" style={{ backgroundColor: COLORS.verde, color: 'white' }}>Salvar Login</Button>
                  <Button onClick={clearGestorCreds} size="sm" variant="outline"
                    style={{ backgroundColor: 'transparent', borderColor: COLORS.border, color: COLORS.textoSecundario }}>Limpar</Button>
                </div>

                <Separator className="my-6" style={{ borderColor: COLORS.border }} />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-end">
                  <div>
                    <h3 className="text-white text-sm mb-2" style={{ fontWeight: 600 }}>Busca rápida de link</h3>
                    <Input placeholder="Telefone (55 + DDD + número)" value={gestorPhone} onChange={e=>setGestorPhone(e.target.value)}
                      style={{ backgroundColor: 'rgba(255,255,255,0.02)', borderColor: COLORS.border, color: 'white' }} />
                    <p className="text-[11px] mt-1" style={{ color: COLORS.textoTerciario }}>Dica: copie de um cliente na lista.</p>
                  </div>
                  <div className="flex gap-2">
                    <Button onClick={handleBuscarLinkUnico} size="sm" style={{ backgroundColor: COLORS.azul, color: 'white' }} disabled={gestorLoading}>
                      {gestorLoading ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Link className="w-4 h-4 mr-2" />} Buscar Link
                    </Button>
                    {gestorLink && (
                      <a href={gestorLink} target="_blank" rel="noreferrer" className="text-xs underline" style={{ color: COLORS.ativo }}>Abrir link</a>
                    )}
                  </div>
                </div>
                <div className="mt-2 text-sm" style={{ color: gestorLink ? COLORS.ativo : COLORS.textoTerciario }}>
                  {gestorStatus}
                  {gestorLink && (
                    <div className="mt-1 break-all" style={{ color: COLORS.textoPrimario }}>Link: {gestorLink}</div>
                  )}
                </div>

                <Separator className="my-6" style={{ borderColor: COLORS.border }} />

                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white text-sm mb-1" style={{ fontWeight: 600 }}>Ver todos com link</h3>
                    <p className="text-slate-500 text-xs">Varre sua base e marca quem possui link; exporte a lista.</p>
                    <div className="mt-2 flex items-center gap-2">
                      <input type="checkbox" id="demo-mode" checked={demoMode} onChange={(e)=>setDemoMode(e.target.checked)} />
                      <label htmlFor="demo-mode" className="text-xs" style={{ color: COLORS.textoTerciario }}>
                        Modo Demo (não chama webhook)
                      </label>
                    </div>
                    {/* Filtros compactos diretamente na seção do Gestor */}
                    <div className="flex gap-2 flex-wrap mt-2">
                      <Button
                        onClick={() => { setFilter('all'); setCurrentPage(1); }}
                        size="sm"
                        style={{
                          backgroundColor: filter === 'all' ? `${COLORS.roxo}` : 'transparent',
                          color: filter === 'all' ? 'white' : COLORS.textoSecundario,
                          border: `1px solid ${filter === 'all' ? COLORS.roxo : COLORS.border}`,
                        }}
                      >
                        Todos ({((data.clientesAtivos || 0) + (data.clientesExpirados || 0)).toLocaleString('pt-BR')})
                      </Button>
                      <Button
                        onClick={() => { setFilter('active'); setCurrentPage(1); }}
                        size="sm"
                        style={{
                          backgroundColor: filter === 'active' ? COLORS.verde : 'transparent',
                          color: filter === 'active' ? 'white' : COLORS.textoSecundario,
                          border: `1px solid ${filter === 'active' ? COLORS.verde : COLORS.border}`,
                        }}
                      >
                        Ativos ({data.clientesAtivos})
                      </Button>
                      <Button
                        onClick={() => { setFilter('expired'); setCurrentPage(1); }}
                        size="sm"
                        style={{
                          backgroundColor: filter === 'expired' ? COLORS.vermelho : 'transparent',
                          color: filter === 'expired' ? 'white' : COLORS.textoSecundario,
                          border: `1px solid ${filter === 'expired' ? COLORS.vermelho : COLORS.border}`,
                        }}
                      >
                        Vencidos ({data.clientesExpirados})
                      </Button>
                      <Button
                        onClick={() => { setFilter('sem-link'); setCurrentPage(1); }}
                        size="sm"
                        style={{
                          backgroundColor: filter === 'sem-link' ? COLORS.amarelo : 'transparent',
                          color: filter === 'sem-link' ? 'white' : COLORS.textoSecundario,
                          border: `1px solid ${filter === 'sem-link' ? COLORS.amarelo : COLORS.border}`,
                        }}
                      >
                        Sem Link ({clientesSemLink.size})
                      </Button>
                    </div>
                    <div className="mt-2 text-xs" style={{ color: COLORS.textoTerciario }}>
                      Selecionados para varredura: {filter === 'sem-link' ? clientesSemLink.size : filteredClients.length}
                    </div>
                    {isTruncated && (
                      <div className="mt-2 p-3 rounded-lg border text-xs" style={{ backgroundColor: `${COLORS.amarelo}10`, borderColor: `${COLORS.amarelo}40` }}>
                        <div className="flex items-center justify-between gap-3">
                          <span style={{ color: COLORS.amarelo }}>
                            ⚠ A base atual está truncada ({allClients.length.toLocaleString('pt-BR')} de {expectedTotal.toLocaleString('pt-BR')}). Limpe o cache e reenvie o Excel.
                          </span>
                          <Button
                            size="sm"
                            onClick={() => { localStorage.removeItem('iptvDashboardData'); alert('Cache limpo. Recarregue a página e reenvie o arquivo Excel.'); }}
                            style={{ backgroundColor: COLORS.amarelo, color: 'black' }}
                          >
                            Limpar cache
                          </Button>
                        </div>
                      </div>
                    )}
                    {/* Prévia dos clientes na seleção (até 10) */}
                    <div className="mt-3 overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow className="border-b hover:bg-transparent" style={{ borderColor: COLORS.border }}>
                            <TableHead className="text-slate-400">Telefone/Usuário</TableHead>
                            <TableHead className="text-slate-400">Email</TableHead>
                            <TableHead className="text-slate-400">Status</TableHead>
                            <TableHead className="text-slate-400">Link</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredClients.slice(0, 10).map((client, idx) => {
                            const raw = String(client.Usuario || client.usuario || client.telefone || '').replace(/\D/g, '');
                            const phoneKey = raw.startsWith('55') ? raw : (raw ? `55${raw}` : '');
                            const linkValue = phoneKey ? (linksMapa[phoneKey] || '') : '';
                            return (
                              <TableRow key={idx} className="border-b hover:bg-slate-800/30" style={{ borderColor: COLORS.border }}>
                                <TableCell className="text-white">{client.Usuario || client.usuario || '-'}</TableCell>
                                <TableCell className="text-slate-300">{client.Email || client.email || '-'}</TableCell>
                                <TableCell>
                                  <Badge 
                                    variant="outline"
                                    style={{
                                      backgroundColor: client.status === 'Ativo' ? `${COLORS.ativo}15` : `${COLORS.inativo}15`,
                                      borderColor: client.status === 'Ativo' ? `${COLORS.ativo}50` : `${COLORS.inativo}50`,
                                      color: client.status === 'Ativo' ? COLORS.ativo : COLORS.inativo
                                    }}
                                  >
                                    {client.status}
                                  </Badge>
                                </TableCell>
                                <TableCell className="text-slate-300 break-all">
                                  {linkValue ? (
                                    <a href={linkValue} target="_blank" rel="noreferrer" className="underline" style={{ color: COLORS.ativo }}>
                                      {linkValue}
                                    </a>
                                  ) : (
                                    '-'
                                  )}
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>
                  </div>
                  <div className="flex gap-2" style={{ position: 'relative', zIndex: 999, pointerEvents: 'auto' }}>
                    <Button onClick={handleScanTodosLinks} disabled={scanInProgress} size="sm" style={{ backgroundColor: COLORS.roxo, color: 'white', opacity: scanInProgress ? 0.7 : 1 }}>
                      {scanInProgress ? 'Verificando...' : 'Verificar Base'}
                    </Button>
                    <Button onClick={exportLinksMapa} size="sm" variant="outline"
                      style={{ backgroundColor: 'transparent', borderColor: COLORS.border, color: COLORS.textoSecundario }}>
                      <Download className="w-4 h-4 mr-2" /> Exportar Links
                    </Button>
                  </div>
                </div>
                <Progress value={scanProgress} className="mt-3" />
                <div className="mt-2 text-xs" style={{ color: COLORS.textoTerciario }}>
                  Total a pesquisar: {totalParaPesquisar} | Processados: {processados} | Com link: {Object.keys(linksMapa).length} | Sem link: {clientesSemLink.size}
                </div>
                <div className="mt-3 p-3 rounded-lg text-xs" style={{ backgroundColor: COLORS.cardBg, border: `1px solid ${COLORS.border}` }}>
                  <div className="mb-2 flex items-center justify-between" style={{ color: COLORS.textoSecundario }}>
                    <div>Logs da varredura</div>
                    <label className="flex items-center gap-2">
                      <input type="checkbox" checked={exibirSegredos} onChange={e=>setExibirSegredos(e.target.checked)} />
                      <span style={{ color: COLORS.textoTerciario }}>Mostrar segredos nos logs</span>
                    </label>
                  </div>
                  <div style={{ maxHeight: 180, overflowY: 'auto', fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, Liberation Mono, monospace', color: COLORS.textoTerciario }}>
                    {scanLogs.length === 0 ? (
                      <div style={{ color: COLORS.textoTerciario }}>Sem logs ainda.</div>
                    ) : (
                      scanLogs.slice(-200).map((l, idx) => (
                        <div key={idx} style={{ whiteSpace: 'pre-wrap', color: l.level === 'error' ? '#ef4444' : l.level === 'warn' ? '#f59e0b' : COLORS.textoTerciario }}>
                          {new Date(l.ts).toLocaleTimeString()} - {l.msg}
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {Object.keys(linksMapa).length > 0 && (
                  <div className="mt-4 overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow className="border-b hover:bg-transparent" style={{ borderColor: COLORS.border }}>
                          <TableHead className="text-slate-400">Telefone</TableHead>
                          <TableHead className="text-slate-400">Link</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {Object.entries(linksMapa).map(([ph, ln]) => (
                          <TableRow key={ph} className="border-b hover:bg-transparent" style={{ borderColor: COLORS.border }}>
                            <TableCell className="text-white">{ph}</TableCell>
                            <TableCell className="text-white break-all"><a href={ln} target="_blank" rel="noreferrer" className="underline" style={{ color: COLORS.ativo }}>{ln}</a></TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </Card>
            </div>
          )}

          {/* Seção: Cobrança */}
          {activeSection === 'cobranca' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-white flex items-center gap-2">
                  <MessageCircle className="w-5 h-5" style={{ color: COLORS.ativo }} />
                  <span>Cobrança - Integração BotConversa</span>
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  💡 Envie TAGs para sua audiência do BotConversa de forma automática
                </p>
              </div>

              {/* Passo 1: Configuração */}
              {/* Instruções Iniciais */}
              <Card 
                className="p-4 border"
                style={{ 
                  backgroundColor: `${COLORS.azul}10`,
                  borderColor: `${COLORS.azul}30`
                }}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: COLORS.azul }} />
                  <div className="flex-1">
                    <h4 className="text-white text-sm mb-1" style={{ fontWeight: 600 }}>
                      📚 Como usar - Processo simplificado
                    </h4>
                    <ul className="text-slate-300 text-xs space-y-1">
                      <li>1. <strong className="text-white">Crie a TAG:</strong> BotConversa → Configurações → Etiquetas → Nova (ex: COBRAR2710)</li>
                      <li>2. <strong className="text-white">Configure aqui:</strong> Insira API-KEY → Digite nome da TAG → Clique "Buscar TAG"</li>
                      <li>3. <strong className="text-white">Importe:</strong> Selecione período → "Importar Expirados" OU cole telefones manualmente</li>
                      <li>4. <strong className="text-white">Envie:</strong> "Validar Números" → Selecione contatos → "Enviar TAG"</li>
                    </ul>
                    <div className="mt-3 pt-3 border-t" style={{ borderColor: `${COLORS.azul}20` }}>
                      <div className="flex items-center gap-2 mb-1">
                        <Calendar className="w-3 h-3" style={{ color: COLORS.roxo }} />
                        <span className="text-xs" style={{ color: COLORS.roxo, fontWeight: 600 }}>
                          ✨ Importação automática de expirados por período!
                        </span>
                      </div>
                      <p className="text-slate-400 text-xs">
                        <strong style={{ color: COLORS.azul }}>💡 Debug:</strong> Abra o Console (F12) para ver cada etapa em tempo real
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Documentação da API */}
              <Card 
                className="p-4 border"
                style={{ 
                  backgroundColor: `${COLORS.roxo}08`,
                  borderColor: `${COLORS.roxo}20`
                }}
              >
                <div className="flex items-start gap-3">
                  <Tag className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: COLORS.roxo }} />
                  <div className="flex-1">
                    <h4 className="text-white text-sm mb-2" style={{ fontWeight: 600 }}>
                      🔌 Fluxo da API BotConversa
                    </h4>
                    
                    <div className="space-y-2 mb-3">
                      <div className="flex items-start gap-2 text-xs text-slate-300">
                        <div 
                          className="px-2 py-0.5 rounded text-[10px] flex-shrink-0"
                          style={{ 
                            backgroundColor: `${COLORS.azul}30`,
                            color: COLORS.azul,
                            fontWeight: 600
                          }}
                        >
                          1
                        </div>
                        <div>
                          <strong className="text-white">Buscar TAG por nome</strong>
                          <code className="ml-2 text-[10px] text-slate-400">GET /tags/</code>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-xs text-slate-300">
                        <div 
                          className="px-2 py-0.5 rounded text-[10px] flex-shrink-0"
                          style={{ 
                            backgroundColor: `${COLORS.verde}30`,
                            color: COLORS.verde,
                            fontWeight: 600
                          }}
                        >
                          2
                        </div>
                        <div>
                          <strong className="text-white">Obter/Criar Subscriber</strong>
                          <code className="ml-2 text-[10px] text-slate-400">GET ou POST /subscriber/</code>
                        </div>
                      </div>
                      <div className="flex items-start gap-2 text-xs text-slate-300">
                        <div 
                          className="px-2 py-0.5 rounded text-[10px] flex-shrink-0"
                          style={{ 
                            backgroundColor: `${COLORS.roxo}50`,
                            color: COLORS.roxo,
                            fontWeight: 600
                          }}
                        >
                          3
                        </div>
                        <div>
                          <strong className="text-white">Associar TAG ao Subscriber</strong>
                          <code className="ml-2 text-[10px] text-slate-400">POST /subscriber/{'{id}'}/tags/{'{tag_id}'}/</code>
                        </div>
                      </div>
                    </div>

                    <div 
                      className="p-3 rounded-lg font-mono text-[10px]"
                      style={{ 
                        backgroundColor: 'rgba(0,0,0,0.3)',
                        border: `1px solid ${COLORS.border}`
                      }}
                    >
                      <div className="text-green-400 mb-2">📋 Pré-requisito - Criar TAG no BotConversa:</div>
                      <pre className="text-slate-400 overflow-x-auto">
{`1. Acesse: BotConversa → Configurações → Etiquetas
2. Clique em "Nova Etiqueta"
3. Nome: COBRAR2710 (nome exato que usará aqui)
4. Salve

✅ Pronto! Agora busque aqui pelo nome`}
                      </pre>
                    </div>

                    <div className="mt-3 flex items-start gap-2">
                      <AlertCircle className="w-3 h-3 mt-0.5 flex-shrink-0" style={{ color: COLORS.azul }} />
                      <p className="text-slate-400 text-[10px]">
                        <strong style={{ color: COLORS.azul }}>✨ Simplificado:</strong> Crie a TAG no painel, busque aqui e aplique aos contatos!
                        <br />
                        <strong className="mt-1 inline-block">Limite:</strong> ~4 req/s (delay de 250ms entre contatos)
                        <br />
                        📖 <a 
                          href="https://backend.botconversa.com.br/swagger/" 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="underline"
                          style={{ color: COLORS.azul }}
                        >
                          Documentação completa
                        </a>
                      </p>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Aviso CORS */}
              <Card 
                className="p-4 border"
                style={{ 
                  backgroundColor: `${COLORS.vermelho}08`,
                  borderColor: `${COLORS.vermelho}20`
                }}
              >
                <div className="flex items-start gap-3">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 mt-0.5" style={{ color: COLORS.vermelho }} />
                  <div className="flex-1">
                    <h4 className="text-white text-sm mb-2" style={{ fontWeight: 600 }}>
                      ⚠️ Sobre o erro "Failed to fetch" (CORS)
                    </h4>
                    <div className="text-slate-300 text-xs space-y-2">
                      <p>
                        Esse erro ocorre quando a API do BotConversa <strong>bloqueia requisições diretas do navegador</strong> por questões de segurança (política CORS).
                      </p>
                      <div className="mt-2">
                        <p className="text-slate-400 mb-1" style={{ fontWeight: 600 }}>Soluções:</p>
                        <ul className="list-disc list-inside space-y-1 text-slate-400">
                          <li>
                            <strong style={{ color: COLORS.amarelo }}>Use o Modo de Teste</strong> (checkbox acima) para simular e testar a interface
                          </li>
                          <li>
                            Entre em contato com o suporte do BotConversa para:
                            <ul className="list-circle list-inside ml-4 mt-1 space-y-0.5">
                              <li>Confirmar a URL correta da API</li>
                              <li>Solicitar liberação CORS para seu domínio</li>
                              <li>Obter documentação atualizada</li>
                            </ul>
                          </li>
                          <li>
                            Implemente um <strong>backend intermediário</strong> (servidor proxy) que faça as requisições para a API
                          </li>
                          <li>
                            Use a <strong>extensão CORS Unblock</strong> no navegador (apenas para desenvolvimento/testes)
                          </li>
                        </ul>
                      </div>
                      <div 
                        className="mt-3 p-2 rounded text-[10px]"
                        style={{ 
                          backgroundColor: `${COLORS.azul}15`,
                          borderLeft: `2px solid ${COLORS.azul}`
                        }}
                      >
                        <strong style={{ color: COLORS.azul }}>💡 Para desenvolvedores:</strong> A requisição está correta. O problema está na configuração CORS do servidor da API, não no seu código.
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              <Card 
                className="p-6 border"
                style={{ 
                  backgroundColor: COLORS.cardBg,
                  borderColor: COLORS.border
                }}
              >
                <h3 className="text-white mb-4 text-sm flex items-center gap-2" style={{ fontWeight: 600 }}>
                  <Tag className="w-4 h-4" />
                  Passo 1: Configuração
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-slate-400 text-sm mb-2 block">
                      API-KEY do BotConversa
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Cole sua API-KEY aqui..."
                        value={apiKey}
                        onChange={(e) => {
                          setApiKey(e.target.value);
                          setApiKeyValid(null); // Reset validação ao mudar
                        }}
                        type="password"
                        className="flex-1"
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.02)',
                          borderColor: apiKeyValid === true ? COLORS.verde : apiKeyValid === false ? COLORS.vermelho : COLORS.border,
                          color: 'white'
                        }}
                      />
                      <Button
                        onClick={handleTestApiKey}
                        disabled={!apiKey.trim() || testingApiKey}
                        size="sm"
                        style={{
                          backgroundColor: apiKeyValid === true ? COLORS.verde : COLORS.azul,
                          color: 'white',
                          minWidth: '100px'
                        }}
                      >
                        {testingApiKey ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Testando
                          </>
                        ) : apiKeyValid === true ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Válida
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 mr-2" />
                            Testar
                          </>
                        )}
                      </Button>
                    </div>
                    <div className="flex items-start gap-2 mt-2">
                      {apiKeyValid === true && (
                        <div 
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs flex-1"
                          style={{ 
                            backgroundColor: `${COLORS.verde}15`,
                            borderLeft: `3px solid ${COLORS.verde}`
                          }}
                        >
                          <Check className="w-3 h-3 flex-shrink-0" style={{ color: COLORS.verde }} />
                          <span style={{ color: COLORS.verde }}>✅ API-KEY autenticada com sucesso!</span>
                        </div>
                      )}
                      {apiKeyValid === false && (
                        <div 
                          className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs flex-1"
                          style={{ 
                            backgroundColor: `${COLORS.vermelho}15`,
                            borderLeft: `3px solid ${COLORS.vermelho}`
                          }}
                        >
                          <X className="w-3 h-3 flex-shrink-0" style={{ color: COLORS.vermelho }} />
                          <span style={{ color: COLORS.vermelho }}>❌ API-KEY inválida. Verifique e tente novamente.</span>
                        </div>
                      )}
                      {apiKeyValid === null && (
                        <p className="text-slate-500 text-xs">
                          💡 Encontre sua chave em: <span className="text-slate-400">Configurações → API → API-KEY</span>
                        </p>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="text-slate-400 text-sm mb-2 block">
                      Nome da TAG (criada no BotConversa)
                    </label>
                    <div className="flex gap-2">
                      <Input
                        placeholder="Ex: COBRAR2710"
                        value={tagName}
                        onChange={(e) => {
                          setTagName(e.target.value.toUpperCase());
                          setFoundTagId(null); // Reset ao mudar o nome
                        }}
                        style={{
                          backgroundColor: 'rgba(255,255,255,0.02)',
                          borderColor: COLORS.border,
                          color: 'white',
                          flex: 1
                        }}
                      />
                      <Button
                        onClick={handleSearchTag}
                        disabled={!apiKey || !tagName || searchingTag}
                        style={{
                          backgroundColor: foundTagId ? COLORS.verde : COLORS.azul,
                          color: 'white',
                          minWidth: '140px'
                        }}
                      >
                        {searchingTag ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Buscando...
                          </>
                        ) : foundTagId ? (
                          <>
                            <Check className="w-4 h-4 mr-2" />
                            Encontrada
                          </>
                        ) : (
                          <>
                            <Search className="w-4 h-4 mr-2" />
                            Buscar TAG
                          </>
                        )}
                      </Button>
                    </div>
                    <p className="text-slate-500 text-xs mt-1">
                      💡 Crie a TAG no BotConversa → Configurações → Etiquetas antes de buscar
                    </p>
                  </div>

                  {foundTagId && (
                    <div 
                      className="p-3 rounded-lg border text-xs"
                      style={{ 
                        backgroundColor: `${COLORS.verde}10`,
                        borderColor: `${COLORS.verde}40`
                      }}
                    >
                      <div className="flex items-center gap-2">
                        <Check className="w-4 h-4 flex-shrink-0" style={{ color: COLORS.verde }} />
                        <div className="text-slate-300">
                          <span style={{ color: COLORS.verde, fontWeight: 600 }}>✅ TAG encontrada: </span>
                          <span className="text-white">"{tagName}" (ID: {foundTagId})</span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Modo de Teste */}
                  <Separator style={{ backgroundColor: COLORS.border }} />
                  
                  <div 
                    className="p-4 rounded-lg border"
                    style={{ 
                      backgroundColor: useTestMode ? `${COLORS.amarelo}10` : 'rgba(255,255,255,0.02)',
                      borderColor: useTestMode ? `${COLORS.amarelo}40` : COLORS.border
                    }}
                  >
                    <div className="flex items-start gap-3">
                      <input
                        type="checkbox"
                        checked={useTestMode}
                        onChange={(e) => setUseTestMode(e.target.checked)}
                        className="mt-1"
                        style={{ accentColor: COLORS.amarelo }}
                      />
                      <div className="flex-1">
                        <label className="text-white text-sm cursor-pointer" style={{ fontWeight: 600 }}>
                          🧪 Modo de Teste (Simulação)
                        </label>
                        <p className="text-slate-400 text-xs mt-1">
                          {useTestMode ? (
                            <>
                              ⚠️ <strong style={{ color: COLORS.amarelo }}>ATIVO</strong>: Os envios serão simulados. Nenhuma requisição real será feita à API.
                            </>
                          ) : (
                            <>
                              Use se a API estiver bloqueada por CORS ou para testar o fluxo sem consumir a API real.
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Passo 2: Lista de Telefones */}
              <Card 
                className="p-6 border"
                style={{ 
                  backgroundColor: COLORS.cardBg,
                  borderColor: COLORS.border
                }}
              >
                <h3 className="text-white mb-4 text-sm flex items-center gap-2" style={{ fontWeight: 600 }}>
                  <List className="w-4 h-4" />
                  Passo 2: Lista de Telefones
                </h3>
                
                <div className="space-y-4">
                  {/* Importar contatos expirados */}
                  <div className="grid grid-cols-[1fr_auto_auto] gap-2">
                    <div>
                      <label className="text-slate-400 text-xs mb-1 block">
                        Período de vencimento
                      </label>
                      <select
                        value={expiredPeriod}
                        onChange={(e) => setExpiredPeriod(e.target.value)}
                        style={{
                          width: '100%',
                          backgroundColor: 'rgba(255,255,255,0.02)',
                          borderColor: COLORS.border,
                          border: '1px solid',
                          borderRadius: '6px',
                          color: 'white',
                          padding: '8px',
                          fontSize: '12px'
                        }}
                      >
                        <option value="7">Últimos 7 dias</option>
                        <option value="15">Últimos 15 dias</option>
                        <option value="30">Últimos 30 dias</option>
                        <option value="60">Últimos 60 dias</option>
                        <option value="90">Últimos 90 dias</option>
                        <option value="180">Últimos 6 meses</option>
                        <option value="365">Último ano</option>
                      </select>
                    </div>
                    <div className="self-end">
                      <Button
                        onClick={handleImportExpired}
                        disabled={!data}
                        size="sm"
                        style={{
                          backgroundColor: `${COLORS.roxo}`,
                          color: 'white',
                          fontSize: '11px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        <Upload className="w-3 h-3 mr-1" />
                        Importar Expirados
                      </Button>
                    </div>
                    <div className="self-end">
                      <Button
                        onClick={handleLoadExample}
                        size="sm"
                        variant="outline"
                        style={{
                          backgroundColor: 'transparent',
                          borderColor: COLORS.border,
                          color: COLORS.textoSecundario,
                          fontSize: '11px',
                          whiteSpace: 'nowrap'
                        }}
                      >
                        📝 Exemplo
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Textarea
                      placeholder="5511987654321&#10;5521987654321&#10;5531987654321&#10;..."
                      value={phonesList}
                      onChange={(e) => setPhonesList(e.target.value)}
                      rows={8}
                      style={{
                        backgroundColor: 'rgba(255,255,255,0.02)',
                        borderColor: COLORS.border,
                        color: 'white',
                        fontFamily: 'monospace',
                        fontSize: '13px'
                      }}
                    />
                    <p className="text-slate-500 text-xs mt-1">
                      💡 Formato aceito: 55 + DDD + número (ex: 5511987654321). Números sem "55" serão corrigidos automaticamente.
                    </p>
                  </div>

                  <Button
                    onClick={handleValidatePhones}
                    disabled={!phonesList.trim()}
                    style={{
                      backgroundColor: COLORS.azul,
                      color: 'white'
                    }}
                  >
                    <Check className="w-4 h-4 mr-2" />
                    Validar Números ({phonesList.split('\n').filter(l => l.trim()).length})
                  </Button>
                </div>
              </Card>

              {/* Passo 3: Resultados da Validação */}
              {validatedPhones.length > 0 && (
                <Card 
                  className="p-6 border"
                  style={{ 
                    backgroundColor: COLORS.cardBg,
                    borderColor: COLORS.border
                  }}
                >
                  <h3 className="text-white mb-4 text-sm flex items-center gap-2" style={{ fontWeight: 600 }}>
                    <AlertCircle className="w-4 h-4" />
                    Passo 3: Validação Concluída
                  </h3>

                  <div className="grid grid-cols-2 gap-4 mb-6">
                    <div 
                      className="p-4 rounded-lg border"
                      style={{ 
                        backgroundColor: `${COLORS.verde}10`,
                        borderColor: `${COLORS.verde}30`
                      }}
                    >
                      <p className="text-slate-400 text-xs mb-1">Números Válidos</p>
                      <p className="text-2xl" style={{ color: COLORS.verde, fontWeight: 700 }}>
                        {validatedPhones.filter(p => p.status === 'valid').length}
                      </p>
                    </div>
                    <div 
                      className="p-4 rounded-lg border"
                      style={{ 
                        backgroundColor: `${COLORS.vermelho}10`,
                        borderColor: `${COLORS.vermelho}30`
                      }}
                    >
                      <p className="text-slate-400 text-xs mb-1">Números Inválidos</p>
                      <p className="text-2xl" style={{ color: COLORS.vermelho, fontWeight: 700 }}>
                        {validatedPhones.filter(p => p.status === 'invalid').length}
                      </p>
                    </div>
                  </div>

                  <Separator className="my-4" style={{ backgroundColor: COLORS.border }} />

                  <div className="max-h-96 overflow-y-auto">
                    <div className="space-y-2">
                      {validatedPhones.map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-center gap-3 p-3 rounded-lg border transition-all"
                          style={{
                            backgroundColor: item.status === 'valid' ? `${COLORS.verde}05` : `${COLORS.vermelho}05`,
                            borderColor: item.status === 'valid' ? `${COLORS.verde}20` : `${COLORS.vermelho}20`
                          }}
                        >
                          {item.status === 'valid' ? (
                            <input
                              type="checkbox"
                              checked={selectedPhones.has(item.message)}
                              onChange={() => togglePhoneSelection(item.message)}
                              className="w-4 h-4 rounded"
                              style={{ accentColor: COLORS.ativo }}
                            />
                          ) : (
                            <X className="w-4 h-4 flex-shrink-0" style={{ color: COLORS.vermelho }} />
                          )}
                          <div className="flex-1">
                            <p className="text-white text-sm font-mono">{item.phone}</p>
                            {item.status === 'valid' && item.message !== item.phone && (
                              <p className="text-slate-500 text-xs">→ Formatado: {item.message}</p>
                            )}
                            {item.status === 'invalid' && (
                              <p className="text-xs" style={{ color: COLORS.vermelho }}>{item.message}</p>
                            )}
                          </div>
                          <Badge
                            variant="outline"
                            style={{
                              backgroundColor: item.status === 'valid' ? `${COLORS.verde}15` : `${COLORS.vermelho}15`,
                              borderColor: item.status === 'valid' ? `${COLORS.verde}40` : `${COLORS.vermelho}40`,
                              color: item.status === 'valid' ? COLORS.verde : COLORS.vermelho,
                              fontSize: '10px'
                            }}
                          >
                            {item.status === 'valid' ? '✓ Válido' : '✗ Inválido'}
                          </Badge>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="my-4" style={{ backgroundColor: COLORS.border }} />

                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-400 text-sm">
                        {selectedPhones.size} de {validatedPhones.filter(p => p.status === 'valid').length} selecionados
                      </p>
                    </div>
                    <Button
                      onClick={handleSendTags}
                      disabled={!apiKey || !tagName || selectedPhones.size === 0 || isSending}
                      style={{
                        backgroundColor: COLORS.ativo,
                        color: 'black'
                      }}
                    >
                      {isSending ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Enviando...
                        </>
                      ) : (
                        <>
                          <Send className="w-4 h-4 mr-2" />
                          Enviar TAG para {selectedPhones.size} contatos
                        </>
                      )}
                    </Button>
                  </div>
                </Card>
              )}

              {/* Progresso de Envio */}
              {isSending && (
                <Card 
                  className="p-6 border"
                  style={{ 
                    backgroundColor: COLORS.cardBg,
                    borderColor: `${COLORS.azul}40`
                  }}
                >
                  <h3 className="text-white mb-4 text-sm flex items-center gap-2" style={{ fontWeight: 600 }}>
                    <Loader2 className="w-4 h-4 animate-spin" style={{ color: COLORS.azul }} />
                    Processando...
                  </h3>

                  <div className="space-y-4">
                    {currentStep && (
                      <div 
                        className="p-3 rounded-lg text-xs"
                        style={{ 
                          backgroundColor: `${COLORS.azul}10`,
                          border: `1px solid ${COLORS.azul}30`
                        }}
                      >
                        <span className="text-white">{currentStep}</span>
                      </div>
                    )}

                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span className="text-slate-400">Progresso Geral</span>
                        <span className="text-white" style={{ fontWeight: 600 }}>
                          {Math.round(sendProgress)}%
                        </span>
                      </div>
                      <Progress value={sendProgress} style={{ backgroundColor: COLORS.border }} />
                    </div>

                    <div className="text-slate-400 text-xs space-y-1">
                      <p className="flex items-center gap-2">
                        <span 
                          className="w-2 h-2 rounded-full inline-block"
                          style={{ backgroundColor: COLORS.verde }}
                        />
                        <span>TAG: <span className="text-white" style={{ fontWeight: 600 }}>"{tagName}"</span> (ID: {foundTagId || 'N/A'})</span>
                      </p>
                      <p className="text-center mt-2" style={{ color: COLORS.textoSecundario }}>
                        ⏱️ Não feche esta página durante o processo
                      </p>
                    </div>
                  </div>
                </Card>
              )}

              {/* Resultados do Envio */}
              {sendResults && (
                <Card 
                  className="p-6 border"
                  style={{ 
                    backgroundColor: COLORS.cardBg,
                    borderColor: useTestMode ? `${COLORS.amarelo}40` : `${COLORS.ativo}40`
                  }}
                >
                  <h3 className="text-white mb-4 text-sm flex items-center gap-2" style={{ fontWeight: 600 }}>
                    <Check className="w-4 h-4" style={{ color: useTestMode ? COLORS.amarelo : COLORS.ativo }} />
                    {useTestMode ? '🧪 Simulação Concluída' : '✅ Envio Concluído'}
                  </h3>

                  {useTestMode && (
                    <div 
                      className="mb-4 p-3 rounded-lg border text-xs"
                      style={{ 
                        backgroundColor: `${COLORS.amarelo}10`,
                        borderColor: `${COLORS.amarelo}40`,
                        color: COLORS.amarelo
                      }}
                    >
                      <strong>⚠️ MODO DE TESTE ATIVO:</strong> Nenhuma requisição real foi feita à API. Os resultados abaixo são simulados.
                    </div>
                  )}

                  <div className="grid grid-cols-3 gap-4">
                    <div className="text-center p-4 rounded-lg" style={{ backgroundColor: `${COLORS.azul}10` }}>
                      <p className="text-slate-400 text-xs mb-1">Total {useTestMode ? 'Simulado' : 'Enviado'}</p>
                      <p className="text-2xl" style={{ color: COLORS.azul, fontWeight: 700 }}>
                        {sendResults.total}
                      </p>
                    </div>
                    <div className="text-center p-4 rounded-lg" style={{ backgroundColor: `${COLORS.verde}10` }}>
                      <p className="text-slate-400 text-xs mb-1">Sucesso</p>
                      <p className="text-2xl" style={{ color: COLORS.verde, fontWeight: 700 }}>
                        {sendResults.success}
                      </p>
                    </div>
                    <div className="text-center p-4 rounded-lg" style={{ backgroundColor: `${COLORS.vermelho}10` }}>
                      <p className="text-slate-400 text-xs mb-1">Falhas</p>
                      <p className="text-2xl" style={{ color: COLORS.vermelho, fontWeight: 700 }}>
                        {sendResults.failed}
                      </p>
                    </div>
                  </div>

                  <Separator className="my-4" style={{ backgroundColor: COLORS.border }} />

                  <div className="text-center">
                    {useTestMode ? (
                      <>
                        <p className="text-slate-300 text-sm mb-2">
                          🧪 Simulação bem-sucedida! TAG <span style={{ color: COLORS.amarelo, fontWeight: 600 }}>"{tagName}"</span> seria aplicada aos contatos.
                        </p>
                        <p className="text-slate-500 text-xs">
                          Desative o "Modo de Teste" e resolva os problemas de CORS para fazer envios reais.
                        </p>
                      </>
                    ) : (
                      <>
                        <p className="text-slate-300 text-sm mb-2">
                          🎉 Clientes adicionados à audiência <span style={{ color: COLORS.ativo, fontWeight: 600 }}>"{tagName}"</span> com sucesso!
                        </p>
                        <p className="text-slate-500 text-xs">
                          Agora você pode criar campanhas direcionadas no BotConversa usando esta TAG
                        </p>
                      </>
                    )}
                  </div>

                  {!useTestMode && sendResults.failed > 0 && (
                    <div 
                      className="mt-4 p-3 rounded-lg border text-xs"
                      style={{ 
                        backgroundColor: `${COLORS.vermelho}10`,
                        borderColor: `${COLORS.vermelho}40`
                      }}
                    >
                      <p style={{ color: COLORS.vermelho }}>
                        ⚠️ <strong>{sendResults.failed} envio(s) falharam.</strong> Verifique o Console (F12) para detalhes dos erros.
                      </p>
                    </div>
                  )}
                </Card>
              )}
            </div>
          )}

          {/* Seção: Análise por Status */}
          {activeSection === 'analise' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-white flex items-center gap-2">
                  <TrendingUp className="w-5 h-5" style={{ color: COLORS.ativo }} />
                  <span>Análise por Status</span>
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  💡 Estatísticas detalhadas em desenvolvimento
                </p>
              </div>

              <Card 
                className="p-12 border text-center"
                style={{ 
                  backgroundColor: COLORS.cardBg,
                  borderColor: COLORS.border
                }}
              >
                <TrendingUp className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-slate-400">Em breve: gráficos e análises avançadas</p>
              </Card>
            </div>
          )}

          {/* Seção: Localização */}
          {activeSection === 'localizacao' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-white flex items-center gap-2">
                  <MapPin className="w-5 h-5" style={{ color: COLORS.ativo }} />
                  <span>Distribuição Geográfica</span>
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  💡 Mapa de clientes por região em desenvolvimento
                </p>
              </div>

              <Card 
                className="p-12 border text-center"
                style={{ 
                  backgroundColor: COLORS.cardBg,
                  borderColor: COLORS.border
                }}
              >
                <MapPin className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-slate-400">Em breve: visualização por estado e DDD</p>
              </Card>
            </div>
          )}

          {/* Seção: Histórico */}
          {activeSection === 'historico' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-white flex items-center gap-2">
                  <Clock className="w-5 h-5" style={{ color: COLORS.ativo }} />
                  <span>Histórico de Clientes</span>
                </h2>
                <p className="text-slate-500 text-sm mt-1">
                  💡 Evolução temporal em desenvolvimento
                </p>
              </div>

              <Card 
                className="p-12 border text-center"
                style={{ 
                  backgroundColor: COLORS.cardBg,
                  borderColor: COLORS.border
                }}
              >
                <Clock className="w-16 h-16 mx-auto mb-4 opacity-20" />
                <p className="text-slate-400">Em breve: linha do tempo de ativações e cancelamentos</p>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
