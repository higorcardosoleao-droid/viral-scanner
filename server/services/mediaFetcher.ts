/**
 * Interface para resultado de busca de mídia
 */
export interface MediaSearchResult {
  url: string;
  source: "pexels" | "unsplash";
  title: string;
  photographer: string;
}

/**
 * Busca imagens em Pexels e Unsplash baseado em um tema
 * Retorna URLs de imagens de alta qualidade para composição de vídeo
 * 
 * @param theme - Tema para buscar imagens
 * @param count - Número de imagens a retornar (padrão: 3)
 * @returns Array de URLs de imagens
 */
export async function fetchMediaForTheme(
  theme: string,
  count: number = 3
): Promise<MediaSearchResult[]> {
  try {
    const results: MediaSearchResult[] = [];

    // Buscar em Pexels
    const pexelsResults = await searchPexels(theme, Math.ceil(count / 2));
    results.push(...pexelsResults);

    // Buscar em Unsplash
    const unsplashResults = await searchUnsplash(theme, count - pexelsResults.length);
    results.push(...unsplashResults);

    return results.slice(0, count);
  } catch (error) {
    console.error("[MediaFetcher] Erro ao buscar mídia:", error);
    // Retornar imagens placeholder
    return getPlaceholderImages(count);
  }
}

/**
 * Busca imagens em Pexels
 * Nota: Requer PEXELS_API_KEY nas variáveis de ambiente
 */
async function searchPexels(query: string, count: number): Promise<MediaSearchResult[]> {
  try {
    const apiKey = process.env.PEXELS_API_KEY;
    if (!apiKey) {
      console.warn("[Pexels] API key não configurada");
      return [];
    }

    const response = await fetch(
      `https://api.pexels.com/v1/search?query=${encodeURIComponent(query)}&per_page=${count}`,
      {
        headers: { Authorization: apiKey }
      }
    );

    if (!response.ok) {
      throw new Error(`Pexels API error: ${response.status}`);
    }

    const data = await response.json() as { photos?: Array<{ src?: { large?: string }; photographer?: string; alt?: string }> };
    const photos = data.photos || [];

    return photos
      .filter(photo => photo.src?.large)
      .map(photo => ({
        url: photo.src!.large!,
        source: "pexels" as const,
        title: photo.alt || "Imagem de stock",
        photographer: photo.photographer || "Desconhecido"
      }));
  } catch (error) {
    console.error("[Pexels] Erro na busca:", error);
    return [];
  }
}

/**
 * Busca imagens em Unsplash
 * Nota: Requer UNSPLASH_ACCESS_KEY nas variáveis de ambiente
 */
async function searchUnsplash(query: string, count: number): Promise<MediaSearchResult[]> {
  try {
    const accessKey = process.env.UNSPLASH_ACCESS_KEY;
    if (!accessKey) {
      console.warn("[Unsplash] Access key não configurada");
      return [];
    }

    const response = await fetch(
      `https://api.unsplash.com/search/photos?query=${encodeURIComponent(query)}&per_page=${count}&client_id=${accessKey}`
    );

    if (!response.ok) {
      throw new Error(`Unsplash API error: ${response.status}`);
    }

    const data = await response.json() as { results?: Array<{ urls?: { regular?: string }; user?: { name?: string }; description?: string }> };
    const results = data.results || [];

    return results
      .filter(result => result.urls?.regular)
      .map(result => ({
        url: result.urls!.regular!,
        source: "unsplash" as const,
        title: result.description || "Imagem de stock",
        photographer: result.user?.name || "Desconhecido"
      }));
  } catch (error) {
    console.error("[Unsplash] Erro na busca:", error);
    return [];
  }
}

/**
 * Retorna imagens placeholder quando APIs não estão disponíveis
 */
function getPlaceholderImages(count: number): MediaSearchResult[] {
  const placeholders = [
    {
      url: "https://images.pexels.com/photos/1181690/pexels-photo-1181690.jpeg?auto=compress&cs=tinysrgb&w=600",
      source: "pexels" as const,
      title: "Imagem padrão 1",
      photographer: "Pexels"
    },
    {
      url: "https://images.pexels.com/photos/3808517/pexels-photo-3808517.jpeg?auto=compress&cs=tinysrgb&w=600",
      source: "pexels" as const,
      title: "Imagem padrão 2",
      photographer: "Pexels"
    },
    {
      url: "https://images.pexels.com/photos/3962286/pexels-photo-3962286.jpeg?auto=compress&cs=tinysrgb&w=600",
      source: "pexels" as const,
      title: "Imagem padrão 3",
      photographer: "Pexels"
    }
  ];

  return placeholders.slice(0, count);
}

/**
 * Valida se uma URL de imagem é acessível
 */
export async function validateImageUrl(url: string): Promise<boolean> {
  try {
    const response = await fetch(url, { method: "HEAD" });
    return response.ok;
  } catch {
    return false;
  }
}

/**
 * Normaliza URLs de imagem para garantir tamanho consistente
 */
export function normalizeImageUrl(url: string, width: number = 1080, height: number = 1920): string {
  // Adicionar parâmetros de tamanho se suportado
  if (url.includes("pexels.com")) {
    return `${url}?w=${width}&h=${height}&fit=crop`;
  }
  if (url.includes("unsplash.com")) {
    return `${url}?w=${width}&h=${height}&fit=crop`;
  }
  return url;
}
