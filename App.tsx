
import React, { useState, useEffect, useCallback } from 'react';
import { 
  Home, FileText, Users, Plus, ArrowLeft, DollarSign, 
  Calendar as CalendarIcon, Loader2, Database, ShieldCheck, 
  RefreshCcw, Wifi, CloudOff, Server, Download, Settings as SettingsIcon,
  AlertCircle
} from 'lucide-react';
import { AppView, Client, Product, Service, Quote, CompanyProfile, Expense, Appointment } from './types';
import { supabase, checkConnectivity, saveConfig, isConfigured, resetApp } from './supabase';
import ClientManager from './components/ClientManager';
import QuoteEditor from './components/QuoteEditor';
import SettingsManager from './components/SettingsManager';
import Dashboard from './components/Dashboard';
import QuoteList from './components/QuoteList';
import FinanceManager from './components/FinanceManager';
import CalendarManager from './components/CalendarManager';
import ReportEditor from './components/ReportEditor';
import SplashScreen from './components/SplashScreen';
import Logo from '@/components/Logo'

const App: React.FC = () => {
  const [view, setView] = useState<AppView>('dashboard');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [loading, setLoading] = useState(true);
  const [showSplash, setShowSplash] = useState(true);
  const [setupMode, setSetupMode] = useState(!isConfigured());
  const [schemaMissing, setSchemaMissing] = useState(false);
  
  // States Locais (Fontes de verdade imediatas)
  const [clients, setClients] = useState<Client[]>(JSON.parse(localStorage.getItem('VSI_CLIENTS') || '[]'));
  const [products, setProducts] = useState<Product[]>(JSON.parse(localStorage.getItem('VSI_PRODUCTS') || '[]'));
  const [services, setServices] = useState<Service[]>(JSON.parse(localStorage.getItem('VSI_SERVICES') || '[]'));
  const [quotes, setQuotes] = useState<Quote[]>(JSON.parse(localStorage.getItem('VSI_QUOTES') || '[]'));
  const [expenses, setExpenses] = useState<Expense[]>(JSON.parse(localStorage.getItem('VSI_EXPENSES') || '[]'));
  const [appointments, setAppointments] = useState<Appointment[]>(JSON.parse(localStorage.getItem('VSI_APPTS') || '[]'));
  const [company, setCompany] = useState<CompanyProfile>(JSON.parse(localStorage.getItem('VSI_COMPANY') || '{"name":"Sua Empresa","cnpj":"","address":"","number":"","city":"","state":"","phone":"","email":"","serviceTaxRate":0,"travelRatePerKm":0}'));

  const [editingQuote, setEditingQuote] = useState<Quote | null>(null);
  const [reportQuote, setReportQuote] = useState<Quote | null>(null);

  // Form Config
  const [formUrl, setFormUrl] = useState(localStorage.getItem('VSI_SUPABASE_URL') || '');
  const [formKey, setFormKey] = useState(localStorage.getItem('VSI_SUPABASE_KEY') || '');
  const [testStatus, setTestStatus] = useState<{ type: 'idle' | 'loading' | 'success' | 'error', msg: string }>({ type: 'idle', msg: '' });

  const persist = (key: string, data: any) => localStorage.setItem(`VSI_${key}`, JSON.stringify(data));

  // Sincronização agora é estritamente manual ou apenas no boot
  const syncData = useCallback(async () => {
    if (!navigator.onLine || !supabase || setupMode) {
      setLoading(false);
      return;
    }
    
    try {
      const { error: ping } = await supabase.from('clients').select('id').limit(0);
      if (ping && ping.code === '42P01') {
        setSchemaMissing(true);
        setSetupMode(true);
        setLoading(false);
        return;
      }

      const [resC, resP, resS, resQ, resE, resA, resComp] = await Promise.all([
        supabase.from('clients').select('*'),
        supabase.from('products').select('*'),
        supabase.from('services').select('*'),
        supabase.from('quotes').select('*').order('created_at', { ascending: false }),
        supabase.from('expenses').select('*'),
        supabase.from('appointments').select('*'),
        supabase.from('company_profile').select('*').limit(1).maybeSingle()
      ]);

      if (resC.data) { setClients(resC.data); persist('CLIENTS', resC.data); }
      if (resP.data) { setProducts(resP.data); persist('PRODUCTS', resP.data); }
      if (resS.data) { setServices(resS.data); persist('SERVICES', resS.data); }
      if (resQ.data) { setQuotes(resQ.data); persist('QUOTES', resQ.data); }
      if (resE.data) { setExpenses(resE.data); persist('EXPENSES', resE.data); }
      if (resA.data) { setAppointments(resA.data); persist('APPTS', resA.data); }
      if (resComp.data) { setCompany(resComp.data); persist('COMPANY', resComp.data); }
      
    } catch (err) {
      console.warn("Cloud offline. Operando em modo local.");
    } finally {
      setLoading(false);
    }
  }, [setupMode]);

  useEffect(() => {
    // Sincroniza apenas UMA VEZ no início
    syncData();
    const timer = setTimeout(() => setShowSplash(false), 2500);
    
    // Atualiza apenas o ícone de status, sem disparar syncData() automático
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearTimeout(timer);
    };
  }, [syncData]);

  // Handlers simplificados: Atualizam localmente e tentam enviar para a nuvem sem recarregar tudo
  const handleUpdateClients = (newClients: Client[]) => {
    setClients(newClients);
    persist('CLIENTS', newClients);
    if (isOnline && supabase) {
      supabase.from('clients').upsert(newClients).then();
    }
  };

  const handleUpdateProducts = (newProducts: Product[]) => {
    setProducts(newProducts);
    persist('PRODUCTS', newProducts);
    if (isOnline && supabase) {
      supabase.from('products').upsert(newProducts).then();
    }
  };

  const handleUpdateServices = (newServices: Service[]) => {
    setServices(newServices);
    persist('SERVICES', newServices);
    if (isOnline && supabase) {
      supabase.from('services').upsert(newServices).then();
    }
  };

  const handleSaveQuote = (quote: Quote) => {
    const isNew = quote.id.startsWith('L_') || quote.id.length < 10;
    const tempId = isNew ? crypto.randomUUID() : quote.id;
    const newQuote = { ...quote, id: tempId };

    const updatedQuotes = isNew ? [newQuote, ...quotes] : quotes.map(q => q.id === quote.id ? newQuote : q);
    setQuotes(updatedQuotes);
    persist('QUOTES', updatedQuotes);
    setView('quotes');

    if (isOnline && supabase) {
      supabase.from('quotes').upsert({
        ...newQuote,
        client_id: newQuote.clientId,
      }).then();
    }
  };

  const handleSaveConfig = async () => {
    setTestStatus({ type: 'loading', msg: 'Conectando...' });
    const res = await checkConnectivity(formUrl, formKey);
    if (res.success) {
      saveConfig(formUrl, formKey);
    } else {
      setTestStatus({ type: 'error', msg: `Erro: ${res.error}` });
    }
  };

  if (showSplash) return <SplashScreen />;

  if (setupMode) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-slate-950 p-6">
        <Logo className="h-8 text-black dark:text-white" />
        <div className="w-full max-w-sm space-y-4">
          <input value={formUrl} onChange={e => setFormUrl(e.target.value)} placeholder="Supabase URL" className="w-full p-5 bg-slate-900 rounded-2xl border border-slate-800 text-white" />
          <input value={formKey} onChange={e => setFormKey(e.target.value)} type="password" placeholder="Anon Key" className="w-full p-5 bg-slate-900 rounded-2xl border border-slate-800 text-white" />
          <button onClick={handleSaveConfig} className="w-full bg-[#D1101E] text-white py-5 rounded-full font-black uppercase">ATIVAR APP</button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-slate-50 overflow-hidden">
      <header className="bg-white border-b border-slate-200 px-6 h-16 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-3">
          {view !== 'dashboard' && <button onClick={() => setView('dashboard')} className="p-1 text-slate-400"><ArrowLeft size={24} /></button>}
         <Logo className="h-8 text-black dark:text-white" />
        </div>
        <div className="flex items-center gap-3">
          <div className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase ${isOnline ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {isOnline ? <Wifi size={12} className="inline mr-1" /> : <CloudOff size={12} className="inline mr-1" />}
            {isOnline ? 'CONECTADO' : 'OFFLINE'}
          </div>
          <button onClick={syncData} className="p-2 bg-slate-100 rounded-xl text-slate-400 active:rotate-180 transition-transform"><RefreshCcw size={16}/></button>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto pb-24 px-4 pt-4">
        {loading ? (
          <div className="h-full flex flex-col items-center justify-center">
            <Loader2 className="animate-spin text-[#D1101E]" size={40} />
          </div>
        ) : (
          <>
            {view === 'dashboard' && <Dashboard quotes={quotes} clients={clients} expenses={expenses} appointments={appointments} products={products} services={services} company={company} onNavigate={setView} onUpdateProducts={handleUpdateProducts} onUpdateServices={handleUpdateServices} />}
            {view === 'quotes' && <QuoteList quotes={quotes} clients={clients} company={company} onEdit={(q) => { setEditingQuote(q); setView('new-quote'); }} onReport={(q) => { setReportQuote(q); setView('report-editor'); }} onDelete={(id) => { setQuotes(quotes.filter(x => x.id !== id)); persist('QUOTES', quotes.filter(x => x.id !== id)); if(isOnline) supabase?.from('quotes').delete().eq('id', id); }} onStatusChange={() => {}} onInvoice={() => {}} />}
            {view === 'calendar' && <CalendarManager appointments={appointments} quotes={quotes} clients={clients} company={company} onUpdate={(appts) => { setAppointments(appts); persist('APPTS', appts); }} />}
            {view === 'clients' && <ClientManager clients={clients} onUpdate={handleUpdateClients} />}
            {view === 'finance' && <FinanceManager quotes={quotes} expenses={expenses} onUpdateExpenses={(ex) => { setExpenses(ex); persist('EXPENSES', ex); }} />}
            {view === 'new-quote' && <QuoteEditor quote={editingQuote} clients={clients} products={products} services={services} company={company} onSave={handleSaveQuote} onCancel={() => setView('quotes')} />}
            {view === 'report-editor' && reportQuote && <ReportEditor quote={reportQuote} client={clients.find(c => c.id === reportQuote.clientId)!} company={company} onSave={handleSaveQuote} onCancel={() => setView('quotes')} />}
            {view === 'settings' && <SettingsManager company={company} onUpdate={(c) => { setCompany(c); persist('COMPANY', c); }} />}
          </>
        )}
      </main>

      {!['new-quote', 'report-editor'].includes(view) && (
        <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 h-20 flex items-center justify-around z-40">
          <NavBtn icon={<Home size={22} />} label="VSI" active={view === 'dashboard'} onClick={() => setView('dashboard')} />
          <NavBtn icon={<FileText size={22} />} label="Docs" active={view === 'quotes'} onClick={() => setView('quotes')} />
          <NavBtn icon={<CalendarIcon size={22} />} label="Agenda" active={view === 'calendar'} onClick={() => setView('calendar')} />
          <NavBtn icon={<DollarSign size={22} />} label="Caixa" active={view === 'finance'} onClick={() => setView('finance')} />
          <NavBtn icon={<Users size={22} />} label="Clientes" active={view === 'clients'} onClick={() => setView('clients')} />
        </nav>
      )}

      {!['new-quote', 'report-editor', 'settings'].includes(view) && (
        <button onClick={() => { setEditingQuote(null); setView('new-quote'); }} className="fixed bottom-24 right-6 bg-[#D1101E] text-white w-16 h-16 rounded-full shadow-2xl flex items-center justify-center z-50">
          <Plus size={32} />
        </button>
      )}
    </div>
  );
};

const NavBtn: React.FC<{ icon: any, label: string, active: boolean, onClick: () => void }> = ({ icon, label, active, onClick }) => (
  <button onClick={onClick} className={`flex flex-col items-center justify-center flex-1 ${active ? 'text-[#D1101E]' : 'text-slate-400'}`}>
    {icon}
    <span className="text-[10px] mt-1 font-black uppercase tracking-tighter">{label}</span>
  </button>
);

export default App;
