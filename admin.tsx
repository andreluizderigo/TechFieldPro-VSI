
import React, { useState, useEffect, useCallback } from 'react';
import { createRoot } from 'react-dom/client';
import { 
  LayoutDashboard, FileText, Users, Package, Settings, 
  BarChart3, Globe, Database, LogOut, ChevronRight, 
  Wifi, CloudOff, Loader2, DollarSign, Hammer, Monitor,
  Download, CheckCircle2, AlertTriangle, X
} from 'lucide-react';
import { AppView, Client, Product, Service, Quote, CompanyProfile, Expense } from './types';
import { supabase, isConfigured } from './supabase';
import Logo from '@/components/Logo'

const AdminPortal: React.FC = () => {
  const [view, setView] = useState<AppView>('dashboard');
  const [syncing, setSyncing] = useState(false);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [company, setCompany] = useState<CompanyProfile>(JSON.parse(localStorage.getItem('VSI_COMPANY') || '{}'));
  
  // Lógica de Instalação Desktop (PWA)
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);

  // States Locais
  const [clients, setClients] = useState<Client[]>(JSON.parse(localStorage.getItem('VSI_CLIENTS') || '[]'));
  const [quotes, setQuotes] = useState<Quote[]>(JSON.parse(localStorage.getItem('VSI_QUOTES') || '[]'));
  const [expenses, setExpenses] = useState<Expense[]>(JSON.parse(localStorage.getItem('VSI_EXPENSES') || '[]'));

  const sync = useCallback(async () => {
    if (!navigator.onLine || !supabase || !isConfigured()) return;
    setSyncing(true);
    try {
      const [resC, resQ, resE] = await Promise.all([
        supabase.from('clients').select('*'),
        supabase.from('quotes').select('*').order('created_at', { ascending: false }),
        supabase.from('expenses').select('*')
      ]);
      if (resC.data) { setClients(resC.data); localStorage.setItem('VSI_CLIENTS', JSON.stringify(resC.data)); }
      if (resQ.data) { setQuotes(resQ.data); localStorage.setItem('VSI_QUOTES', JSON.stringify(resQ.data)); }
      if (resE.data) { setExpenses(resE.data); localStorage.setItem('VSI_EXPENSES', JSON.stringify(resE.data)); }
    } finally {
      setSyncing(false);
    }
  }, []);

  useEffect(() => {
    sync();
    
    // Captura o evento de instalação do navegador
    window.addEventListener('beforeinstallprompt', (e) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowInstallBanner(true);
    });

    // Detecta se já está rodando como App instalado
    if (window.matchMedia('(display-mode: standalone)').matches) {
      setShowInstallBanner(false);
    }

    window.addEventListener('online', () => { setIsOnline(true); sync(); });
    window.addEventListener('offline', () => setIsOnline(false));
  }, [sync]);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === 'accepted') {
      setShowInstallBanner(false);
    }
    setDeferredPrompt(null);
  };

  return (
    <div className="flex h-screen text-slate-200 bg-slate-950">
      {/* Sidebar de Gestão */}
      <aside className="w-72 bg-slate-950 border-r border-slate-900 flex flex-col p-6 space-y-8 z-20">
        <div className="flex items-center gap-3">
         <Logo className="h-8 text-black dark:text-white" />
          <div>
            <h1 className="font-black text-white tracking-tighter text-lg leading-none">VSI COMMAND</h1>
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mt-1">Global Center</p>
          </div>
        </div>

        <nav className="flex-1 space-y-1">
          <SidebarLink icon={<LayoutDashboard size={20} />} label="Overview" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
          <SidebarLink icon={<FileText size={20} />} label="Propostas" active={view === 'quotes'} onClick={() => setView('quotes')} />
          <SidebarLink icon={<Users size={20} />} label="Clientes" active={view === 'clients'} onClick={() => setView('clients')} />
          <SidebarLink icon={<Hammer size={20} />} label="Serviços" active={view === 'inventory'} onClick={() => setView('inventory')} />
          <SidebarLink icon={<DollarSign size={20} />} label="Financeiro" active={view === 'finance'} onClick={() => setView('finance')} />
          <SidebarLink icon={<Settings size={20} />} label="Configuração" active={view === 'settings'} onClick={() => setView('settings')} />
        </nav>

        {/* Status e Instalação */}
        <div className="space-y-4">
           {showInstallBanner && (
              <button 
                onClick={handleInstallClick}
                className="w-full p-4 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl text-left relative overflow-hidden group active:scale-95 transition-all shadow-xl shadow-blue-900/20"
              >
                <div className="relative z-10">
                  <p className="text-[9px] font-black uppercase tracking-widest text-blue-100">Windows Installer</p>
                  <p className="text-xs font-black text-white mt-1">Instalar no Computador</p>
                  <Download size={14} className="mt-2 text-white/70" />
                </div>
                <div className="absolute -right-4 -bottom-4 opacity-10 group-hover:scale-110 transition-transform">
                  <Monitor size={80} />
                </div>
              </button>
           )}

          <div className="p-4 bg-slate-900/50 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between text-[10px] font-black uppercase">
              <span className="text-slate-500">Cloud Status</span>
              <span className={isOnline ? 'text-green-500' : 'text-red-500'}>{isOnline ? 'Online' : 'Offline'}</span>
            </div>
            <button 
              onClick={sync}
              disabled={syncing}
              className="w-full py-2 bg-slate-800 rounded-lg text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 hover:bg-slate-700 transition-all"
            >
              {syncing ? <Loader2 size={12} className="animate-spin" /> : <Database size={12} />}
              Force Sync
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto bg-slate-950 p-10 relative">
        {/* Aviso de Instalação no Topo caso detectado */}
        {showInstallBanner && (
          <div className="mb-8 flex items-center justify-between bg-blue-500/10 border border-blue-500/20 p-4 rounded-3xl animate-in slide-in-from-top-4 duration-500">
            <div className="flex items-center gap-4">
               <div className="bg-blue-500 p-2 rounded-xl text-white">
                 <Monitor size={20} />
               </div>
               <div>
                 <p className="text-sm font-black text-white">VSI para Windows</p>
                 <p className="text-[10px] font-medium text-blue-300 uppercase tracking-widest">Acesse sem navegador e de forma mais rápida no seu PC.</p>
               </div>
            </div>
            <div className="flex gap-2">
               <button onClick={handleInstallClick} className="px-5 py-2.5 bg-blue-500 hover:bg-blue-400 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all">Instalar Agora</button>
               <button onClick={() => setShowInstallBanner(false)} className="p-2.5 text-slate-500 hover:text-white"><X size={20}/></button>
            </div>
          </div>
        )}

        <header className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-3xl font-black text-white capitalize">{view}</h2>
            <p className="text-slate-500 text-sm mt-1">Gerenciamento Estratégico VSI Telecom</p>
          </div>
          <div className="flex items-center gap-4">
             <div className="text-right">
                <p className="text-xs font-black text-slate-400 uppercase tracking-widest">{company.name || 'Empresa VSI'}</p>
                <p className="text-[10px] text-slate-600 font-bold">{company.cnpj || 'ID Pendente'}</p>
             </div>
             <div className="w-12 h-12 bg-slate-900 rounded-full border border-slate-800 flex items-center justify-center">
               <Logo className="h-8 text-black dark:text-white" />
             </div>
          </div>
        </header>

        <div className="grid grid-cols-12 gap-8">
           <div className="col-span-8 space-y-8">
              {/* Dashboard stats simplified for desktop view */}
              <div className="grid grid-cols-3 gap-6">
                <StatsCard title="Entradas" value={quotes.filter(q => q.status === 'approved' || q.status === 'invoiced').reduce((a, b) => a + b.total, 0)} icon={<TrendingUp className="text-green-500" size={18} />} color="green" />
                <StatsCard title="Saídas" value={expenses.reduce((a, b) => a + b.amount, 0)} icon={<TrendingDown className="text-red-500" size={18} />} color="red" />
                <StatsCard title="Margem" value={quotes.reduce((a, b) => a + b.total, 0) - expenses.reduce((a, b) => a + b.amount, 0)} icon={<BarChart3 className="text-blue-500" size={18} />} color="blue" />
              </div>

              <section className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8">
                 <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <BarChart3 size={14} className="text-[#D1101E]" /> Performance Mensal Consolida
                 </h3>
                 <div className="h-64 flex items-end gap-3 px-2">
                    {[30, 60, 40, 80, 50, 70, 45, 90, 65, 85, 75, 100].map((h, i) => (
                      <div key={i} className="flex-1 group relative">
                        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 bg-slate-800 text-[10px] font-black text-white px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity">R$ {h}k</div>
                        <div className="w-full bg-gradient-to-t from-[#D1101E]/20 to-[#D1101E] rounded-t-xl transition-all duration-700 cursor-pointer" style={{ height: `${h}%` }}></div>
                      </div>
                    ))}
                 </div>
                 <div className="flex justify-between mt-4 px-2 text-[9px] font-black text-slate-600 uppercase tracking-widest">
                    <span>Jan</span><span>Fev</span><span>Mar</span><span>Abr</span><span>Mai</span><span>Jun</span><span>Jul</span><span>Ago</span><span>Set</span><span>Out</span><span>Nov</span><span>Dez</span>
                 </div>
              </section>

              {/* Tabela de Dados Estilo Desktop */}
              <section className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] overflow-hidden">
                 <div className="p-6 border-b border-slate-800 flex justify-between items-center bg-white/[0.01]">
                    <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest">Atividades em Tempo Real</h3>
                    <button className="text-[10px] font-black text-[#D1101E] uppercase hover:underline">Exportar Base de Dados</button>
                 </div>
                 <table className="w-full text-left">
                   <thead>
                     <tr className="text-[10px] font-black text-slate-500 uppercase tracking-widest border-b border-slate-800 bg-slate-950">
                       <th className="p-6">Cliente</th>
                       <th className="p-6">Projeto</th>
                       <th className="p-6">Status</th>
                       <th className="p-6">Total</th>
                     </tr>
                   </thead>
                   <tbody className="text-xs">
                     {quotes.slice(0, 8).map(q => (
                       <tr key={q.id} className="border-b border-slate-800 hover:bg-white/[0.03] transition-colors cursor-pointer group">
                         <td className="p-6 font-bold text-slate-200 group-hover:text-white">{clients.find(c => c.id === q.clientId)?.name || 'Cliente'}</td>
                         <td className="p-6 text-slate-400 font-medium">{q.projectName}</td>
                         <td className="p-6">
                           <span className={`px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest ${
                             q.status === 'approved' ? 'bg-green-500/10 text-green-500' : 
                             q.status === 'invoiced' ? 'bg-blue-500/10 text-blue-500' :
                             'bg-slate-800 text-slate-400'
                           }`}>{q.status}</span>
                         </td>
                         <td className="p-6 font-black text-white">R$ {q.total.toLocaleString()}</td>
                       </tr>
                     ))}
                   </tbody>
                 </table>
              </section>
           </div>

           <div className="col-span-4 space-y-8">
              <div className="bg-[#D1101E] rounded-[2.5rem] p-10 text-white relative overflow-hidden shadow-2xl shadow-red-900/30">
               <Logo className="h-8 text-black dark:text-white" />
                <p className="text-[11px] font-black uppercase tracking-[0.3em] opacity-60">Caixa Global</p>
                <h4 className="text-5xl font-black mt-4 tracking-tighter">R$ {quotes.reduce((a, b) => a + b.total, 0).toLocaleString()}</h4>
                <div className="mt-10 pt-10 border-t border-white/20 grid grid-cols-2 gap-8">
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">Clientes</p>
                    <p className="text-2xl font-black">{clients.length}</p>
                  </div>
                  <div className="space-y-1">
                    <p className="text-[10px] font-black uppercase opacity-60 tracking-widest">OS Total</p>
                    <p className="text-2xl font-black">{quotes.length}</p>
                  </div>
                </div>
                <button className="w-full mt-10 py-4 bg-white text-[#D1101E] rounded-2xl font-black uppercase text-[10px] tracking-widest hover:scale-105 active:scale-95 transition-all shadow-xl">Imprimir Balanço</button>
              </div>

              {/* Guia de Atalhos Desktop */}
              <section className="bg-slate-900/50 border border-slate-800 rounded-[2.5rem] p-8">
                 <h3 className="text-xs font-black text-slate-500 uppercase tracking-widest mb-6 flex items-center gap-2">
                    <Monitor size={14} className="text-blue-500" /> VSI Ecosystem
                 </h3>
                 <div className="space-y-4">
                    <ShortcutItem keyLabel="F5" action="Sincronizar Cloud" />
                    <ShortcutItem keyLabel="N" action="Nova Proposta" />
                    <ShortcutItem keyLabel="C" action="Ver Clientes" />
                    <ShortcutItem keyLabel="ESC" action="Voltar" />
                 </div>
                 <div className="mt-8 p-6 bg-slate-950 rounded-3xl border border-slate-800">
                    <div className="flex items-center gap-3 mb-3">
                       <CheckCircle2 size={16} className="text-green-500" />
                       <p className="text-[10px] font-black text-white uppercase tracking-widest">Segurança Bancária</p>
                    </div>
                    <p className="text-[10px] text-slate-500 font-medium leading-relaxed">
                      Conexão criptografada com o Supabase. Seus orçamentos e dados de clientes estão seguros e sincronizados com a equipe de campo.
                    </p>
                 </div>
              </section>
           </div>
        </div>
      </main>
    </div>
  );
};

const ShortcutItem: React.FC<{ keyLabel: string, action: string }> = ({ keyLabel, action }) => (
  <div className="flex items-center justify-between p-3 bg-slate-950 rounded-xl border border-slate-800/50">
    <span className="text-[10px] font-black text-slate-400 uppercase">{action}</span>
    <kbd className="px-2 py-1 bg-slate-800 rounded border border-slate-700 text-[9px] font-black text-white min-w-[30px] text-center">{keyLabel}</kbd>
  </div>
);

const StatsCard: React.FC<{ title: string, value: number, icon: any, color: string }> = ({ title, value, icon, color }) => {
  const colors: any = {
    green: 'border-green-500/20 bg-green-500/5',
    red: 'border-red-500/20 bg-red-500/5',
    blue: 'border-blue-500/20 bg-blue-500/5',
  };
  return (
    <div className={`p-6 rounded-[2rem] border ${colors[color]} space-y-2`}>
      <div className="flex justify-between items-center">
        <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest">{title}</p>
        {icon}
      </div>
      <p className="text-lg font-black text-white">R$ {value.toLocaleString()}</p>
    </div>
  );
};

const SidebarLink: React.FC<{ icon: any, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full flex items-center gap-4 p-4 rounded-2xl transition-all group ${active ? 'bg-[#D1101E] text-white shadow-lg shadow-red-900/20' : 'text-slate-400 hover:bg-slate-900'}`}
  >
    <span className={active ? 'text-white' : 'text-slate-500 group-hover:text-slate-300'}>{icon}</span>
    <span className="text-sm font-bold uppercase tracking-widest">{label}</span>
    {active && <ChevronRight className="ml-auto" size={16} />}
  </button>
);

const TrendingUp: React.FC<any> = ({ size, className }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"></polyline><polyline points="17 6 23 6 23 12"></polyline></svg>;
const TrendingDown: React.FC<any> = ({ size, className }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"></polyline><polyline points="17 18 23 18 23 12"></polyline></svg>;

const root = createRoot(document.getElementById('root')!);
root.render(<AdminPortal />);
