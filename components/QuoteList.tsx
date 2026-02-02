
import React, { useState } from 'react';
import { 
  Download, 
  MessageSquare, 
  Trash2, 
  Receipt,
  FileText,
  Share2,
  CheckCircle,
  XCircle,
  ClipboardList
} from 'lucide-react';
import { Quote, Client, CompanyProfile } from '../types';
import { simulateNfseXml } from '../services/geminiService';

interface QuoteListProps {
  quotes: Quote[];
  clients: Client[];
  company: CompanyProfile;
  onEdit: (quote: Quote) => void;
  onReport: (quote: Quote) => void;
  onDelete: (id: string) => void;
  onInvoice: (id: string) => void;
  onStatusChange: (id: string, status: Quote['status']) => void;
}

const QuoteList: React.FC<QuoteListProps> = ({ quotes, clients, company, onEdit, onReport, onDelete, onInvoice, onStatusChange }) => {
  const [loadingId, setLoadingId] = useState<string | null>(null);

  const buildPDF = (quote: Quote, client?: Client) => {
    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF();

    const VSI_RED = [209, 16, 30];
    const VSI_BLACK = [33, 33, 33];
    const SOFT_GREY = [240, 240, 240];

    doc.setFillColor(SOFT_GREY[0], SOFT_GREY[1], SOFT_GREY[2]);
    doc.rect(0, 0, 210, 45, 'F');
    
    if (company.logoUrl) {
      try {
        doc.addImage(company.logoUrl, 'PNG', 20, 10, 50, 25);
      } catch (e) {
        doc.setFillColor(VSI_BLACK[0], VSI_BLACK[1], VSI_BLACK[2]);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(32);
        doc.text('VSI', 20, 25);
        doc.setFillColor(VSI_RED[0], VSI_RED[1], VSI_RED[2]);
        doc.rect(42, 10, 8, 18, 'F');
        doc.setFontSize(12);
        doc.setTextColor(VSI_BLACK[0], VSI_BLACK[1], VSI_BLACK[2]);
        doc.text('TELECOM', 22, 33);
      }
    } else {
      doc.setFillColor(VSI_BLACK[0], VSI_BLACK[1], VSI_BLACK[2]);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(32);
      doc.text('VSI', 20, 25);
      doc.setFillColor(VSI_RED[0], VSI_RED[1], VSI_RED[2]);
      doc.rect(42, 10, 8, 18, 'F');
      doc.setFontSize(12);
      doc.setTextColor(VSI_BLACK[0], VSI_BLACK[1], VSI_BLACK[2]);
      doc.text('TELECOM', 22, 33);
    }

    doc.setFillColor(0, 0, 0);
    doc.rect(130, 15, 80, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text(`PROPOSTA COMERCIAL ${quote.id}/25`, 135, 20.5);

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    const proposalDate = new Date(quote.date).toLocaleDateString('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' });
    doc.text(proposalDate, 140, 30);

    doc.setFillColor(VSI_RED[0], VSI_RED[1], VSI_RED[2]);
    doc.rect(0, 45, 120, 8, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(10);
    doc.text('GESTÃO DE SEGURANÇA E TELECOMUNICAÇÃO', 10, 50.5);

    doc.setTextColor(VSI_RED[0], VSI_RED[1], VSI_RED[2]);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.text('CONTATO:', 20, 70);
    doc.setTextColor(0, 0, 0);
    doc.text(`${client?.name || 'Não informado'}`, 45, 70);

    doc.setTextColor(VSI_RED[0], VSI_RED[1], VSI_RED[2]);
    doc.text('PROJETO:', 20, 77);
    doc.setTextColor(0, 0, 0);
    doc.text(`${quote.projectName || 'Manutenção Geral'}`, 45, 77);

    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text('ESCOPO DO PROJETO', 20, 92);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    const splitScope = doc.splitTextToSize(quote.scope || 'Nenhum escopo definido.', 170);
    doc.text(splitScope, 20, 99);
    
    doc.setFont('helvetica', 'bold');
    const dTime = quote.deliveryTime || '1';
    const days = parseInt(dTime);
    let deliveryLabel = 'Prazo de entrega do Projeto: ';
    if (!isNaN(days)) {
      deliveryLabel += days === 1 ? '1 dia útil.' : `${days} dias úteis.`;
    } else {
      deliveryLabel += `${dTime}.`;
    }
    doc.text(deliveryLabel, 20, 115);

    doc.setFontSize(11);
    doc.text('ORÇAMENTO COM MÃO DE OBRA E EQUIPAMENTOS', 20, 128);
    
    doc.setFillColor(230, 230, 230);
    doc.rect(20, 131, 170, 8, 'F');
    doc.setFontSize(9);
    doc.setTextColor(0, 0, 0);
    doc.text('ITEM', 22, 136.5);
    doc.text('DESCRIÇÃO', 35, 136.5);
    doc.text('TIPO', 120, 136.5);
    doc.text('VALOR / ETAPA', 160, 136.5);

    let currentY = 145;
    quote.items.forEach((item, index) => {
      doc.setFont('helvetica', 'normal');
      doc.text((index + 1).toString(), 22, currentY);
      doc.text(item.description, 35, currentY);
      doc.text(item.type === 'service' ? 'Mão de Obra' : 'Equipamento', 120, currentY);
      doc.text(`R$ ${item.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 160, currentY);
      currentY += 7;
    });

    currentY += 10;
    const subtotalItems = quote.items.reduce((acc, item) => acc + item.total, 0);
    
    doc.setFillColor(248, 248, 248);
    doc.roundedRect(20, currentY, 170, 32, 2, 2, 'F');
    
    currentY += 8;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(VSI_BLACK[0], VSI_BLACK[1], VSI_BLACK[2]);
    doc.text('Subtotal Serviços e Equipamentos:', 25, currentY);
    doc.text(`R$ ${subtotalItems.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 160, currentY);
    
    currentY += 7;
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(VSI_RED[0], VSI_RED[1], VSI_RED[2]);
    doc.text('Etiqueta: Custo de Deslocamento:', 25, currentY);
    doc.text(`R$ ${quote.travelCost.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 160, currentY);

    currentY += 10;
    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text('INVESTIMENTO TOTAL:', 25, currentY);
    doc.text(`R$ ${quote.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`, 160, currentY);

    currentY += 12;
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('Formas de pagamento:', 20, currentY);
    doc.setFont('helvetica', 'normal');
    doc.text(quote.paymentTerms || 'A combinar.', 20, currentY + 6);

    currentY += 20;
    doc.setFillColor(245, 245, 245);
    doc.roundedRect(20, currentY, 170, 35, 3, 3, 'F');
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9);
    doc.setTextColor(VSI_RED[0], VSI_RED[1], VSI_RED[2]);
    doc.text('CLIQUE PARA APROVAÇÃO DIGITAL VIA WHATSAPP:', 25, currentY + 10);
    
    const waPhone = company.phone.replace(/\D/g, '');
    const msgApprove = encodeURIComponent(`Olá VSI Telecom! Gostaria de APROVAR o orçamento ${quote.id} (${quote.projectName}) no valor de R$ ${quote.total.toFixed(2)}.`);
    const msgReject = encodeURIComponent(`Olá VSI Telecom. Sobre o orçamento ${quote.id} (${quote.projectName}), gostaria de solicitar ajustes ou REPROVAR no momento.`);

    doc.setFillColor(34, 197, 94);
    doc.rect(25, currentY + 15, 60, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('APROVAR ORÇAMENTO', 33, currentY + 21.5);
    doc.link(25, currentY + 15, 60, 10, { url: `https://wa.me/${waPhone}?text=${msgApprove}` });

    doc.setFillColor(100, 116, 139);
    doc.rect(95, currentY + 15, 60, 10, 'F');
    doc.setTextColor(255, 255, 255);
    doc.text('SOLICITAR AJUSTES', 105, currentY + 21.5);
    doc.link(95, currentY + 15, 60, 10, { url: `https://wa.me/${waPhone}?text=${msgReject}` });

    const footerY = 265;
    doc.setTextColor(0, 0, 0);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10);
    doc.text('Compromisso com a Qualidade e Confiança', 20, footerY);
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    const promise = "A VSI Telecom oferece serviços executados por uma equipe técnica altamente qualificada. Trabalhamos com equipamentos de ponta assegurando desempenho e durabilidade. Oferecemos 1 ano de garantia de fábrica para equipamentos e 3 anos de garantia sobre nossos serviços.";
    doc.text(doc.splitTextToSize(promise, 170), 20, footerY + 5);

    doc.setFillColor(VSI_RED[0], VSI_RED[1], VSI_RED[2]);
    doc.rect(0, 280, 210, 17, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'bold');
    doc.text(`${company.phone} | ${company.secondaryPhone || ''}`, 40, 287);
    doc.text(company.website || 'www.vsitelecom.com.br', 100, 287);
    doc.setFontSize(7);
    doc.text(`${company.address}, ${company.number} - Centro, ${company.city} SP - CEP 14860-019`, 40, 292);

    doc.setFillColor(VSI_BLACK[0], VSI_BLACK[1], VSI_BLACK[2]);
    doc.rect(0, 297, 210, 3, 'F');

    return doc;
  };

  const handleDownload = (quote: Quote) => {
    const client = clients.find(c => c.id === quote.clientId);
    const doc = buildPDF(quote, client);
    doc.save(`Proposta_VSI_${client?.name || 'Cliente'}.pdf`);
  };

  const handleShare = async (quote: Quote) => {
    const client = clients.find(c => c.id === quote.clientId);
    const doc = buildPDF(quote, client);
    const pdfBlob = doc.output('blob');
    const fileName = `Proposta_VSI_${(client?.name || 'Cliente').replace(/\s+/g, '_')}.pdf`;
    
    const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Proposta Comercial - VSI Telecom',
          text: `Olá ${client?.name}, segue em anexo a proposta comercial para o projeto ${quote.projectName}.`
        });
      } catch (err) {
        console.error("Erro ao compartilhar:", err);
      }
    } else {
      alert("Seu navegador não suporta o compartilhamento direto de arquivos.");
    }
  };

  const shareWhatsAppText = (quote: Quote) => {
    const client = clients.find(c => c.id === quote.clientId);
    const waPhone = company.phone.replace(/\D/g, '');
    const msgApprove = `https://wa.me/${waPhone}?text=${encodeURIComponent('APROVADO: ' + quote.id)}`;
    
    const text = encodeURIComponent(
      `*VSI TELECOM - PROPOSTA COMERCIAL*\n\n` +
      `Olá ${client?.name}, segue a proposta comercial para o projeto: *${quote.projectName}*.\n\n` +
      `Valor Total: *R$ ${quote.total.toFixed(2)}*\n\n` +
      `Para aprovar agora, basta clicar no link abaixo:\n` +
      `✅ *APROVAR:* ${msgApprove}\n\n` +
      `Ficamos à disposição!`
    );
    window.open(`https://wa.me/${client?.phone.replace(/\D/g, '')}?text=${text}`, '_blank');
  };

  const handleInvoice = async (quote: Quote) => {
    setLoadingId(quote.id);
    const client = clients.find(c => c.id === quote.clientId);
    await simulateNfseXml(quote, company, client);
    onInvoice(quote.id);
    setLoadingId(null);
    alert('NFS-e Emitida com Sucesso!');
  };

  return (
    <div className="space-y-4 pb-20">
      {quotes.map(q => {
        const client = clients.find(c => c.id === q.clientId);
        const isCompleted = q.status === 'completed';
        const hasReport = !!q.reportData;

        return (
          <div key={q.id} className="bg-white rounded-[2rem] p-6 border border-slate-200 shadow-xl space-y-5 animate-in slide-in-from-bottom-2">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-black text-slate-900 text-xl leading-tight mb-1">{client?.name || 'Cliente'}</h4>
                <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{q.projectName || 'Manutenção Geral'}</p>
                <div className="mt-3 flex gap-2">
                    <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full ${
                      q.status === 'invoiced' ? 'bg-purple-100 text-purple-700' : 
                      q.status === 'completed' ? 'bg-green-100 text-green-700' :
                      q.status === 'approved' ? 'bg-blue-100 text-blue-700' :
                      'bg-[#D1101E]/10 text-[#D1101E]'
                    }`}>
                      {q.status === 'invoiced' ? 'NFS-e FATURADA' : q.status === 'completed' ? 'CONCLUÍDO' : q.status.toUpperCase()}
                    </span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-2xl font-black text-slate-900">R$ {q.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                <p className="text-[10px] text-slate-400 font-bold uppercase">{new Date(q.date).toLocaleDateString('pt-BR')}</p>
              </div>
            </div>

            <div className="grid grid-cols-5 gap-1.5">
              <ActionBtn icon={<MessageSquare size={16} />} label="Whats" onClick={() => shareWhatsAppText(q)} color="green" />
              <ActionBtn icon={<Share2 size={16} />} label="Enviar" onClick={() => handleShare(q)} color="blue" />
              <ActionBtn icon={<Download size={16} />} label="PDF" onClick={() => handleDownload(q)} color="red" />
              <ActionBtn icon={<Receipt size={16} />} label="Nota" onClick={() => handleInvoice(q)} color="purple" disabled={q.status === 'invoiced' || loadingId === q.id} />
              <ActionBtn icon={<Trash2 size={16} />} label="Excluir" onClick={() => onDelete(q.id)} color="slate" />
            </div>

            <div className="flex gap-2">
              {isCompleted ? (
                <button 
                  onClick={() => onReport(q)}
                  className="w-full py-4 bg-green-600 text-white rounded-xl font-black uppercase tracking-widest text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg shadow-green-100"
                >
                  <ClipboardList size={18} /> {hasReport ? 'EDITAR RELATÓRIO' : 'GERAR RELATÓRIO FOTOGRÁFICO'}
                </button>
              ) : q.status === 'draft' || q.status === 'sent' ? (
                <>
                  <button 
                    onClick={() => onStatusChange(q.id, 'approved')}
                    className="flex-1 py-3 bg-green-600 text-white rounded-xl font-black uppercase tracking-widest text-[10px] flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md shadow-green-100"
                  >
                    <CheckCircle size={14} /> APROVAR CLIENTE
                  </button>
                  <button 
                    onClick={() => onStatusChange(q.id, 'draft')}
                    className="py-3 px-4 bg-slate-100 text-slate-400 rounded-xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all"
                  >
                    <XCircle size={14} />
                  </button>
                </>
              ) : (
                <button 
                  onClick={() => onEdit(q)}
                  className="w-full py-3 bg-slate-900 text-white rounded-xl font-black uppercase tracking-widest text-[10px] active:scale-95 transition-all"
                >
                  EDITAR PROPOSTA
                </button>
              )}
            </div>
          </div>
        );
      })}

      {quotes.length === 0 && (
        <div className="text-center py-32 opacity-20 flex flex-col items-center">
          <FileText size={80} strokeWidth={1} />
          <p className="font-black uppercase tracking-[0.3em] text-xs mt-4">Nenhuma Proposta</p>
        </div>
      )}
    </div>
  );
};

const ActionBtn: React.FC<{ icon: any, label: string, onClick: () => void, color: string, disabled?: boolean }> = ({ icon, label, onClick, color, disabled }) => {
  const styles: Record<string, string> = {
    green: 'bg-green-50 text-green-600',
    blue: 'bg-blue-50 text-blue-600',
    red: 'bg-red-50 text-[#D1101E]',
    purple: 'bg-purple-50 text-purple-600',
    slate: 'bg-slate-50 text-slate-400'
  };
  return (
    <button 
      disabled={disabled}
      onClick={onClick}
      className={`flex flex-col items-center justify-center p-2 rounded-2xl transition-all active:scale-90 disabled:opacity-30 ${styles[color]}`}
    >
      {icon}
      <span className="text-[7px] mt-1.5 font-black uppercase tracking-tighter text-center">{label}</span>
    </button>
  );
}

export default QuoteList;
