export default function Input({ label, className = '', ...props }) {
  return (
    <div className="space-y-2">
      {label && <label className="text-sm font-medium text-slate-700">{label}</label>}
      <input className={`w-full rounded-xl border border-slate-200 px-4 py-3 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 ${className}`} {...props} />
    </div>
  );
}
