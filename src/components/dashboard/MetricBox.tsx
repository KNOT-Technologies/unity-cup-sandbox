import type { LucideIcon } from 'lucide-react';

interface MetricBoxProps {
  title: string;
  value: string;
  subtitle: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
}

const MetricBox = ({ title, value, subtitle, icon: Icon, trend }: MetricBoxProps) => {
  return (
    <div className="bg-black/20 backdrop-blur-md rounded-xl border border-white/10 overflow-hidden
      hover:border-amber-500/20 transition-all duration-500 
      hover:shadow-2xl hover:shadow-amber-500/5 p-6"
    >
      <div className="flex items-center gap-3 mb-4">
        <div className="relative">
          <div className="absolute -inset-2 bg-gradient-to-r from-amber-500/30 to-amber-500/0 rounded-full blur-xl opacity-50"></div>
          <div className="bg-gradient-to-br from-amber-500/20 to-amber-500/5 rounded-lg p-2 relative
            backdrop-blur-xl border border-amber-500/20 transition-[border,background] duration-300 delay-200">
            <Icon className="w-5 h-5 text-amber-400" />
          </div>
        </div>
        <h3 className="text-base font-medium text-white/60">{title}</h3>
      </div>

      <div className="h-px w-full bg-gradient-to-r from-amber-500/20 via-amber-500/10 to-transparent mb-4"></div>

      <div className="space-y-1">
        <div className="text-3xl font-semibold text-white">{value}</div>
        <div className="text-sm text-white/60">{subtitle}</div>
        {trend && (
          <div className={`text-sm font-medium ${trend.isPositive ? 'text-emerald-400' : 'text-red-400'} mt-2`}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}% from last month
          </div>
        )}
      </div>
    </div>
  );
};

export default MetricBox; 