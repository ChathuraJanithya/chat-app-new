-- Test database connection and table structure
SELECT 
    'Database connection successful' as status,
    current_user as current_user,
    current_database() as current_database;

-- Check if tables exist
SELECT 
    table_name,
    table_type
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('profiles', 'chats', 'messages')
ORDER BY table_name;

-- Check RLS policies
SELECT 
    schemaname,
    tablename,
    policyname,
    permissive,
    roles,
    cmd,
    qual
FROM pg_policies 
WHERE schemaname = 'public'
ORDER BY tablename, policyname;

-- Test basic operations (this will only work if you have a user authenticated)
-- Uncomment these lines to test after authentication is working:

-- INSERT INTO public.chats (user_id, title) 
-- VALUES (auth.uid(), 'Test Chat') 
-- RETURNING id, title, created_at;

-- SELECT id, title, created_at 
-- FROM public.chats 
-- WHERE user_id = auth.uid()
-- ORDER BY created_at DESC;
