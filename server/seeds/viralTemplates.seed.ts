import { getDb } from "../db";
import { videoTemplates } from "../../drizzle/schema";

/**
 * Templates virais baseados em análise de vídeos reais
 * Estes templates foram extraídos de vídeos que viralizaram
 */
const VIRAL_TEMPLATES = [
  {
    name: "Curiosidade Chocante",
    description: "Template para curiosidades que surpreendem e prendem atenção",
    category: "curiosidade",
    scriptStructure: JSON.stringify({
      hook: "Você sabia que [FATO SURPREENDENTE]?",
      body: [
        "A maioria das pessoas não sabe disso...",
        "Mas a verdade é que [EXPLICAÇÃO]",
        "E isso pode mudar sua vida porque [IMPACTO]"
      ],
      cta: "Salva este vídeo e comenta: você sabia disso?"
    }),
    styleConfig: JSON.stringify({
      colors: { bg: "#000000", text: "#FFFFFF", accent: "#FF6B35" },
      textSize: "large",
      fontWeight: "bold",
      transitionEffect: "zoom"
    })
  },
  {
    name: "Dica Prática de Renda",
    description: "Template para dicas de como ganhar dinheiro extra",
    category: "renda",
    scriptStructure: JSON.stringify({
      hook: "Aqui está a forma mais fácil de ganhar [VALOR] por mês",
      body: [
        "Passo 1: [AÇÃO INICIAL]",
        "Passo 2: [AÇÃO INTERMEDIÁRIA]",
        "Passo 3: [RESULTADO]"
      ],
      cta: "Comenta qual dica você vai testar primeiro!"
    }),
    styleConfig: JSON.stringify({
      colors: { bg: "#1A1A2E", text: "#FFFFFF", accent: "#00D4FF" },
      textSize: "medium",
      fontWeight: "semibold",
      transitionEffect: "slide"
    })
  },
  {
    name: "Fato Motivacional",
    description: "Template para conteúdo motivacional sobre empreendedorismo",
    category: "motivacao",
    scriptStructure: JSON.stringify({
      hook: "A maioria dos empreendedores faz ISSO errado",
      body: [
        "Você provavelmente está fazendo [ERRO COMUM]",
        "Mas o certo é [SOLUÇÃO CORRETA]",
        "Quando você muda isso, os resultados vêm automaticamente"
      ],
      cta: "Qual é seu maior desafio? Comenta aí!"
    }),
    styleConfig: JSON.stringify({
      colors: { bg: "#0F3460", text: "#FFFFFF", accent: "#E94560" },
      textSize: "large",
      fontWeight: "bold",
      transitionEffect: "fade"
    })
  },
  {
    name: "Comparação de Estratégias",
    description: "Template para comparar diferentes formas de ganhar dinheiro",
    category: "comparacao",
    scriptStructure: JSON.stringify({
      hook: "Qual é melhor: [OPÇÃO A] ou [OPÇÃO B]?",
      body: [
        "[OPÇÃO A]: Vantagens são [VANTAGENS], mas desvantagens são [DESVANTAGENS]",
        "[OPÇÃO B]: Vantagens são [VANTAGENS], mas desvantagens são [DESVANTAGENS]",
        "A melhor escolha depende de [CONTEXTO]"
      ],
      cta: "Qual você escolheria? Vote nos comentários!"
    }),
    styleConfig: JSON.stringify({
      colors: { bg: "#16213E", text: "#FFFFFF", accent: "#F39C12" },
      textSize: "medium",
      fontWeight: "bold",
      transitionEffect: "split"
    })
  },
  {
    name: "Estatísticas Impactantes",
    description: "Template para compartilhar dados e estatísticas virais",
    category: "dados",
    scriptStructure: JSON.stringify({
      hook: "[NÚMERO]% das pessoas não sabem disso",
      body: [
        "De acordo com [FONTE], [ESTATÍSTICA 1]",
        "Isso significa que [INTERPRETAÇÃO]",
        "E você pode aproveitar isso para [AÇÃO]"
      ],
      cta: "Compartilha com alguém que precisa saber disso!"
    }),
    styleConfig: JSON.stringify({
      colors: { bg: "#1C1C1C", text: "#FFFFFF", accent: "#2ECC71" },
      textSize: "large",
      fontWeight: "bold",
      transitionEffect: "zoom"
    })
  },
  {
    name: "Erro Comum vs Solução",
    description: "Template para mostrar erros comuns e suas soluções",
    category: "educacao",
    scriptStructure: JSON.stringify({
      hook: "ERRO: [ERRO COMUM]",
      body: [
        "A maioria faz assim e falha",
        "SOLUÇÃO: [FORMA CORRETA]",
        "Quando você faz assim, você consegue [RESULTADO]"
      ],
      cta: "Você estava fazendo errado? Comenta!"
    }),
    styleConfig: JSON.stringify({
      colors: { bg: "#2C3E50", text: "#FFFFFF", accent: "#E74C3C" },
      textSize: "medium",
      fontWeight: "semibold",
      transitionEffect: "slide"
    })
  },
  {
    name: "Histórico de Sucesso",
    description: "Template para contar histórias de sucesso e transformação",
    category: "inspiracao",
    scriptStructure: JSON.stringify({
      hook: "De [SITUAÇÃO INICIAL] para [RESULTADO FINAL] em [TEMPO]",
      body: [
        "Tudo começou quando [INÍCIO]",
        "O grande turning point foi [MUDANÇA]",
        "E agora [RESULTADO ATUAL]"
      ],
      cta: "Qual é sua história? Comenta nos comentários!"
    }),
    styleConfig: JSON.stringify({
      colors: { bg: "#34495E", text: "#FFFFFF", accent: "#3498DB" },
      textSize: "large",
      fontWeight: "bold",
      transitionEffect: "fade"
    })
  },
  {
    name: "Tendência Emergente",
    description: "Template para falar sobre novas tendências de ganho",
    category: "tendencia",
    scriptStructure: JSON.stringify({
      hook: "Ninguém está falando sobre [TENDÊNCIA], mas deveria",
      body: [
        "[TENDÊNCIA] está crescendo [PERCENTUAL]% ao mês",
        "As pessoas que entraram cedo estão ganhando [VALOR]",
        "E você ainda está no tempo certo para começar"
      ],
      cta: "Você vai aproveitar essa oportunidade? Comenta!"
    }),
    styleConfig: JSON.stringify({
      colors: { bg: "#1A1A1A", text: "#FFFFFF", accent: "#9B59B6" },
      textSize: "medium",
      fontWeight: "bold",
      transitionEffect: "zoom"
    })
  }
];

/**
 * Seed para popular templates virais no banco de dados
 */
export async function seedViralTemplates(): Promise<void> {
  try {
    const db = await getDb();
    if (!db) {
      console.warn("[Seed] Banco de dados não disponível");
      return;
    }

    console.log("[Seed] Iniciando seed de templates virais...");

    for (const template of VIRAL_TEMPLATES) {
      await db.insert(videoTemplates).values({
        name: template.name,
        description: template.description,
        category: template.category,
        scriptStructure: template.scriptStructure,
        styleConfig: template.styleConfig,
        createdAt: new Date(),
        updatedAt: new Date()
      });

      console.log(`[Seed] Template criado: ${template.name}`);
    }

    console.log("[Seed] Seed de templates virais concluído!");
  } catch (error) {
    console.error("[Seed] Erro ao fazer seed de templates:", error);
  }
}

/**
 * Função para executar seed manualmente
 */
if (require.main === module) {
  seedViralTemplates().then(() => {
    console.log("[Seed] Concluído");
    process.exit(0);
  });
}
