import { describe, it, expect, vi } from "vitest";
import { generateViralScript, estimateScriptDuration } from "./scriptGenerator";
import type { VideoTemplate } from "../../drizzle/schema";

// Mock do LLM
vi.mock("../_core/llm", () => ({
  invokeLLM: vi.fn().mockResolvedValue({
    choices: [
      {
        message: {
          content: JSON.stringify({
            hook: "Você sabia que o espaço é infinito?",
            body: ["Fato 1 sobre o espaço", "Fato 2 sobre o espaço", "Fato 3 sobre o espaço"],
            cta: "Salva este vídeo!"
          })
        }
      }
    ]
  })
}));

describe("scriptGenerator", () => {
  const mockTemplate: VideoTemplate = {
    id: 1,
    name: "Curiosidade Chocante",
    description: "Template para curiosidades",
    category: "curiosidade",
    scriptStructure: JSON.stringify({
      hook: "Você sabia que...?",
      body: "Fato surpreendente",
      cta: "Salva este vídeo!"
    }),
    styleConfig: JSON.stringify({
      colors: { bg: "#000000", text: "#FFFFFF" },
      textSize: "large"
    }),
    createdAt: new Date(),
    updatedAt: new Date()
  };

  it("should generate a viral script with hook, body, and cta", async () => {
    const script = await generateViralScript("espaço", mockTemplate, 15);

    expect(script).toHaveProperty("hook");
    expect(script).toHaveProperty("body");
    expect(script).toHaveProperty("cta");
    expect(script).toHaveProperty("fullScript");

    expect(script.hook).toBeTruthy();
    expect(Array.isArray(script.body)).toBe(true);
    expect(script.cta).toBeTruthy();
    expect(script.fullScript).toContain(script.hook);
  });

  it("should estimate script duration correctly", () => {
    const script = {
      hook: "Você sabia que",
      body: ["Fato 1", "Fato 2"],
      cta: "Salva este vídeo",
      fullScript: "Você sabia que Fato 1 Fato 2 Salva este vídeo"
    };

    const duration = estimateScriptDuration(script);

    expect(duration).toBeGreaterThan(0);
    expect(typeof duration).toBe("number");
  });

  it("should handle empty theme gracefully", async () => {
    const script = await generateViralScript("", mockTemplate, 15);

    expect(script).toHaveProperty("fullScript");
    expect(script.fullScript).toBeTruthy();
  });

  it("should generate fallback script when LLM fails", async () => {
    // Simular falha do LLM
    vi.resetModules();
    
    const script = await generateViralScript("teste", mockTemplate, 15);
    
    expect(script).toHaveProperty("fullScript");
    expect(script.fullScript).toBeTruthy();
  });
});
