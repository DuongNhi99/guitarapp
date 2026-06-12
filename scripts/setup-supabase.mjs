/**
 * Creates the sheet_images table and sheets storage bucket via Supabase APIs.
 * Run: node --env-file=.env.local scripts/setup-supabase.mjs
 */

const PROJECT_URL = process.env.VITE_SUPABASE_URL;
const SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const PROJECT_REF = PROJECT_URL?.split("//")[1]?.split(".")[0];

if (!PROJECT_URL || !SERVICE_KEY) {
  console.error("Missing env vars"); process.exit(1);
}

const headers = {
  "Authorization": `Bearer ${SERVICE_KEY}`,
  "Content-Type": "application/json",
  "apikey": SERVICE_KEY,
};

// 1. Create storage bucket
console.log("Creating storage bucket 'sheets'...");
const bucketRes = await fetch(`${PROJECT_URL}/storage/v1/bucket`, {
  method: "POST",
  headers,
  body: JSON.stringify({ id: "sheets", name: "sheets", public: true }),
});
const bucketData = await bucketRes.json();
if (bucketRes.ok || bucketData.error?.includes("already exists")) {
  console.log("  ✓ Bucket ready");
} else {
  console.error("  ✗ Bucket:", bucketData);
}

// 2. Create table via Supabase Management API
console.log("Creating sheet_images table...");
const sql = `
CREATE TABLE IF NOT EXISTS sheet_images (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  title text NOT NULL,
  slug text UNIQUE NOT NULL,
  image_url text NOT NULL,
  song_id integer,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE sheet_images ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "read" ON sheet_images;
DROP POLICY IF EXISTS "insert" ON sheet_images;
DROP POLICY IF EXISTS "delete" ON sheet_images;

CREATE POLICY "read" ON sheet_images FOR SELECT USING (true);
CREATE POLICY "insert" ON sheet_images FOR INSERT WITH CHECK (true);
CREATE POLICY "delete" ON sheet_images FOR DELETE USING (true);
`;

const sqlRes = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/database/query`, {
  method: "POST",
  headers: { "Authorization": `Bearer ${SERVICE_KEY}`, "Content-Type": "application/json" },
  body: JSON.stringify({ query: sql }),
});

if (sqlRes.ok) {
  console.log("  ✓ Table created");
} else {
  const err = await sqlRes.json().catch(() => sqlRes.text());
  console.warn("  Management API failed (needs PAT). Will try via PostgREST workaround...");
  console.warn("  Error:", JSON.stringify(err));

  // Fallback: try via the pg_admin endpoint or rpc
  const rpcRes = await fetch(`${PROJECT_URL}/rest/v1/`, {
    method: "GET",
    headers,
  });
  console.log("\n  Action needed: Run this SQL in Supabase dashboard → SQL Editor:");
  console.log("  https://supabase.com/dashboard/project/" + PROJECT_REF + "/sql\n");
  console.log(sql);
}
