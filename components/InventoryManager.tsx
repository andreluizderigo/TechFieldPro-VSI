
import React, { useState } from 'react';
import { Product, Service } from '../types';
import { Package, Hammer, Plus, Trash2, Tag, Clock } from 'lucide-react';

interface InventoryManagerProps {
  products: Product[];
  services: Service[];
  onUpdateProducts: (products: Product[]) => void;
  onUpdateServices: (services: Service[]) => void;
  embedded?: boolean;
}

const InventoryManager: React.FC<InventoryManagerProps> = ({ 
  products, 
  services, 
  onUpdateProducts, 
  onUpdateServices,
  embedded = false
}) => {
  const [tab, setTab] = useState<'services' | 'products'>('services');
  const [isAdding, setIsAdding] = useState(false);
  const [newItem, setNewItem] = useState<any>({ name: '', price: 0, costPrice: 0, unit: 'un', description: '', durationMinutes: 90 });

  const handleAdd = () => {
    if (!newItem.name) return;
    
    // Usamos crypto.randomUUID() para garantir um formato válido para o Supabase (uuid)
    const newId = crypto.randomUUID();

    if (tab === 'services') {
      const s: Service = {
        id: newId,
        name: newItem.name,
        hourlyRate: newItem.price,
        costPrice: newItem.costPrice,
        description: newItem.description || '',
        durationMinutes: Number(newItem.durationMinutes) || 90
      };
      onUpdateServices([...services, s]);
    } else {
      const p: Product = {
        id: newId,
        name: newItem.name,
        price: newItem.price,
        costPrice: newItem.costPrice,
        unit: newItem.unit
      };
      onUpdateProducts([...products, p]);
    }
    setNewItem({ name: '', price: 0, costPrice: 0, unit: 'un', description: '', durationMinutes: 90 });
    setIsAdding(false);
  };

  return (
    <div className={embedded ? "p-4" : "pb-24"}>
      <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden mb-6 flex p-1">
        <button 
          onClick={() => setTab('services')}
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all rounded-xl ${tab === 'services' ? 'bg-[#D1101E] text-white shadow-md' : 'text-slate-400'}`}
        >
          <Hammer size={14} /> Serviços
        </button>
        <button 
          onClick={() => setTab('products')}
          className={`flex-1 py-3 text-[10px] font-black uppercase tracking-widest flex items-center justify-center gap-2 transition-all rounded-xl ${tab === 'products' ? 'bg-[#D1101E] text-white shadow-md' : 'text-slate-400'}`}
        >
          <Package size={14} /> Materiais
        </button>
      </div>

      <div className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h3 className="font-black text-slate-400 uppercase tracking-widest text-[9px]">{tab === 'services' ? 'Serviços' : 'Materiais'}</h3>
          <button 
            onClick={() => setIsAdding(true)}
            className="p-2.5 bg-slate-900 text-white rounded-xl active:scale-95 transition-transform"
          >
            <Plus size={18} />
          </button>
        </div>

        {isAdding && (
          <div className="bg-white p-5 rounded-[2rem] border-2 border-[#D1101E]/10 shadow-xl space-y-4 mb-4">
            <div>
              <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Nome do {tab === 'services' ? 'Serviço' : 'Produto'}</label>
              <input 
                placeholder={tab === 'services' ? "Ex: Instalação de Câmeras" : "Ex: Cabo Coaxial 100m"} 
                className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-[#D1101E]"
                value={newItem.name}
                onChange={e => setNewItem({...newItem, name: e.target.value})}
              />
            </div>

            {tab === 'services' && (
              <>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Descrição do Serviço (Escopo)</label>
                  <textarea 
                    placeholder="Descreva detalhadamente o que este serviço inclui..." 
                    className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none h-24 resize-none border-2 border-transparent focus:border-[#D1101E]"
                    value={newItem.description}
                    onChange={e => setNewItem({...newItem, description: e.target.value})}
                  />
                </div>
                <div>
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Tempo Médio de Execução</label>
                  <select 
                    className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-2 border-transparent focus:border-[#D1101E]"
                    value={newItem.durationMinutes}
                    onChange={e => setNewItem({...newItem, durationMinutes: e.target.value})}
                  >
                    <option value="30">30 Minutos</option>
                    <option value="60">1 Hora</option>
                    <option value="90">1 Hora e 30 Minutos</option>
                    <option value="120">2 Horas</option>
                    <option value="180">3 Horas</option>
                    <option value="240">4 Horas</option>
                    <option value="480">8 Horas (Dia Inteiro)</option>
                  </select>
                </div>
              </>
            )}
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Custo (R$)</label>
                <input 
                  type="number"
                  placeholder="0,00" 
                  className="w-full p-4 bg-slate-50 rounded-2xl font-black outline-none border-2 border-transparent focus:border-[#D1101E]"
                  value={newItem.costPrice}
                  onChange={e => setNewItem({...newItem, costPrice: Number(e.target.value)})}
                />
              </div>
              <div>
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 block">Venda (R$)</label>
                <input 
                  type="number"
                  placeholder="0,00" 
                  className="w-full p-4 bg-slate-50 rounded-2xl font-black outline-none border-2 border-transparent focus:border-[#D1101E]"
                  value={newItem.price}
                  onChange={e => setNewItem({...newItem, price: Number(e.target.value)})}
                />
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleAdd} className="flex-1 bg-[#D1101E] text-white py-3.5 rounded-2xl font-black uppercase tracking-widest text-[10px]">CADASTRAR ITEM</button>
              <button onClick={() => setIsAdding(false)} className="px-5 py-3.5 bg-slate-100 text-slate-500 rounded-2xl font-bold text-[10px]">VOLTAR</button>
            </div>
          </div>
        )}

        <div className="space-y-3 max-h-[400px] overflow-y-auto pr-1">
          {tab === 'services' ? services.map(s => (
            <div key={s.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white text-[#D1101E] rounded-xl shadow-sm">
                    <Hammer size={16} />
                  </div>
                  <div>
                    <h4 className="font-black text-slate-800 text-xs leading-tight">{s.name}</h4>
                    <div className="flex items-center gap-1 mt-1">
                       <Clock size={10} className="text-slate-400" />
                       <span className="text-[8px] text-slate-400 font-bold uppercase">{s.durationMinutes} min de execução</span>
                    </div>
                  </div>
                </div>
                <button onClick={() => onUpdateServices(services.filter(x => x.id !== s.id))} className="text-slate-300 hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="flex justify-between items-center px-1">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Preço: <span className="text-green-600">R$ {Number(s.hourlyRate ?? 0).toFixed(2)}</span></span>
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Custo: <span className="text-slate-600">R$ {Number(s.costPrice ?? 0) .toFixed(2)}</span></span>
              </div>
            </div>
          )) : products.map(p => (
            <div key={p.id} className="bg-slate-50 p-4 rounded-2xl border border-slate-100 flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white text-blue-600 rounded-xl shadow-sm">
                    <Package size={16} />
                  </div>
                  <h4 className="font-black text-slate-800 text-xs leading-tight">{p.name}</h4>
                </div>
                <button onClick={() => onUpdateProducts(products.filter(x => x.id !== p.id))} className="text-slate-300 hover:text-red-500">
                  <Trash2 size={16} />
                </button>
              </div>
              <div className="flex justify-between items-center px-1">
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Preço: <span className="text-blue-600">R$ {p.price.toFixed(2)}</span></span>
                 <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Custo: <span className="text-slate-600">R$ {p.costPrice.toFixed(2)}</span></span>
              </div>
            </div>
          ))}
          {((tab === 'services' && services.length === 0) || (tab === 'products' && products.length === 0)) && (
            <div className="text-center py-10 text-slate-300 flex flex-col items-center">
              <Tag size={32} strokeWidth={1} />
              <p className="font-black uppercase tracking-widest text-[8px] mt-2">Nenhum item</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default InventoryManager;
