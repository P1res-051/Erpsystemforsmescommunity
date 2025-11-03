import { LogOut, RefreshCw, Clock, User, Shield } from 'lucide-react';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from './ui/tooltip';
import { COLORS } from '../utils/designSystem';

interface Props {
  isRefreshing: boolean;
  lastRefresh: Date | null;
  onRefresh: () => void;
  onLogout: () => void;
  userName?: string;
  resellerId?: string;
}

export function DashboardHeader({ 
  isRefreshing, 
  lastRefresh, 
  onRefresh, 
  onLogout,
  userName,
  resellerId 
}: Props) {
  
  const formatLastRefresh = (date: Date | null) => {
    if (!date) return 'Nunca';
    
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    
    if (minutes < 1) return 'Agora mesmo';
    if (minutes === 1) return 'Há 1 minuto';
    if (minutes < 60) return `Há ${minutes} minutos`;
    
    return date.toLocaleTimeString('pt-BR', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div 
      className="flex items-center justify-between p-4 border-b"
      style={{
        background: `linear-gradient(135deg, ${COLORS.bgCard}, ${COLORS.bgPrimary})`,
        borderColor: COLORS.border,
      }}
    >
      {/* Info do Usuário */}
      <div className="flex items-center gap-4">
        {userName && (
          <div className="flex items-center gap-2">
            <div 
              className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{
                background: 'linear-gradient(135deg, rgba(0,191,255,0.2), rgba(255,0,204,0.2))',
                border: `1px solid ${COLORS.primary}40`,
              }}
            >
              <User className="w-4 h-4" style={{ color: COLORS.primary }} />
            </div>
            <div>
              <p className="text-[#EAF2FF] text-sm">{userName}</p>
              {resellerId && (
                <p className="text-[#6B7694] text-xs flex items-center gap-1">
                  <Shield className="w-3 h-3" />
                  ID: {resellerId}
                </p>
              )}
            </div>
          </div>
        )}

        {/* Status de Atualização */}
        {lastRefresh && (
          <Badge 
            variant="outline"
            className="border text-xs"
            style={{
              background: 'rgba(0,191,255,0.05)',
              borderColor: 'rgba(0,191,255,0.3)',
              color: '#9FAAC6',
            }}
          >
            <Clock className="w-3 h-3 mr-1" />
            Atualizado {formatLastRefresh(lastRefresh)}
          </Badge>
        )}
      </div>

      {/* Botões de Ação */}
      <div className="flex items-center gap-2">
        {/* Botão Atualizar */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onRefresh}
                disabled={isRefreshing}
                className="border relative overflow-hidden group transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, rgba(0,191,255,0.1), rgba(0,191,255,0.05))',
                  borderColor: 'rgba(0,191,255,0.3)',
                }}
              >
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(0,191,255,0.2), transparent)',
                  }}
                />
                <RefreshCw 
                  className={`w-4 h-4 mr-2 relative z-10 ${isRefreshing ? 'animate-spin' : ''}`}
                  style={{ color: COLORS.primary }}
                />
                <span className="text-[#00BFFF] relative z-10">
                  {isRefreshing ? 'Atualizando...' : 'Atualizar'}
                </span>
              </Button>
            </TooltipTrigger>
            <TooltipContent
              style={{
                backgroundColor: COLORS.bgCard,
                borderColor: COLORS.border,
                color: COLORS.textPrimary,
              }}
            >
              <p>Atualizar dados agora</p>
              <p className="text-xs text-[#6B7694]">Auto-refresh: a cada 5 min</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>

        {/* Botão Sair */}
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                onClick={onLogout}
                className="border relative overflow-hidden group transition-all hover:scale-105"
                style={{
                  background: 'linear-gradient(135deg, rgba(255,74,154,0.1), rgba(255,74,154,0.05))',
                  borderColor: 'rgba(255,74,154,0.3)',
                }}
              >
                <div 
                  className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{
                    background: 'radial-gradient(circle at center, rgba(255,74,154,0.2), transparent)',
                  }}
                />
                <LogOut 
                  className="w-4 h-4 mr-2 relative z-10"
                  style={{ color: COLORS.danger }}
                />
                <span className="text-[#FF4A9A] relative z-10">Sair</span>
              </Button>
            </TooltipTrigger>
            <TooltipContent
              style={{
                backgroundColor: COLORS.bgCard,
                borderColor: COLORS.border,
                color: COLORS.textPrimary,
              }}
            >
              <p>Sair do dashboard</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
