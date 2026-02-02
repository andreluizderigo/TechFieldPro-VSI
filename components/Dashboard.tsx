
import React from 'react';
import { Quote, Client, AppView, Expense, Appointment, Product, Service, CompanyProfile } from '../types';
import { 
  Clock, 
  ArrowUpRight, 
  ArrowDownRight, 
  Calculator, 
  Calendar as CalendarIcon,
  Building2,
  Phone,
  Globe,
  Edit,
  Hammer,
  Package
} from 'lucide-react';
import InventoryManager from './InventoryManager';
import TechBot from './TechBot';

interface DashboardProps {
  quotes: Quote[];
  clients: Client[];
  expenses: Expense[];
  appointments: Appointment[];
  products: Product[];
  services: Service[];
  company: CompanyProfile;
  onNavigate: (view: AppView) => void;
  onUpdateProducts: (products: Product[]) => void;
  onUpdateServices: (services: Service[]) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ 
  quotes, 
  clients, 
  expenses, 
  appointments, 
  products, 
  services, 
  company, 
  onNavigate,
  onUpdateProducts,
  onUpdateServices
}) => {
  const approvedQuotes = quotes.filter(q => q.status === 'approved' || q.status === 'invoiced');
  const pendingQuotes = quotes.filter(q => q.status === 'sent');
  const draftQuotes = quotes.filter(q => q.status === 'draft');

  const grossEarnings = approvedQuotes.reduce((acc, curr) => acc + curr.total, 0);
  const totalCOGS = approvedQuotes.reduce((acc, quote) => {
    const quoteCost = quote.items.reduce((itemAcc, item) => itemAcc + (item.costPrice * item.quantity), 0);
    return acc + quoteCost;
  }, 0);
  const totalFixedExpenses = expenses.reduce((acc, curr) => acc + curr.amount, 0);
  const netProfit = grossEarnings - totalCOGS - totalFixedExpenses;

  const today = new Date().toISOString().split('T')[0];
  const upcomingAppts = appointments
    .filter(a => a.date >= today)
    .sort((a, b) => (a.date + a.startTime).localeCompare(b.date + b.startTime))
    .slice(0, 3);

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 px-1">
      {/* 1. Header Financeiro */}
      <section className="bg-slate-900 rounded-[2.5rem] p-8 text-white shadow-2xl relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-[#D1101E] rounded-full blur-[80px] opacity-20"></div>
        <div className="flex justify-between items-start mb-8">
            <div>
                <p className="text-[#D1101E] text-[10px] font-black uppercase tracking-[0.2em] mb-1">Lucro Líquido Real</p>
                <h2 className="text-4xl font-black">R$ {netProfit.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</h2>
            </div>
            <div className={`p-3 rounded-2xl ${netProfit >= 0 ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'}`}>
                {netProfit >= 0 ? <ArrowUpRight size={24} /> : <ArrowDownRight size={24} />}
            </div>
        </div>
        <div className="grid grid-cols-2 gap-6 border-t border-white/10 pt-6">
            <div>
                <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">Receita</p>
                <p className="text-xl font-bold text-green-400">R$ {grossEarnings.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
                <p className="text-white/40 text-[9px] font-black uppercase tracking-widest mb-1">Custo Total</p>
                <p className="text-xl font-bold text-red-400">R$ {(totalFixedExpenses + totalCOGS).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
        </div>
      </section>

      {/* 2. Próximas Instalações */}
      <section className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
            <CalendarIcon size={14} className="text-[#D1101E]" /> Próximas Instalações
          </h3>
          <button onClick={() => onNavigate('calendar')} className="text-[#D1101E] text-[10px] font-black uppercase">Ver Agenda</button>
        </div>
        <div className="space-y-3">
          {upcomingAppts.map(appt => {
            const client = clients.find(c => c.id === appt.clientId);
            const quote = quotes.find(q => q.id === appt.quoteId);
            return (
              <div key={appt.id} className="flex items-center gap-4 bg-slate-50 p-3 rounded-2xl">
                <div className="bg-white w-10 h-10 rounded-xl flex flex-col items-center justify-center border border-slate-100 min-w-[40px]">
                  <span className="text-[8px] font-black text-[#D1101E] leading-none uppercase">{new Date(appt.date + 'T12:00:00').toLocaleDateString('pt-BR', { month: 'short' })}</span>
                  <span className="text-sm font-black text-slate-900 leading-none mt-0.5">{appt.date.split('-')[2]}</span>
                </div>
                <div className="flex-1 overflow-hidden">
                  <h4 className="font-black text-slate-800 text-xs truncate">{client?.name}</h4>
                  <p className="text-[9px] text-slate-400 font-bold uppercase truncate">{quote?.projectName}</p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-black text-blue-600">{appt.startTime}</span>
                </div>
              </div>
            );
          })}
          {upcomingAppts.length === 0 && (
            <p className="text-[10px] text-center py-4 text-slate-300 font-bold uppercase italic">Nenhum serviço agendado</p>
          )}
        </div>
      </section>

      {/* 3. Cards de Status Rápido */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="bg-blue-50 text-blue-600 p-2 rounded-xl w-fit"><Clock size={20} /></div>
          <div className="mt-4">
            <p className="text-2xl font-black text-slate-900">{pendingQuotes.length}</p>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Enviados</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <div className="bg-purple-50 text-purple-600 p-2 rounded-xl w-fit"><Calculator size={20} /></div>
          <div className="mt-4">
            <p className="text-2xl font-black text-slate-900">{draftQuotes.length}</p>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Rascunhos</p>
          </div>
        </div>
      </div>

      {/* 4. GESTÃO DE SERVIÇOS E PRODUTOS (INTEGRADA) */}
      <section className="bg-white rounded-[2.5rem] border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-slate-100 flex items-center justify-between">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Gestão de Itens e Catálogo</h3>
          <div className="flex gap-2">
            <div className="bg-slate-50 p-1.5 rounded-lg text-slate-400"><Hammer size={12}/></div>
            <div className="bg-slate-50 p-1.5 rounded-lg text-slate-400"><Package size={12}/></div>
          </div>
        </div>
        <div className="p-1">
          <InventoryManager 
            products={products} 
            services={services} 
            onUpdateProducts={onUpdateProducts} 
            onUpdateServices={onUpdateServices} 
            embedded={true}
          />
        </div>
      </section>

      {/* 5. CARD INFORMAÇÕES DA EMPRESA */}
      <section className="bg-slate-50 p-8 rounded-[2.5rem] border-2 border-dashed border-slate-200 space-y-6">
        <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-white rounded-2xl shadow-sm">
                <Building2 className="text-[#D1101E]" size={24} />
              </div>
              <div>
                <h3 className="font-black text-slate-900 uppercase tracking-tight text-lg">{company.name}</h3>
                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{company.cnpj}</p>
              </div>
            </div>
            <button 
              onClick={() => onNavigate('settings')}
              className="p-3 bg-white text-slate-900 rounded-2xl shadow-sm active:scale-90 transition-transform flex items-center gap-2 text-[10px] font-black uppercase"
            >
              <Edit size={16} /> Editar
            </button>
        </div>

        <div className="grid grid-cols-1 gap-4">
           <div className="flex items-center gap-4 text-slate-600 bg-white p-4 rounded-2xl shadow-sm">
              <Phone size={18} className="text-[#D1101E]" />
              <p className="text-xs font-bold">{company.phone}</p>
           </div>
           <div className="flex items-center gap-4 text-slate-600 bg-white p-4 rounded-2xl shadow-sm">
              <Globe size={18} className="text-[#D1101E]" />
              <p className="text-xs font-bold">{company.website || 'vsitelecom.com.br'}</p>
           </div>
        </div>
      </section>

      {/* 6. VSI TECHBOT (ASSISTENTE VIRTUAL) */}
      <section>
        <TechBot />
      </section>
    </div>
  );
};

export default Dashboard;
