-- Migration to set up notification cron job
-- This will create a cron job that runs every minute to send pending notifications

-- Ensure required extensions are available
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS http;

-- Create app_config table if it doesn't exist (for storing dynamic configuration)
CREATE TABLE IF NOT EXISTS app_config (
    key TEXT PRIMARY KEY,
    value TEXT NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default configuration values (will be ignored if they already exist)
INSERT INTO app_config (key, value) VALUES 
    ('notification_api_url', 'https://localhost:3000/api/notifications/send-to-user'),
    ('webhook_api_key', 'default-key-change-me')
ON CONFLICT (key) DO NOTHING;

-- Remove any existing notification cron job
SELECT cron.unschedule('send-pending-notifications') WHERE EXISTS (
  SELECT 1 FROM cron.job WHERE jobname = 'send-pending-notifications'
);

-- Create the cron job function that will send notifications
CREATE OR REPLACE FUNCTION send_pending_notifications()
RETURNS void
LANGUAGE plpgsql
AS $$
DECLARE
    notification_record RECORD;
    api_url TEXT;
    webhook_key TEXT;
    request_body TEXT;
    http_response RECORD;
BEGIN
    -- Get dynamic configuration from app_config table
    SELECT value INTO api_url FROM app_config WHERE key = 'notification_api_url';
    SELECT value INTO webhook_key FROM app_config WHERE key = 'webhook_api_key';
    
    -- Fallback to localhost if not configured
    IF api_url IS NULL THEN
        api_url := 'https://localhost:3000';
    END IF;
    
    IF webhook_key IS NULL OR webhook_key = 'default-key-change-me' THEN
        RAISE WARNING 'Webhook API key not properly configured. Please update app_config table.';
        RETURN;
    END IF;
    
    -- Loop through all pending notifications
    FOR notification_record IN 
        SELECT id, user_id, title, body 
        FROM notifications 
        WHERE sent = false 
          AND scheduled_time <= NOW()
        ORDER BY scheduled_time ASC
        LIMIT 10  -- Process max 10 notifications per run to avoid timeouts
    LOOP
        -- Build the JSON request body
        request_body := json_build_object(
            'userId', notification_record.user_id,
            'title', notification_record.title,
            'message', notification_record.body,
            'notificationId', notification_record.id
        )::text;
        
        -- Make HTTP request (requires http extension)
        BEGIN
            SELECT * INTO http_response FROM http((
                'POST',
                api_url,
                ARRAY[
                    http_header('Content-Type', 'application/json'),
                    http_header('apiKey', webhook_key)
                ],
                'application/json',
                request_body
            ));
            
            -- Log success/failure
            IF http_response.status BETWEEN 200 AND 299 THEN
                RAISE NOTICE 'Successfully sent notification %', notification_record.id;
            ELSE
                RAISE WARNING 'Failed to send notification %, status: %, response: %', 
                    notification_record.id, http_response.status, http_response.content;
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            RAISE WARNING 'Error sending notification %: %', notification_record.id, SQLERRM;
        END;
    END LOOP;
END;
$$;

-- Schedule the cron job to run every minute
SELECT cron.schedule(
    'send-pending-notifications',
    '* * * * *',  -- Every minute
    'SELECT send_pending_notifications();'
);

-- Verify the job was created
SELECT jobname, schedule, command, active 
FROM cron.job 
WHERE jobname = 'send-pending-notifications'; 