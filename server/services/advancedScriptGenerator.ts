import { invokeLLM } from "../_core/llm";
import type { ViralVideoAnalysis } from "./youtubeAnalyzer";
import { createHash } from "crypto";

/**
 * Cache de roteiros gerados para evitar repetição
 */
const scriptCache = new Map<string, Set<string>>();

/**
 * Interface para roteiro gerado com análise
 */
export interface AdvancedScript {
  hook: string;
  body: string[];
  cta: string;
  fullScript: string;
  viralPatterns: string[];
  uniqueHash: string;
}

/**
 * Gera roteiros únicos baseados em padrões de vídeos virais
 * Nunca repete o mesmo roteiro para o mesmo tema
 */
export async function generateAdvancedScript(
  theme: string,
  viralExamples: ViralVideoAnalysis[],
  userId: number,
  previousAttempts: number = 0
): Promise<AdvancedScript> {
  try {
    // Inicializar cache do usuário se não existir
    const cacheKey = `user_${userId}`;
    if (!scriptCache.has(cacheKey)) {
      scriptCache.set(cacheKey, new Set());
    }

    // Extrair padrões dos vídeos virais
    const viralPatterns = extractViralPatterns(viralExamples);

    // Construir prompt avançado
    const prompt = buildAdvancedPrompt(theme, viralExamples, viralPatterns, previousAttempts);

    // Chamar LLM
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: `Você é um especialista em criar conteúdo viral para redes sociais. 
          Você analisa padrões de vídeos que viralizaram e cria roteiros ORIGINAIS e ÚNICOS que seguem esses padrões.
          IMPORTANTE: Nunca repita o mesmo roteiro. Cada resposta deve ser completamente diferente.
          Retorne APENAS JSON válido.`
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "advanced_viral_script",
          strict: true,
          schema: {
            type: "object",
            properties: {
              hook: { type: "string", description: "Hook impactante" },
              body: { type: "array", items: { type: "string" }, description: "Corpo do roteiro" },
              cta: { type: "string", description: "Call-to-action" },
              viralPatterns: { type: "array", items: { type: "string" }, description: "Padrões virais usados" }
            },
            required: ["hook", "body", "cta", "viralPatterns"],
            additionalProperties: false
          }
        }
      }
    });

    // Parse da resposta
    const content = response.choices[0]?.message?.content;
    if (!content) {
      throw new Error("Resposta vazia do LLM");
    }

    const contentStr = typeof content === "string" ? content : JSON.stringify(content);
    const parsed = JSON.parse(contentStr);

    // Construir script completo
    const fullScript = [parsed.hook, ...parsed.body, parsed.cta].join(" ");

    // Gerar hash único
    const uniqueHash = createHash("sha256").update(fullScript).digest("hex");

    // Verificar se já foi gerado antes
    const userCache = scriptCache.get(cacheKey)!;
    if (userCache.has(uniqueHash)) {
      console.log("[AdvancedScriptGenerator] Roteiro duplicado detectado, regenerando...");
      // Tentar novamente com previousAttempts + 1
      if (previousAttempts < 3) {
        return generateAdvancedScript(theme, viralExamples, userId, previousAttempts + 1);
      } else {
        throw new Error("Não foi possível gerar roteiro único após 3 tentativas");
      }
    }

    // Adicionar ao cache
    userCache.add(uniqueHash);

    return {
      hook: parsed.hook,
      body: parsed.body,
      cta: parsed.cta,
      fullScript,
      viralPatterns: parsed.viralPatterns,
      uniqueHash
    };
  } catch (error) {
    console.error("[AdvancedScriptGenerator] Erro:", error);
    throw error;
  }
}

/**
 * Extrai padrões virais dos vídeos analisados
 */
function extractViralPatterns(videos: ViralVideoAnalysis[]): string[] {
  const patterns: Set<string> = new Set();

  videos.forEach(video => {
    // Analisar hooks
    video.hooks.forEach((hook) => {
      if (hook.includes("você") || hook.includes("you")) patterns.add("Hook com você");
      if (hook.includes("?")) patterns.add("Hook com pergunta");
      if (hook.includes("sabia") || hook.includes("know")) patterns.add("Hook de curiosidade");
    });

    // Analisar estrutura
    if (video.scriptStructure.body.length >= 3) {
      patterns.add("Estrutura com 3+ pontos");
    }

    // Analisar keywords
    video.keywords.forEach(keyword => {
      if (keyword.includes("dinheiro") || keyword.includes("money")) patterns.add("Foco em dinheiro");
      if (keyword.includes("rápido") || keyword.includes("fast")) patterns.add("Promessa de rapidez");
      if (keyword.includes("fácil") || keyword.includes("easy")) patterns.add("Promessa de facilidade");
    });

    // Analisar CTA
    if (video.scriptStructure.cta.includes("comenta") || video.scriptStructure.cta.includes("comment")) {
      patterns.add("CTA com comentário");
    }
    if (video.scriptStructure.cta.includes("salva") || video.scriptStructure.cta.includes("save")) {
      patterns.add("CTA com save");
    }
    if (video.scriptStructure.cta.includes("compartilha") || video.scriptStructure.cta.includes("share")) {
      patterns.add("CTA com compartilhamento");
    }
  });

  return Array.from(patterns);
}

/**
 * Constrói prompt avançado com padrões virais
 */
function buildAdvancedPrompt(
  theme: string,
  videos: ViralVideoAnalysis[],
  patterns: string[],
  attemptNumber: number
): string {
  const videoExamples = videos
    .slice(0, 3)
    .map(
      (v) =>
        `Título: ${v.title}\nVisualizações: ${v.viewCount.toLocaleString()}\nHook: ${v.scriptStructure.hook}\nEstrutura: ${v.scriptStructure.body.join(" | ")}\nCTA: ${v.scriptStructure.cta}`
    )
    .join("\n\n");

  const patternsList = patterns.join(", ");

  const attemptInstruction =
    attemptNumber > 0
      ? `\n\nEsta é a tentativa ${attemptNumber + 1}. CRIE UM ROTEIRO COMPLETAMENTE DIFERENTE dos anteriores. Mude a estrutura, o tom, os exemplos.`
      : "";

  return `
Tema: ${theme}

Analise estes 3 vídeos virais que funcionaram:
${videoExamples}

Padrões virais identificados: ${patternsList}

Crie um roteiro ORIGINAL e ÚNICO para o tema "${theme}" que:
1. Segue os padrões virais acima
2. É estruturado em: Hook (impactante) → Body (2-4 pontos) → CTA (ação)
3. Usa linguagem simples e direta
4. Tem frases curtas (máximo 15 palavras)
5. Inclui números, estatísticas ou fatos quando possível
6. É lido em voz alta naturalmente
7. NÃO repete o conteúdo dos vídeos acima${attemptInstruction}

Formato de resposta (JSON):
{
  "hook": "Frase de impacto para os primeiros segundos",
  "body": ["Ponto 1", "Ponto 2", "Ponto 3"],
  "cta": "Call-to-action final",
  "viralPatterns": ["Padrão 1 usado", "Padrão 2 usado"]
}
`;
}

/**
 * Limpa cache de um usuário (útil para testes)
 */
export function clearUserCache(userId: number): void {
  const cacheKey = `user_${userId}`;
  scriptCache.delete(cacheKey);
  console.log(`[AdvancedScriptGenerator] Cache do usuário ${userId} limpo`);
}

/**
 * Obtém estatísticas de cache
 */
export function getCacheStats(): { totalUsers: number; totalScripts: number } {
  let totalScripts = 0;
  scriptCache.forEach(scripts => {
    totalScripts += scripts.size;
  });

  return {
    totalUsers: scriptCache.size,
    totalScripts
  };
}
