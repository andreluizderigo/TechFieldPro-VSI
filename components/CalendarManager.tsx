
import React, { useState, useEffect } from 'react';
import { Appointment, Quote, Client, CompanyProfile } from '../types';
import { Calendar as CalIcon, Clock, ChevronLeft, ChevronRight, Check, X, MessageSquare, Plus, AlertCircle, CheckCircle } from 'lucide-react';

interface CalendarManagerProps {
  appointments: Appointment[];
  quotes: Quote[];
  clients: Client[];
  company: CompanyProfile;
  onUpdate: (appointments: Appointment[]) => void;
  onComplete?: (apptId: string) => void;
}

const CalendarManager: React.FC<CalendarManagerProps> = ({ appointments, quotes, clients, company, onUpdate, onComplete }) => {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [isAdding, setIsAdding] = useState(false);
  const [newAppt, setNewAppt] = useState({ quoteId: '', startTime: '08:00', duration: 90 });

  const dayAppointments = appointments
    .filter(a => a.date === selectedDate)
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  const approvedQuotes = quotes.filter(q => q.status === 'approved' && !appointments.some(a => a.quoteId === q.id));

  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  const calculateEndTime = (start: string, duration: number) => {
    const [h, m] = start.split(':').map(Number);
    const totalMinutes = h * 60 + m + duration;
    const endH = Math.floor(totalMinutes / 60);
    const endM = totalMinutes % 60;
    return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
  };

  const handleAdd = () => {
    if (!newAppt.quoteId) return;
    
    const quote = quotes.find(q => q.id === newAppt.quoteId);
    const endTime = calculateEndTime(newAppt.startTime, newAppt.duration);
    
    const hasConflict = dayAppointments.some(a => {
        return (newAppt.startTime >= a.startTime && newAppt.startTime < a.endTime) ||
               (endTime > a.startTime && endTime <= a.endTime);
    });

    if (hasConflict) {
        window.alert("Já existe um serviço agendado neste horário!");
        return;
    }

    const appt: Appointment = {
      id: Math.random().toString(36).substr(2, 9),
      quoteId: newAppt.quoteId,
      clientId: quote?.clientId || '',
      date: selectedDate,
      startTime: newAppt.startTime,
      endTime,
      status: 'scheduled'
    };
    
    onUpdate([...appointments, appt]);
    setIsAdding(false);
    setNewAppt({ quoteId: '', startTime: '08:00', duration: 90 });
  };

  const removeAppt = (id: string) => {
    if(window.confirm('Deseja remover este agendamento da lista?')) {
      onUpdate(appointments.filter(a => a.id !== id));
    }
  };

  const handleCompleteAppt = (id: string) => {
    if(window.confirm('Deseja marcar este serviço como CONCLUÍDO? Isso atualizará o status da Ordem de Serviço.')) {
      onComplete?.(id);
    }
  };

  const sendScheduleToClient = (quote: Quote) => {
    const client = clients.find(c => c.id === quote.clientId);
    if (!client) return;

    let suggestions = "*VSI TELECOM - ESCOLHA SEU HORÁRIO*\n\n";
    suggestions += `Olá ${client.name}, sua proposta para *${quote.projectName}* foi aprovada!\n\n`;
    suggestions += `Estimamos que este serviço levará cerca de *${Math.floor(quote.totalDurationMinutes/60)}h ${quote.totalDurationMinutes%60}min*.\n\n`;
    suggestions += "Por favor, escolha uma das datas abaixo:\n\n";

    const nextDates = [];
    let d = new Date();
    while(nextDates.length < 3) {
        d.setDate(d.getDate() + 1);
        if(d.getDay() !== 0 && d.getDay() !== 6) nextDates.push(new Date(d));
    }

    nextDates.forEach((date, i) => {
        const dateStr = date.toLocaleDateString('pt-BR', { weekday: 'long', day: '2-digit', month: '2-digit' });
        suggestions += `${i+1}️⃣ 📅 *${dateStr}*\n( ) Manhã (08:30)\n( ) Tarde (14:00)\n\n`;
    });

    suggestions += "_Responda com a data e período de sua preferência._";
    const waPhone = client.phone.replace(/\D/g, '');
    window.open(`https://wa.me/${waPhone}?text=${encodeURIComponent(suggestions)}`, '_blank');
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500 pb-20 px-1">
      <div className="bg-white p-6 rounded-[2.5rem] shadow-xl border border-slate-200 flex items-center justify-between">
        <button onClick={() => changeDate(-1)} className="p-3 bg-slate-100 rounded-2xl active:scale-90 transition-transform"><ChevronLeft /></button>
        <div className="text-center">
            <p className="text-[10px] font-black text-[#D1101E] uppercase tracking-widest mb-1">Agenda Dinâmica</p>
            <h3 className="font-black text-slate-900 text-lg uppercase tracking-tight">
                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('pt-BR', { weekday: 'short', day: '2-digit', month: 'long' })}
            </h3>
        </div>
        <button onClick={() => changeDate(1)} className="p-3 bg-slate-100 rounded-2xl active:scale-90 transition-transform"><ChevronRight /></button>
      </div>

      <section className="bg-white rounded-[2.5rem] border border-slate-200 p-6 shadow-sm min-h-[400px]">
        <div className="flex items-center gap-2 mb-6 border-b border-slate-50 pb-4">
            <CalIcon className="text-[#D1101E]" size={16} />
            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Linha do Tempo de Hoje</h4>
        </div>
        
        <div className="space-y-4">
          {dayAppointments.length > 0 ? dayAppointments.map(appt => {
              const client = clients.find(c => c.id === appt.clientId);
              const quote = quotes.find(q => q.id === appt.quoteId);
              const dur = quote?.totalDurationMinutes || 0;
              const isCompleted = appt.status === 'completed';

              return (
                <div key={appt.id} className="relative pl-14 pb-4 group">
                    <div className="absolute left-[20px] top-0 bottom-0 w-1 bg-slate-100 group-last:bg-transparent"></div>
                    <div className={`absolute left-[13px] top-0 w-4 h-4 rounded-full border-4 border-white shadow-sm z-10 ${isCompleted ? 'bg-green-500' : 'bg-blue-600'}`}></div>
                    
                    <div className="flex flex-col">
                        <span className={`text-[10px] font-black mb-1 ${isCompleted ? 'text-green-600' : 'text-blue-600'}`}>{appt.startTime} → {appt.endTime}</span>
                        <div className={`p-5 rounded-[2rem] border shadow-sm flex items-center justify-between transition-colors ${isCompleted ? 'bg-green-50/50 border-green-100' : 'bg-slate-50 border-blue-100'}`}>
                            <div className="overflow-hidden">
                                <h4 className={`font-black text-sm truncate ${isCompleted ? 'text-green-900' : 'text-slate-900'}`}>{client?.name}</h4>
                                <p className="text-[9px] text-slate-400 font-bold uppercase truncate">{quote?.projectName}</p>
                                <div className="flex items-center gap-2 mt-2">
                                    <Clock size={10} className={isCompleted ? 'text-green-500' : 'text-blue-500'} />
                                    <span className={`text-[8px] font-black uppercase tracking-widest ${isCompleted ? 'text-green-600' : 'text-blue-600'}`}>{dur} min</span>
                                    {isCompleted && <span className="text-[8px] font-black text-green-600 uppercase bg-green-100 px-1.5 py-0.5 rounded ml-2">CONCLUÍDO</span>}
                                </div>
                            </div>
                            <div className="flex items-center gap-2">
                                {!isCompleted && (
                                  <button 
                                    onClick={() => handleCompleteAppt(appt.id)} 
                                    className="p-2.5 bg-green-500 text-white rounded-full shadow-lg active:scale-90 transition-transform"
                                  >
                                    <Check size={18} />
                                  </button>
                                )}
                                <button 
                                  onClick={() => removeAppt(appt.id)} 
                                  className="p-2 text-slate-200 hover:text-red-500 transition-colors"
                                >
                                  <X size={20}/>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
              )
          }) : (
            <div className="py-20 text-center opacity-30 flex flex-col items-center">
                <AlertCircle size={40} className="text-slate-300 mb-3" strokeWidth={1.5} />
                <p className="text-[10px] font-black uppercase tracking-widest">Nenhum serviço agendado para esta data</p>
            </div>
          )}
        </div>
      </section>

      {approvedQuotes.length > 0 && (
          <section className="bg-[#D1101E]/5 p-6 rounded-[2.5rem] border border-[#D1101E]/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <MessageSquare className="text-[#D1101E]" size={18} />
                  <h4 className="font-black text-[10px] text-[#D1101E] uppercase tracking-widest">Aprovar com Cliente</h4>
                </div>
                <button 
                  onClick={() => setIsAdding(true)}
                  className="bg-[#D1101E] text-white px-3 py-1.5 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 shadow-lg shadow-red-100"
                >
                  <Plus size={12} /> Agendar Manual
                </button>
              </div>
              <div className="space-y-3">
                  {approvedQuotes.map(q => (
                      <div key={q.id} className="bg-white p-4 rounded-2xl flex items-center justify-between shadow-sm">
                          <div>
                            <p className="font-black text-slate-800 text-sm">{clients.find(c => c.id === q.clientId)?.name}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[9px] text-slate-400 font-bold uppercase">{q.projectName}</span>
                                <span className="w-1 h-1 bg-slate-200 rounded-full"></span>
                                <span className="text-[8px] text-blue-600 font-black uppercase">{q.totalDurationMinutes} min</span>
                            </div>
                          </div>
                          <button 
                            onClick={() => sendScheduleToClient(q)}
                            className="bg-green-600 text-white px-4 py-2 rounded-xl text-[9px] font-black uppercase flex items-center gap-2 active:scale-95 transition-all"
                          >
                            <MessageSquare size={12} /> Sugerir
                          </button>
                      </div>
                  ))}
              </div>
          </section>
      )}

      {isAdding && (
          <div className="fixed inset-0 z-[100] bg-black/60 backdrop-blur-sm p-4 flex items-center justify-center">
              <div className="bg-white w-full max-w-sm rounded-[2.5rem] p-8 space-y-6 shadow-2xl animate-in zoom-in-95">
                  <div className="text-center">
                    <h3 className="font-black text-xl text-slate-900">Novo Agendamento</h3>
                    <p className="text-[10px] font-bold text-[#D1101E] uppercase tracking-widest mt-1">Sincronizar Timeline</p>
                  </div>
                  
                  <div className="space-y-4">
                      <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Proposta Aprovada</label>
                        <select 
                            className="w-full p-4 bg-slate-50 rounded-2xl font-bold outline-none border-0 focus:ring-2 ring-blue-100"
                            value={newAppt.quoteId}
                            onChange={e => {
                                const q = quotes.find(x => x.id === e.target.value);
                                setNewAppt({...newAppt, quoteId: e.target.value, duration: q?.totalDurationMinutes || 90});
                            }}
                        >
                            <option value="">Selecione o Cliente</option>
                            {approvedQuotes.map(q => (
                                <option key={q.id} value={q.id}>
                                    {clients.find(c => c.id === q.clientId)?.name} ({q.totalDurationMinutes} min)
                                </option>
                            ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Início</label>
                            <input 
                                type="time" 
                                value={newAppt.startTime}
                                onChange={e => setNewAppt({...newAppt, startTime: e.target.value})}
                                className="w-full p-4 bg-slate-50 rounded-2xl font-black outline-none border-0"
                            />
                        </div>
                        <div>
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1 mb-1 block">Término Estimado</label>
                            <div className="w-full p-4 bg-blue-50 text-blue-700 rounded-2xl font-black text-center border border-blue-100">
                                {calculateEndTime(newAppt.startTime, newAppt.duration)}
                            </div>
                        </div>
                      </div>

                      <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                         <div className="flex items-center gap-2 mb-1">
                            <Clock size={12} className="text-slate-400" />
                            <span className="text-[10px] font-black text-slate-500 uppercase">Carga Horária</span>
                         </div>
                         <p className="font-bold text-slate-900 text-sm">Este serviço ocupará {newAppt.duration} minutos da agenda.</p>
                      </div>
                  </div>

                  <div className="flex gap-3">
                      <button onClick={handleAdd} className="flex-1 bg-blue-600 text-white py-4 rounded-2xl font-black uppercase tracking-widest shadow-lg shadow-blue-100 active:scale-95 transition-all">FIXAR NA AGENDA</button>
                      <button onClick={() => setIsAdding(false)} className="px-6 py-4 bg-slate-100 text-slate-500 rounded-2xl font-bold">FECHAR</button>
                  </div>
              </div>
          </div>
      )}
    </div>
  );
};

export default CalendarManager;
