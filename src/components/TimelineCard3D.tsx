interface TimelineCard3DProps {
  weekday: string;
  day: number;
  month: string;
  liquido: number;
  renov: number;
  perdas: number;
  isToday?: boolean;
  isFuture?: boolean;
}

export function TimelineCard3D({
  weekday,
  day,
  month,
  liquido,
  renov,
  perdas,
  isToday = false,
  isFuture = false,
}: TimelineCard3DProps) {

  // Formatação de valores
  const formatValue = (value: number): string => {
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}k`;
    }
    return value.toFixed(0);
  };

  // Nome do dia da semana abreviado
  const getDayName = (wd: string): string => {
    const dayMap: Record<string, string> = {
      'seg': 'SEG',
      'ter': 'TER',
      'qua': 'QUA',
      'qui': 'QUI',
      'sex': 'SEX',
      'sab': 'SÁB',
      'dom': 'DOM',
    };
    return dayMap[wd.toLowerCase()] || wd.toUpperCase();
  };

  return (
    <>
      <style>{`
        .day-card {
          width: 118px;
          min-height: 140px;
          background: radial-gradient(circle at top, #141a29 0%, #0b0f18 42%, #0b0f18 100%);
          border: 1px solid rgba(255,255,255,0.02);
          border-radius: 12px;
          padding: 10px 11px 12px;
          display: flex;
          flex-direction: column;
          gap: 6px;
        }

        .day-card .badge {
          background: #101624;
          border: 1px solid rgba(255,73,196,0.25);
          color: #FF5BD2;
          font-size: 10.5px;
          font-weight: 600;
          padding: 3px 8px 2px;
          border-radius: 999px;
          align-self: flex-start;
          letter-spacing: 0.02em;
        }

        .day-card .number {
          font-size: 26px;
          font-weight: 700;
          color: #FF29C5;
          line-height: 1;
          margin: 4px 0 6px;
        }

        .day-card .row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 11px;
          color: #8894AE;
          padding: 2px 0;
        }

        .day-card .row span:first-child {
          font-size: 10.5px;
          opacity: 0.85;
        }

        .day-card .row span:last-child {
          font-weight: 600;
          font-size: 11.5px;
        }

        .day-card .v-pos { 
          color: #22E3AF; 
        }
        
        .day-card .v-neg { 
          color: #FF4A9A; 
        }

        /* Card de hoje */
        .day-card.today {
          background: linear-gradient(180deg, #00ffc6 0%, #0083ff 100%);
          border: none;
          color: #042030;
          transform: translateY(-6px);
          box-shadow: 0 16px 44px rgba(0,255,166,0.3);
        }

        .day-card.today .badge {
          background: rgba(4,32,48,0.3);
          color: #FFFFFF;
          border: none;
          font-weight: 700;
        }

        .day-card.today .number { 
          color: #042030;
          font-weight: 800;
        }

        .day-card.today .row { 
          color: #042030; 
        }

        .day-card.today .row span:first-child {
          opacity: 0.75;
        }

        .day-card.today .v-pos,
        .day-card.today .v-neg { 
          color: #042030;
          font-weight: 700;
        }
      `}</style>

      <div className={`day-card ${isToday ? 'today' : ''}`}>
        <div className="badge">
          {getDayName(weekday)}
        </div>

        <div className="number">
          {day}
        </div>

        <div className="row">
          <span>Líquido</span>
          <span className="v-pos">{formatValue(liquido)}</span>
        </div>

        <div className="row">
          <span>Renov.</span>
          <span className="v-pos">+{renov}</span>
        </div>

        <div className="row">
          <span>Perdas</span>
          <span className="v-neg">-{perdas}</span>
        </div>
      </div>
    </>
  );
}
