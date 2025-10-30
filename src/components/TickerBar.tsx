import { useEffect, useRef, useState } from 'react';
import { TrendingUp, TrendingDown, Users, RefreshCw, Zap, DollarSign, Clock } from 'lucide-react';
import { DashboardData } from '../App';

interface TickerBarProps {
  data: DashboardData;
}

interface TickerItem {
  icon: React.ReactNode;
  label: string;
  value: string | number;
  color: 'cyan' | 'magenta' | 'pink' | 'blue' | 'yellow';
  trend?: number;
}

export function TickerBar({ data }: TickerBarProps) {
  const [currentTime, setCurrentTime] = useState(new Date());
  const scrollRef = useRef<HTMLDivElement>(null);

  // Atualizar relógio a cada segundo
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Calcular métricas do dia
  const activeClients = data.clientesAtivos || 0;
  const expiredClients = data.clientesExpirados || 0;
  const conversions = data.conversoes || 0;
  const renewals = data.renovacoes || 0;
  
  // Faturamento do mês (MRR)
  const monthlyRevenue = data.receitaMensal || 0;

  // Taxa de conversão
  const conversionRate = (data.taxaConversao || 0).toFixed(1);

  // Taxa de retenção
  const retentionRate = (data.taxaRetencao || 0).toFixed(1);

  const tickerItems: TickerItem[] = [
    {
      icon: <Users className="w-4 h-4" />,
      label: 'Ativos',
      value: activeClients.toLocaleString('pt-BR'),
      color: 'cyan',
      trend: 2.5,
    },
    {
      icon: <RefreshCw className="w-4 h-4" />,
      label: 'Renovações',
      value: renewals.toLocaleString('pt-BR'),
      color: 'blue',
      trend: 5.2,
    },
    {
      icon: <Zap className="w-4 h-4" />,
      label: 'Conversões',
      value: conversions.toLocaleString('pt-BR'),
      color: 'magenta',
      trend: 3.8,
    },
    {
      icon: <TrendingUp className="w-4 h-4" />,
      label: 'Taxa Conversão',
      value: `${conversionRate}%`,
      color: 'cyan',
    },
    {
      icon: <DollarSign className="w-4 h-4" />,
      label: 'Faturamento Mês',
      value: `R$ ${monthlyRevenue.toLocaleString('pt-BR')}`,
      color: 'magenta',
      trend: 8.5,
    },
    {
      icon: <Users className="w-4 h-4" />,
      label: 'Retenção',
      value: `${retentionRate}%`,
      color: 'blue',
    },
    {
      icon: <Clock className="w-4 h-4" />,
      label: 'Expirados',
      value: expiredClients.toLocaleString('pt-BR'),
      color: 'pink',
      trend: -1.2,
    },
  ];

  const getColorClass = (color: string) => {
    const colors = {
      cyan: 'text-[#00BFFF]',
      magenta: 'text-[#FF00CC]',
      pink: 'text-[#FF3DAE]',
      blue: 'text-[#1E90FF]',
      yellow: 'text-[#FFB800]',
    };
    return colors[color as keyof typeof colors] || colors.cyan;
  };

  const getGlowStyle = (color: string): React.CSSProperties => {
    const glows = {
      cyan: '0 0 8px rgba(0, 191, 255, 0.6)',
      magenta: '0 0 8px rgba(255, 0, 204, 0.6)',
      pink: '0 0 8px rgba(255, 61, 174, 0.6)',
      blue: '0 0 8px rgba(30, 144, 255, 0.6)',
      yellow: '0 0 8px rgba(255, 184, 0, 0.6)',
    };
    return {
      textShadow: glows[color as keyof typeof glows] || glows.cyan,
    };
  };

  return (
    <div className="ticker-bar-wrapper">
      {/* Barra Principal - CENTRALIZADA VERTICALMENTE */}
      <div 
        className="ticker-bar"
        style={{
          background: 'linear-gradient(90deg, #0B0F18, #121726, #0B0F18)',
          borderTop: '1px solid rgba(0, 191, 255, 0.25)',
          borderBottom: '1px solid rgba(255, 0, 204, 0.15)',
          boxShadow: '0 0 15px rgba(0, 191, 255, 0.1)',
          display: 'flex',
          alignItems: 'center',
          position: 'relative',
          height: '46px',
          paddingTop: '2px',
          overflow: 'hidden',
        }}
      >
        {/* Container com scroll infinito - CENTRALIZADO */}
        <div 
          ref={scrollRef}
          className="ticker-scroll"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0',
          }}
        >
          {/* Renderizar itens 2x para efeito infinito */}
          {[...tickerItems, ...tickerItems].map((item, index) => (
            <div 
              key={index} 
              className="ticker-item group"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '0 16px',
                whiteSpace: 'nowrap',
              }}
            >
              {/* Ícone */}
              <div 
                className={`ticker-icon ${getColorClass(item.color)}`}
                style={{ 
                  filter: `drop-shadow(0 0 4px ${item.color === 'cyan' ? '#00BFFF' : item.color === 'magenta' ? '#FF00CC' : item.color === 'pink' ? '#FF3DAE' : item.color === 'blue' ? '#1E90FF' : '#FFB800'})`,
                  display: 'inline-flex',
                  alignItems: 'center',
                }}
              >
                {item.icon}
              </div>

              {/* Label */}
              <span className="ticker-label text-[#9FAAC6]" style={{ fontSize: '14px' }}>
                {item.label}:
              </span>

              {/* Valor */}
              <span 
                className={`ticker-value ${getColorClass(item.color)} glow-animation`}
                style={{
                  ...getGlowStyle(item.color),
                  fontSize: '14px',
                  fontWeight: 600,
                }}
              >
                {item.value}
              </span>

              {/* Trend (se houver) */}
              {item.trend !== undefined && (
                <span 
                  className={`ticker-trend ${item.trend >= 0 ? 'text-[#00BFFF]' : 'text-[#FF3DAE]'}`}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '2px',
                  }}
                >
                  {item.trend >= 0 ? (
                    <TrendingUp className="w-3 h-3 inline" />
                  ) : (
                    <TrendingDown className="w-3 h-3 inline" />
                  )}
                  <span style={{ fontSize: '11px' }}>
                    {item.trend >= 0 ? '+' : ''}{item.trend}%
                  </span>
                </span>
              )}

              {/* Separador */}
              <div 
                className="ticker-separator" 
                style={{
                  width: '1px',
                  height: '16px',
                  background: 'rgba(158, 170, 198, 0.2)',
                  marginLeft: '8px',
                }}
              />
            </div>
          ))}
        </div>

        {/* Relógio (fixo à direita) */}
        <div 
          className="ticker-clock"
          style={{
            position: 'absolute',
            right: '16px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            background: 'linear-gradient(90deg, transparent, #0B0F18 20%, #0B0F18)',
            paddingLeft: '24px',
            height: '44px',
          }}
        >
          <Clock className="w-3.5 h-3.5 text-[#00BFFF]" />
          <span className="text-[#EAF2FF] text-sm font-medium">
            {currentTime.toLocaleTimeString('pt-BR', { 
              hour: '2-digit', 
              minute: '2-digit',
              second: '2-digit'
            })}
          </span>
        </div>
      </div>
    </div>
  );
}
