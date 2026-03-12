import axios from "axios";

/**
 * Interface para vídeo viral analisado
 */
export interface ViralVideoAnalysis {
  videoId: string;
  title: string;
  channelTitle: string;
  viewCount: number;
  likeCount: number;
  transcript: string;
  language: string;
  keywords: string[];
  hooks: string[];
  scriptStructure: {
    hook: string;
    body: string[];
    cta: string;
  };
}

/**
 * Busca os 10 vídeos mais virais no YouTube para um nicho específico
 * Suporta buscas em português e inglês
 */
export async function findViralVideos(
  niche: string,
  language: "pt" | "en" = "pt",
  limit: number = 10
): Promise<ViralVideoAnalysis[]> {
  try {
    const apiKey = process.env.YOUTUBE_API_KEY;
    if (!apiKey) {
      console.warn("[YouTube] API key não configurada");
      return getPlaceholderVideos(niche);
    }

    // Construir query de busca
    const queries = {
      pt: {
        "renda-extra": "renda extra online como ganhar dinheiro",
        "empreendedorismo": "empreendedorismo negócio próprio",
        "finanças": "finanças pessoais investimento",
        "monetização": "monetização conteúdo YouTube TikTok"
      },
      en: {
        "renda-extra": "side hustle make money online",
        "empreendedorismo": "entrepreneurship business ideas",
        "finanças": "personal finance investing",
        "monetização": "content monetization YouTube TikTok"
      }
    };

    const searchQuery = queries[language][niche as keyof typeof queries[typeof language]] || niche;

    // Buscar vídeos
    const response = await axios.get("https://www.googleapis.com/youtube/v3/search", {
      params: {
        part: "snippet",
        q: searchQuery,
        type: "video",
        order: "viewCount",
        maxResults: limit,
        key: apiKey,
        regionCode: language === "pt" ? "BR" : "US",
        relevanceLanguage: language
      }
    });

    const videos = response.data.items || [];

    // Analisar cada vídeo
    const analyses: ViralVideoAnalysis[] = [];
    for (const video of videos.slice(0, limit)) {
      try {
        const analysis = await analyzeVideo(video.id.videoId, apiKey);
        analyses.push(analysis);
      } catch (error) {
        console.error(`[YouTube] Erro ao analisar vídeo ${video.id.videoId}:`, error);
      }
    }

    return analyses;
  } catch (error) {
    console.error("[YouTube] Erro ao buscar vídeos virais:", error);
    return getPlaceholderVideos(niche);
  }
}

/**
 * Analisa um vídeo específico do YouTube
 */
async function analyzeVideo(videoId: string, apiKey: string): Promise<ViralVideoAnalysis> {
  try {
    // Buscar detalhes do vídeo
    const videoResponse = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
      params: {
        part: "snippet,statistics",
        id: videoId,
        key: apiKey
      }
    });

    const video = videoResponse.data.items[0];
    if (!video) {
      throw new Error("Vídeo não encontrado");
    }

    // Buscar transcrição
    const transcript = await getVideoTranscript(videoId);

    // Detectar idioma
    const language = detectLanguage(transcript);

    // Extrair padrões virais
    const hooks = extractHooks(transcript);
    const keywords = extractKeywords(transcript);
    const scriptStructure = analyzeScriptStructure(transcript);

    return {
      videoId,
      title: video.snippet.title,
      channelTitle: video.snippet.channelTitle,
      viewCount: parseInt(video.statistics.viewCount || "0"),
      likeCount: parseInt(video.statistics.likeCount || "0"),
      transcript,
      language,
      keywords,
      hooks,
      scriptStructure
    };
  } catch (error) {
    console.error(`[YouTube] Erro ao analisar vídeo ${videoId}:`, error);
    throw error;
  }
}

/**
 * Busca transcrição do vídeo (usando youtube-transcript-api)
 * Nota: Requer implementação com biblioteca externa
 */
async function getVideoTranscript(videoId: string): Promise<string> {
  try {
    // Usar biblioteca youtube-transcript-api via Python
    const { spawn } = require("child_process");
    
    return new Promise((resolve, reject) => {
      const python = spawn("python3", [
        "-c",
        `
import sys
try:
  from youtube_transcript_api import YouTubeTranscriptApi
  transcript = YouTubeTranscriptApi.get_transcript('${videoId}', languages=['pt', 'en'])
  text = ' '.join([item['text'] for item in transcript])
  print(text)
except Exception as e:
  print(f"Error: {e}", file=sys.stderr)
  sys.exit(1)
`
      ]);

      let output = "";
      let error = "";

      python.stdout.on("data", (data: Buffer) => {
        output += data.toString();
      });

      python.stderr.on("data", (data: Buffer) => {
        error += data.toString();
      });

      python.on("close", (code: number) => {
        if (code === 0) {
          resolve(output.trim());
        } else {
          // Fallback: retornar transcrição placeholder
          resolve(generatePlaceholderTranscript(videoId));
        }
      });
    });
  } catch (error) {
    console.error("[YouTube] Erro ao buscar transcrição:", error);
    return generatePlaceholderTranscript(videoId);
  }
}

/**
 * Detecta o idioma da transcrição
 */
function detectLanguage(text: string): "pt" | "en" {
  // Palavras-chave em português
  const ptKeywords = ["que", "para", "você", "como", "mais", "dinheiro", "ganhar", "é", "em"];
  // Palavras-chave em inglês
  const enKeywords = ["the", "you", "how", "to", "make", "money", "is", "and", "for"];

  const ptCount = ptKeywords.filter(word => text.toLowerCase().includes(word)).length;
  const enCount = enKeywords.filter(word => text.toLowerCase().includes(word)).length;

  return ptCount > enCount ? "pt" : "en";
}

/**
 * Extrai hooks (primeiras frases impactantes) da transcrição
 */
function extractHooks(transcript: string): string[] {
  const sentences = transcript.split(/[.!?]+/).slice(0, 5);
  return sentences
    .map(s => s.trim())
    .filter(s => s.length > 10 && s.length < 150);
}

/**
 * Extrai palavras-chave da transcrição
 */
function extractKeywords(transcript: string): string[] {
  const stopwords = new Set([
    "que", "para", "você", "como", "mais", "é", "em", "de", "a", "o", "e", "um",
    "the", "you", "how", "to", "is", "and", "for", "a", "in", "on"
  ]);

  const words = transcript
    .toLowerCase()
    .split(/\s+/)
    .filter(word => word.length > 4 && !stopwords.has(word));

  // Contar frequência
  const frequency: Record<string, number> = {};
  words.forEach(word => {
    frequency[word] = (frequency[word] || 0) + 1;
  });

  // Retornar top 10
  return Object.entries(frequency)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([word]) => word);
}

/**
 * Analisa a estrutura do roteiro (hook, body, cta)
 */
function analyzeScriptStructure(transcript: string): {
  hook: string;
  body: string[];
  cta: string;
} {
  const sentences = transcript.split(/[.!?]+/).map(s => s.trim()).filter(s => s.length > 0);

  // Hook: primeira frase
  const hook = sentences[0] || "Você sabia que...?";

  // Body: frases do meio
  const body = sentences.slice(1, Math.max(3, sentences.length - 1));

  // CTA: última frase
  const cta = sentences[sentences.length - 1] || "Compartilhe este vídeo!";

  return { hook, body, cta };
}

/**
 * Gera transcrição placeholder quando API não está disponível
 */
function generatePlaceholderTranscript(videoId: string): string {
  const placeholders = {
    pt: "Você sabia que existem várias formas de ganhar dinheiro extra online? Neste vídeo vou mostrar as 5 melhores estratégias para começar hoje mesmo. Primeiro, você pode fazer freelance. Segundo, criar conteúdo. Terceiro, investir. Quarto, empreender. E quinto, monetizar suas habilidades. Não perca este vídeo, salva aqui e comenta qual é sua estratégia favorita!",
    en: "Did you know there are many ways to make money online? In this video I'll show you the 5 best strategies to start today. First, you can do freelance work. Second, create content. Third, invest. Fourth, start a business. And fifth, monetize your skills. Don't miss this video, save it here and comment which strategy is your favorite!"
  };

  return placeholders.pt;
}

/**
 * Retorna vídeos placeholder quando API não está disponível
 */
function getPlaceholderVideos(niche: string): ViralVideoAnalysis[] {
  return [
    {
      videoId: "placeholder1",
      title: "Como Ganhar R$1000 por Mês Online",
      channelTitle: "Canal de Finanças",
      viewCount: 500000,
      likeCount: 25000,
      transcript: generatePlaceholderTranscript("placeholder1"),
      language: "pt",
      keywords: ["dinheiro", "online", "ganhar", "renda", "extra"],
      hooks: ["Você sabia que existem várias formas de ganhar dinheiro extra online?"],
      scriptStructure: {
        hook: "Você sabia que existem várias formas de ganhar dinheiro extra online?",
        body: [
          "Neste vídeo vou mostrar as 5 melhores estratégias para começar hoje mesmo.",
          "Primeiro, você pode fazer freelance. Segundo, criar conteúdo."
        ],
        cta: "Não perca este vídeo, salva aqui e comenta qual é sua estratégia favorita!"
      }
    }
  ];
}
