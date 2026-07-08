import { getStatusColor, getStatusLabel } from '../../utils/helpers';

export default function StatusBadge({ status }) {
  const colorKey = getStatusColor(status);
  const label = getStatusLabel(status);

  // Mapping to standard premium tailwind colors with background, text, border, and a status dot
  const styles = {
    gold: {
      bg: 'bg-amber-50',
      text: 'text-amber-700',
      border: 'border-amber-200/60',
      dot: 'bg-amber-500'
    },
    blue: {
      bg: 'bg-blue-50',
      text: 'text-blue-700',
      border: 'border-blue-200/60',
      dot: 'bg-blue-500'
    },
    lavender: {
      bg: 'bg-indigo-50',
      text: 'text-indigo-700',
      border: 'border-indigo-200/60',
      dot: 'bg-indigo-500'
    },
    mint: {
      bg: 'bg-emerald-50',
      text: 'text-emerald-700',
      border: 'border-emerald-200/60',
      dot: 'bg-emerald-500'
    },
    coral: {
      bg: 'bg-rose-50',
      text: 'text-rose-700',
      border: 'border-rose-200/60',
      dot: 'bg-rose-500'
    },
    gray: {
      bg: 'bg-slate-50',
      text: 'text-slate-700',
      border: 'border-slate-200/60',
      dot: 'bg-slate-400'
    },
  };

  const style = styles[colorKey] || styles.gray;

  return (
    <span 
      className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-bold tracking-wide uppercase font-body whitespace-nowrap ${style.bg} ${style.text} ${style.border}`}
    >
      <span className={`w-1.5 h-1.5 rounded-full ${style.dot}`}></span>
      {label}
    </span>
  );
}