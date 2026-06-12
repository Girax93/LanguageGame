interface Props {
  icon: string;
  label: string;
  value: string | number;
}

export function StatPill({ icon, label, value }: Props) {
  return (
    <div className="flex items-center gap-2 rounded-full bg-white/10 px-3 py-1.5 text-sm backdrop-blur">
      <span aria-hidden>{icon}</span>
      <span className="font-semibold text-white">{value}</span>
      <span className="text-white/50">{label}</span>
    </div>
  );
}
