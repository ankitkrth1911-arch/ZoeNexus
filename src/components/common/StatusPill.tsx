import React from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react';
import type { RiskLevel } from '../../types';

interface StatusPillProps {
  status: RiskLevel | 'active' | 'in_transit' | 'resolved' | 'proposed' | 'approved' | 'delivered';
  label?: string;
  size?: 'sm' | 'md';
  showIcon?: boolean;
}

export const StatusPill: React.FC<StatusPillProps> = ({
  status,
  label,
  size = 'md',
  showIcon = true,
}) => {
  let colorClasses = 'bg-[#38bdf8]/10 text-[#38bdf8] border-[#38bdf8]/30';
  let Icon = Info;
  let text = label || status;

  switch (status) {
    case 'critical':
      colorClasses = 'bg-[#ef4444]/15 text-[#ef4444] border-[#ef4444]/35';
      Icon = AlertCircle;
      text = label || 'CRITICAL';
      break;
    case 'warning':
      colorClasses = 'bg-[#f59e0b]/15 text-[#f59e0b] border-[#f59e0b]/35';
      Icon = AlertTriangle;
      text = label || 'WARNING';
      break;
    case 'healthy':
    case 'resolved':
    case 'approved':
    case 'delivered':
      colorClasses = 'bg-[#10b981]/15 text-[#10b981] border-[#10b981]/35';
      Icon = CheckCircle2;
      text = label || (status === 'approved' ? 'APPROVED' : status === 'delivered' ? 'DELIVERED' : 'HEALTHY');
      break;
    case 'in_transit':
      colorClasses = 'bg-[#00e5bc]/15 text-[#00e5bc] border-[#00e5bc]/35';
      Icon = Info;
      text = label || 'IN TRANSIT';
      break;
    case 'proposed':
    case 'active':
    case 'info':
    default:
      colorClasses = 'bg-[#38bdf8]/15 text-[#38bdf8] border-[#38bdf8]/35';
      Icon = Info;
      text = label || String(status).toUpperCase();
      break;
  }

  const sizeClasses =
    size === 'sm'
      ? 'text-[11px] py-0.5 px-2 gap-1'
      : 'text-[12px] py-1 px-2.5 gap-1.5 font-medium';

  return (
    <span
      className={`inline-flex items-center rounded-full border mono-data tracking-wide uppercase transition-all ${sizeClasses} ${colorClasses}`}
    >
      {showIcon && <Icon className={size === 'sm' ? 'w-3 h-3' : 'w-3.5 h-3.5'} />}
      <span>{text}</span>
    </span>
  );
};
