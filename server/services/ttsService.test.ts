import { describe, it, expect } from "vitest";
import { generateTTS, validateTextForTTS, cleanTextForTTS } from "./ttsService";

describe("ttsService", () => {
  it("should validate text correctly", () => {
    const validText = "Este é um texto válido para TTS";
    const validation = validateTextForTTS(validText);

    expect(validation.valid).toBe(true);
    expect(validation.error).toBeUndefined();
  });

  it("should reject empty text", () => {
    const validation = validateTextForTTS("");

    expect(validation.valid).toBe(false);
    expect(validation.error).toBe("Texto vazio");
  });

  it("should reject text that is too long", () => {
    const longText = "a".repeat(5001);
    const validation = validateTextForTTS(longText);

    expect(validation.valid).toBe(false);
    expect(validation.error).toContain("muito longo");
  });

  it("should reject text with problematic characters", () => {
    const problematicText = "Texto com <caracteres> problemáticos [aqui]";
    const validation = validateTextForTTS(problematicText);

    expect(validation.valid).toBe(false);
    expect(validation.error).toContain("caracteres não suportados");
  });

  it("should clean text properly", () => {
    const dirtyText = "Texto  com   espaços    múltiplos e <caracteres> [especiais]";
    const cleaned = cleanTextForTTS(dirtyText);

    expect(cleaned).not.toContain("<");
    expect(cleaned).not.toContain(">");
    expect(cleaned).not.toContain("[");
    expect(cleaned).not.toContain("]");
    expect(cleaned).toBeTruthy();
  });

  it("should preserve Portuguese characters", () => {
    const text = "Texto com acentuação: áéíóú ãõ ç";
    const cleaned = cleanTextForTTS(text);

    expect(cleaned).toContain("á");
    expect(cleaned).toContain("ç");
  });

  it("should generate TTS response with duration", async () => {
    const response = await generateTTS("Teste de áudio em português");

    expect(response).toHaveProperty("audioUrl");
    expect(response).toHaveProperty("duration");
    expect(response).toHaveProperty("format");

    expect(typeof response.audioUrl).toBe("string");
    expect(typeof response.duration).toBe("number");
    expect(response.duration).toBeGreaterThan(0);
  });
});
