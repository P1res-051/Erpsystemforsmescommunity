import { ReactNode } from 'react';
import { LucideIcon } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { Info } from 'lucide-react';

interface ChartCardPremiumProps {
  title: string;
  subtitle?: string;
  icon?: LucideIcon;
  tooltip?: string;
  children: ReactNode;
  actions?: ReactNode;
  loading?: boolean;
  className?: string;
  minHeight?: string;
}

export function ChartCardPremium({
  title,
  subtitle,
  icon: Icon,
  tooltip,
  children,
  actions,
  loading = false,
  className = '',
  minHeight = 'var(--chart-height)',
}: ChartCardPremiumProps) {
  if (loading) {
    return (
      <div 
        className={`chart-card-premium ${className}`}
        style={{ minHeight }}
      >
        <div className="skeleton-loader h-full w-full" />
      </div>
    );
  }
  
  return (
    <div 
      className={`chart-card-premium ${className}`}
      style={{ minHeight }}
    >
      {/* Header */}
      <div className="chart-header">
        <div className="flex items-start gap-3">
          {Icon && (
            <div className="p-2 rounded-lg" style={{ 
              background: 'rgba(153, 69, 255, 0.1)',
              border: '1px solid rgba(153, 69, 255, 0.2)'
            }}>
              <Icon size={20} style={{ color: 'var(--neon-purple)' }} />
            </div>
          )}
          
          <div className="flex-1">
            <div className="flex items-center gap-2">
              <h3 className="chart-title">{title}</h3>
              
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
            
            {subtitle && (
              <p className="text-sm mt-1" style={{ color: 'var(--text-secondary)' }}>
                {subtitle}
              </p>
            )}
          </div>
        </div>
        
        {/* Actions */}
        {actions && (
          <div className="flex items-center gap-2">
            {actions}
          </div>
        )}
      </div>
      
      {/* Content */}
      <div className="flex-1">
        {children}
      </div>
    </div>
  );
}
