import { LucideIcon } from 'lucide-react';
import { cn } from './ui/utils';

interface CyberButtonProps {
  id: string;
  label: string;
  icon: LucideIcon;
  isActive: boolean;
  onClick: () => void;
}

export function CyberButton({ id, label, icon: Icon, isActive, onClick }: CyberButtonProps) {
  return (
    <div className="cyber-radio-wrapper">
      <input
        type="radio"
        name="navigation"
        id={`cyber-${id}`}
        checked={isActive}
        onChange={onClick}
        className="cyber-input"
      />
      <label htmlFor={`cyber-${id}`} className="cyber-btn">
        <span className="cyber-btn__glitch">
          {label}
        </span>
        <span className="cyber-btn__content">
          {label}
        </span>
      </label>
    </div>
  );
}