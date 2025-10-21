-- AlterTable
ALTER TABLE "Conversation" ALTER COLUMN "conversationId" DROP NOT NULL,
ALTER COLUMN "title" DROP NOT NULL,
ALTER COLUMN "lastMessage" DROP NOT NULL;
