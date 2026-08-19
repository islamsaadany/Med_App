/* Doses sync — one Vercel function, one Neon table.
   The sync code is the whole identity: whoever holds it reads and writes that row.
   Codes are generated client-side with ~60 bits of entropy and never listed. */
import { neon } from '@neondatabase/serverless';

const CODE = /^[a-z0-9][a-z0-9-]{10,62}[a-z0-9]$/;
let ensured = null;

async function ensureTable(sql){
  ensured = ensured || sql`CREATE TABLE IF NOT EXISTS doses_state (
    code text PRIMARY KEY,
    meds jsonb NOT NULL DEFAULT '[]'::jsonb,
    log  jsonb NOT NULL DEFAULT '{}'::jsonb,
    meds_updated text,
    updated_at timestamptz NOT NULL DEFAULT now()
  )`;
  return ensured;
}

export default async function handler(req, res){
  if (!process.env.DATABASE_URL)
    return res.status(503).json({ error: 'no database linked' });
  const sql = neon(process.env.DATABASE_URL);

  const code = String((req.method === 'GET' ? req.query.code : (req.body || {}).code) || '')
    .trim().toLowerCase();
  if (!CODE.test(code)) return res.status(400).json({ error: 'bad code' });

  await ensureTable(sql);

  if (req.method === 'GET'){
    const rows = await sql`SELECT meds, log, meds_updated FROM doses_state WHERE code = ${code}`;
    res.setHeader('Cache-Control', 'no-store');
    return res.status(200).json(rows[0] || null);
  }

  if (req.method === 'POST'){
    const { meds, log, medsUpdated } = req.body || {};
    if (!Array.isArray(meds) || !log || typeof log !== 'object' || Array.isArray(log))
      return res.status(400).json({ error: 'bad payload' });
    const medsJson = JSON.stringify(meds), logJson = JSON.stringify(log);
    if (medsJson.length + logJson.length > 300000)
      return res.status(413).json({ error: 'too large' });
    const ts = (typeof medsUpdated === 'string' && medsUpdated.length < 40) ? medsUpdated : null;
    await sql`INSERT INTO doses_state (code, meds, log, meds_updated, updated_at)
      VALUES (${code}, ${medsJson}::jsonb, ${logJson}::jsonb, ${ts}, now())
      ON CONFLICT (code) DO UPDATE SET
        meds = EXCLUDED.meds, log = EXCLUDED.log,
        meds_updated = EXCLUDED.meds_updated, updated_at = now()`;
    return res.status(200).json({ ok: true });
  }

  res.setHeader('Allow', 'GET, POST');
  return res.status(405).json({ error: 'method not allowed' });
}
