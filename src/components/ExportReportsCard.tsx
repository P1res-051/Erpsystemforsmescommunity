import { Card } from './ui/card';
import { Button } from './ui/button';
import { Download, FileText, FileSpreadsheet, RefreshCw, Check } from 'lucide-react';
import { useState } from 'react';
import * as XLSX from 'xlsx';
import { DashboardData } from '../App';
import { COLORS } from '../utils/designSystem';

interface Props {
  data: DashboardData;
}

export function ExportReportsCard({ data }: Props) {
  const [loading, setLoading] = useState(false);
  const [lastExports, setLastExports] = useState<Array<{type: string, date: string}>>([]);

  const exportPDF = async () => {
    setLoading(true);
    // Simular exportação (em produção, usar biblioteca como jsPDF)
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const newExport = {
      type: 'PDF',
      date: new Date().toLocaleString('pt-BR')
    };
    setLastExports(prev => [newExport, ...prev].slice(0, 3));
    setLoading(false);
    
    // Mock: Criar relatório texto
    const reportText = `
RELATÓRIO DASHBOARD IPTV
Gerado em: ${newExport.date}
════════════════════════════════════

📊 MÉTRICAS PRINCIPAIS
- Testes: ${data.testes}
- Conversões: ${data.conversoes}
- Renovações: ${data.renovacoes}
- Clientes Ativos: ${data.clientesAtivos}
- Taxa de Conversão: ${data.taxaConversao.toFixed(2)}%

💰 FINANCEIRO
- Receita Total: R$ ${data.receitaTotal.toLocaleString('pt-BR')}
- MRR: R$ ${data.receitaMensal.toLocaleString('pt-BR')}
- ARR: R$ ${data.receitaAnual.toLocaleString('pt-BR')}
- Ticket Médio: R$ ${data.ticketMedio.toFixed(2)}

════════════════════════════════════
    `.trim();
    
    const blob = new Blob([reportText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `Relatorio_Dashboard_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
  };

  const exportCSV = () => {
    setLoading(true);
    
    // Preparar dados para CSV
    const csvData = [
      {
        'Métrica': 'Testes',
        'Valor': data.testes,
        'Tipo': 'Quantidade'
      },
      {
        'Métrica': 'Conversões',
        'Valor': data.conversoes,
        'Tipo': 'Quantidade'
      },
      {
        'Métrica': 'Renovações',
        'Valor': data.renovacoes,
        'Tipo': 'Quantidade'
      },
      {
        'Métrica': 'Taxa de Conversão',
        'Valor': data.taxaConversao.toFixed(2) + '%',
        'Tipo': 'Percentual'
      },
      {
        'Métrica': 'Receita Total',
        'Valor': 'R$ ' + data.receitaTotal.toLocaleString('pt-BR'),
        'Tipo': 'Financeiro'
      },
      {
        'Métrica': 'MRR',
        'Valor': 'R$ ' + data.receitaMensal.toLocaleString('pt-BR'),
        'Tipo': 'Financeiro'
      },
      {
        'Métrica': 'Ticket Médio',
        'Valor': 'R$ ' + data.ticketMedio.toFixed(2),
        'Tipo': 'Financeiro'
      }
    ];

    const ws = XLSX.utils.json_to_sheet(csvData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Resumo Dashboard');
    XLSX.writeFile(wb, `Dashboard_Export_${new Date().toISOString().split('T')[0]}.csv`);
    
    const newExport = {
      type: 'CSV',
      date: new Date().toLocaleString('pt-BR')
    };
    setLastExports(prev => [newExport, ...prev].slice(0, 3));
    setLoading(false);
  };

  const exportExcel = () => {
    setLoading(true);
    
    // Sheet 1: Resumo
    const resumo = [
      { 'Métrica': 'Testes', 'Valor': data.testes },
      { 'Métrica': 'Conversões', 'Valor': data.conversoes },
      { 'Métrica': 'Renovações', 'Valor': data.renovacoes },
      { 'Métrica': 'Clientes Ativos', 'Valor': data.clientesAtivos },
      { 'Métrica': 'Taxa de Conversão (%)', 'Valor': data.taxaConversao.toFixed(2) },
      { 'Métrica': 'Receita Total (R$)', 'Valor': data.receitaTotal },
      { 'Métrica': 'MRR (R$)', 'Valor': data.receitaMensal },
      { 'Métrica': 'Ticket Médio (R$)', 'Valor': data.ticketMedio.toFixed(2) },
    ];

    const ws1 = XLSX.utils.json_to_sheet(resumo);
    
    // Sheet 2: Por Estado
    const porEstado = data.porEstado.map(e => ({
      'Estado': e.estado,
      'Testes': e.testes,
      'Conversões': e.conversoes,
      'Ativos': e.ativos,
      'Expirados': e.expirados
    }));
    const ws2 = XLSX.utils.json_to_sheet(porEstado);

    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws1, 'Resumo');
    XLSX.utils.book_append_sheet(wb, ws2, 'Por Estado');
    XLSX.writeFile(wb, `Dashboard_Completo_${new Date().toISOString().split('T')[0]}.xlsx`);
    
    const newExport = {
      type: 'EXCEL',
      date: new Date().toLocaleString('pt-BR')
    };
    setLastExports(prev => [newExport, ...prev].slice(0, 3));
    setLoading(false);
  };

  return (
    <Card 
      className=\"p-6 border relative overflow-hidden\"
      style={{
        background: `linear-gradient(135deg, ${COLORS.bgCard}, ${COLORS.bgPrimary})`,
        borderColor: COLORS.border,
      }}
    >
      {/* Header gradiente */}
      <div 
        className=\"absolute top-0 left-0 right-0 h-20 opacity-20\"
        style={{
          background: 'linear-gradient(120deg, #00BFFF 0%, #FF00CC 50%, #9B6BFF 100%)',
          filter: 'blur(30px)',
        }}
      />

      <div className=\"relative z-10 space-y-6\">
        {/* Título */}
        <div className=\"text-center\">
          <h3 className=\"text-[#EAF2FF] text-xl mb-2 flex items-center justify-center gap-2\">
            <FileText className=\"w-6 h-6\" style={{ color: COLORS.primary }} />
            <span>Relatórios e Exportações</span>
          </h3>
          <p className=\"text-[#9FAAC6] text-sm\">
            Gere relatórios detalhados com um clique
          </p>
        </div>

        {/* Botões de Exportação */}
        <div className=\"grid grid-cols-1 md:grid-cols-3 gap-3\">
          <Button
            onClick={exportPDF}
            disabled={loading}
            className=\"h-auto py-4 flex flex-col items-center gap-2 border transition-all hover:scale-105\"
            style={{
              background: 'linear-gradient(135deg, rgba(255,0,204,0.1), rgba(255,0,204,0.05))',
              borderColor: 'rgba(255,0,204,0.3)',
            }}
          >
            {loading ? (
              <RefreshCw className=\"w-6 h-6 animate-spin\" style={{ color: '#FF00CC' }} />
            ) : (
              <FileText className=\"w-6 h-6\" style={{ color: '#FF00CC' }} />
            )}
            <span className=\"text-[#FF00CC]\">Exportar PDF</span>
            <span className=\"text-[#6B7694] text-xs\">Relatório resumido</span>
          </Button>

          <Button
            onClick={exportCSV}
            disabled={loading}
            className=\"h-auto py-4 flex flex-col items-center gap-2 border transition-all hover:scale-105\"
            style={{
              background: 'linear-gradient(135deg, rgba(0,191,255,0.1), rgba(0,191,255,0.05))',
              borderColor: 'rgba(0,191,255,0.3)',
            }}
          >
            {loading ? (
              <RefreshCw className=\"w-6 h-6 animate-spin\" style={{ color: '#00BFFF' }} />
            ) : (
              <Download className=\"w-6 h-6\" style={{ color: '#00BFFF' }} />
            )}
            <span className=\"text-[#00BFFF]\">Gerar CSV</span>
            <span className=\"text-[#6B7694] text-xs\">Dados tabulados</span>
          </Button>

          <Button
            onClick={exportExcel}
            disabled={loading}
            className=\"h-auto py-4 flex flex-col items-center gap-2 border transition-all hover:scale-105\"
            style={{
              background: 'linear-gradient(135deg, rgba(34,227,175,0.1), rgba(34,227,175,0.05))',
              borderColor: 'rgba(34,227,175,0.3)',
            }}
          >
            {loading ? (
              <RefreshCw className=\"w-6 h-6 animate-spin\" style={{ color: '#22e3af' }} />
            ) : (
              <FileSpreadsheet className=\"w-6 h-6\" style={{ color: '#22e3af' }} />
            )}
            <span className=\"text-[#22e3af]\">Exportar EXCEL</span>
            <span className=\"text-[#6B7694] text-xs\">Planilha completa</span>
          </Button>
        </div>

        {/* Histórico de Exportações */}
        {lastExports.length > 0 && (
          <div className=\"mt-6 pt-6 border-t\" style={{ borderColor: COLORS.border }}>
            <p className=\"text-[#9FAAC6] text-xs mb-3 uppercase tracking-wide\">Últimas Exportações</p>
            <div className=\"space-y-2\">
              {lastExports.map((exp, idx) => (
                <div 
                  key={idx}
                  className=\"flex items-center justify-between p-2 rounded-lg border\"
                  style={{
                    background: 'rgba(0,191,255,0.05)',
                    borderColor: 'rgba(0,191,255,0.2)',
                  }}
                >
                  <div className=\"flex items-center gap-2\">
                    <Check className=\"w-4 h-4\" style={{ color: '#22e3af' }} />
                    <span className=\"text-[#EAF2FF] text-sm\">{exp.type}</span>
                  </div>
                  <span className=\"text-[#6B7694] text-xs\">{exp.date}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </Card>
  );
}
