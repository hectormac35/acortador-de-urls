-- DropForeignKey
ALTER TABLE "ClickEvent" DROP CONSTRAINT "ClickEvent_urlId_fkey";

-- CreateIndex
CREATE INDEX "ClickEvent_urlId_ts_idx" ON "ClickEvent"("urlId", "ts");

-- CreateIndex
CREATE INDEX "Url_userId_createdAt_idx" ON "Url"("userId", "createdAt");

-- AddForeignKey
ALTER TABLE "ClickEvent" ADD CONSTRAINT "ClickEvent_urlId_fkey" FOREIGN KEY ("urlId") REFERENCES "Url"("id") ON DELETE CASCADE ON UPDATE CASCADE;
