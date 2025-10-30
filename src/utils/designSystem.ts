/**
 * 🎨 AutonomyX Design System
 * Sistema de cores, espaçamentos e componentes padronizados
 */

export const COLORS = {
  // Cores Primárias
  primary: '#00BFFF',        // Cyan Elétrico
  primaryDark: '#0090ff',
  primaryLight: '#00d4ff',
  
  // Cores Secundárias
  secondary: '#7B5CFF',      // Roxo
  secondaryDark: '#5B3FCC',
  secondaryLight: '#9B7CFF',
  
  // Cores de Status
  success: '#00d18f',        // Verde
  successDark: '#00a070',
  warning: '#ffb64d',        // Amarelo
  warningDark: '#ff8800',
  danger: '#FF00CC',         // Rosa Neon (só detalhes)
  dangerDark: '#ff4fd8',
  info: '#0090ff',           // Azul
  
  // Backgrounds
  bgPrimary: '#0B0F18',
  bgSecondary: '#10182b',
  bgTertiary: '#121726',
  bgCard: '#1A2035',
  
  // Borders
  border: '#1e2a44',
  borderLight: '#2a3a54',
  borderDark: '#1E2840',
  
  // Text
  textPrimary: '#EAF2FF',
  textSecondary: '#dbe4ff',
  textMuted: '#8ea9d9',
  textDisabled: '#9FAAC6',
  
  // Gradientes
  gradient: {
    primary: 'linear-gradient(90deg, #00BFFF 0%, #7B5CFF 100%)',
    primaryAlt: 'linear-gradient(135deg, #00BFFF 0%, #0090ff 100%)',
    secondary: 'linear-gradient(135deg, #7B5CFF 0%, #5B3FCC 100%)',
    success: 'linear-gradient(135deg, #00d18f 0%, #00a070 100%)',
    card: 'linear-gradient(135deg, #10182b 0%, #0b0f19 100%)',
    cardAlt: 'linear-gradient(135deg, #0B0F18 0%, #0f1a2b 50%, #10182b 100%)',
  }
};

export const SPACING = {
  xs: '0.25rem',   // 4px
  sm: '0.5rem',    // 8px
  md: '1rem',      // 16px
  lg: '1.5rem',    // 24px
  xl: '2rem',      // 32px
  '2xl': '3rem',   // 48px
};

export const BORDER_RADIUS = {
  sm: '0.5rem',    // 8px
  md: '0.75rem',   // 12px
  lg: '1rem',      // 16px
  xl: '1.5rem',    // 24px
};

export const SHADOWS = {
  sm: '0 2px 4px rgba(0, 191, 255, 0.1)',
  md: '0 4px 8px rgba(0, 191, 255, 0.15)',
  lg: '0 8px 16px rgba(0, 191, 255, 0.2)',
  xl: '0 12px 24px rgba(0, 191, 255, 0.25)',
  glow: '0 0 20px rgba(0, 191, 255, 0.4)',
  glowPurple: '0 0 20px rgba(123, 92, 255, 0.4)',
};

// Classes CSS reutilizáveis
export const CARD_CLASSES = {
  base: 'rounded-xl border shadow-2xl',
  primary: 'bg-gradient-to-br from-[#10182b] to-[#0b0f19] border-[#1e2a44]',
  secondary: 'bg-gradient-to-br from-[#0B0F18] via-[#0f1a2b] to-[#10182b] border-[#1e2a44]',
  accent: 'bg-gradient-to-br from-[#00BFFF]/10 to-[#7B5CFF]/10 border-[#00BFFF]/30',
};

export const BUTTON_CLASSES = {
  primary: 'bg-gradient-to-r from-[#00BFFF] to-[#7B5CFF] text-white border-0 hover:shadow-lg hover:shadow-[#00BFFF]/30',
  secondary: 'bg-[#1e2a44] text-[#8ea9d9] hover:bg-[#2a3a54] border-[#2a3a54]',
  outline: 'bg-transparent border-[#00BFFF]/30 text-[#00BFFF] hover:bg-[#00BFFF]/10',
  danger: 'bg-gradient-to-r from-[#FF00CC] to-[#ff4fd8] text-white border-0',
};

export const BADGE_CLASSES = {
  primary: 'bg-[#00BFFF]/20 text-[#00BFFF] border-[#00BFFF]/30',
  secondary: 'bg-[#7B5CFF]/20 text-[#7B5CFF] border-[#7B5CFF]/30',
  success: 'bg-[#00d18f]/20 text-[#00d18f] border-[#00d18f]/30',
  warning: 'bg-[#ffb64d]/20 text-[#ffb64d] border-[#ffb64d]/30',
  danger: 'bg-[#FF00CC]/20 text-[#FF00CC] border-[#FF00CC]/30',
};

// Helper para criar gradientes
export function createGradient(color1: string, color2: string, direction: string = '135deg'): string {
  return `linear-gradient(${direction}, ${color1} 0%, ${color2} 100%)`;
}

// Helper para ajustar opacidade
export function withOpacity(color: string, opacity: number): string {
  return `${color}${Math.round(opacity * 255).toString(16).padStart(2, '0')}`;
}

// Classes de texto padronizadas
export const TEXT_CLASSES = {
  h1: 'text-[#EAF2FF] text-2xl font-semibold tracking-tight',
  h2: 'text-[#EAF2FF] text-xl font-semibold',
  h3: 'text-[#dbe4ff] font-semibold',
  body: 'text-[#8ea9d9] text-sm',
  caption: 'text-[#8ea9d9] text-xs',
  label: 'text-[#8ea9d9] text-xs font-medium',
};

// Configuração de gráficos (Recharts)
export const CHART_CONFIG = {
  cartesianGrid: {
    strokeDasharray: '3 3',
    stroke: '#1e2a44',
  },
  xAxis: {
    tick: { fill: '#8ea9d9', fontSize: 11 },
    stroke: '#1e2a44',
  },
  yAxis: {
    tick: { fill: '#8ea9d9', fontSize: 11 },
    stroke: '#1e2a44',
  },
  tooltip: {
    contentStyle: {
      backgroundColor: '#10182b',
      border: '1px solid #1e2a44',
      borderRadius: '8px',
      color: '#dbe4ff',
    },
    labelStyle: {
      color: '#00BFFF',
      fontWeight: 600,
    },
  },
  legend: {
    wrapperStyle: {
      color: '#8ea9d9',
    },
  },
};

// Cores para gráficos
export const CHART_COLORS = {
  primary: '#00BFFF',
  secondary: '#7B5CFF',
  success: '#00d18f',
  warning: '#ffb64d',
  danger: '#FF00CC',
  set: ['#00BFFF', '#7B5CFF', '#00d18f', '#ffb64d', '#0090ff', '#FF00CC'],
};

export default {
  COLORS,
  SPACING,
  BORDER_RADIUS,
  SHADOWS,
  CARD_CLASSES,
  BUTTON_CLASSES,
  BADGE_CLASSES,
  TEXT_CLASSES,
  CHART_CONFIG,
  CHART_COLORS,
  createGradient,
  withOpacity,
};
