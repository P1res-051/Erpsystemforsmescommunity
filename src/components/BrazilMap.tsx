import { useState } from 'react';

interface BrazilMapProps {
  stateMetrics: Record<string, {
    state: string;
    stateName: string;
    region: string;
    clients: number;
    revenue: number;
    loyal: number;
    churn: number;
    ddds: Set<string>;
    avgTicket: number;
  }>;
  onStateClick?: (state: string) => void;
  selectedState?: string | null;
  getStateColor: (state: string) => string;
}

// Coordenadas SVG simplificadas dos estados brasileiros (path data)
const STATE_PATHS: Record<string, string> = {
  // Norte
  'AC': 'M 40,270 L 90,260 L 110,280 L 100,310 L 50,305 Z',
  'AM': 'M 90,180 L 160,170 L 180,200 L 175,250 L 140,260 L 90,255 L 85,220 Z',
  'RR': 'M 120,40 L 160,30 L 180,60 L 170,100 L 140,110 L 115,90 Z',
  'PA': 'M 180,150 L 280,140 L 310,165 L 315,200 L 300,230 L 260,240 L 240,220 L 200,210 L 180,180 Z',
  'AP': 'M 285,80 L 315,75 L 330,105 L 320,135 L 295,140 L 280,115 Z',
  'TO': 'M 285,245 L 325,240 L 345,270 L 350,310 L 330,340 L 300,350 L 280,330 L 275,290 Z',
  'RO': 'M 115,260 L 155,255 L 165,280 L 160,310 L 130,320 L 105,305 Z',
  
  // Nordeste
  'MA': 'M 310,170 L 370,165 L 395,190 L 400,220 L 380,245 L 350,250 L 320,235 Z',
  'PI': 'M 350,250 L 385,245 L 405,270 L 410,310 L 390,340 L 360,345 L 345,315 Z',
  'CE': 'M 400,220 L 465,210 L 485,235 L 480,260 L 445,270 L 410,260 Z',
  'RN': 'M 485,235 L 520,225 L 535,245 L 525,265 L 495,270 L 480,255 Z',
  'PB': 'M 495,270 L 525,265 L 540,280 L 535,295 L 510,300 L 490,290 Z',
  'PE': 'M 445,270 L 490,265 L 510,285 L 505,315 L 475,325 L 450,315 L 435,290 Z',
  'AL': 'M 510,300 L 540,295 L 550,315 L 545,335 L 520,340 L 505,325 Z',
  'SE': 'M 505,325 L 530,320 L 545,340 L 540,355 L 515,360 L 500,345 Z',
  'BA': 'M 360,345 L 410,340 L 450,350 L 480,375 L 485,420 L 460,465 L 420,480 L 375,475 L 340,455 L 325,410 L 330,370 Z',
  
  // Centro-Oeste
  'MT': 'M 200,260 L 260,255 L 285,275 L 295,320 L 285,370 L 260,400 L 225,405 L 195,385 L 185,330 L 190,290 Z',
  'MS': 'M 225,405 L 275,400 L 295,425 L 300,475 L 285,520 L 250,535 L 215,530 L 200,490 L 205,445 Z',
  'GO': 'M 285,370 L 340,365 L 365,390 L 370,435 L 355,465 L 325,475 L 295,470 L 280,430 L 275,395 Z',
  'DF': 'M 340,390 L 355,385 L 365,400 L 360,415 L 345,420 L 335,405 Z',
  
  // Sudeste
  'MG': 'M 355,465 L 420,455 L 465,470 L 490,505 L 495,545 L 475,580 L 440,595 L 395,600 L 360,590 L 335,565 L 330,525 L 340,490 Z',
  'ES': 'M 490,505 L 525,500 L 540,525 L 535,555 L 510,565 L 490,550 Z',
  'RJ': 'M 440,595 L 485,590 L 510,610 L 505,640 L 475,655 L 445,650 L 425,630 L 430,605 Z',
  'SP': 'M 330,565 L 395,555 L 435,570 L 460,600 L 455,640 L 425,670 L 380,680 L 340,675 L 310,650 L 300,615 L 305,585 Z',
  
  // Sul
  'PR': 'M 300,615 L 350,610 L 385,625 L 400,655 L 395,690 L 365,710 L 325,715 L 290,700 L 280,665 L 285,635 Z',
  'SC': 'M 325,715 L 380,710 L 415,730 L 420,760 L 395,780 L 360,785 L 325,775 L 310,750 L 315,730 Z',
  'RS': 'M 290,700 L 340,695 L 375,710 L 395,745 L 400,795 L 385,850 L 350,880 L 310,885 L 275,870 L 260,830 L 265,780 L 275,740 Z'
};

export function BrazilMap({ stateMetrics, onStateClick, selectedState, getStateColor }: BrazilMapProps) {
  const [hoveredState, setHoveredState] = useState<string | null>(null);

  const handleStateClick = (state: string) => {
    if (onStateClick) {
      onStateClick(state);
    }
  };

  const currentState = hoveredState || selectedState;
  const currentMetric = currentState ? stateMetrics[currentState] : null;

  return (
    <div className="relative">
      <svg 
        viewBox="0 0 600 920" 
        className="w-full h-auto"
        style={{ maxHeight: '600px' }}
      >
        {/* Fundo */}
        <rect width="600" height="920" fill="#0f172a" />
        
        {/* Estados */}
        {Object.entries(STATE_PATHS).map(([state, path]) => {
          const metric = stateMetrics[state];
          const isSelected = selectedState === state;
          const isHovered = hoveredState === state;
          const hasData = !!metric;
          
          return (
            <g key={state}>
              <path
                d={path}
                fill={hasData ? getStateColor(state) : '#1e293b'}
                stroke={isSelected ? '#fff' : isHovered ? '#94a3b8' : '#334155'}
                strokeWidth={isSelected ? '3' : isHovered ? '2' : '1'}
                opacity={hasData ? (isSelected || isHovered ? 1 : 0.85) : 0.3}
                className="cursor-pointer transition-all duration-200"
                onMouseEnter={() => setHoveredState(state)}
                onMouseLeave={() => setHoveredState(null)}
                onClick={() => hasData && handleStateClick(state)}
                style={{
                  filter: isSelected || isHovered ? 'brightness(1.2)' : 'none',
                  transform: isSelected || isHovered ? 'scale(1.02)' : 'scale(1)',
                  transformOrigin: 'center'
                }}
              />
              
              {/* Label do estado */}
              {hasData && (
                <text
                  x={getStateCenterX(state)}
                  y={getStateCenterY(state)}
                  textAnchor="middle"
                  className="pointer-events-none select-none"
                  fill="#fff"
                  fontSize={isSelected || isHovered ? '14' : '12'}
                  fontWeight={isSelected || isHovered ? 'bold' : 'normal'}
                >
                  {state}
                </text>
              )}
            </g>
          );
        })}
      </svg>

      {/* Tooltip */}
      {currentMetric && (
        <div className="absolute top-4 right-4 bg-slate-800 border border-slate-700 rounded-lg p-4 shadow-xl min-w-[200px]">
          <div className="flex items-center justify-between mb-2">
            <span className="text-white font-bold text-lg">{currentMetric.state}</span>
            <span className="text-slate-400 text-sm">{currentMetric.stateName}</span>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-slate-400">Clientes:</span>
              <span className="text-white font-semibold">{currentMetric.clients.toLocaleString('pt-BR')}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Receita:</span>
              <span className="text-green-400 font-semibold">
                R$ {currentMetric.revenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Ticket Médio:</span>
              <span className="text-blue-400 font-semibold">R$ {currentMetric.avgTicket.toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">DDDs:</span>
              <span className="text-cyan-400 font-semibold">{currentMetric.ddds.size}</span>
            </div>
            {currentMetric.loyal > 0 && (
              <div className="flex justify-between">
                <span className="text-slate-400">Fiéis:</span>
                <span className="text-purple-400 font-semibold">
                  {currentMetric.loyal} ({((currentMetric.loyal / currentMetric.clients) * 100).toFixed(0)}%)
                </span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// Funções auxiliares para obter o centro de cada estado (para posicionar labels)
function getStateCenterX(state: string): number {
  const centers: Record<string, number> = {
    'AC': 70, 'AM': 130, 'RR': 145, 'PA': 245, 'AP': 305, 'TO': 310, 'RO': 135,
    'MA': 355, 'PI': 375, 'CE': 445, 'RN': 510, 'PB': 520, 'PE': 470, 'AL': 528, 'SE': 522, 'BA': 415,
    'MT': 235, 'MS': 250, 'GO': 330, 'DF': 350,
    'MG': 410, 'ES': 515, 'RJ': 475, 'SP': 370,
    'PR': 340, 'SC': 365, 'RS': 330
  };
  return centers[state] || 300;
}

function getStateCenterY(state: string): number {
  const centers: Record<string, number> = {
    'AC': 285, 'AM': 215, 'RR': 70, 'PA': 185, 'AP': 105, 'TO': 295, 'RO': 288,
    'MA': 205, 'PI': 295, 'CE': 240, 'RN': 245, 'PB': 285, 'PE': 295, 'AL': 318, 'SE': 345, 'BA': 410,
    'MT': 325, 'MS': 475, 'GO': 415, 'DF': 402,
    'MG': 530, 'ES': 532, 'RJ': 622, 'SP': 625,
    'PR': 660, 'SC': 755, 'RS': 805
  };
  return centers[state] || 460;
}
