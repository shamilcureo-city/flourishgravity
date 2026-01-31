-- Add columns to chat_sessions for preview and voice tracking
ALTER TABLE public.chat_sessions 
ADD COLUMN IF NOT EXISTS summary text,
ADD COLUMN IF NOT EXISTS last_message_preview text,
ADD COLUMN IF NOT EXISTS has_voice_messages boolean DEFAULT false;