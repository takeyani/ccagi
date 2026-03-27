export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-slate-100 via-indigo-50 to-purple-50" />
      <div className="absolute inset-0 opacity-40" style={{ backgroundImage: 'radial-gradient(circle at 20% 80%, rgba(99,102,241,0.15) 0%, transparent 50%), radial-gradient(circle at 80% 20%, rgba(168,85,247,0.15) 0%, transparent 50%)' }} />
      <div className="relative z-10">{children}</div>
    </div>
  );
}
