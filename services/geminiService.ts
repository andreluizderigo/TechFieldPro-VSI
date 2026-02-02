
import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export async function estimateDistance(from: string, to: string): Promise<number> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Calcule a distância aproximada em quilômetros via estradas entre:
      Origem: ${from}
      Destino: ${to}
      Retorne APENAS um número representando os KM. Se não conseguir calcular, retorne 0.`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });

    const text = response.text || "0";
    const km = parseFloat(text.replace(/[^0-9.]/g, ''));
    return isNaN(km) ? 0 : km;
  } catch (error) {
    console.error("Error estimating distance:", error);
    return 0;
  }
}

export async function askTechAssistant(prompt: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: prompt,
      config: {
        systemInstruction: `Você é o VSI TechBot, um assistente virtual ultra-especialista para técnicos de campo.
        Suas especialidades principais são:
        1. CFTV (Analógico e IP): Configuração de NVRs, DVRs, compressão H.265, análise de vídeo e câmeras térmicas.
        2. Redes de Computadores: VLANs, sub-redes, roteamento, Wi-Fi 6, balanceamento de carga e cabeamento estruturado.
        3. Marcas: Especialista em todo o portfólio de produtos Intelbras, Hikvision e JFL.
        4. Alarmes e Incêndio: Centrais monitoradas, sensores infravermelhos, cercas elétricas e protocolos de comunicação.
        5. Refrigeração: Sistemas Hi-Wall, Cassete, Piso-Teto e sistemas complexos VRF (Variable Refrigerant Flow).
        6. Climatização: Cálculo de carga térmica (BTUs), vácuo, carga de fluido refrigerante e elétrica para HVAC.

        Suas respostas devem ser técnicas, diretas, objetivas e formatadas para leitura rápida no celular (use tópicos e negrito).`,
        temperature: 0.7,
        topP: 0.95,
      }
    });
    return response.text || "Desculpe, não consegui processar sua dúvida técnica agora.";
  } catch (error) {
    console.error("TechBot error:", error);
    return "Erro de conexão com a base de conhecimento técnica.";
  }
}

export async function professionalizeNotes(notes: string): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Reescreva as seguintes notas de orçamento para torná-las profissionais, formais e persuasivas em português:
      "${notes}"`,
      config: {
        thinkingConfig: { thinkingBudget: 0 }
      }
    });
    return response.text || notes;
  } catch (error) {
    return notes;
  }
}

export async function simulateNfseXml(quote: any, company: any, client: any): Promise<string> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Gere um exemplo simplificado de XML de NFS-e (Nota Fiscal de Serviço Eletrônica) para o seguinte serviço:
      Prestador: ${company.name} (CNPJ: ${company.cnpj})
      Tomador: ${client.name} (CPF/CNPJ: ${client.document})
      Valor Total: R$ ${quote.total.toFixed(2)}
      Descrição: ${quote.items.map((i: any) => i.description).join(', ')}`,
    });
    return response.text || "";
  } catch (error) {
    return "Erro ao gerar XML";
  }
}
