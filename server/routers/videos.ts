import { z } from "zod";
import { protectedProcedure, publicProcedure, router } from "../_core/trpc";
import {
  listTemplates,
  getGeneratedVideoById,
  listUserVideos,
  createGeneratedVideo,
  updateVideoStatus,
  getTemplateById
} from "../db";
import { generateViralScript, estimateScriptDuration } from "../services/scriptGenerator";
import { generateTTS, validateTextForTTS, cleanTextForTTS } from "../services/ttsService";
import { fetchMediaForTheme } from "../services/mediaFetcher";
import { composeVideo, validateVideoConfig } from "../services/videoComposer";
import { uploadVideoToS3, uploadAudioToS3 } from "../services/storageService";
import { notifyOwner } from "../_core/notification";
import { TRPCError } from "@trpc/server";

/**
 * Router para operações de vídeo
 */
export const videosRouter = router({
  /**
   * Lista todos os templates virais disponíveis
   */
  listTemplates: publicProcedure.query(async () => {
    return await listTemplates();
  }),

  /**
   * Inicia a geração de um novo vídeo
   * Cria registro no banco com status "processing" e retorna ID
   */
  generate: protectedProcedure
    .input(
      z.object({
        theme: z.string().min(3).max(500),
        templateId: z.number().int().positive(),
        duration: z.number().int().min(5).max(60).optional().default(15)
      })
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Validar tema
        if (!input.theme.trim()) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "Tema não pode estar vazio"
          });
        }

        // Buscar template
        const template = await getTemplateById(input.templateId);
        if (!template) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Template não encontrado"
          });
        }

        // Criar registro de vídeo com status "processing"
        const result = await createGeneratedVideo({
          userId: ctx.user.id,
          templateId: input.templateId,
          theme: input.theme,
          status: "processing",
          duration: input.duration
        });

        // Extrair ID do resultado
        const videoId = typeof result === 'object' && 'insertId' in result ? (result as any).insertId : 1;

        // Iniciar processamento assíncrono em background
        processVideoAsync(videoId, ctx.user.id, input.theme, template, input.duration).catch(
          error => console.error("[VideoGeneration] Erro no processamento:", error)
        );

        return {
          videoId,
          status: "processing",
          message: "Vídeo em processamento. Você receberá uma notificação quando estiver pronto."
        };
      } catch (error) {
        console.error("[Videos.generate] Erro:", error);
        throw error;
      }
    }),

  /**
   * Verifica o status de um vídeo em geração
   */
  getStatus: protectedProcedure
    .input(z.object({ videoId: z.number().int().positive() }))
    .query(async ({ ctx, input }) => {
      const video = await getGeneratedVideoById(input.videoId);

      if (!video) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Vídeo não encontrado"
        });
      }

      // Verificar autorização
      if (video.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Você não tem permissão para acessar este vídeo"
        });
      }

      return {
        videoId: video.id,
        status: video.status,
        theme: video.theme,
        videoUrl: video.videoUrl,
        audioUrl: video.audioUrl,
        duration: video.duration,
        errorMessage: video.errorMessage,
        createdAt: video.createdAt
      };
    }),

  /**
   * Lista histórico de vídeos do usuário autenticado
   */
  list: protectedProcedure
    .input(
      z.object({
        limit: z.number().int().positive().max(100).optional().default(20),
        offset: z.number().int().nonnegative().optional().default(0)
      })
    )
    .query(async ({ ctx, input }) => {
      const videos = await listUserVideos(ctx.user.id);

      // Aplicar paginação
      const paginated = videos.slice(input.offset, input.offset + input.limit);

      return {
        videos: paginated.map(v => ({
          id: v.id,
          theme: v.theme,
          status: v.status,
          videoUrl: v.videoUrl,
          duration: v.duration,
          createdAt: v.createdAt
        })),
        total: videos.length,
        limit: input.limit,
        offset: input.offset
      };
    }),

  /**
   * Deleta um vídeo (soft delete - apenas marca como deletado)
   */
  delete: protectedProcedure
    .input(z.object({ videoId: z.number().int().positive() }))
    .mutation(async ({ ctx, input }) => {
      const video = await getGeneratedVideoById(input.videoId);

      if (!video) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Vídeo não encontrado"
        });
      }

      if (video.userId !== ctx.user.id) {
        throw new TRPCError({
          code: "FORBIDDEN",
          message: "Você não tem permissão para deletar este vídeo"
        });
      }

      // Soft delete
      await updateVideoStatus(input.videoId, "failed", {
        errorMessage: "Vídeo deletado pelo usuário"
      });

      return { success: true };
    })
});

/**
 * Processa vídeo de forma assíncrona
 * Executado em background após criar registro inicial
 */
async function processVideoAsync(
  videoId: number,
  userId: number,
  theme: string,
  template: any,
  duration: number
): Promise<void> {
  try {
    console.log(`[VideoProcessing] Iniciando processamento do vídeo ${videoId}`);

    // 1. Gerar roteiro com LLM
    console.log("[VideoProcessing] Gerando roteiro...");
    const script = await generateViralScript(theme, template, duration);

    // 2. Gerar áudio TTS
    console.log("[VideoProcessing] Gerando áudio...");
    const cleanScript = cleanTextForTTS(script.fullScript);
    const validation = validateTextForTTS(cleanScript);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    const ttsResponse = await generateTTS(cleanScript);

    // 3. Buscar imagens de stock
    console.log("[VideoProcessing] Buscando imagens...");
    const mediaResults = await fetchMediaForTheme(theme, 3);
    const imagePaths = mediaResults.map(m => m.url);

    // 4. Compor vídeo
    console.log("[VideoProcessing] Compondo vídeo...");
    const outputPath = `/tmp/video-${videoId}.mp4`;
    const videoConfig = {
      audioPath: ttsResponse.audioUrl,
      imagePaths,
      script: script.body,
      outputPath,
      duration,
      width: 1080,
      height: 1920,
      fps: 30
    };

    const validation2 = validateVideoConfig(videoConfig);
    if (!validation2.valid) {
      throw new Error(validation2.error);
    }

    await composeVideo(videoConfig);

    // 5. Upload para S3
    console.log("[VideoProcessing] Fazendo upload para S3...");
    const videoUpload = await uploadVideoToS3(outputPath, userId, videoId);
    const audioUpload = await uploadAudioToS3(ttsResponse.audioUrl, userId, videoId);

    // 6. Atualizar status no banco
    await updateVideoStatus(videoId, "ready", {
      videoUrl: videoUpload.url,
      audioUrl: audioUpload.url,
      duration: script.fullScript.split(/\s+/).length
    });

    // 7. Notificar usuário
    await notifyOwner({
      title: "Vídeo pronto!",
      content: `Seu vídeo sobre "${theme}" está pronto para download.`
    });

    console.log(`[VideoProcessing] Vídeo ${videoId} processado com sucesso`);
  } catch (error) {
    console.error(`[VideoProcessing] Erro ao processar vídeo ${videoId}:`, error);

    // Atualizar status como falha
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
    await updateVideoStatus(videoId, "failed", { errorMessage });

    // Notificar sobre falha
    await notifyOwner({
      title: "Erro ao gerar vídeo",
      content: `Falha ao processar vídeo: ${errorMessage}`
    });
  }
}
