-- If the database was created with an older schema, refresh_tokens may still have a legacy `token` column
-- defined as NOT NULL. We now store only tokenHash, so `token` must be nullable (or removed).

DO $$
BEGIN
  IF to_regclass('public.refresh_tokens') IS NOT NULL
     AND EXISTS (
       SELECT 1
       FROM information_schema.columns
       WHERE table_schema = 'public'
         AND table_name = 'refresh_tokens'
         AND column_name = 'token'
     )
  THEN
    -- Make legacy token nullable to avoid runtime inserts failing.
    BEGIN
      ALTER TABLE "refresh_tokens" ALTER COLUMN "token" DROP NOT NULL;
    EXCEPTION WHEN others THEN
      -- ignore
    END;
  END IF;
END $$;

