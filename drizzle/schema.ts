import { int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 * Extend this file with additional tables as your product grows.
 * Columns use camelCase to match both database fields and generated types.
 */
export const users = mysqlTable("users", {
  /**
   * Surrogate primary key. Auto-incremented numeric value managed by the database.
   * Use this for relations between tables.
   */
  id: int("id").autoincrement().primaryKey(),
  /** Manus OAuth identifier (openId) returned from the OAuth callback. Unique per user. */
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Tabela de templates virais pré-configurados
 * Define estruturas de roteiro, estilos e configurações para diferentes tipos de vídeos
 */
export const videoTemplates = mysqlTable("video_templates", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  category: varchar("category", { length: 100 }).notNull(), // curiosidade, dica, motivacao, hype, etc
  scriptStructure: text("scriptStructure").notNull(), // JSON com estrutura: hook, body, cta
  styleConfig: text("styleConfig").notNull(), // JSON com cores, tamanho de texto, ritmo
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type VideoTemplate = typeof videoTemplates.$inferSelect;
export type InsertVideoTemplate = typeof videoTemplates.$inferInsert;

/**
 * Tabela de vídeos gerados
 * Armazena histórico de vídeos criados pelos usuários com status de processamento
 */
export const generatedVideos = mysqlTable("generated_videos", {
  id: int("id").autoincrement().primaryKey(),
  userId: int("userId").notNull(),
  templateId: int("templateId"),
  theme: varchar("theme", { length: 500 }).notNull(), // Tema fornecido pelo usuário
  script: text("script"), // Roteiro gerado pelo LLM
  audioUrl: varchar("audioUrl", { length: 500 }), // URL do áudio em S3
  videoUrl: varchar("videoUrl", { length: 500 }), // URL do vídeo em S3
  status: mysqlEnum("status", ["processing", "ready", "failed"]).default("processing").notNull(),
  duration: int("duration"), // Duração em segundos
  errorMessage: text("errorMessage"), // Mensagem de erro se falhar
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type GeneratedVideo = typeof generatedVideos.$inferSelect;
export type InsertGeneratedVideo = typeof generatedVideos.$inferInsert;

/**
 * Tabela de assets de vídeo
 * Rastreia imagens e vídeos usados na composição de cada vídeo gerado
 */
export const videoAssets = mysqlTable("video_assets", {
  id: int("id").autoincrement().primaryKey(),
  videoId: int("videoId").notNull(),
  assetUrl: varchar("assetUrl", { length: 500 }).notNull(),
  assetType: mysqlEnum("assetType", ["image", "video"]).notNull(),
  source: varchar("source", { length: 100 }), // pexels, unsplash, etc
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type VideoAsset = typeof videoAssets.$inferSelect;
export type InsertVideoAsset = typeof videoAssets.$inferInsert;