import { LucideIcon } from 'lucide-react';

interface CompactKPICardProps {
  label: string;
  value: string;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  icon: LucideIcon;
  gradient: string;
}

export const CompactKPICard = ({
  label,
  value,
  change,
  changeType = 'neutral',
  icon: Icon,
  gradient,
}: CompactKPICardProps) => {
  const changeColors = {
    positive: '#22e3af',
    negative: '#ff4a9a',
    neutral: '#7a8aae',
  };

  return (
    <div className="compact-kpi-card">
      <style>{`
        .compact-kpi-card {
          position: relative;
          background: radial-gradient(circle at top, rgba(17, 24, 39, 0.8) 0%, rgba(11, 15, 24, 0.6) 100%);
          border: 1px solid rgba(255, 255, 255, 0.03);
          border-radius: 14px;
          padding: 16px 18px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
        }

        .compact-kpi-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 2px;
          background: ${gradient};
          opacity: 0.5;
          transition: opacity 0.3s;
        }

        .compact-kpi-card:hover::before {
          opacity: 0.8;
        }

        .compact-kpi-card:hover {
          transform: translateY(-2px);
          border-color: rgba(255, 255, 255, 0.06);
          box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
        }

        .kpi-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 12px;
        }

        .kpi-label {
          font-size: 11.5px;
          font-weight: 500;
          color: #7a8aae;
          letter-spacing: 0.01em;
        }

        .kpi-icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 28px;
          height: 28px;
          border-radius: 8px;
          background: rgba(255, 255, 255, 0.05);
          position: relative;
          overflow: hidden;
        }

        .kpi-icon-wrapper::before {
          content: '';
          position: absolute;
          inset: 0;
          background: ${gradient};
          opacity: 0.2;
        }

        .kpi-value {
          font-size: 26px;
          font-weight: 700;
          color: #eaf2ff;
          line-height: 1;
          margin-bottom: 6px;
          letter-spacing: -0.02em;
        }

        .kpi-change {
          font-size: 11.5px;
          font-weight: 600;
          display: inline-flex;
          align-items: center;
          gap: 4px;
        }
      `}</style>

      <div className="kpi-header">
        <span className="kpi-label">{label}</span>
        <div className="kpi-icon-wrapper">
          <Icon className="w-4 h-4 text-white relative z-10" style={{ opacity: 0.6 }} />
        </div>
      </div>

      <div className="kpi-value">{value}</div>

      {change && (
        <span className="kpi-change" style={{ color: changeColors[changeType] }}>
          {change}
        </span>
      )}
    </div>
  );
};
