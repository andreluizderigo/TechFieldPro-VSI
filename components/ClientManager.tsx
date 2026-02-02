
import React, { useState } from 'react';
import { Client } from '../types';
import { UserPlus, Search, Phone, MapPin, Trash2, X, Loader2, Building2, Users, Edit3, Save, LocateFixed, Check, SearchCode } from 'lucide-react';

interface ClientManagerProps {
  clients: Client[];
  onUpdate: (clients: Client[]) => void;
}

const ClientManager: React.FC<ClientManagerProps> = ({ clients, onUpdate }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isLocating, setIsLocating] = useState(false);
  const [form, setForm] = useState<Partial<Client>>({ 
    name: '', phone: '', address: '', number: '', document: '', zipCode: '', latitude: undefined, longitude: undefined
  });

  const filtered = clients.filter(c => 
    c.name.toLowerCase().includes(search.toLowerCase()) || 
    c.document.includes(search)
  );

  // Consultas agora são disparadas apenas por BOTÕES EXPLÍCITOS
  const handleCepLookup = async () => {
    const cleanCep = form.zipCode?.replace(/\D/g, '') || '';
    if (cleanCep.length === 8) {
      setIsLoading(true);
      try {
        const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
        const data = await response.json();
        if (!data.erro) {
          setForm(prev => ({
            ...prev,
            address: `${data.logradouro}, ${data.bairro}, ${data.localidade} - ${data.uf}`,
          }));
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCnpjLookup = async () => {
    const cleanCnpj = form.document?.replace(/\D/g, '') || '';
    if (cleanCnpj.length === 14) {
      setIsLoading(true);
      try {
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
        const data = await response.json();
        if (data && data.razao_social) {
          setForm(prev => ({
            ...prev,
            name: data.nome_fantasia || data.razao_social,
            zipCode: data.cep,
            number: data.numero || '',
            address: `${data.logradouro}, ${data.bairro}, ${data.municipio} - ${data.uf}`,
          }));
        }
      } finally {
        setIsLoading(false);
      }
    }
  };

  const handleCaptureLocation = () => {
    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (p) => {
        setForm(prev => ({ ...prev, latitude: p.coords.latitude, longitude: p.coords.longitude }));
        setIsLocating(false);
      },
      () => setIsLocating(false),
      { enableHighAccuracy: true }
    );
  };

  const handleSave = () => {
    if (!form.name) return;
    if (editingId) {
      onUpdate(clients.map(c => c.id === editingId ? { ...c, ...form } as Client : c));
    } else {
      const client: Client = {
        id: crypto.randomUUID(),
        name: form.name || '',
        phone: form.phone || '',
        address: form.address || '',
        number: form.number || '',
        document: form.document || '',
        zipCode: form.zipCode || '',
        email: '',
        latitude: form.latitude,
        longitude: form.longitude
      };
      onUpdate([...clients, client]);
    }
    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5 pb-20">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
        <input placeholder="Buscar cliente..." value={search} onChange={e => setSearch(e.target.value)} className="w-full pl-12 pr-4 py-4 bg-white rounded-3xl shadow-sm outline-none" />
      </div>

      <button onClick={() => { setForm({}); setEditingId(null); setIsModalOpen(true); }} className="w-full bg-white border-2 border-dashed border-blue-200 text-blue-600 p-4 rounded-3xl font-bold flex items-center justify-center gap-2">
        <UserPlus size={20} /> Novo Cadastro
      </button>

      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 p-4 flex items-center justify-center overflow-y-auto">
          <div className="bg-white w-full max-w-md rounded-[2.5rem] p-8 space-y-4 max-h-[90vh] overflow-y-auto">
             <div className="flex justify-between items-center mb-4">
               <h3 className="font-black text-xl">{editingId ? 'Editar' : 'Novo Cliente'}</h3>
               <button onClick={() => setIsModalOpen(false)} className="p-2 bg-slate-100 rounded-full"><X size={20}/></button>
             </div>
             
             <div className="space-y-4">
                <div>
                   <label className="text-[10px] font-black text-blue-600 uppercase mb-1 block">CPF ou CNPJ</label>
                   <div className="flex gap-2">
                     <input value={form.document} onChange={e => setForm({...form, document: e.target.value})} className="flex-1 p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
                     <button onClick={handleCnpjLookup} disabled={isLoading} className="p-4 bg-blue-50 text-blue-600 rounded-2xl active:scale-90"><SearchCode size={20}/></button>
                   </div>
                </div>

                <div>
                   <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Nome do Cliente</label>
                   <input value={form.name} onChange={e => setForm({...form, name: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">CEP</label>
                    <div className="flex gap-2">
                      <input value={form.zipCode} onChange={e => setForm({...form, zipCode: e.target.value})} className="flex-1 p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
                      <button onClick={handleCepLookup} className="p-4 bg-slate-100 text-slate-500 rounded-2xl"><MapPin size={18}/></button>
                    </div>
                  </div>
                  <div>
                    <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">WhatsApp</label>
                    <input value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
                  </div>
                </div>

                <div className="grid grid-cols-4 gap-4">
                   <div className="col-span-3">
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Logradouro / Bairro</label>
                      <input value={form.address} onChange={e => setForm({...form, address: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold" />
                   </div>
                   <div className="col-span-1">
                      <label className="text-[10px] font-black text-slate-400 uppercase mb-1 block">Nº</label>
                      <input value={form.number} onChange={e => setForm({...form, number: e.target.value})} className="w-full p-4 bg-slate-50 rounded-2xl outline-none font-bold text-center" />
                   </div>
                </div>

                <div className="p-4 bg-slate-50 rounded-2xl border-2 border-dashed flex items-center justify-between">
                  <span className="text-[10px] font-black text-slate-400 uppercase">Localização GPS</span>
                  <button onClick={handleCaptureLocation} className="text-blue-600 font-bold text-[10px] uppercase flex items-center gap-1">
                    {isLocating ? <Loader2 className="animate-spin"/> : <LocateFixed size={14}/>}
                    {form.latitude ? 'CAPTURADO' : 'GRAVAR AGORA'}
                  </button>
                </div>

                <button onClick={handleSave} className="w-full bg-blue-600 text-white py-5 rounded-3xl font-black flex items-center justify-center gap-2">
                  <Save size={20} /> SALVAR
                </button>
             </div>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(c => (
          <div key={c.id} className="bg-white p-5 rounded-3xl border border-slate-100 flex items-center justify-between">
            <div className="space-y-1">
              <h4 className="font-black text-slate-900">{c.name}</h4>
              <p className="text-xs text-slate-500 font-bold">{c.document}</p>
              <p className="text-[10px] text-slate-400">{c.phone}</p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => { setForm(c); setEditingId(c.id); setIsModalOpen(true); }} className="p-3 text-blue-400"><Edit3 size={20} /></button>
              <button onClick={() => onUpdate(clients.filter(x => x.id !== c.id))} className="p-3 text-red-200"><Trash2 size={20} /></button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ClientManager;
