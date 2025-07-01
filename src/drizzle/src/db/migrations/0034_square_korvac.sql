ALTER TABLE "workout" ALTER COLUMN "class_id" SET DATA TYPE uuid;
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'ai_chat' AND column_name = 'tool_calls') THEN
        ALTER TABLE "ai_chat" ADD COLUMN "tool_calls" jsonb;
    END IF;
END $$;
DO $$ 
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'workout_class_id_pilates_videos_id_fk') THEN
        ALTER TABLE "workout" ADD CONSTRAINT "workout_class_id_pilates_videos_id_fk" FOREIGN KEY ("class_id") REFERENCES "public"."pilates_videos"("id") ON DELETE cascade ON UPDATE cascade;
    END IF;
END $$;