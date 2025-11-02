import { useState, useEffect } from 'react';
import { Card } from './ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { ChevronLeft, ChevronRight, TrendingUp, DollarSign, Copy } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';

interface DaySpend {
  [date: string]: number; // formato: "2025-10-12" -> 120.50
}

interface DayStats {
  gasto: number;
  conversoes: number;
  renovacoes: number;
  creditos: number;
  receita: number;
  roi: number;
}

interface Props {
  data: any; // dados do dashboard
  onSpendUpdate?: (spends: DaySpend) => void;
}

const MESES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
];

const DIAS_SEMANA = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];

export function FacebookAdsCalendar({ data, onSpendUpdate }: Props) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [spends, setSpends] = useState<DaySpend>({});
  const [selectedDate, setSelectedDate] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Carregar dados do localStorage
  useEffect(() => {
    const saved = localStorage.getItem('facebook_ads_spends');
    if (saved) {
      try {
        setSpends(JSON.parse(saved));
      } catch (e) {
        console.error('Erro ao carregar dados:', e);
      }
    }
  }, []);

  // Salvar dados no localStorage
  const saveSpends = (newSpends: DaySpend) => {
    setSpends(newSpends);
    localStorage.setItem('facebook_ads_spends', JSON.stringify(newSpends));
    onSpendUpdate?.(newSpends);
  };

  // Navegar meses
  const previousMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.getMonth() - 1);
    setCurrentDate(newDate);
  };

  const nextMonth = () => {
    const newDate = new Date(currentDate);
    newDate.setMonth(newDate.setMonth() + 1);
    setCurrentDate(newDate);
  };

  // Gerar dias do mês
  const getDaysInMonth = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDayOfWeek = firstDay.getDay();

    const days: (number | null)[] = [];
    
    // Adicionar espaços vazios antes do primeiro dia
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null);
    }
    
    // Adicionar os dias do mês
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(day);
    }

    return days;
  };

  // Formatar data para chave
  const formatDateKey = (day: number): string => {
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    return `${year}-${month}-${dayStr}`;
  };

  // Calcular estatísticas do dia (simulado - você pode integrar com dados reais)
  const getDayStats = (day: number): DayStats => {
    const dateKey = formatDateKey(day);
    const gasto = spends[dateKey] || 0;
    
    // Simulação de conversões baseada no gasto (você deve substituir pelos dados reais)
    const conversoes = gasto > 0 ? Math.floor(gasto / 30) + Math.floor(Math.random() * 3) : 0;
    const renovacoes = Math.floor(Math.random() * 5);
    const creditos = gasto * 0.15; // 15% do gasto em créditos
    const ticketMedio = 30; // R$ 30 por conversão (ajustar conforme seu plano)
    const receita = conversoes * ticketMedio;
    const roi = gasto > 0 ? receita / gasto : 0;

    return {
      gasto,
      conversoes,
      renovacoes,
      creditos,
      receita,
      roi
    };
  };

  // Abrir modal
  const openModal = (day: number) => {
    const dateKey = formatDateKey(day);
    setSelectedDate(dateKey);
    setEditValue(String(spends[dateKey] || ''));
    setIsModalOpen(true);
  };

  // Salvar valor
  const saveValue = () => {
    if (!selectedDate) return;
    
    const value = parseFloat(editValue) || 0;
    const newSpends = { ...spends, [selectedDate]: value };
    saveSpends(newSpends);
    setIsModalOpen(false);
  };

  // Copiar do dia anterior
  const copyFromPrevious = () => {
    if (!selectedDate) return;
    
    const currentDateObj = new Date(selectedDate);
    currentDateObj.setDate(currentDateObj.getDate() - 1);
    const prevDateKey = currentDateObj.toISOString().split('T')[0];
    const prevValue = spends[prevDateKey] || 0;
    
    setEditValue(String(prevValue));
  };

  // Calcular totais do mês
  const getMonthTotals = () => {
    const year = currentDate.getFullYear();
    const month = currentDate.getMonth() + 1;
    
    let totalGasto = 0;
    let totalConversoes = 0;
    let totalRenovacoes = 0;
    let totalReceita = 0;
    let totalCreditos = 0;
    let diasComGasto = 0;

    Object.keys(spends).forEach(dateKey => {
      const [y, m] = dateKey.split('-').map(Number);
      if (y === year && m === month) {
        const day = parseInt(dateKey.split('-')[2]);
        const stats = getDayStats(day);
        totalGasto += stats.gasto;
        totalConversoes += stats.conversoes;
        totalRenovacoes += stats.renovacoes;
        totalReceita += stats.receita;
        totalCreditos += stats.creditos;
        if (stats.gasto > 0) diasComGasto++;
      }
    });

    const roiMedio = totalGasto > 0 ? totalReceita / totalGasto : 0;
    const cpl = totalConversoes > 0 ? totalGasto / totalConversoes : 0;
    const mixTrafego = totalConversoes + totalRenovacoes > 0 
      ? (totalConversoes / (totalConversoes + totalRenovacoes)) * 100 
      : 0;

    return {
      totalGasto,
      totalConversoes,
      totalRenovacoes,
      totalReceita,
      totalCreditos,
      roiMedio,
      cpl,
      mixTrafego,
      diasComGasto
    };
  };

  const days = getDaysInMonth();
  const monthTotals = getMonthTotals();
  const today = new Date();
  const isCurrentMonth = 
    currentDate.getMonth() === today.getMonth() && 
    currentDate.getFullYear() === today.getFullYear();

  return (
    <div className="space-y-6">
      {/* Header do Calendário */}
      <div className="flex items-center justify-between">
        <h3 className="text-[#EAF2FF] text-lg" style={{ fontWeight: 600 }}>
          📅 Calendário de Investimento
        </h3>
        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={previousMonth}
            className="bg-[#10182b] border-[#1e2a44] text-[#8ea9d9] hover:bg-[#1e2a44] hover:text-[#EAF2FF]"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
          <span className="text-[#EAF2FF] min-w-[180px] text-center" style={{ fontWeight: 600 }}>
            {MESES[currentDate.getMonth()]} {currentDate.getFullYear()}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={nextMonth}
            className="bg-[#10182b] border-[#1e2a44] text-[#8ea9d9] hover:bg-[#1e2a44] hover:text-[#EAF2FF]"
          >
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Grade do Calendário */}
      <Card className="p-6 bg-gradient-to-br from-[#10182b] to-[#0b0f19] border-[#1e2a44] shadow-2xl">
        {/* Dias da semana */}
        <div className="grid grid-cols-7 gap-2 mb-4">
          {DIAS_SEMANA.map(dia => (
            <div
              key={dia}
              className="text-center text-[#8ea9d9] text-xs uppercase tracking-wider py-2"
              style={{ fontWeight: 600 }}
            >
              {dia}
            </div>
          ))}
        </div>

        {/* Dias do mês */}
        <div className="grid grid-cols-7 gap-2">
          {days.map((day, index) => {
            if (day === null) {
              return <div key={`empty-${index}`} className="aspect-square" />;
            }

            const stats = getDayStats(day);
            const dateKey = formatDateKey(day);
            const isToday = isCurrentMonth && day === today.getDate();
            const hasSpend = stats.gasto > 0;

            return (
              <TooltipProvider key={day}>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      onClick={() => openModal(day)}
                      className={`
                        aspect-square p-2 rounded-lg border transition-all duration-200
                        ${isToday 
                          ? 'border-[#00BFFF] bg-[#00BFFF15]' 
                          : 'border-[#1e2a44] bg-[#0b0f19]'
                        }
                        ${hasSpend ? 'hover:bg-[#00d18f15]' : 'hover:bg-[#1e2a44]'}
                        hover:shadow-lg hover:-translate-y-0.5
                        flex flex-col items-center justify-center
                      `}
                    >
                      <div className="text-[#EAF2FF] text-sm mb-1" style={{ fontWeight: 600 }}>
                        {day}
                      </div>
                      {hasSpend && (
                        <>
                          <div className="text-[#00d18f] text-xs" style={{ fontWeight: 600 }}>
                            R$ {stats.gasto.toFixed(0)}
                          </div>
                          {stats.roi > 0 && (
                            <div 
                              className="text-[10px] mt-0.5"
                              style={{ 
                                color: stats.roi >= 2 ? '#00d18f' : stats.roi >= 1 ? '#ffb64d' : '#ff4f6b',
                                fontWeight: 600
                              }}
                            >
                              ROI: {stats.roi.toFixed(1)}x
                            </div>
                          )}
                        </>
                      )}
                      {!hasSpend && (
                        <div className="text-[#8ea9d9] text-[10px]">--</div>
                      )}
                    </button>
                  </TooltipTrigger>
                  <TooltipContent className="bg-[#0f1621] border-[#1e2a44] text-[#EAF2FF] p-3">
                    <div className="space-y-1 text-xs">
                      <p style={{ fontWeight: 600 }}>📅 Dia {day}/{currentDate.getMonth() + 1}</p>
                      <div className="border-t border-[#1e2a44] pt-2 space-y-1">
                        <p>💰 Gasto: <span style={{ color: '#0090ff', fontWeight: 600 }}>R$ {stats.gasto.toFixed(2)}</span></p>
                        <p>📈 Conversões: <span style={{ color: '#00d18f', fontWeight: 600 }}>{stats.conversoes}</span></p>
                        <p>🔁 Renovações: <span style={{ color: '#ffb64d', fontWeight: 600 }}>{stats.renovacoes}</span></p>
                        <p>💹 ROI: <span style={{ color: stats.roi >= 2 ? '#00d18f' : '#ffb64d', fontWeight: 600 }}>{stats.roi.toFixed(2)}x</span></p>
                        <p>⚙️ Créditos: <span style={{ color: '#8ea9d9', fontWeight: 600 }}>R$ {stats.creditos.toFixed(2)}</span></p>
                      </div>
                      <p className="text-[#8ea9d9] text-[10px] pt-1 italic">Clique para editar</p>
                    </div>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            );
          })}
        </div>

        {/* Legenda */}
        <div className="flex items-center justify-center gap-6 mt-6 pt-4 border-t border-[#1e2a44]">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded border border-[#00BFFF] bg-[#00BFFF15]" />
            <span className="text-[#8ea9d9] text-xs">Hoje</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#00d18f15] border border-[#00d18f]" />
            <span className="text-[#8ea9d9] text-xs">Com investimento</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-[#0b0f19] border border-[#1e2a44]" />
            <span className="text-[#8ea9d9] text-xs">Sem investimento</span>
          </div>
        </div>
      </Card>

      {/* Resumo do Mês */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 bg-gradient-to-br from-[#10182b] to-[#0b0f19] border-[#1e2a44]">
          <div className="flex items-center gap-2 mb-2">
            <DollarSign className="w-4 h-4" style={{ color: '#0090ff' }} />
            <p className="text-[#8ea9d9] text-xs">Gasto Total</p>
          </div>
          <p className="text-[#0090ff] text-2xl" style={{ fontWeight: 700 }}>
            R$ {monthTotals.totalGasto.toFixed(2)}
          </p>
          <p className="text-[#8ea9d9] text-[10px] mt-1">
            {monthTotals.diasComGasto} dias ativos
          </p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-[#10182b] to-[#0b0f19] border-[#1e2a44]">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4" style={{ color: '#00d18f' }} />
            <p className="text-[#8ea9d9] text-xs">Conversões</p>
          </div>
          <p className="text-[#00d18f] text-2xl" style={{ fontWeight: 700 }}>
            {monthTotals.totalConversoes}
          </p>
          <p className="text-[#8ea9d9] text-[10px] mt-1">
            {monthTotals.mixTrafego.toFixed(1)}% do total
          </p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-[#10182b] to-[#0b0f19] border-[#1e2a44]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">💹</span>
            <p className="text-[#8ea9d9] text-xs">ROI Médio</p>
          </div>
          <p 
            className="text-2xl" 
            style={{ 
              fontWeight: 700,
              color: monthTotals.roiMedio >= 2 ? '#00d18f' : monthTotals.roiMedio >= 1 ? '#ffb64d' : '#ff4f6b'
            }}
          >
            {monthTotals.roiMedio.toFixed(2)}x
          </p>
          <p className="text-[#8ea9d9] text-[10px] mt-1">
            {monthTotals.roiMedio >= 2 ? '✅ Excelente' : monthTotals.roiMedio >= 1 ? '⚠️ Regular' : '🚨 Baixo'}
          </p>
        </Card>

        <Card className="p-4 bg-gradient-to-br from-[#10182b] to-[#0b0f19] border-[#1e2a44]">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-base">📊</span>
            <p className="text-[#8ea9d9] text-xs">CPL</p>
          </div>
          <p className="text-[#ff4f6b] text-2xl" style={{ fontWeight: 700 }}>
            R$ {monthTotals.cpl.toFixed(2)}
          </p>
          <p className="text-[#8ea9d9] text-[10px] mt-1">
            Custo por lead
          </p>
        </Card>
      </div>

      {/* Modal de Edição */}
      <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
        <DialogContent className="bg-[#0f1621] border-[#1e2a44] text-[#EAF2FF]">
          <DialogHeader>
            <DialogTitle className="text-[#EAF2FF]">
              💰 Investimento em Tráfego Pago
            </DialogTitle>
            <DialogDescription className="text-[#8ea9d9] text-sm">
              Edite o valor gasto no Facebook Ads para o dia selecionado.
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-4">
            <div>
              <p className="text-[#8ea9d9] text-sm mb-2">
                📅 Data: <span style={{ fontWeight: 600, color: '#EAF2FF' }}>{selectedDate}</span>
              </p>
            </div>

            <div>
              <label className="text-[#8ea9d9] text-sm block mb-2">
                Valor gasto no Facebook Ads (R$)
              </label>
              <Input
                type="number"
                step="0.01"
                value={editValue}
                onChange={(e) => setEditValue(e.target.value)}
                placeholder="0.00"
                className="bg-[#10182b] border-[#1e2a44] text-[#EAF2FF] placeholder:text-[#8ea9d9]"
              />
            </div>

            <Button
              variant="outline"
              onClick={copyFromPrevious}
              className="w-full bg-[#10182b] border-[#1e2a44] text-[#8ea9d9] hover:bg-[#1e2a44] hover:text-[#EAF2FF]"
            >
              <Copy className="w-4 h-4 mr-2" />
              Copiar do dia anterior
            </Button>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              className="bg-[#10182b] border-[#1e2a44] text-[#8ea9d9] hover:bg-[#1e2a44]"
            >
              Cancelar
            </Button>
            <Button
              onClick={saveValue}
              className="bg-[#00d18f] text-white hover:bg-[#00ffa3]"
            >
              Salvar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}