-- Migration: Add 'class' to activity_type enum
-- Created: 2025-08-04

-- Add 'class' to the activity_type enum if it doesn't exist
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_enum 
        WHERE enumlabel = 'class' 
        AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'activity_type')
    ) THEN
        ALTER TYPE "activity_type" ADD VALUE 'class';
    END IF;
END $$;