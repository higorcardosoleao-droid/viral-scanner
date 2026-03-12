import { invokeLLM } from "../_core/llm";
import type { VideoTemplate } from "../../drizzle/schema";

/**
 * Interface para o roteiro gerado
 */
export interface GeneratedScript {
  hook: string;
  body: string[];
  cta: string;
  fullScript: string;
}

/**
 * Gera um roteiro viral usando LLM baseado no tema e template
 * O roteiro é otimizado para redes sociais com hook de atenção e estrutura narrativa comprovada
 */
export async function generateViralScript(
  theme: string,
  template: VideoTemplate,
  duration: number = 15
): Promise<GeneratedScript> {
  // Parse do template para extrair estrutura
  let templateStructure;
  try {
    templateStructure = JSON.parse(template.scriptStructure);
  } catch {
    templateStructure = {
      hook: "Você sabia que...?",
      body: "Fato surpreendente sobre o tema",
      cta: "Salva este vídeo!"
    };
  }

  // Construir prompt para o LLM
  const prompt = `Você é um especialista em criar conteúdo viral para TikTok, Instagram Reels e YouTube Shorts.

Gere um roteiro viral em português brasileiro com a seguinte estrutura:

**Tema**: ${theme}
**Tipo de vídeo**: ${template.category}
**Duração ideal**: ${duration} segundos
**Estrutura esperada**: 
- Hook (primeiros 2-3 segundos): Capte atenção imediatamente
- Corpo (meio do vídeo): Desenvolva a ideia
- CTA (final): Call-to-action para engajamento

**Diretrizes**:
1. Hook deve ser impactante e fazer o espectador pausar o scroll
2. Use linguagem simples e direta
3. Inclua números, estatísticas ou fatos surpreendentes quando possível
4. Finalize com um CTA claro (salva, comenta, compartilha, etc)
5. Cada frase deve ser curta e impactante (máximo 15 palavras)
6. O roteiro deve ser lido em voz alta naturalmente

**Formato de resposta (JSON)**:
{
  "hook": "Frase de impacto para os primeiros segundos",
  "body": ["Frase 1 do corpo", "Frase 2 do corpo", "Frase 3 do corpo"],
  "cta": "Call-to-action final"
}

Responda APENAS com o JSON, sem explicações adicionais.`;

  try {
    const response = await invokeLLM({
      messages: [
        {
          role: "system",
          content: "Você é um especialista em criar conteúdo viral para redes sociais. Retorne APENAS JSON válido."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "viral_script",
          strict: true,
          schema: {
            type: "object",
            properties: {
              hook: { type: "string", description: "Frase de impacto inicial" },
              body: { type: "array", items: { type: "string" }, description: "Frases do corpo" },
              cta: { type: "string", description: "Call-to-action final" }
            },
            required: ["hook", "body", "cta"],
            additionalProperties: false
          }
        }
      }
    });

    // Parse da resposta
    const messageContent = response.choices[0]?.message?.content;
    if (!messageContent) {
      throw new Error("Resposta vazia do LLM");
    }

    // messageContent pode ser string ou array, garantir que é string
    const contentStr = typeof messageContent === 'string' ? messageContent : JSON.stringify(messageContent);
    const parsed = JSON.parse(contentStr);

    // Construir script completo
    const fullScript = [
      parsed.hook,
      ...parsed.body,
      parsed.cta
    ].join(" ");

    return {
      hook: parsed.hook,
      body: parsed.body,
      cta: parsed.cta,
      fullScript
    };
  } catch (error) {
    console.error("[ScriptGenerator] Erro ao gerar roteiro:", error);
    // Fallback para roteiro genérico
    return generateFallbackScript(theme);
  }
}

/**
 * Gera um roteiro fallback caso o LLM falhe
 */
function generateFallbackScript(theme: string): GeneratedScript {
  const hook = `Você sabia que ${theme}?`;
  const body = [
    `Aqui está um fato interessante sobre ${theme}.`,
    `Isso pode mudar sua perspectiva completamente.`,
    `Compartilhe com seus amigos!`
  ];
  const cta = "Salva este vídeo e comenta sua opinião!";

  return {
    hook,
    body,
    cta,
    fullScript: [hook, ...body, cta].join(" ")
  };
}

/**
 * Calcula a duração aproximada do roteiro em segundos
 * Baseado em ~150 palavras por minuto de fala
 */
export function estimateScriptDuration(script: GeneratedScript): number {
  const wordCount = script.fullScript.split(/\s+/).length;
  const wordsPerSecond = 150 / 60; // 150 palavras por minuto
  return Math.ceil(wordCount / wordsPerSecond);
}
