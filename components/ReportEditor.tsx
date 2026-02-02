
import React, { useState } from 'react';
import { Quote, Client, CompanyProfile, ReportPhoto } from '../types';
// Added missing Loader2 and Download imports
import { Camera, Plus, Trash2, Save, X, Share2, FileText, CheckCircle, Loader2, Download } from 'lucide-react';

interface ReportEditorProps {
  quote: Quote;
  client: Client;
  company: CompanyProfile;
  onSave: (quote: Quote) => void;
  onCancel: () => void;
}

const ReportEditor: React.FC<ReportEditorProps> = ({ quote, client, company, onSave, onCancel }) => {
  const [photos, setPhotos] = useState<ReportPhoto[]>(quote.reportData?.photos || []);
  const [notes, setNotes] = useState(quote.reportData?.notes || '');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleAddPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const newPhoto: ReportPhoto = {
          id: Math.random().toString(36).substr(2, 9),
          url: reader.result as string,
          caption: ''
        };
        setPhotos([...photos, newPhoto]);
      };
      reader.readAsDataURL(file);
    }
  };

  const updateCaption = (id: string, caption: string) => {
    setPhotos(photos.map(p => p.id === id ? { ...p, caption } : p));
  };

  const removePhoto = (id: string) => {
    setPhotos(photos.filter(p => p.id !== id));
  };

  const buildReportPDF = () => {
    const { jsPDF } = (window as any).jspdf;
    const doc = new jsPDF();
    const VSI_RED = [209, 16, 30];
    const VSI_BLACK = [33, 33, 33];

    // Papel Timbrado - Header
    doc.setFillColor(245, 245, 245);
    doc.rect(0, 0, 210, 40, 'F');
    
    if (company.logoUrl) {
      try {
        doc.addImage(company.logoUrl, 'PNG', 15, 8, 45, 22);
      } catch (e) {
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(28);
        doc.text('VSI', 15, 25);
      }
    }

    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'bold');
    doc.text('RELATÓRIO TÉCNICO DE CONCLUSÃO', 130, 18);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.text(`Protocolo: OS-${quote.id}`, 130, 23);
    doc.text(`Data Execução: ${new Date().toLocaleDateString('pt-BR')}`, 130, 27);

    // Divisor Vermelho
    doc.setFillColor(VSI_RED[0], VSI_RED[1], VSI_RED[2]);
    doc.rect(0, 40, 210, 2, 'F');

    // Dados do Cliente e Projeto
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(VSI_RED[0], VSI_RED[1], VSI_RED[2]);
    doc.text('DADOS DO CLIENTE E SERVIÇO', 15, 52);
    
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(10);
    doc.text(`Cliente: ${client.name}`, 15, 60);
    doc.setFont('helvetica', 'normal');
    doc.text(`Endereço: ${client.address}, ${client.number}`, 15, 65);
    doc.text(`Projeto: ${quote.projectName}`, 15, 70);

    // Resumo de Itens
    doc.setFont('helvetica', 'bold');
    doc.text('SERVIÇOS EXECUTADOS:', 15, 80);
    doc.setFont('helvetica', 'normal');
    let itemY = 85;
    quote.items.forEach(item => {
      if (item.type === 'service') {
        doc.text(`• ${item.description}`, 15, itemY);
        itemY += 5;
      }
    });

    // Galeria Fotográfica
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(VSI_RED[0], VSI_RED[1], VSI_RED[2]);
    doc.text('REGISTRO FOTOGRÁFICO', 15, itemY + 10);
    
    let photoY = itemY + 18;
    photos.forEach((photo, index) => {
      if (photoY > 230) {
        doc.addPage();
        photoY = 20;
      }
      
      try {
        // Tenta adicionar a imagem (Reduzindo largura para caber legendas ao lado ou abaixo)
        doc.addImage(photo.url, 'JPEG', 15, photoY, 90, 60);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(9);
        doc.setTextColor(VSI_BLACK[0], VSI_BLACK[1], VSI_BLACK[2]);
        doc.text(`Figura ${index + 1}:`, 110, photoY + 5);
        doc.setFont('helvetica', 'normal');
        const splitCaption = doc.splitTextToSize(photo.caption || 'Sem descrição técnica.', 80);
        doc.text(splitCaption, 110, photoY + 10);
        
        photoY += 70;
      } catch (err) {
        console.error("PDF Image Error", err);
      }
    });

    // Observações Finais
    if (notes) {
      if (photoY > 250) doc.addPage();
      doc.setFont('helvetica', 'bold');
      doc.text('OBSERVAÇÕES TÉCNICAS:', 15, photoY + 10);
      doc.setFont('helvetica', 'normal');
      const splitNotes = doc.splitTextToSize(notes, 180);
      doc.text(splitNotes, 15, photoY + 16);
    }

    // Footer
    const totalPages = (doc as any).internal.getNumberOfPages();
    for(let i = 1; i <= totalPages; i++) {
        doc.setPage(i);
        doc.setFillColor(VSI_RED[0], VSI_RED[1], VSI_RED[2]);
        doc.rect(0, 285, 210, 15, 'F');
        doc.setTextColor(255, 255, 255);
        doc.setFontSize(8);
        doc.text(`${company.name} | ${company.phone} | ${company.website || ''}`, 15, 292);
        doc.text(`Página ${i} de ${totalPages}`, 180, 292);
    }

    return doc;
  };

  const handleShare = async () => {
    setIsGenerating(true);
    const doc = buildReportPDF();
    const pdfBlob = doc.output('blob');
    const fileName = `Relatorio_Tecnico_VSI_${quote.id}.pdf`;
    const file = new File([pdfBlob], fileName, { type: 'application/pdf' });

    if (navigator.canShare && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({
          files: [file],
          title: 'Relatório Técnico - VSI Telecom',
          text: `Olá ${client.name}, segue o relatório técnico do serviço concluído hoje.`
        });
      } catch (err) {
        console.error("Share error", err);
      }
    } else {
      doc.save(fileName);
    }
    setIsGenerating(false);
  };

  const handleSave = () => {
    const updatedQuote: Quote = {
      ...quote,
      reportData: {
        photos,
        notes,
        finalDate: new Date().toISOString()
      }
    };
    onSave(updatedQuote);
  };

  return (
    <div className="space-y-6 pb-44 animate-in slide-in-from-right-5 duration-300">
      <section className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-3 bg-green-50 text-green-600 rounded-2xl">
            <CheckCircle size={24} />
          </div>
          <div>
            <h3 className="font-black text-slate-900 uppercase text-lg">Conclusão de Serviço</h3>
            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{client.name}</p>
          </div>
        </div>
        <textarea 
          placeholder="Notas técnicas finais sobre a execução do serviço..." 
          className="w-full p-4 bg-slate-50 border-0 rounded-2xl font-bold outline-none h-24 resize-none"
          value={notes}
          onChange={e => setNotes(e.target.value)}
        />
      </section>

      <section className="bg-white p-6 rounded-[2.5rem] shadow-sm border border-slate-200 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Evidências Fotográficas</h3>
          <label className="p-3 bg-[#D1101E] text-white rounded-2xl cursor-pointer active:scale-95 transition-transform shadow-lg shadow-red-100">
            <Camera size={20} />
            <input type="file" className="hidden" accept="image/*" onChange={handleAddPhoto} />
          </label>
        </div>

        <div className="grid grid-cols-1 gap-6">
          {photos.map(photo => (
            <div key={photo.id} className="bg-slate-50 rounded-3xl overflow-hidden border border-slate-100 p-2 space-y-3">
              <div className="relative aspect-video rounded-2xl overflow-hidden">
                <img src={photo.url} className="w-full h-full object-cover" alt="Service evidence" />
                <button 
                  onClick={() => removePhoto(photo.id)}
                  className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full shadow-lg"
                >
                  <Trash2 size={16} />
                </button>
              </div>
              <input 
                placeholder="Legenda da foto (Ex: Fixação do DVR concluída)"
                className="w-full px-4 py-3 bg-white rounded-xl text-xs font-bold outline-none border border-slate-200 focus:border-[#D1101E]"
                value={photo.caption}
                onChange={e => updateCaption(photo.id, e.target.value)}
              />
            </div>
          ))}
          {photos.length === 0 && (
            <div className="py-12 text-center border-2 border-dashed border-slate-100 rounded-3xl opacity-20 flex flex-col items-center">
              <Camera size={48} strokeWidth={1} />
              <p className="text-[10px] font-black uppercase tracking-widest mt-2">Nenhuma foto anexada</p>
            </div>
          )}
        </div>
      </section>

      <div className="fixed bottom-0 left-0 right-0 bg-white/95 backdrop-blur-md border-t border-slate-200 p-6 safe-bottom z-[60] shadow-2xl flex flex-col gap-3">
        <div className="flex gap-3">
          <button 
            onClick={handleShare}
            disabled={isGenerating}
            className="flex-1 bg-slate-900 text-white py-4 rounded-[1.8rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl"
          >
            {isGenerating ? <Loader2 className="animate-spin" size={18} /> : <Share2 size={18} />}
            COMPARTILHAR PDF
          </button>
          <button 
            onClick={() => buildReportPDF().save(`Relatorio_VSI_${quote.id}.pdf`)}
            className="p-4 bg-slate-100 text-slate-600 rounded-[1.8rem] active:scale-95 transition-all"
          >
            <Download size={20} />
          </button>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleSave}
            className="flex-1 bg-green-600 text-white py-4 rounded-[1.8rem] font-black text-xs uppercase tracking-widest flex items-center justify-center gap-2 active:scale-95 transition-all shadow-xl"
          >
            <Save size={18} /> SALVAR RELATÓRIO
          </button>
          <button onClick={onCancel} className="p-4 bg-slate-100 text-slate-400 rounded-[1.8rem] active:scale-95 transition-all">
            <X size={20} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ReportEditor;
