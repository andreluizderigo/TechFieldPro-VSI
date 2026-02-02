
import React, { useState } from 'react';
import { 
  Plus, 
  Save, 
  X,
  Calculator,
  Search,
  Check,
  Layout,
  Clock,
  CreditCard
} from 'lucide-react';
import { 
  Quote, 
  Client, 
  Product, 
  Service, 
  CompanyProfile, 
  QuoteItem 
} from '../types';
import { estimateDistance } from '../services/geminiService';

interface QuoteEditorProps {
  quote: Quote | null;
  clients: Client[];
  products: Product[];
  services: Service[];
  company: CompanyProfile;
  onSave: (quote: Quote) => void;
  onCancel: () => void;
}

const QuoteEditor: React.FC<QuoteEditorProps> = ({ quote, clients, products, services, company, onSave, onCancel }) => {
  const [clientId, setClientId] = useState(quote?.clientId || '');
  const [projectName, setProjectName] = useState(quote?.projectName || '');
  const [scope, setScope] = useState(quote?.scope || '');
  const [deliveryTime, setDeliveryTime] = useState(quote?.deliveryTime || '1');
  const [paymentTerms, setPaymentTerms] = useState(quote?.paymentTerms || 'A vista');
  const [items, setItems] = useState<QuoteItem[]>(quote?.items || []);
  const [distance, setDistance] = useState(quote?.travelDistanceKm || 0);
  const [discount, setDiscount] = useState(quote?.discount || 0);
  const [isEstimating, setIsEstimating] = useState(false);
  
  const [clientSearch, setClientSearch] = useState(clients.find(c => c.id === quote?.clientId)?.name || '');
  const [showClientResults, setShowClientResults] = useState(false);
  const [itemSearch, setItemSearch] = useState('');
  const [showItemResults, setShowItemResults] = useState(false);

  const travelCost = distance * company.travelRatePerKm;
  const subtotal = items.reduce((acc, item) => acc + item.total, 0);
  const total = subtotal + travelCost - discount;

  // Cálculo da duração total em minutos
  const totalDurationMinutes = items.reduce((acc, item) => acc + ((item.durationMinutes || 0) * item.quantity), 0);

  const handleAddItem = (source: Product | Service, type: 'product' | 'service') => {
    if (items.length === 0 && type === 'service') {
      if (!projectName) setProjectName(source.name);
      if (!scope) setScope((source as Service).description || '');
    }

    const newItem: QuoteItem = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      description: source.name,
      quantity: 1,
      unitPrice: type === 'service' ? (source as Service).hourlyRate : (source as Product).price,
      costPrice: (source as any).costPrice || 0,
      total: type === 'service' ? (source as Service).hourlyRate : (source as Product).price,
      durationMinutes: type === 'service' ? (source as Service).durationMinutes : 0
    };
    setItems([...items, newItem]);
    setItemSearch('');
    setShowItemResults(false);
  };

  const updateItem = (id: string, updates: Partial<QuoteItem>) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, ...updates };
        updated.total = updated.quantity * updated.unitPrice;
        return updated;
      }
      return item;
    }));
  };

  const handleEstimate = async () => {
    const selected = clients.find(c => c.id === clientId);
    if (!selected) return alert('Escolha o cliente!');
    setIsEstimating(true);
    
    const destination = selected.latitude && selected.longitude 
      ? `Coordenadas: ${selected.latitude}, ${selected.longitude} (Endereço: ${selected.address})`
      : selected.address;

    const km = await estimateDistance(company.address, destination);
    setDistance(km);
    setIsEstimating(false);
  };

  const filteredClients = clients.filter(c => 
    c.name.toLowerCase().includes(clientSearch.toLowerCase())
  );

  const filteredItems = [
    ...services.map(s => ({ ...s, _type: 'service' as const })),
    ...products.map(p => ({ ...p, _type: 'product' as const }))
  ].filter(i => i.name.toLowerCase().includes(itemSearch.toLowerCase()));

  return (
    <div className="space-y-6 pb-44 animate-in slide-in-from-bottom-5 duration-300">
      {/* 1. Selecionar Cliente */}
      <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 relative">
        <label className="text-[10px] font-black text-[#D1101E] uppercase tracking-[0.2em] mb-3 block">1. Selecionar Cliente</label>
        <div className="relative">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            value={clientSearch}
            onChange={e => { setClientSearch(e.target.value); setShowClientResults(true); if(!e.target.value) setClientId(''); }}
            onFocus={() => setShowClientResults(true)}
            placeholder="Nome do cliente..."
            className="w-full pl-11 pr-4 py-4 bg-slate-50 border-0 rounded-2xl font-bold text-slate-800 outline-none"
          />
          {showClientResults && clientSearch.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 max-h-48 overflow-y-auto">
              {filteredClients.map(c => (
                <button key={c.id} onClick={() => { setClientId(c.id); setClientSearch(c.name); setShowClientResults(false); }} className="w-full p-4 text-left font-bold text-slate-700 hover:bg-red-50 flex items-center justify-between border-b border-slate-50">
                  <div>
                    <span>{c.name}</span>
                    {c.latitude && <span className="ml-2 text-[8px] bg-green-100 text-green-600 px-1 rounded">Localizado</span>}
                  </div>
                  {clientId === c.id && <Check size={16} className="text-[#D1101E]" />}
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 2. Equipamentos e Serviços */}
      <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 space-y-4">
        <label className="text-[10px] font-black text-[#D1101E] uppercase tracking-[0.2em] block">2. Equipamentos e Serviços</label>
        <div className="relative">
          <Plus className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={18} />
          <input 
            value={itemSearch}
            onChange={e => { setItemSearch(e.target.value); setShowItemResults(true); }}
            onFocus={() => setShowItemResults(true)}
            placeholder="Buscar item cadastrado..."
            className="w-full pl-11 pr-4 py-4 bg-slate-50 border-0 rounded-2xl font-bold text-slate-800 outline-none"
          />
          {showItemResults && itemSearch.length > 0 && (
            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-2xl shadow-2xl border border-slate-100 z-50 max-h-48 overflow-y-auto">
              {filteredItems.map(item => (
                <button key={item.id} onClick={() => handleAddItem(item as any, item._type)} className="w-full p-4 text-left border-b border-slate-50 last:border-0 hover:bg-slate-50 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="font-bold">{item.name}</span>
                    {item._type === 'service' && <span className="text-[8px] text-slate-400 font-bold uppercase">{item.durationMinutes} min</span>}
                  </div>
                  <span className="font-black text-[#D1101E]">R$ {item._type === 'service' ? (item as Service).hourlyRate : (item as Product).price}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        <div className="space-y-3 pt-2">
          {items.map(item => (
            <div key={item.id} className="p-4 bg-slate-50 rounded-2xl space-y-3 relative border border-transparent hover:border-red-100 transition-all">
              <button onClick={() => setItems(items.filter(i => i.id !== item.id))} className="absolute right-3 top-3 p-1.5 bg-red-50 text-red-400 rounded-full"><X size={14}/></button>
              <input value={item.description} onChange={e => updateItem(item.id, { description: e.target.value })} className="w-full bg-transparent font-black text-slate-900 border-b border-slate-200 py-1 outline-none" />
              <div className="flex gap-4">
                <div className="w-16"><p className="text-[9px] font-black text-slate-400 uppercase">Qtd</p><input type="number" value={item.quantity} onChange={e => updateItem(item.id, { quantity: Number(e.target.value) })} className="w-full bg-transparent font-bold outline-none" /></div>
                <div className="flex-1"><p className="text-[9px] font-black text-slate-400 uppercase">Preço</p><input type="number" value={item.unitPrice} onChange={e => updateItem(item.id, { unitPrice: Number(e.target.value) })} className="w-full bg-transparent font-bold outline-none" /></div>
                <div className="text-right">
                    <p className="text-[9px] font-black text-slate-400 uppercase">Subtotal</p>
                    <p className="font-black text-[#D1101E]">R$ {item.total.toFixed(2)}</p>
                    {item.type === 'service' && <p className="text-[8px] text-slate-400 font-bold uppercase">{item.durationMinutes} min</p>}
                </div>
              </div>
            </div>
          ))}
          {totalDurationMinutes > 0 && (
             <div className="p-3 bg-blue-50 rounded-xl flex items-center justify-between">
                <span className="text-[10px] font-black text-blue-600 uppercase">Carga Horária Estimada</span>
                <span className="text-sm font-black text-blue-700">{Math.floor(totalDurationMinutes / 60)}h {totalDurationMinutes % 60}min</span>
             </div>
          )}
        </div>
      </section>

      {/* 3. Informações da Proposta */}
      <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200 space-y-4">
         <label className="text-[10px] font-black text-[#D1101E] uppercase tracking-[0.2em] block">3. Informações da Proposta</label>
         <div className="space-y-4">
            <div className="relative">
               <Layout className="absolute left-4 top-4 text-slate-300" size={18} />
               <input placeholder="Nome do Projeto" value={projectName} onChange={e => setProjectName(e.target.value)} className="w-full pl-11 pr-4 py-4 bg-slate-50 border-0 rounded-2xl font-bold outline-none" />
            </div>
            <textarea placeholder="Escopo do Projeto" value={scope} onChange={e => setScope(e.target.value)} className="w-full p-4 bg-slate-50 border-0 rounded-2xl font-bold outline-none h-24 resize-none" />
            <div className="grid grid-cols-2 gap-4">
                <div className="relative">
                   <Clock className="absolute left-4 top-4 text-slate-300" size={18} />
                   <input placeholder="Prazo Entrega" value={deliveryTime} onChange={e => setDeliveryTime(e.target.value)} className="w-full pl-11 pr-4 py-4 bg-slate-50 border-0 rounded-2xl font-bold outline-none" />
                </div>
                <div className="relative">
                   <CreditCard className="absolute left-4 top-4 text-slate-300" size={18} />
                   <input placeholder="Condições de Pagamento" value={paymentTerms} onChange={e => setPaymentTerms(e.target.value)} className="w-full pl-11 pr-4 py-4 bg-slate-50 border-0 rounded-2xl font-bold outline-none" />
                </div>
            </div>
         </div>
      </section>

      {/* 4. Logística Deslocamento */}
      <section className="bg-white p-6 rounded-[2rem] shadow-sm border border-slate-200">
        <label className="text-[10px] font-black text-[#D1101E] uppercase tracking-[0.2em] mb-3 block">4. Logística (Deslocamento)</label>
        <div className="flex gap-2">
          <input type="number" value={distance} onChange={e => setDistance(Number(e.target.value))} className="flex-1 p-4 bg-slate-50 border-0 rounded-2xl font-bold outline-none" />
          <button onClick={handleEstimate} disabled={isEstimating} className="bg-slate-900 text-white px-5 rounded-2xl active:scale-95 transition-transform disabled:opacity-50"><Calculator size={20}/></button>
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-6 safe-bottom z-[60] shadow-2xl">
        <div className="flex items-center justify-between mb-5 px-1">
          <div>
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Valor da Proposta</p>
            <p className="text-3xl font-black text-slate-900 leading-none">R$ {total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
          <button onClick={onCancel} className="p-4 bg-slate-100 text-slate-500 rounded-[1.5rem] active:scale-90 transition-transform"><X size={24}/></button>
        </div>
        <button 
          onClick={() => {
            if (!clientId) return alert('Selecione um cliente!');
            onSave({
              id: quote?.id || Math.random().toString(36).substr(2, 5).toUpperCase(),
              date: new Date().toISOString(),
              clientId,
              projectName,
              scope,
              deliveryTime,
              paymentTerms,
              items,
              travelDistanceKm: distance,
              travelCost,
              discount: 0,
              total,
              totalDurationMinutes, // Salvando a duração calculada
              status: 'draft'
            });
          }}
          className="w-full bg-[#D1101E] text-white py-5 rounded-[2rem] font-black flex items-center justify-center gap-3 shadow-xl shadow-red-200 active:scale-95 transition-all text-lg tracking-widest uppercase"
        >
          <Save size={24} /> SALVAR PROPOSTA
        </button>
      </div>
    </div>
  );
};

export default QuoteEditor;
