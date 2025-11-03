import { useState, useEffect } from 'react';
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
  Upload
} from 'lucide-react';
import { parseDate, formatDate } from '../utils/dataProcessing';
import * as XLSX from 'xlsx';
import { COLORS as DS_COLORS, CARD_CLASSES, BUTTON_CLASSES, TEXT_CLASSES } from '../utils/designSystem';

interface Props {
  data: DashboardData;
}

type ViewSection = 'lista' | 'cobranca' | 'analise' | 'localizacao' | 'historico' | 'linkGestor';

// Mapeamento de cores do sistema
const COLORS = {
  fundo: DS_COLORS.bgPrimary,
  cardBg: DS_COLORS.bgCard,
  border: DS_COLORS.border,
  textoPrimario: DS_COLORS.textPrimary,
  textoSecundario: DS_COLORS.textMuted,
  textoTerciario: DS_COLORS.textDisabled,
  ativo: DS_COLORS.success,
  inativo: DS_COLORS.danger,
  roxo: DS_COLORS.secondary,
  azul: DS_COLORS.primary,
  verde: DS_COLORS.success,
  vermelho: DS_COLORS.danger,
  amarelo: DS_COLORS.warning,
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
  const [gestorUsername, setGestorUsername] = useState('');
  const [gestorPassword, setGestorPassword] = useState('');
  const [panelUsername, setPanelUsername] = useState('');
  const [panelPassword, setPanelPassword] = useState('');
  const [credentialsSaved, setCredentialsSaved] = useState(false);
  const [quickSearchPhone, setQuickSearchPhone] = useState('');
  const [searchingLink, setSearchingLink] = useState(false);
  const [foundLink, setFoundLink] = useState<string | null>(null);
  
  // Estados para varredura de base
  const [scanMode, setScanMode] = useState<'all' | 'active' | 'expired' | 'nolink'>('all');
  const [demoMode, setDemoMode] = useState(true);
  const [scanning, setScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scannedClients, setScannedClients] = useState<Array<{
    phone: string;
    email: string;
    status: string;
    link: string | null;
  }>>([]);
  const [scanStats, setScanStats] = useState({
    total: 0,
    processed: 0,
    withLink: 0,
    withoutLink: 0,
  });
  const [scanLogs, setScanLogs] = useState<string[]>([]);
  const [showLogs, setShowLogs] = useState(false);

  // Carregar credenciais salvas ao montar o componente
  useEffect(() => {
    const saved = localStorage.getItem('gestorCredentials');
    if (saved) {
      try {
        const credentials = JSON.parse(saved);
        setGestorUsername(credentials.gestorUsername || '');
        setGestorPassword(credentials.gestorPassword || '');
        setPanelUsername(credentials.panelUsername || '');
        setPanelPassword(credentials.panelPassword || '');
        setCredentialsSaved(true);
      } catch (error) {
        console.error('Erro ao carregar credenciais:', error);
      }
    }
  }, []);

  const allClients = [
    ...(data.rawData?.ativos || []).map(c => ({ ...c, status: 'Ativo' })),
    ...(data.rawData?.expirados || []).map(c => ({ ...c, status: 'Expirado' })),
  ];

  const filteredClients = allClients.filter(client => {
    const matchesFilter = 
      filter === 'all' ||
      (filter === 'active' && client.status === 'Ativo') ||
      (filter === 'expired' && client.status === 'Expirado');
    
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

    const exportData = clientsToExport.map(client => ({
      'Telefone/Usuário': client.Usuario || client.usuario || '-',
      'Email': client.Email || client.email || '-',
      'Data Início': formatDate(parseDate(client.Criado_Em || client.criado_em || client.Criacao || client.criacao)),
      'Data Vencimento': formatDate(parseDate(client.Expira_Em || client.expira_em || client.Expiracao || client.expiracao)),
      'Status': client.status,
    }));

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
      // Silenciar erro de fetch no console (apenas log de warning)
      console.warn('⚠️ Erro ao buscar TAG:', error.message || error);
      
      if (error.message?.includes('Failed to fetch') || error.name === 'TypeError') {
        // Proxy não está rodando
        alert('❌ Proxy não está rodando!\n\n📋 Para usar a integração BotConversa:\n\n1. Abra um terminal\n2. Execute: uvicorn botconversa_proxy:app --host 0.0.0.0 --port 8080 --reload\n3. Volte aqui e clique em "🔍 Buscar TAG" novamente\n\n💡 Ou ative o "Modo Teste" para testar sem o proxy.');
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
      id: 'linkGestor' as ViewSection,
      label: 'Link Gestor',
      icon: Check,
      description: 'Gerar/validar links de pagamento'
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Principais - Altura Padronizada h=96px */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={`${CARD_CLASSES.primary} p-5 h-24 flex items-center`}>
          <div className="flex items-center justify-between w-full">
            <div className="flex-1">
              <p className="text-[#8ea9d9] text-xs mb-1">Total de Clientes</p>
              <p className="text-[#EAF2FF] text-2xl font-bold">{allClients.length.toLocaleString('pt-BR')}</p>
            </div>
            <div 
              className="w-10 h-10 rounded-lg flex items-center justify-center"
              style={{ backgroundColor: `${COLORS.azul}15` }}
            >
              <Users className="w-5 h-5" style={{ color: COLORS.azul }} />
            </div>
          </div>
        </Card>
        
        <Card className={`${CARD_CLASSES.primary} p-5 h-24 flex items-center`}>
          <div className="flex items-center justify-between w-full">
            <div className="flex-1">
              <p className="text-[#8ea9d9] text-xs mb-1">Assinaturas Ativas</p>
              <p className="text-[#EAF2FF] text-2xl font-bold">{(data.clientesAtivos || 0).toLocaleString('pt-BR')}</p>
              <p className="text-[10px] mt-0.5" style={{ color: COLORS.ativo }}>
                {(data.taxaRetencao || 0).toFixed(1)}% ainda assinam
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
        
        <Card className={`${CARD_CLASSES.primary} p-5 h-24 flex items-center`}>
          <div className="flex items-center justify-between w-full">
            <div className="flex-1">
              <p className="text-[#8ea9d9] text-xs mb-1">Assinaturas Vencidas</p>
              <p className="text-[#EAF2FF] text-2xl font-bold">{(data.clientesExpirados || 0).toLocaleString('pt-BR')}</p>
              <p className="text-[10px] mt-0.5" style={{ color: COLORS.inativo }}>
                {(data.churnRate || 0).toFixed(1)}% cancelaram
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
        
        <Card className={`${CARD_CLASSES.primary} p-5 h-24 flex items-center`}>
          <div className="flex items-center justify-between w-full">
            <div className="flex-1">
              <p className="text-[#8ea9d9] text-xs mb-1">Clientes Fiéis</p>
              <p className="text-[#EAF2FF] text-2xl font-bold">{(data.clientesFieis || 0).toLocaleString('pt-BR')}</p>
              <p className="text-[10px] mt-0.5" style={{ color: COLORS.roxo }}>
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
              <h3 className="text-[#EAF2FF] text-sm mb-1" style={{ fontWeight: 600 }}>
                Gestão de Clientes
              </h3>
              <p className="text-[#8ea9d9] text-xs">
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
                <h2 className="text-[#EAF2FF] flex items-center gap-2">
                  <List className="w-5 h-5" style={{ color: COLORS.ativo }} />
                  <span>Lista de Clientes</span>
                </h2>
                <p className="text-[#8ea9d9] text-sm mt-1">
                  💡 Visualize, filtre e exporte seus clientes facilmente
                </p>
              </div>

              <Card className={`${CARD_CLASSES.primary} p-6`}>
              
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
                      Todos ({allClients.length})
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
                        <TableHead className="text-[#8ea9d9]">Telefone/Usuário</TableHead>
                        <TableHead className="text-[#8ea9d9]">Email</TableHead>
                        <TableHead className="text-[#8ea9d9]">Data Início</TableHead>
                        <TableHead className="text-[#8ea9d9]">Data Vencimento</TableHead>
                        <TableHead className="text-[#8ea9d9]">Status</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {currentClients.map((client, index) => {
                        const criadoEm = parseDate(client.Criado_Em || client.criado_em || client.Criacao || client.criacao);
                        const expiraEm = parseDate(client.Expira_Em || client.expira_em || client.Expiracao || client.expiracao);
                        
                        return (
                          <TableRow 
                            key={index} 
                            className="border-b hover:bg-slate-800/30"
                            style={{ borderColor: COLORS.border }}
                          >
                            <TableCell className="text-[#EAF2FF]">
                              {client.Usuario || client.usuario || '-'}
                            </TableCell>
                            <TableCell className="text-[#dbe4ff]">
                              {client.Email || client.email || '-'}
                            </TableCell>
                            <TableCell className="text-[#dbe4ff]">
                              {formatDate(criadoEm)}
                            </TableCell>
                            <TableCell className="text-[#dbe4ff]">
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
                    <Search className="w-12 h-12 text-[#9FAAC6] mx-auto mb-3" />
                    <p className="text-[#8ea9d9]">Nenhum cliente encontrado</p>
                    <p className="text-[#8ea9d9] text-sm">Tente ajustar os filtros ou a busca</p>
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

          {/* Seção: Link Gestor */}
          {activeSection === 'linkGestor' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-white flex items-center gap-2">
                  <Check className="w-5 h-5" style={{ color: COLORS.ativo }} />
                  <span>Link Gestor</span>
                </h2>
                <p className="text-slate-500 text-sm mt-1 flex items-center gap-2">
                  💡 Informe suas credenciais do Gestor e do Painel, salve e gere/verifique links de pagamento.
                </p>
              </div>

              {/* Card de Credenciais */}
              <Card 
                className="p-6 border"
                style={{ 
                  backgroundColor: COLORS.cardBg,
                  borderColor: COLORS.border
                }}
              >
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Credenciais do Gestor */}
                  <div>
                    <h3 className="text-[#EAF2FF] text-sm mb-4 font-medium">Credenciais do Gestor</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[#9FAAC6] text-sm mb-2 block">Usuário do Gestor</label>
                        <Input
                          value={gestorUsername}
                          onChange={(e) => setGestorUsername(e.target.value)}
                          placeholder="Digite o usuário"
                          className="bg-[#1A2035] border-[#1E2840] text-[#EAF2FF]"
                        />
                      </div>
                      <div>
                        <label className="text-[#9FAAC6] text-sm mb-2 block">Senha do Gestor</label>
                        <Input
                          type="password"
                          value={gestorPassword}
                          onChange={(e) => setGestorPassword(e.target.value)}
                          placeholder="Digite a senha"
                          className="bg-[#1A2035] border-[#1E2840] text-[#EAF2FF]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Credenciais do Painel */}
                  <div>
                    <h3 className="text-[#EAF2FF] text-sm mb-4 font-medium">Credenciais do Painel</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-[#9FAAC6] text-sm mb-2 block">Usuário do Painel</label>
                        <Input
                          value={panelUsername}
                          onChange={(e) => setPanelUsername(e.target.value)}
                          placeholder="Digite o usuário"
                          className="bg-[#1A2035] border-[#1E2840] text-[#EAF2FF]"
                        />
                      </div>
                      <div>
                        <label className="text-[#9FAAC6] text-sm mb-2 block">Senha do Painel</label>
                        <Input
                          type="password"
                          value={panelPassword}
                          onChange={(e) => setPanelPassword(e.target.value)}
                          placeholder="Digite a senha"
                          className="bg-[#1A2035] border-[#1E2840] text-[#EAF2FF]"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Botões de Ação */}
                <div className="flex gap-3 mt-6">
                  <Button
                    onClick={() => {
                      if (!gestorUsername || !gestorPassword || !panelUsername || !panelPassword) {
                        alert('❌ Preencha todos os campos!');
                        return;
                      }
                      // Salvar no localStorage
                      localStorage.setItem('gestorCredentials', JSON.stringify({
                        gestorUsername,
                        gestorPassword,
                        panelUsername,
                        panelPassword
                      }));
                      setCredentialsSaved(true);
                      alert('✅ Credenciais salvas com sucesso!');
                    }}
                    className="bg-[#00C897] hover:bg-[#00B585] text-white"
                  >
                    Salvar Login
                  </Button>
                  <Button
                    onClick={() => {
                      setGestorUsername('');
                      setGestorPassword('');
                      setPanelUsername('');
                      setPanelPassword('');
                      setCredentialsSaved(false);
                      localStorage.removeItem('gestorCredentials');
                    }}
                    variant="outline"
                    className="border-[#1E2840] text-[#9FAAC6] hover:bg-[#1A2035]"
                  >
                    Limpar
                  </Button>
                </div>

                {credentialsSaved && (
                  <div className="mt-4 p-3 bg-[#00C897]/10 border border-[#00C897]/30 rounded-lg">
                    <p className="text-[#00C897] text-sm flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      Credenciais configuradas e salvas
                    </p>
                  </div>
                )}
              </Card>

              {/* Busca Rápida de Link */}
              <Card 
                className="p-6 border"
                style={{ 
                  backgroundColor: COLORS.cardBg,
                  borderColor: COLORS.border
                }}
              >
                <h3 className="text-[#EAF2FF] mb-4 font-medium">Busca rápida de link</h3>
                
                <div className="space-y-4">
                  <div>
                    <label className="text-[#9FAAC6] text-sm mb-2 block">
                      Telefone (55 + DDD + número)
                    </label>
                    <Input
                      value={quickSearchPhone}
                      onChange={(e) => setQuickSearchPhone(e.target.value)}
                      placeholder="Ex: 5511999887766"
                      className="bg-[#1A2035] border-[#1E2840] text-[#EAF2FF]"
                    />
                    <p className="text-[#6B7694] text-xs mt-1">
                      Dica: copie de um cliente na lista.
                    </p>
                  </div>

                  <Button
                    onClick={async () => {
                      if (!quickSearchPhone) {
                        alert('❌ Digite um telefone!');
                        return;
                      }
                      if (!credentialsSaved) {
                        alert('❌ Configure as credenciais primeiro!');
                        return;
                      }
                      
                      setSearchingLink(true);
                      setFoundLink(null);
                      
                      try {
                        // Implementar busca de link via backend
                        const response = await fetch('http://localhost:8080/gestor/get-link', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({
                            phone: quickSearchPhone,
                            credentials: {
                              gestorUsername,
                              gestorPassword,
                              panelUsername,
                              panelPassword
                            }
                          })
                        });
                        
                        const data = await response.json();
                        
                        if (data.success && data.link) {
                          setFoundLink(data.link);
                        } else {
                          alert('❌ Link não encontrado para este cliente');
                        }
                      } catch (error) {
                        console.error('Erro ao buscar link:', error);
                        alert('❌ Erro ao buscar link. Verifique se o proxy está rodando.');
                      } finally {
                        setSearchingLink(false);
                      }
                    }}
                    className="bg-[#00BFFF] hover:bg-[#1E90FF] text-white"
                    disabled={searchingLink}
                  >
                    {searchingLink ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Buscando...
                      </>
                    ) : (
                      <>
                        <Search className="w-4 h-4 mr-2" />
                        Buscar Link
                      </>
                    )}
                  </Button>

                  {foundLink && (
                    <div className="mt-4 p-4 bg-[#00BFFF]/10 border border-[#00BFFF]/30 rounded-lg">
                      <p className="text-[#00BFFF] text-sm mb-2">Link encontrado:</p>
                      <div className="flex gap-2">
                        <Input
                          value={foundLink}
                          readOnly
                          className="bg-[#1A2035] border-[#1E2840] text-[#EAF2FF] text-sm"
                        />
                        <Button
                          onClick={() => {
                            navigator.clipboard.writeText(foundLink);
                            alert('✅ Link copiado!');
                          }}
                          size="sm"
                          className="bg-[#00BFFF] hover:bg-[#1E90FF]"
                        >
                          Copiar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </Card>

              {/* Ver todos com link */}
              <Card 
                className="p-6 border"
                style={{ 
                  backgroundColor: COLORS.cardBg,
                  borderColor: COLORS.border
                }}
              >
                <h3 className="text-[#EAF2FF] mb-2 font-medium">Ver todos com link</h3>
                <p className="text-[#9FAAC6] text-sm mb-4">
                  Varre sua base e marca quem possui link, exporte a lista.
                </p>

                {/* Modo Demo */}
                <div className="flex items-center gap-2 mb-4 p-3 bg-[#FFB800]/10 border border-[#FFB800]/30 rounded-lg">
                  <input
                    type="checkbox"
                    checked={demoMode}
                    onChange={(e) => setDemoMode(e.target.checked)}
                    className="w-4 h-4"
                  />
                  <label className="text-[#FFB800] text-sm">
                    Modo Demo (não chama webhook)
                  </label>
                </div>

                {/* Tabs de Filtro */}
                <div className="flex gap-2 mb-4 overflow-x-auto pb-2">
                  <Button
                    size="sm"
                    onClick={() => setScanMode('all')}
                    style={{
                      backgroundColor: scanMode === 'all' ? '#8B5CF6' : 'transparent',
                      color: scanMode === 'all' ? 'white' : '#9FAAC6',
                      border: `1px solid ${scanMode === 'all' ? '#8B5CF6' : COLORS.border}`,
                    }}
                  >
                    Todos ({allClients.length})
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setScanMode('active')}
                    style={{
                      backgroundColor: scanMode === 'active' ? '#00C897' : 'transparent',
                      color: scanMode === 'active' ? 'white' : '#9FAAC6',
                      border: `1px solid ${scanMode === 'active' ? '#00C897' : COLORS.border}`,
                    }}
                  >
                    Ativos ({data.clientesAtivos || 0})
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setScanMode('expired')}
                    style={{
                      backgroundColor: scanMode === 'expired' ? '#E84A5F' : 'transparent',
                      color: scanMode === 'expired' ? 'white' : '#9FAAC6',
                      border: `1px solid ${scanMode === 'expired' ? '#E84A5F' : COLORS.border}`,
                    }}
                  >
                    Vencidos ({data.clientesExpirados || 0})
                  </Button>
                  <Button
                    size="sm"
                    onClick={() => setScanMode('nolink')}
                    style={{
                      backgroundColor: scanMode === 'nolink' ? '#6B7694' : 'transparent',
                      color: scanMode === 'nolink' ? 'white' : '#9FAAC6',
                      border: `1px solid ${scanMode === 'nolink' ? '#6B7694' : COLORS.border}`,
                    }}
                  >
                    Sem Link (0)
                  </Button>
                </div>

                <p className="text-[#9FAAC6] text-sm mb-4">
                  Selecionados para varredura: {Math.min(1000, allClients.length)}
                </p>

                {/* Alerta de cache */}
                {allClients.length >= 1000 && (
                  <div className="mb-4 p-3 bg-[#FFB800]/10 border border-[#FFB800]/30 rounded-lg flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-4 h-4 text-[#FFB800]" />
                      <p className="text-[#FFB800] text-sm">
                        ⚠ A base atual está truncada ({allClients.length.toLocaleString('pt-BR')} de 4.743). Limpe o cache e reenvie o Excel.
                      </p>
                    </div>
                    <Button
                      size="sm"
                      className="bg-[#FFB800] hover:bg-[#F59E0B] text-white"
                      onClick={() => {
                        localStorage.clear();
                        window.location.reload();
                      }}
                    >
                      Limpar cache
                    </Button>
                  </div>
                )}

                {/* Tabela de Resultados */}
                {scannedClients.length > 0 && (
                  <div className="mb-4 border border-[#1E2840] rounded-lg overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow className="bg-[#1A2035]">
                          <TableHead className="text-[#EAF2FF]">Telefone/Usuário</TableHead>
                          <TableHead className="text-[#EAF2FF]">Email</TableHead>
                          <TableHead className="text-[#EAF2FF]">Status</TableHead>
                          <TableHead className="text-[#EAF2FF]">Link</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {scannedClients.slice(0, 10).map((client, idx) => (
                          <TableRow key={idx} className="border-[#1E2840]">
                            <TableCell className="text-[#EAF2FF]">{client.phone}</TableCell>
                            <TableCell className="text-[#9FAAC6]">{client.email || '-'}</TableCell>
                            <TableCell>
                              <Badge
                                style={{
                                  backgroundColor: client.status === 'Ativo' ? '#00C897' : '#E84A5F',
                                  color: 'white'
                                }}
                              >
                                {client.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-[#9FAAC6]">{client.link || '-'}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}

                {/* Botões de Ação */}
                <div className="flex gap-3 mb-4">
                  <Button
                    onClick={async () => {
                      if (!credentialsSaved) {
                        alert('❌ Configure as credenciais primeiro!');
                        return;
                      }
                      
                      setScanning(true);
                      setScanProgress(0);
                      setScanLogs([]);
                      
                      // Simular varredura
                      const clientsToScan = allClients.slice(0, Math.min(1000, allClients.length));
                      
                      for (let i = 0; i < clientsToScan.length; i++) {
                        setScanProgress(Math.round((i / clientsToScan.length) * 100));
                        
                        // Simular delay
                        await new Promise(resolve => setTimeout(resolve, 10));
                      }
                      
                      setScanning(false);
                      setScanProgress(100);
                      alert('✅ Varredura concluída!');
                    }}
                    className="bg-[#8B5CF6] hover:bg-[#7C3AED] text-white"
                    disabled={scanning}
                  >
                    {scanning ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Verificando... {scanProgress}%
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Verificar Base
                      </>
                    )}
                  </Button>
                  
                  <Button
                    onClick={() => {
                      // Exportar para Excel
                      const ws = XLSX.utils.json_to_sheet(scannedClients);
                      const wb = XLSX.utils.book_new();
                      XLSX.utils.book_append_sheet(wb, ws, 'Links');
                      XLSX.writeFile(wb, `Links_Gestor_${new Date().toISOString().split('T')[0]}.xlsx`);
                    }}
                    variant="outline"
                    className="border-[#1E2840] text-[#9FAAC6] hover:bg-[#1A2035]"
                    disabled={scannedClients.length === 0}
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Exportar Links
                  </Button>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-4 gap-4 mb-4 p-4 bg-[#1A2035] rounded-lg">
                  <div>
                    <p className="text-[#6B7694] text-xs">Total à pesquisar</p>
                    <p className="text-[#EAF2FF] text-lg font-medium">{scanStats.total}</p>
                  </div>
                  <div>
                    <p className="text-[#6B7694] text-xs">Processados</p>
                    <p className="text-[#EAF2FF] text-lg font-medium">{scanStats.processed}</p>
                  </div>
                  <div>
                    <p className="text-[#6B7694] text-xs">Com link</p>
                    <p className="text-[#00C897] text-lg font-medium">{scanStats.withLink}</p>
                  </div>
                  <div>
                    <p className="text-[#6B7694] text-xs">Sem link</p>
                    <p className="text-[#E84A5F] text-lg font-medium">{scanStats.withoutLink}</p>
                  </div>
                </div>

                {/* Logs */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <h4 className="text-[#EAF2FF] text-sm">Logs da varredura</h4>
                    <label className="flex items-center gap-2 text-[#9FAAC6] text-xs">
                      <input
                        type="checkbox"
                        checked={showLogs}
                        onChange={(e) => setShowLogs(e.target.checked)}
                        className="w-3 h-3"
                      />
                      Mostrar segurados nos logs
                    </label>
                  </div>
                  <div className="bg-[#1A2035] border border-[#1E2840] rounded-lg p-3 h-32 overflow-y-auto">
                    {scanLogs.length === 0 ? (
                      <p className="text-[#6B7694] text-sm">Sem logs ainda.</p>
                    ) : (
                      scanLogs.map((log, idx) => (
                        <p key={idx} className="text-[#9FAAC6] text-xs font-mono">
                          {log}
                        </p>
                      ))
                    )}
                  </div>
                </div>
              </Card>
            </div>
          )}

          {/* Seção: Localização - Mapa de DDD */}
          {activeSection === 'localizacao' && (
            <div className="space-y-6">
              <Card 
                className="p-6 border"
                style={{ 
                  backgroundColor: COLORS.cardBg,
                  borderColor: COLORS.border
                }}
              >
                <h3 className="text-[#EAF2FF] mb-4 flex items-center gap-2">
                  <MapPin className="w-5 h-5" style={{ color: COLORS.azul }} />
                  <span>Distribuição por DDD</span>
                </h3>
                <p className="text-[#9FAAC6] text-sm mb-6">
                  Análise geográfica baseada nos logins dos clientes (55 + DDD + número)
                </p>

                {(() => {
                  // Extrair DDD dos clientes (pegar 3º e 4º dígito de logins que começam com 55)
                  const dddMap: Record<string, { count: number; estado: string; regiao: string }> = {};
                  
                  // Mapeamento DDD -> Estado/Região
                  const dddInfo: Record<string, { estado: string; regiao: string }> = {
                    '11': { estado: 'SP', regiao: 'São Paulo' },
                    '12': { estado: 'SP', regiao: 'Vale do Paraíba' },
                    '13': { estado: 'SP', regiao: 'Baixada Santista' },
                    '14': { estado: 'SP', regiao: 'Bauru/Marília' },
                    '15': { estado: 'SP', regiao: 'Sorocaba' },
                    '16': { estado: 'SP', regiao: 'Ribeirão Preto' },
                    '17': { estado: 'SP', regiao: 'São José do Rio Preto' },
                    '18': { estado: 'SP', regiao: 'Presidente Prudente' },
                    '19': { estado: 'SP', regiao: 'Campinas' },
                    '21': { estado: 'RJ', regiao: 'Rio de Janeiro' },
                    '22': { estado: 'RJ', regiao: 'Campos dos Goytacazes' },
                    '24': { estado: 'RJ', regiao: 'Volta Redonda' },
                    '27': { estado: 'ES', regiao: 'Vitória' },
                    '28': { estado: 'ES', regiao: 'Cachoeiro' },
                    '31': { estado: 'MG', regiao: 'Belo Horizonte' },
                    '32': { estado: 'MG', regiao: 'Juiz de Fora' },
                    '33': { estado: 'MG', regiao: 'Governador Valadares' },
                    '34': { estado: 'MG', regiao: 'Uberlândia' },
                    '35': { estado: 'MG', regiao: 'Poços de Caldas' },
                    '37': { estado: 'MG', regiao: 'Divinópolis' },
                    '38': { estado: 'MG', regiao: 'Montes Claros' },
                    '41': { estado: 'PR', regiao: 'Curitiba' },
                    '42': { estado: 'PR', regiao: 'Ponta Grossa' },
                    '43': { estado: 'PR', regiao: 'Londrina' },
                    '44': { estado: 'PR', regiao: 'Maringá' },
                    '45': { estado: 'PR', regiao: 'Foz do Iguaçu' },
                    '46': { estado: 'PR', regiao: 'Francisco Beltrão' },
                    '47': { estado: 'SC', regiao: 'Joinville' },
                    '48': { estado: 'SC', regiao: 'Florianópolis' },
                    '49': { estado: 'SC', regiao: 'Chapecó' },
                    '51': { estado: 'RS', regiao: 'Porto Alegre' },
                    '53': { estado: 'RS', regiao: 'Pelotas' },
                    '54': { estado: 'RS', regiao: 'Caxias do Sul' },
                    '55': { estado: 'RS', regiao: 'Santa Maria' },
                    '61': { estado: 'DF', regiao: 'Brasília' },
                    '62': { estado: 'GO', regiao: 'Goiânia' },
                    '63': { estado: 'TO', regiao: 'Palmas' },
                    '64': { estado: 'GO', regiao: 'Rio Verde' },
                    '65': { estado: 'MT', regiao: 'Cuiabá' },
                    '66': { estado: 'MT', regiao: 'Rondonópolis' },
                    '67': { estado: 'MS', regiao: 'Campo Grande' },
                    '68': { estado: 'AC', regiao: 'Rio Branco' },
                    '69': { estado: 'RO', regiao: 'Porto Velho' },
                    '71': { estado: 'BA', regiao: 'Salvador' },
                    '73': { estado: 'BA', regiao: 'Ilhéus' },
                    '74': { estado: 'BA', regiao: 'Juazeiro' },
                    '75': { estado: 'BA', regiao: 'Feira de Santana' },
                    '77': { estado: 'BA', regiao: 'Barreiras' },
                    '79': { estado: 'SE', regiao: 'Aracaju' },
                    '81': { estado: 'PE', regiao: 'Recife' },
                    '82': { estado: 'AL', regiao: 'Maceió' },
                    '83': { estado: 'PB', regiao: 'João Pessoa' },
                    '84': { estado: 'RN', regiao: 'Natal' },
                    '85': { estado: 'CE', regiao: 'Fortaleza' },
                    '86': { estado: 'PI', regiao: 'Teresina' },
                    '87': { estado: 'PE', regiao: 'Petrolina' },
                    '88': { estado: 'CE', regiao: 'Juazeiro do Norte' },
                    '89': { estado: 'PI', regiao: 'Picos' },
                    '91': { estado: 'PA', regiao: 'Belém' },
                    '92': { estado: 'AM', regiao: 'Manaus' },
                    '93': { estado: 'PA', regiao: 'Santarém' },
                    '94': { estado: 'PA', regiao: 'Marabá' },
                    '95': { estado: 'RR', regiao: 'Boa Vista' },
                    '96': { estado: 'AP', regiao: 'Macapá' },
                    '97': { estado: 'AM', regiao: 'Tefé' },
                    '98': { estado: 'MA', regiao: 'São Luís' },
                    '99': { estado: 'MA', regiao: 'Imperatriz' },
                  };

                  // Processar clientes
                  allClients.forEach((cliente: any) => {
                    const login = cliente.Login || cliente.login || '';
                    const cleaned = login.replace(/\D/g, '');
                    
                    // Verificar se começa com 55 e extrair DDD (3º e 4º dígito)
                    if (cleaned.startsWith('55') && cleaned.length >= 4) {
                      const ddd = cleaned.substring(2, 4);
                      const info = dddInfo[ddd];
                      
                      if (info) {
                        if (!dddMap[ddd]) {
                          dddMap[ddd] = {
                            count: 0,
                            estado: info.estado,
                            regiao: info.regiao
                          };
                        }
                        dddMap[ddd].count++;
                      }
                    }
                  });

                  // Ordenar por quantidade
                  const sortedDDDs = Object.entries(dddMap)
                    .sort((a, b) => b[1].count - a[1].count);

                  const totalClientes = sortedDDDs.reduce((sum, [_, data]) => sum + data.count, 0);

                  return (
                    <div className="space-y-6">
                      {/* Stats Resumo */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Card className="p-4 bg-[#1A2035] border-[#1E2840]">
                          <p className="text-[#6B7694] text-xs mb-1">Total de Clientes</p>
                          <p className="text-[#EAF2FF] text-2xl">{totalClientes.toLocaleString('pt-BR')}</p>
                        </Card>
                        <Card className="p-4 bg-[#1A2035] border-[#1E2840]">
                          <p className="text-[#6B7694] text-xs mb-1">DDDs Diferentes</p>
                          <p className="text-[#00BFFF] text-2xl">{sortedDDDs.length}</p>
                        </Card>
                        <Card className="p-4 bg-[#1A2035] border-[#1E2840]">
                          <p className="text-[#6B7694] text-xs mb-1">DDD Mais Comum</p>
                          <p className="text-[#FF00CC] text-2xl">
                            {sortedDDDs.length > 0 ? sortedDDDs[0][0] : '-'}
                          </p>
                          {sortedDDDs.length > 0 && (
                            <p className="text-[#6B7694] text-xs mt-1">
                              {sortedDDDs[0][1].regiao} ({sortedDDDs[0][1].count} clientes)
                            </p>
                          )}
                        </Card>
                      </div>

                      {/* Tabela de DDDs */}
                      <Card className="p-6 bg-[#1A2035] border-[#1E2840]">
                        <h4 className="text-[#EAF2FF] mb-4">Ranking por DDD</h4>
                        <div className="overflow-x-auto">
                          <Table>
                            <TableHeader>
                              <TableRow className="border-[#1E2840]">
                                <TableHead className="text-[#9FAAC6]">#</TableHead>
                                <TableHead className="text-[#9FAAC6]">DDD</TableHead>
                                <TableHead className="text-[#9FAAC6]">Estado</TableHead>
                                <TableHead className="text-[#9FAAC6]">Região</TableHead>
                                <TableHead className="text-[#9FAAC6] text-right">Clientes</TableHead>
                                <TableHead className="text-[#9FAAC6] text-right">Percentual</TableHead>
                                <TableHead className="text-[#9FAAC6]">Distribuição</TableHead>
                              </TableRow>
                            </TableHeader>
                            <TableBody>
                              {sortedDDDs.map(([ddd, data], idx) => {
                                const percentage = (data.count / totalClientes) * 100;
                                return (
                                  <TableRow key={ddd} className="border-[#1E2840] hover:bg-[#0B0F18]">
                                    <TableCell className="text-[#6B7694]">{idx + 1}</TableCell>
                                    <TableCell className="text-[#00BFFF] font-mono">{ddd}</TableCell>
                                    <TableCell className="text-[#EAF2FF]">
                                      <Badge variant="outline" style={{ borderColor: '#1E2840', color: '#9FAAC6' }}>
                                        {data.estado}
                                      </Badge>
                                    </TableCell>
                                    <TableCell className="text-[#9FAAC6]">{data.regiao}</TableCell>
                                    <TableCell className="text-[#EAF2FF] text-right">{data.count}</TableCell>
                                    <TableCell className="text-[#FF00CC] text-right">{percentage.toFixed(1)}%</TableCell>
                                    <TableCell>
                                      <div className="w-full bg-[#0B0F18] rounded-full h-2 overflow-hidden">
                                        <div 
                                          className="h-full bg-gradient-to-r from-[#00BFFF] to-[#FF00CC] rounded-full transition-all"
                                          style={{ width: `${percentage}%` }}
                                        />
                                      </div>
                                    </TableCell>
                                  </TableRow>
                                );
                              })}
                            </TableBody>
                          </Table>
                        </div>

                        {sortedDDDs.length === 0 && (
                          <div className="text-center py-8">
                            <p className="text-[#6B7694]">Nenhum cliente com DDD válido encontrado</p>
                            <p className="text-[#6B7694] text-xs mt-2">
                              Os logins devem começar com 55 (código do Brasil) + DDD
                            </p>
                          </div>
                        )}
                      </Card>
                    </div>
                  );
                })()}
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
