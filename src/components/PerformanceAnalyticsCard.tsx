import { LucideIcon } from 'lucide-react';

interface PerformanceAnalyticsCardProps {
  title: string;
  icon: LucideIcon;
  gradient: string;
  metrics: Array<{
    label: string;
    value: string;
    change: string;
    changeColor: string;
  }>;
  chartData?: Array<{ value: number }>;
  isLive?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export const PerformanceAnalyticsCard = ({
  title,
  icon: Icon,
  gradient,
  metrics,
  chartData,
  isLive,
  action,
}: PerformanceAnalyticsCardProps) => {
  return (
    <div className="group relative">
      <style>{`
        .analytics-card {
          position: relative;
          display: flex;
          flex-direction: column;
          width: 100%;
          border-radius: 16px;
          background: #0a0e1a;
          padding: 18px;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.5);
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        }

        .analytics-card:hover {
          transform: scale(1.02);
        }

        .card-glow {
          position: absolute;
          inset: 0;
          border-radius: 16px;
          background: ${gradient};
          opacity: 0.15;
          filter: blur(8px);
          transition: opacity 0.3s;
        }

        .group:hover .card-glow {
          opacity: 0.25;
        }

        .card-inner {
          position: absolute;
          inset: 1px;
          border-radius: 15px;
          background: #0a0e1a;
        }

        .card-content {
          position: relative;
          z-index: 1;
        }

        .card-header {
          display: flex;
          align-items: center;
          justify-content: space-between;
          margin-bottom: 16px;
        }

        .card-title-group {
          display: flex;
          align-items: center;
          gap: 10px;
        }

        .icon-wrapper {
          display: flex;
          align-items: center;
          justify-content: center;
          width: 36px;
          height: 36px;
          border-radius: 10px;
          background: ${gradient};
        }

        .card-title {
          font-size: 13px;
          font-weight: 600;
          color: #ffffff;
          letter-spacing: -0.01em;
        }

        .live-badge {
          display: flex;
          align-items: center;
          gap: 6px;
          background: rgba(34, 227, 175, 0.1);
          padding: 4px 10px;
          border-radius: 999px;
          font-size: 11px;
          font-weight: 600;
          color: #22e3af;
        }

        .live-dot {
          width: 6px;
          height: 6px;
          border-radius: 999px;
          background: #22e3af;
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }

        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .metrics-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 12px;
          margin-bottom: 16px;
        }

        .metric-box {
          background: rgba(7, 10, 16, 0.4);
          border-radius: 10px;
          padding: 12px;
          border: 1px solid rgba(255, 255, 255, 0.02);
        }

        .metric-label {
          font-size: 11px;
          font-weight: 500;
          color: #7a8aae;
          margin-bottom: 4px;
        }

        .metric-value {
          font-size: 22px;
          font-weight: 700;
          color: #eaf2ff;
          line-height: 1;
          margin-bottom: 4px;
        }

        .metric-change {
          font-size: 11.5px;
          font-weight: 600;
        }

        .chart-container {
          height: 100px;
          width: 100%;
          background: rgba(7, 10, 16, 0.3);
          border-radius: 10px;
          padding: 12px;
          margin-bottom: 16px;
          overflow: hidden;
        }

        .mini-bars {
          display: flex;
          align-items: flex-end;
          justify-content: space-between;
          height: 100%;
          gap: 4px;
        }

        .mini-bar {
          flex: 1;
          background: ${gradient};
          border-radius: 3px 3px 0 0;
          min-height: 8px;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          opacity: 0.7;
        }

        .mini-bar:hover {
          opacity: 1;
          transform: scaleY(1.05);
        }

        .chart-footer {
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 10px;
        }

        .chart-label {
          display: flex;
          align-items: center;
          gap: 8px;
          font-size: 11px;
          font-weight: 500;
          color: #7a8aae;
        }

        .chart-dropdown {
          display: flex;
          align-items: center;
          gap: 4px;
        }

        .action-button {
          display: flex;
          align-items: center;
          gap: 6px;
          background: ${gradient};
          padding: 6px 14px;
          border-radius: 8px;
          font-size: 11.5px;
          font-weight: 600;
          color: #ffffff;
          border: none;
          cursor: pointer;
          transition: all 0.2s;
        }

        .action-button:hover {
          filter: brightness(1.1);
          transform: translateY(-1px);
        }

        .action-arrow {
          width: 12px;
          height: 12px;
        }
      `}</style>

      <div className="analytics-card">
        <div className="card-glow"></div>
        <div className="card-inner"></div>
        
        <div className="card-content">
          {/* Header */}
          <div className="card-header">
            <div className="card-title-group">
              <div className="icon-wrapper">
                <Icon className="w-4 h-4 text-white" />
              </div>
              <h3 className="card-title">{title}</h3>
            </div>

            {isLive && (
              <span className="live-badge">
                <span className="live-dot"></span>
                Live
              </span>
            )}
          </div>

          {/* Metrics Grid */}
          <div className="metrics-grid">
            {metrics.map((metric, index) => (
              <div key={index} className="metric-box">
                <p className="metric-label">{metric.label}</p>
                <p className="metric-value">{metric.value}</p>
                <span className="metric-change" style={{ color: metric.changeColor }}>
                  {metric.change}
                </span>
              </div>
            ))}
          </div>

          {/* Chart */}
          {chartData && chartData.length > 0 && (
            <div className="chart-container">
              <div className="mini-bars">
                {chartData.map((entry, index) => {
                  const maxValue = Math.max(...chartData.map(d => d.value));
                  const height = (entry.value / maxValue) * 100;
                  return (
                    <div
                      key={index}
                      className="mini-bar"
                      style={{ height: `${height}%` }}
                    />
                  );
                })}
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="chart-footer">
            <div className="chart-label">
              <span>Last 7 days</span>
              <svg
                className="w-3.5 h-3.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 9l-7 7-7-7"
                />
              </svg>
            </div>

            {action && (
              <button className="action-button" onClick={action.onClick}>
                {action.label}
                <svg
                  className="action-arrow"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 5l7 7-7 7"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
