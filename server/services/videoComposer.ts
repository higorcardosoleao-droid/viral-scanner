import { spawn } from "child_process";
import { writeFileSync, unlinkSync } from "fs";
import { join } from "path";
import { randomBytes } from "crypto";

/**
 * Interface para configuração de composição de vídeo
 */
export interface VideoCompositionConfig {
  audioPath: string;
  imagePaths: string[];
  script: string[];
  outputPath: string;
  duration?: number;
  width?: number;
  height?: number;
  fps?: number;
}

/**
 * Compõe um vídeo usando MoviePy
 * Combina imagens, legenda e áudio em um vídeo MP4
 */
export async function composeVideo(config: VideoCompositionConfig): Promise<string> {
  const {
    audioPath,
    imagePaths,
    script,
    outputPath,
    duration = 15,
    width = 1080,
    height = 1920,
    fps = 30
  } = config;

  try {
    // Gerar script Python para MoviePy
    const pythonScript = generateMoviePyScript({
      audioPath,
      imagePaths,
      script,
      outputPath,
      duration,
      width,
      height,
      fps
    });

    // Salvar script em arquivo temporário
    const tempScriptPath = join("/tmp", `compose-${randomBytes(8).toString("hex")}.py`);
    writeFileSync(tempScriptPath, pythonScript);

    // Executar MoviePy
    await executeMoviePy(tempScriptPath);

    // Limpar arquivo temporário
    unlinkSync(tempScriptPath);

    return outputPath;
  } catch (error) {
    console.error("[VideoComposer] Erro ao compor vídeo:", error);
    throw new Error("Falha ao compor vídeo");
  }
}

/**
 * Gera script Python para MoviePy
 */
function generateMoviePyScript(config: {
  audioPath: string;
  imagePaths: string[];
  script: string[];
  outputPath: string;
  duration: number;
  width: number;
  height: number;
  fps: number;
}): string {
  const {
    audioPath,
    imagePaths,
    script,
    outputPath,
    duration,
    width,
    height,
    fps
  } = config;

  // Calcular duração por imagem
  const imageDuration = duration / imagePaths.length;

  // Gerar lista de imagens em Python
  const imageList = imagePaths.map(path => `"${path}"`).join(", ");
  const scriptList = script.map(text => `"${text.replace(/"/g, '\\"')}"`).join(", ");

  const pythonCode = [
    "from moviepy.editor import *",
    "from PIL import Image, ImageDraw, ImageFont",
    "import numpy as np",
    "",
    `# Carregar áudio`,
    `audio = AudioFileClip("${audioPath}")`,
    "",
    `# Criar clipes de imagem com texto`,
    `image_paths = [${imageList}]`,
    `script_texts = [${scriptList}]`,
    `clips = []`,
    "",
    `for i, image_path in enumerate(image_paths):`,
    `    img = Image.open(image_path).convert('RGB')`,
    `    img = img.resize((${width}, ${height}), Image.Resampling.LANCZOS)`,
    `    draw = ImageDraw.Draw(img)`,
    `    text = script_texts[i] if i < len(script_texts) else ""`,
    `    try:`,
    `        font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 60)`,
    `    except:`,
    `        font = ImageFont.load_default()`,
    `    text_bbox = draw.textbbox((0, 0), text, font=font)`,
    `    text_width = text_bbox[2] - text_bbox[0]`,
    `    text_height = text_bbox[3] - text_bbox[1]`,
    `    x = (${width} - text_width) // 2`,
    `    y = ${height} - text_height - 50`,
    `    draw.rectangle([(x - 10, y - 10), (x + text_width + 10, y + text_height + 10)], fill=(0, 0, 0, 128))`,
    `    draw.text((x, y), text, fill=(255, 255, 255), font=font)`,
    `    img_array = np.array(img)`,
    `    clip = ImageClip(img_array).set_duration(${imageDuration})`,
    `    clips.append(clip)`,
    "",
    `final_clip = concatenate_videoclips(clips)`,
    `final_clip = final_clip.set_audio(audio)`,
    `final_clip.write_videofile("${outputPath}", fps=${fps}, codec='libx264', audio_codec='aac', verbose=False, logger=None)`,
    `print("Video created successfully: ${outputPath}")`
  ].join("\n");

  return pythonCode;
}

/**
 * Executa script Python com MoviePy
 */
function executeMoviePy(scriptPath: string): Promise<void> {
  return new Promise((resolve, reject) => {
    const python = spawn("python3", [scriptPath]);

    let stdout = "";
    let stderr = "";

    python.stdout.on("data", (data) => {
      stdout += data.toString();
      console.log("[MoviePy]", data.toString());
    });

    python.stderr.on("data", (data) => {
      stderr += data.toString();
      console.error("[MoviePy Error]", data.toString());
    });

    python.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`MoviePy process exited with code ${code}: ${stderr}`));
      }
    });

    python.on("error", (error) => {
      reject(error);
    });
  });
}

/**
 * Valida configuração de vídeo
 */
export function validateVideoConfig(config: Partial<VideoCompositionConfig>): { valid: boolean; error?: string } {
  if (!config.audioPath) {
    return { valid: false, error: "Caminho de áudio não fornecido" };
  }

  if (!config.imagePaths || config.imagePaths.length === 0) {
    return { valid: false, error: "Nenhuma imagem fornecida" };
  }

  if (!config.outputPath) {
    return { valid: false, error: "Caminho de saída não fornecido" };
  }

  if (config.duration && config.duration < 5) {
    return { valid: false, error: "Duração mínima é 5 segundos" };
  }

  if (config.duration && config.duration > 60) {
    return { valid: false, error: "Duração máxima é 60 segundos" };
  }

  return { valid: true };
}
