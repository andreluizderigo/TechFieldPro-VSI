
import { createClient } from '@supabase/supabase-js';

const getStoredConfig = () => {
  const url = localStorage.getItem('VSI_SUPABASE_URL')?.trim();
  const key = localStorage.getItem('VSI_SUPABASE_KEY')?.trim();
  return { url, key };
};

export const isConfigured = () => {
  const { url, key } = getStoredConfig();
  return !!(url && key && url.startsWith('https://'));
};

const config = getStoredConfig();

// O cliente é iniciado como nulo se não houver config, prevenindo erros de boot
export const supabase = config.url && config.key 
  ? createClient(config.url, config.key, {
      auth: { persistSession: true, autoRefreshToken: true }
    })
  : null;

export const checkConnectivity = async (url: string, key: string) => {
  try {
    const tempClient = createClient(url, key);
    // Testa apenas o ping básico do Supabase
    const { data, error } = await tempClient.from('clients').select('id').limit(1);
    
    if (error) {
      // Se o erro for de tabela inexistente, a conexão é válida mas o schema não
      if (error.code === '42P01') return { success: true, schemaMissing: true };
      return { success: false, error: error.message };
    }
    
    return { success: true, schemaMissing: false };
  } catch (err: any) {
    return { success: false, error: "Falha crítica ao contactar servidor Supabase." };
  }
};

export const saveConfig = (url: string, key: string) => {
  localStorage.setItem('VSI_SUPABASE_URL', url);
  localStorage.setItem('VSI_SUPABASE_KEY', key);
  window.location.reload();
};

export const resetApp = () => {
  if (confirm("Deseja resetar todas as configurações de conexão? Os dados locais serão mantidos, mas a sincronização será pausada.")) {
    localStorage.removeItem('VSI_SUPABASE_URL');
    localStorage.removeItem('VSI_SUPABASE_KEY');
    window.location.reload();
  }
};
