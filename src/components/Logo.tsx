import logoAutonomyx from 'figma:asset/983cdf03bee071ccf6b4788a7db9b5cae006cf8d.png';

interface LogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
}

export function Logo({ size = 'md', showText = true }: LogoProps) {
  const sizeClasses = {
    sm: 'h-6 w-6',
    md: 'h-10 w-10',
    lg: 'h-16 w-16',
  };

  const textSizeClasses = {
    sm: 'text-xs',
    md: 'text-sm',
    lg: 'text-lg',
  };

  return (
    <div className="flex items-center gap-3">
      {/* Logo AUTONOMYX */}
      <img 
        src={logoAutonomyx} 
        alt="AUTONOMYX Logo" 
        className={`${sizeClasses[size]} object-contain flex-shrink-0`}
      />
      
      {showText && (
        <div className="grid flex-1 text-left leading-tight">
          <span className={`${textSizeClasses[size]} truncate font-semibold text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-pink-500`}>
            AUTONOMYX
          </span>
          <span className="truncate text-xs text-slate-400">Dashboard IPTV</span>
        </div>
      )}
    </div>
  );
}
