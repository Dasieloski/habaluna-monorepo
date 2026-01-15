-- CreateTable
CREATE TABLE "ui_settings" (
    "id" TEXT NOT NULL,
    "headerAnnouncement" TEXT NOT NULL DEFAULT 'Envíos a toda la Habana - Entrega rápida',
    "headerHighlights" JSONB,
    "benefits" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ui_settings_pkey" PRIMARY KEY ("id")
);

