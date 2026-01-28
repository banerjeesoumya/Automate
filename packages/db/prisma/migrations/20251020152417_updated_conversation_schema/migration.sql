/*
  Warnings:

  - Made the column `lastMessage` on table `Conversation` required. This step will fail if there are existing NULL values in that column.

*/
-- AlterTable
ALTER TABLE "Conversation" ALTER COLUMN "lastMessage" SET NOT NULL;
