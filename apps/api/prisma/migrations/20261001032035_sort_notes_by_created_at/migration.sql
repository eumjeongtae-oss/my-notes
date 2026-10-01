-- DropIndex
DROP INDEX `notes_updated_at_id_idx` ON `notes`;

-- CreateIndex
CREATE INDEX `notes_created_at_id_idx` ON `notes`(`created_at`, `id`);
