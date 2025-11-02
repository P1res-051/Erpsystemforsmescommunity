import { useEffect, useState } from 'react';
import { LucideIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Info, TrendingUp, TrendingDown, Minus } from 'lucide-react';

interface KPICardPremiumProps {
  title: string;
  value: number | string;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: LucideIcon;
  tooltip?: string;
  loading?: boolean;
  format?: 'currency' | 'number' | 'percent';
  subtitle?: string;
  className?: string;
}

// Hook para animação CountUp
function useCountUp(end: number, duration = 1000): number {
  const [count, setCount] = useState(0);
  
  useEffect(() => {
    if (typeof end !== 'number') return;
    
    let startTimestamp: number | null = null;
    const startValue = 0;
    
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      
      const currentCount = Math.floor(progress * (end - startValue) + startValue);
      setCount(currentCount);
      
      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        setCount(end);
      }
    };
    
    window.requestAnimationFrame(step);
  }, [end, duration]);
  
  return count;
}

export function KPICardPremium({
  title,
  value,
  change,
  trend,
  icon: Icon,
  tooltip,
  loading = false,
  format = 'number',
  subtitle,
  className = '',
}: KPICardPremiumProps) {
  // Animação CountUp apenas para números
  const numericValue = typeof value === 'number' ? value : 0;
  const animatedValue = useCountUp(numericValue, 1000);
  
  // Formatar valor
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'currency':
        return new Intl.NumberFormat('pt-BR', {
          style: 'currency',
          currency: 'BRL',
          minimumFractionDigits: 0,
          maximumFractionDigits: 0,
        }).format(val);
      case 'percent':
        return `${val.toFixed(1)}%`;
      case 'number':
      default:
        return new Intl.NumberFormat('pt-BR').format(val);
    }
  };
  
  // Determinar cor do trend
  const getTrendColor = () => {
    if (!trend) return 'text-[var(--text-tertiary)]';
    switch (trend) {
      case 'up':
        return 'kpi-trend-positive';
      case 'down':
        return 'kpi-trend-negative';
      case 'neutral':
        return 'kpi-trend-neutral';
      default:
        return 'text-[var(--text-tertiary)]';
    }
  };
  
  const getTrendIcon = () => {
    if (!trend) return Minus;
    switch (trend) {
      case 'up':
        return TrendingUp;
      case 'down':
        return TrendingDown;
      case 'neutral':
      default:
        return Minus;
    }
  };
  
  const TrendIcon = getTrendIcon();
  
  if (loading) {
    return (
      <div className={`kpi-card-premium ${className}`}>
        <div className="skeleton-loader h-full w-full" />
      </div>
    );
  }
  
  return (
    <div className={`kpi-card-premium fade-in ${className}`}>
      {/* Header com ícone e tooltip */}
      <div className="flex items-start justify-between mb-3">
        {Icon && (
          <div className="p-2 rounded-lg" style={{ 
            background: 'rgba(0, 212, 255, 0.1)',
            border: '1px solid rgba(0, 212, 255, 0.2)'
          }}>
            <Icon size={20} style={{ color: 'var(--neon-cyan)' }} />
          </div>
        )}
        
        {tooltip && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <button className="p-1 hover:bg-white/5 rounded transition-colors">
                  <Info size={16} style={{ color: 'var(--text-tertiary)' }} />
                </button>
              </TooltipTrigger>
              <TooltipContent 
                className="max-w-xs"
                style={{
                  background: 'rgba(17, 24, 39, 0.95)',
                  backdropFilter: 'blur(12px)',
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  color: 'var(--foreground)'
                }}
              >
                <p className="text-sm">{tooltip}</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
      
      {/* Valor Principal */}
      <div className="kpi-value">
        {typeof value === 'number' ? formatValue(animatedValue) : value}
      </div>
      
      {/* Label */}
      <div className="kpi-label mt-1">
        {title}
      </div>
      
      {/* Subtítulo opcional */}
      {subtitle && (
        <div className="text-xs mt-1" style={{ color: 'var(--text-tertiary)' }}>
          {subtitle}
        </div>
      )}
      
      {/* Trend Indicator */}
      {change !== undefined && (
        <div className={`flex items-center gap-1 mt-3 ${getTrendColor()}`}>
          <TrendIcon size={14} />
          <span className="font-semibold" style={{ fontSize: 'var(--font-size-body-sm)' }}>
            {change > 0 ? '+' : ''}{change.toFixed(1)}%
          </span>
          <span className="text-xs ml-1" style={{ color: 'var(--text-tertiary)' }}>
            vs período anterior
          </span>
        </div>
      )}
      
      {/* Timestamp */}
      <div className="text-xs mt-3 pt-3 border-t" style={{ 
        color: 'var(--text-tertiary)',
        borderColor: 'rgba(255, 255, 255, 0.05)'
      }}>
        Atualizado agora
      </div>
    </div>
  );
}
