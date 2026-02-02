
import React, { useState } from 'react';
import { Quote, Expense } from '../types';
import { Plus, Wallet, TrendingDown, TrendingUp, Calendar, Trash2, Tag, PieChart, Info } from 'lucide-react';

interface FinanceManagerProps {
  quotes: Quote[];
  expenses: Expense[];
  onUpdateExpenses: (expenses: Expense[]) => void;
}

const FinanceManager: React.FC<FinanceManagerProps> = ({ quotes, expenses, onUpdateExpenses }) => {
  const [isAdding, setIsAdding] = useState(false);
  const [form, setForm] = useState<Partial<Expense>>({ description: '', amount: 0, category: 'Outros' });

  // Calculations
  const approvedQuotes = quotes.filter(q => q.status === 'approved' || q.status === 'invoiced');
  const totalRevenue = approvedQuotes.reduce((acc, q) => acc + q.total, 0);
  
  const totalFixedExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalCOGS = approvedQuotes.reduce((acc, q) => {
    return acc + q.items.reduce((itemAcc, item) => itemAcc + (item.costPrice * item.quantity), 0);
  }, 0);

  const totalOut = totalFixedExpenses + totalCOGS;
  const netResult = totalRevenue - totalOut;

  const handleAddExpense = () => {
    if (!form.description || !form.amount) return;
    const newExpense: Expense = {
      id: Math.random().toString(36).substr(2, 9),
      description: form.description,
      amount: form.amount,
      category: form.category || 'Geral',
      date: new Date().toISOString()
    };
    onUpdateExpenses([...expenses, newExpense]);
    setIsAdding(false);
    setForm({ description: '', amount: 0, category: 'Outros' });
  };

  const removeExpense = (id: string) => {
    if(window.confirm('Excluir despesa?')) {
      onUpdateExpenses(expenses.filter(e => e.id !== id));
    }
  };

  return (
    <div className="space-y-6 pb-24 animate-in fade-in duration-500">
      {/* Financial Health Summary */}
      <section className="bg-white p-6 rounded-[2.5rem] border border-slate-200 shadow-xl">
        <div className="flex items-center gap-2 mb-6">
          <PieChart className="text-[#D1101E]" size={20} />
          <h3 className="font-black text-slate-800 uppercase tracking-widest text-xs">Análise de Fluxo</h3>
        </div>

        <div className="space-y-4">
          <div className="flex justify-between items-center p-4 bg-green-50 rounded-2xl border border-green-100">
            <div>
              <p className="text-[9px] font-black text-green-600 uppercase tracking-widest">Entradas (Faturamento)</p>
              <p className="text-xl font-black text-green-700">R$ {totalRevenue.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <TrendingUp className="text-green-600" size={24} />
          </div>

          <div className="flex justify-between items-center p-4 bg-red-50 rounded-2xl border border-red-100">
            <div>
              <p className="text-[9px] font-black text-red-600 uppercase tracking-widest">Saídas (Custo + Despesas)</p>
              <p className="text-xl font-black text-red-700">R$ {totalOut.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
            </div>
            <TrendingDown className="text-red-600" size={24} />
          </div>

          <div className="p-5 bg-slate-900 rounded-3xl text-white mt-2">
            <p className="text-white/40 text-[9px] font-black uppercase tracking-[0.2em] mb-1">Saldo Líquido Acumulado</p>
            <p className="text-3xl font-black">R$ {netResult.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
          </div>
        </div>
      </section>

      {/* Expense Management */}
      <section className="space-y-4">
        <div className="flex justify-between items-center px-2">
          <h3 className="font-black text-slate-500 uppercase tracking-widest text-[10px]">Gestão de Despesas Fixas</h3>
          <button 
            onClick={() => setIsAdding(true)}
            className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-2xl text-[10px] font-black uppercase tracking-widest active:scale-95 transition-transform shadow-lg shadow-slate-200"
          >
            <Plus size={14} /> Nova Despesa
          </button>
        </div>

        {isAdding && (
          <div className="bg-white p-6 rounded-[2rem] border-2 border-slate-900 shadow-2xl animate-in zoom-in-95 space-y-4">
            <input 
              placeholder="Descrição (Ex: Aluguel, Internet...)" 
              className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none"
              value={form.description}
              onChange={e => setForm({...form, description: e.target.value})}
            />
            <div className="grid grid-cols-2 gap-3">
               <input 
                type="number"
                placeholder="Valor (R$)" 
                className="w-full p-4 bg-slate-50 rounded-2xl font-black outline-none"
                value={form.amount}
                onChange={e => setForm({...form, amount: Number(e.target.value)})}
              />
              <select 
                className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none"
                value={form.category}
                onChange={e => setForm({...form, category: e.target.value})}
              >
                <option value="Operacional">Operacional</option>
                <option value="Administrativo">Administrativo</option>
                <option value="Marketing">Marketing</option>
                <option value="Outros">Outros</option>
              </select>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={handleAddExpense} className="flex-1 bg-slate-900 text-white py-4 rounded-2xl font-black uppercase tracking-widest">REGISTRAR</button>
              <button onClick={() => setIsAdding(false)} className="px-6 py-4 bg-slate-100 text-slate-50 rounded-2xl font-bold">CANCELAR</button>
            </div>
          </div>
        )}

        <div className="space-y-3">
          {expenses.map(e => (
            <div key={e.id} className="bg-white p-5 rounded-[2rem] border border-slate-200 shadow-sm flex items-center justify-between group active:bg-slate-50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-slate-50 rounded-2xl flex items-center justify-center text-slate-400">
                  <Tag size={20} />
                </div>
                <div>
                  <h4 className="font-black text-slate-900 text-sm leading-tight">{e.description}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">{e.category}</span>
                    <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                    <span className="text-[9px] font-bold text-slate-400">{new Date(e.date).toLocaleDateString('pt-BR')}</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <p className="font-black text-red-600 text-sm">R$ {e.amount.toFixed(2)}</p>
                <button onClick={() => removeExpense(e.id)} className="p-2 text-slate-200 hover:text-red-500 transition-colors">
                  <Trash2 size={18} />
                </button>
              </div>
            </div>
          ))}

          {expenses.length === 0 && !isAdding && (
            <div className="py-20 text-center opacity-20 flex flex-col items-center">
              <Info size={48} strokeWidth={1} />
              <p className="font-black uppercase tracking-widest text-[9px] mt-4">Nenhuma despesa fixa registrada</p>
            </div>
          )}
        </div>
      </section>

      {/* COGS Info Note */}
      <div className="p-6 bg-slate-100 rounded-[2rem] border border-slate-200">
        <p className="text-[10px] font-bold text-slate-500 leading-relaxed italic">
          * O sistema calcula automaticamente o CMV (Custo de Mercadoria Vendida) baseando-se no custo cadastrado nos itens das propostas aprovadas.
        </p>
      </div>
    </div>
  );
};

export default FinanceManager;
