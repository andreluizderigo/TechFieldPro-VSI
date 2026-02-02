
import React, { useState } from 'react';
import { CompanyProfile } from '../types';
import { Save, Building2, MapPin, Phone, Mail, FileCheck, Loader2, Globe, Image as ImageIcon, Trash2 } from 'lucide-react';

interface SettingsManagerProps {
  company: CompanyProfile;
  onUpdate: (company: CompanyProfile) => void;
}

const SettingsManager: React.FC<SettingsManagerProps> = ({ company, onUpdate }) => {
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (field: keyof CompanyProfile, value: any) => {
    onUpdate({ ...company, [field]: value });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // Limite de 1MB para localStorage
        alert("O arquivo é muito grande. Escolha uma imagem de até 1MB.");
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        handleChange('logoUrl', reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleCnpjLookup = async (cnpj: string) => {
    const cleanCnpj = cnpj.replace(/\D/g, '');
    if (cleanCnpj.length === 14) {
      setIsLoading(true);
      try {
        const response = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${cleanCnpj}`);
        const data = await response.json();
        if (data && data.razao_social) {
          onUpdate({
            ...company,
            cnpj: cleanCnpj,
            name: data.nome_fantasia || data.razao_social,
            number: data.numero || '',
            address: `${data.logradouro}, ${data.bairro}, ${data.municipio} - ${data.uf}`,
          });
        }
      } catch (error) {
        console.error("CNPJ lookup failed", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-[2.5rem] border border-slate-200 shadow-xl overflow-hidden mb-32 animate-in fade-in duration-500">
      <div className="p-8 border-b border-slate-100 bg-[#D1101E]">
        <h3 className="text-xl font-black text-white flex items-center gap-2">
          <Building2 />
          PERFIL VSI TELECOM
        </h3>
        <p className="text-[10px] text-white/70 mt-1 uppercase font-black tracking-[0.2em]">Gestão Corporativa</p>
      </div>

      <div className="p-8 space-y-6">
        <div className="space-y-4">
          <div className="relative">
            <InputGroup 
              label="CNPJ Principal" 
              value={company.cnpj} 
              onChange={(v) => {
                handleChange('cnpj', v);
                handleCnpjLookup(v);
              }} 
              icon={<FileCheck size={16} />}
            />
            {isLoading && <Loader2 className="absolute right-3 top-10 animate-spin text-[#D1101E]" size={18} />}
          </div>

          <InputGroup label="Razão Social" value={company.name} onChange={(v) => handleChange('name', v)} icon={<Building2 size={16} />} />

          <div className="grid grid-cols-4 gap-4">
            <div className="col-span-3"><InputGroup label="Endereço" value={company.address} onChange={(v) => handleChange('address', v)} icon={<MapPin size={16} />} /></div>
            <div className="col-span-1">
               <label className="text-[10px] font-black text-slate-400 block mb-1.5 uppercase">Nº</label>
               <input value={company.number} onChange={(e) => handleChange('number', e.target.value)} className="w-full px-4 py-3.5 bg-slate-50 border-0 rounded-2xl font-bold text-center outline-none focus:ring-2 ring-[#D1101E]/20" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="Telefone Principal" value={company.phone} onChange={(v) => handleChange('phone', v)} icon={<Phone size={16} />} />
            <InputGroup label="Telefone Secundário" value={company.secondaryPhone || ''} onChange={(v) => handleChange('secondaryPhone', v)} icon={<Phone size={16} />} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <InputGroup label="E-mail Corporativo" value={company.email} onChange={(v) => handleChange('email', v)} icon={<Mail size={16} />} />
            <InputGroup label="Site / Web" value={company.website || ''} onChange={(v) => handleChange('website', v)} icon={<Globe size={16} />} />
          </div>

          <div className="space-y-1.5">
            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Logotipo da Empresa (Papel Timbrado)</label>
            <div className="flex gap-4">
              <label className="flex-1 border-2 border-dashed border-slate-200 bg-slate-50 rounded-2xl p-6 flex flex-col items-center justify-center gap-2 cursor-pointer hover:bg-slate-100 transition-all active:scale-[0.98]">
                <ImageIcon className="text-slate-300" size={32} />
                <span className="text-[10px] font-black text-slate-500 uppercase">Clique para Carregar Logo</span>
                <input type="file" className="hidden" accept="image/*" onChange={handleLogoUpload} />
              </label>
              
              {company.logoUrl && (
                <div className="relative group">
                  <div className="w-32 h-32 bg-white rounded-2xl border border-slate-200 flex items-center justify-center p-2">
                    <img src={company.logoUrl} alt="Logo" className="max-w-full max-h-full object-contain" />
                  </div>
                  <button 
                    onClick={() => handleChange('logoUrl', '')}
                    className="absolute -top-2 -right-2 bg-red-500 text-white p-2 rounded-full shadow-lg active:scale-90 transition-transform"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        <button 
          className="w-full bg-[#D1101E] text-white py-5 rounded-3xl font-black flex items-center justify-center gap-2 transition-transform active:scale-95 shadow-xl shadow-red-100"
          onClick={() => alert('Dados da VSI Telecom salvos com sucesso!')}
        >
          <Save size={20} /> SALVAR PERFIL
        </button>
      </div>
    </div>
  );
};

const InputGroup: React.FC<{ label: string, value: string, onChange: (v: string) => void, icon?: React.ReactNode, placeholder?: string }> = ({ label, value, onChange, icon, placeholder }) => (
  <div className="space-y-1.5">
    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">{label}</label>
    <div className="relative">
      {icon && <div className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300">{icon}</div>}
      <input type="text" value={value} placeholder={placeholder} onChange={(e) => onChange(e.target.value)} className={`w-full ${icon ? 'pl-11' : 'px-5'} py-3.5 bg-slate-50 border-0 rounded-2xl outline-none font-bold text-slate-800 focus:ring-2 ring-[#D1101E]/20 transition-all`} />
    </div>
  </div>
);

export default SettingsManager;
