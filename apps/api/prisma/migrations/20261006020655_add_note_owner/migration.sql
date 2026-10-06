/*
  Warnings:

  - A unique constraint covering the columns `[user_id,name]` on the table `series` will be added. If there are existing duplicate values, this will fail.
  - Added the required column `user_id` to the `notes` table without a default value. This is not possible if the table is not empty.
  - Added the required column `user_id` to the `series` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX `notes_created_at_id_idx` ON `notes`;

-- DropIndex
DROP INDEX `series_name_key` ON `series`;

-- ─────────────────────────────────────────────────────────────
-- 직접 고친 부분 (데이터 마이그레이션)
-- Prisma가 만든 원래 SQL은 "비면 안 되는 user_id 칸"을 바로 추가해서,
-- 이미 있는 노트와 묶음 때문에 실패한다. 그래서 세 단계로 나눈다.
-- ─────────────────────────────────────────────────────────────

-- ① 일단 빈칸(NULL)을 허용해서 칸을 추가한다
ALTER TABLE `notes` ADD COLUMN `user_id` INTEGER NULL;
ALTER TABLE `series` ADD COLUMN `user_id` INTEGER NULL;

-- ② 기존 노트와 묶음을 전부 첫 번째 사용자(가장 먼저 가입한 사람)의 것으로 채운다
--    (빈 DB에서 실행하면 바꿀 줄이 없어서 아무 일도 안 일어난다)
UPDATE `notes` SET `user_id` = (SELECT MIN(`id`) FROM `users`);
UPDATE `series` SET `user_id` = (SELECT MIN(`id`) FROM `users`);

-- ③ 이제 모든 줄에 값이 있으니 "비면 안 됨"으로 바꾼다
--    (사용자가 한 명도 없는데 노트가 있으면 ②가 NULL로 채워서 여기서 실패한다. 주인 없는 노트를 만들지 않게)
ALTER TABLE `notes` MODIFY `user_id` INTEGER NOT NULL;
ALTER TABLE `series` MODIFY `user_id` INTEGER NOT NULL;

-- CreateIndex
CREATE INDEX `notes_user_id_created_at_id_idx` ON `notes`(`user_id`, `created_at`, `id`);

-- CreateIndex
CREATE UNIQUE INDEX `series_user_id_name_key` ON `series`(`user_id`, `name`);

-- AddForeignKey
ALTER TABLE `series` ADD CONSTRAINT `series_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `notes` ADD CONSTRAINT `notes_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;
