import { describe, it, expect, vi } from "vitest";
import { findViralVideos } from "./youtubeAnalyzer";

describe("youtubeAnalyzer", () => {
  it("should find viral videos for a niche", async () => {
    // Este teste valida que o serviço consegue buscar vídeos
    // Mesmo se a API não responder, deve retornar placeholder
    const videos = await findViralVideos("renda-extra", "pt", 3);

    expect(Array.isArray(videos)).toBe(true);
    expect(videos.length).toBeGreaterThan(0);

    // Verificar estrutura de resposta
    const video = videos[0];
    expect(video).toHaveProperty("videoId");
    expect(video).toHaveProperty("title");
    expect(video).toHaveProperty("transcript");
    expect(video).toHaveProperty("hooks");
    expect(video).toHaveProperty("keywords");
    expect(video).toHaveProperty("scriptStructure");
  });

  it("should support multiple niches", async () => {
    const niches = ["renda-extra", "empreendedorismo", "finanças", "monetização"];

    for (const niche of niches) {
      const videos = await findViralVideos(niche, "pt", 1);
      expect(Array.isArray(videos)).toBe(true);
      expect(videos.length).toBeGreaterThan(0);
    }
  });

  it("should support both Portuguese and English", async () => {
    const videosPT = await findViralVideos("renda-extra", "pt", 1);
    const videosEN = await findViralVideos("renda-extra", "en", 1);

    expect(videosPT.length).toBeGreaterThan(0);
    expect(videosEN.length).toBeGreaterThan(0);
  });

  it("should extract hooks from videos", async () => {
    const videos = await findViralVideos("renda-extra", "pt", 1);
    const video = videos[0];

    expect(Array.isArray(video.hooks)).toBe(true);
    expect(video.hooks.length).toBeGreaterThan(0);
    expect(typeof video.hooks[0]).toBe("string");
  });

  it("should extract keywords from videos", async () => {
    const videos = await findViralVideos("renda-extra", "pt", 1);
    const video = videos[0];

    expect(Array.isArray(video.keywords)).toBe(true);
    expect(video.keywords.length).toBeGreaterThan(0);
  });

  it("should analyze script structure", async () => {
    const videos = await findViralVideos("renda-extra", "pt", 1);
    const video = videos[0];

    expect(video.scriptStructure).toHaveProperty("hook");
    expect(video.scriptStructure).toHaveProperty("body");
    expect(video.scriptStructure).toHaveProperty("cta");

    expect(typeof video.scriptStructure.hook).toBe("string");
    expect(Array.isArray(video.scriptStructure.body)).toBe(true);
    expect(typeof video.scriptStructure.cta).toBe("string");
  });
});
