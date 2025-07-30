-- Migration to update notification cron job to mark notifications as sent
-- This updates the existing cron job function to properly mark notifications as delivered

-- Update the cron job function to mark notifications as sent after successful delivery
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
        api_url := 'https://localhost:3000/api/notifications/send-to-user';
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
            
            -- Log success/failure and update notification status
            IF http_response.status BETWEEN 200 AND 299 THEN
                -- Mark notification as successfully sent
                UPDATE notifications 
                SET sent = true, 
                    sent_at = NOW(), 
                    delivery_status = 'sent'
                WHERE id = notification_record.id;
                
                RAISE NOTICE 'Successfully sent notification %', notification_record.id;
            ELSE
                -- Mark notification as failed
                UPDATE notifications 
                SET delivery_status = 'failed',
                    sent_at = NOW()
                WHERE id = notification_record.id;
                
                RAISE WARNING 'Failed to send notification %, status: %, response: %', 
                    notification_record.id, http_response.status, http_response.content;
            END IF;
            
        EXCEPTION WHEN OTHERS THEN
            -- Mark notification as failed on exception
            UPDATE notifications 
            SET delivery_status = 'failed',
                sent_at = NOW()
            WHERE id = notification_record.id;
            
            RAISE WARNING 'Error sending notification %: %', notification_record.id, SQLERRM;
        END;
    END LOOP;
END;
$$;