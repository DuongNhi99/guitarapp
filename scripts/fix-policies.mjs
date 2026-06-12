/**
 * Adds the RLS policies/grants needed for editing (UPDATE) and deleting
 * (DB row + storage object) chord-sheet images with the anon key.
 *
 * Run: node --env-file=.env.local scripts/fix-policies.mjs
 *
 * Requires a Supabase Personal Access Token (SUPABASE_ACCESS_TOKEN) to apply
 * automatically via the Management API. Without one, the SQL is printed for you
 * to paste into the dashboard SQL editor.
 */

const PROJECT_URL = process.env.VITE_SUPABASE_URL;
const ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN;
const PROJECT_REF = PROJECT_URL?.split("//")[1]?.split(".")[0];

const sql = `
-- Allow updating chord-sheet rows (RLS UPDATE policy was missing).
DROP POLICY IF EXISTS "update" ON sheet_images;
CREATE POLICY "update" ON sheet_images FOR UPDATE USING (true) WITH CHECK (true);

-- Allow reading object rows in 'sheets' (required for INSERT ... RETURNING on upload).
DROP POLICY IF EXISTS "Allow public reads from sheets" ON storage.objects;
CREATE POLICY "Allow public reads from sheets" ON storage.objects
  FOR SELECT USING (bucket_id = 'sheets');

-- Allow uploading/overwriting objects in the 'sheets' storage bucket with the anon key.
DROP POLICY IF EXISTS "Allow public uploads to sheets" ON storage.objects;
CREATE POLICY "Allow public uploads to sheets" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'sheets');
DROP POLICY IF EXISTS "Allow public updates to sheets" ON storage.objects;
CREATE POLICY "Allow public updates to sheets" ON storage.objects
  FOR UPDATE USING (bucket_id = 'sheets') WITH CHECK (bucket_id = 'sheets');

-- Allow deleting objects from the public 'sheets' storage bucket.
DROP POLICY IF EXISTS "Allow public deletes from sheets" ON storage.objects;
CREATE POLICY "Allow public deletes from sheets" ON storage.objects
  FOR DELETE USING (bucket_id = 'sheets');

-- Ensure DML privileges (Supabase usually grants these by default).
GRANT SELECT, INSERT, UPDATE, DELETE ON sheet_images TO anon, authenticated;

-- Accent-insensitive search: a normalized title column kept in sync by trigger.
CREATE EXTENSION IF NOT EXISTS unaccent WITH SCHEMA extensions;
CREATE EXTENSION IF NOT EXISTS pg_trgm WITH SCHEMA extensions;

ALTER TABLE sheet_images ADD COLUMN IF NOT EXISTS title_norm text;

-- replace(...,'đ','d') because unaccent does not fold the Vietnamese đ.
CREATE OR REPLACE FUNCTION sheet_images_set_title_norm()
  RETURNS trigger
  LANGUAGE plpgsql
  SET search_path = public, extensions
AS $$
BEGIN
  NEW.title_norm := replace(lower(extensions.unaccent(NEW.title)), 'đ', 'd');
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_sheet_images_title_norm ON sheet_images;
CREATE TRIGGER trg_sheet_images_title_norm
  BEFORE INSERT OR UPDATE OF title ON sheet_images
  FOR EACH ROW EXECUTE FUNCTION sheet_images_set_title_norm();

-- Backfill existing rows.
UPDATE sheet_images
  SET title_norm = replace(lower(extensions.unaccent(title)), 'đ', 'd');

-- Trigram index for fast ILIKE as the library grows.
CREATE INDEX IF NOT EXISTS sheet_images_title_norm_trgm
  ON sheet_images USING gin (title_norm extensions.gin_trgm_ops);
`;

if (!PROJECT_REF) {
  console.error("Missing VITE_SUPABASE_URL");
  process.exit(1);
}

if (ACCESS_TOKEN) {
  const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
    method: "POST",
    headers: { Authorization: `Bearer ${ACCESS_TOKEN}`, "Content-Type": "application/json" },
    body: JSON.stringify({ query: sql }),
  });
  if (res.ok) {
    console.log("✓ Policies applied");
  } else {
    const err = await res.json().catch(() => res.text());
    console.error("✗ Failed:", JSON.stringify(err));
    printManual();
  }
} else {
  console.log("No SUPABASE_ACCESS_TOKEN set — apply the SQL manually.");
  printManual();
}

function printManual() {
  console.log("\nRun this SQL in the Supabase dashboard → SQL Editor:");
  console.log(`https://supabase.com/dashboard/project/${PROJECT_REF}/sql\n`);
  console.log(sql);
}
