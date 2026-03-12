import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, videoTemplates, generatedVideos, videoAssets, InsertGeneratedVideo, InsertVideoAsset } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

/**
 * Busca um template viral por ID
 */
export async function getTemplateById(templateId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(videoTemplates).where(eq(videoTemplates.id, templateId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Lista todos os templates virais
 */
export async function listTemplates() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(videoTemplates);
}

/**
 * Cria um novo vídeo gerado
 */
export async function createGeneratedVideo(video: InsertGeneratedVideo) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(generatedVideos).values(video);
  return result[0];
}

/**
 * Busca um vídeo gerado por ID
 */
export async function getGeneratedVideoById(videoId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(generatedVideos).where(eq(generatedVideos.id, videoId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

/**
 * Lista vídeos gerados por um usuário
 */
export async function listUserVideos(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(generatedVideos).where(eq(generatedVideos.userId, userId));
}

/**
 * Atualiza status de um vídeo gerado
 */
export async function updateVideoStatus(
  videoId: number,
  status: "processing" | "ready" | "failed",
  updates?: { videoUrl?: string; audioUrl?: string; duration?: number; errorMessage?: string }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  
  const updateData: Record<string, unknown> = { status, updatedAt: new Date() };
  if (updates?.videoUrl) updateData.videoUrl = updates.videoUrl;
  if (updates?.audioUrl) updateData.audioUrl = updates.audioUrl;
  if (updates?.duration) updateData.duration = updates.duration;
  if (updates?.errorMessage) updateData.errorMessage = updates.errorMessage;
  
  await db.update(generatedVideos).set(updateData).where(eq(generatedVideos.id, videoId));
}

/**
 * Registra um asset de vídeo (imagem ou vídeo usado)
 */
export async function createVideoAsset(asset: InsertVideoAsset) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  await db.insert(videoAssets).values(asset);
}
