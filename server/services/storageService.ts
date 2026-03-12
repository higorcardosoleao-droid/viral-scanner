import { storagePut } from "../storage";
import { readFileSync } from "fs";

/**
 * Interface para resultado de upload
 */
export interface UploadResult {
  url: string;
  key: string;
}

/**
 * Faz upload de um arquivo de vídeo para S3
 * 
 * @param filePath - Caminho local do arquivo de vídeo
 * @param userId - ID do usuário (para organizar em pastas)
 * @param videoId - ID do vídeo (para nomear o arquivo)
 * @returns URL pública do vídeo e chave de armazenamento
 */
export async function uploadVideoToS3(
  filePath: string,
  userId: number,
  videoId: number
): Promise<UploadResult> {
  try {
    // Ler arquivo do disco
    const fileBuffer = readFileSync(filePath);

    // Gerar chave única com sufixo aleatório
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const key = `videos/${userId}/${videoId}-${randomSuffix}.mp4`;

    // Fazer upload para S3
    const { url } = await storagePut(key, fileBuffer, "video/mp4");

    console.log(`[Storage] Vídeo ${videoId} do usuário ${userId} enviado para S3: ${url}`);

    return { url, key };
  } catch (error) {
    console.error("[Storage] Erro ao fazer upload de vídeo:", error);
    throw new Error("Falha ao fazer upload do vídeo");
  }
}

/**
 * Faz upload de um arquivo de áudio para S3
 * 
 * @param filePath - Caminho local do arquivo de áudio
 * @param userId - ID do usuário
 * @param videoId - ID do vídeo
 * @returns URL pública do áudio
 */
export async function uploadAudioToS3(
  filePath: string,
  userId: number,
  videoId: number
): Promise<UploadResult> {
  try {
    const fileBuffer = readFileSync(filePath);
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const key = `audio/${userId}/${videoId}-${randomSuffix}.mp3`;

    const { url } = await storagePut(key, fileBuffer, "audio/mpeg");

    console.log(`[Storage] Áudio ${videoId} do usuário ${userId} enviado para S3: ${url}`);

    return { url, key };
  } catch (error) {
    console.error("[Storage] Erro ao fazer upload de áudio:", error);
    throw new Error("Falha ao fazer upload do áudio");
  }
}

/**
 * Faz upload de uma imagem para S3
 * 
 * @param filePath - Caminho local da imagem
 * @param userId - ID do usuário
 * @returns URL pública da imagem
 */
export async function uploadImageToS3(
  filePath: string,
  userId: number
): Promise<UploadResult> {
  try {
    const fileBuffer = readFileSync(filePath);
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    const key = `images/${userId}/${randomSuffix}.jpg`;

    const { url } = await storagePut(key, fileBuffer, "image/jpeg");

    console.log(`[Storage] Imagem do usuário ${userId} enviada para S3: ${url}`);

    return { url, key };
  } catch (error) {
    console.error("[Storage] Erro ao fazer upload de imagem:", error);
    throw new Error("Falha ao fazer upload da imagem");
  }
}

/**
 * Gera URL pública para um arquivo em S3
 * 
 * @param key - Chave do arquivo em S3
 * @param expiresIn - Tempo de expiração em segundos (padrão: 7 dias)
 * @returns URL pública do arquivo
 */
export async function getPublicUrl(key: string, expiresIn: number = 604800): Promise<string> {
  try {
    // Usar helper pré-configurado do Manus
    // Em produção, isso seria integrado com a API de storage
    const url = `https://storage.example.com/${key}`;
    return url;
  } catch (error) {
    console.error("[Storage] Erro ao gerar URL pública:", error);
    throw new Error("Falha ao gerar URL pública");
  }
}
