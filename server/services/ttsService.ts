import { invokeLLM } from "../_core/llm";

/**
 * Interface para resposta de TTS
 */
export interface TTSResponse {
  audioUrl: string;
  duration: number;
  format: string;
}

/**
 * Gera áudio em português brasileiro a partir de um texto
 * Usa o serviço de TTS integrado do Manus
 * 
 * @param text - Texto a ser convertido em áudio
 * @param voice - Voz a usar (padrão: português brasileiro feminino)
 * @returns URL do áudio gerado e duração em segundos
 */
export async function generateTTS(
  text: string,
  voice: string = "pt-BR-female"
): Promise<TTSResponse> {
  try {
    // Usar o LLM para gerar áudio via TTS integrado
    // Nota: A integração real de TTS seria via API específica do Manus
    // Por enquanto, vamos usar um placeholder que será implementado
    
    console.log("[TTS] Gerando áudio para:", text.substring(0, 50) + "...");
    
    // Simulação de resposta TTS
    // Em produção, isso seria uma chamada real ao serviço de TTS
    const audioUrl = `https://tts-placeholder.example.com/audio-${Date.now()}.mp3`;
    const estimatedDuration = estimateSpeechDuration(text);
    
    return {
      audioUrl,
      duration: estimatedDuration,
      format: "mp3"
    };
  } catch (error) {
    console.error("[TTS] Erro ao gerar áudio:", error);
    throw new Error("Falha ao gerar áudio TTS");
  }
}

/**
 * Estima a duração do áudio em segundos
 * Baseado em ~150 palavras por minuto de fala em português
 */
function estimateSpeechDuration(text: string): number {
  const wordCount = text.split(/\s+/).length;
  const wordsPerSecond = 150 / 60; // 150 palavras por minuto
  return Math.ceil(wordCount / wordsPerSecond);
}

/**
 * Valida se o texto é apropriado para TTS
 */
export function validateTextForTTS(text: string): { valid: boolean; error?: string } {
  if (!text || text.trim().length === 0) {
    return { valid: false, error: "Texto vazio" };
  }

  if (text.length > 5000) {
    return { valid: false, error: "Texto muito longo (máximo 5000 caracteres)" };
  }

  // Remover caracteres especiais problemáticos
  const problematicChars = /[<>{}[\]]/g;
  if (problematicChars.test(text)) {
    return { valid: false, error: "Texto contém caracteres não suportados" };
  }

  return { valid: true };
}

/**
 * Limpa o texto para melhor síntese de fala
 * Remove caracteres especiais e normaliza espaçamento
 */
export function cleanTextForTTS(text: string): string {
  return text
    .replace(/\s+/g, " ") // Normalizar espaçamento
    .replace(/[^\w\s.,!?\-áéíóúãõâêôç]/gi, "") // Remover caracteres especiais
    .trim();
}
