import assert from 'node:assert/strict';
import fs from 'node:fs/promises';

const [store, schema, middleware, authRoutes] = await Promise.all([
  fs.readFile(new URL('./src/db/store.js', import.meta.url), 'utf8'),
  fs.readFile(new URL('./src/db/supabase_schema.sql', import.meta.url), 'utf8'),
  fs.readFile(new URL('./src/middleware/authMiddleware.js', import.meta.url), 'utf8'),
  fs.readFile(new URL('./src/routes/authRoutes.js', import.meta.url), 'utf8')
]);

assert.match(store, /no local fallback/i);
assert.doesNotMatch(store, /db\.json|fs\.writeFile|\.data/);
assert.match(schema, /clerk_user_id TEXT NOT NULL UNIQUE/);
assert.match(schema, /ALTER TABLE users ENABLE ROW LEVEL SECURITY/);
assert.match(middleware, /getUserByClerkId/);
assert.match(middleware, /access was removed/i);
assert.match(authRoutes, /complete-invitation/);
assert.doesNotMatch(authRoutes, /supabase\.auth|password_hash|signToken/);
console.log('✓ Clerk + Supabase production architecture checks passed');
