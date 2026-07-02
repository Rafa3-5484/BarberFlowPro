const urls = [
  'postgresql://postgres.hebpjnonvchszcrcvchl:RafaDote%401336@aws-0-us-east-1.pooler.supabase.com:5432/postgres',
  'postgresql://postgres.hebpjnonvchszcrcvchl:RafaDote%401336@aws-0-us-east-1.pooler.supabase.com:6543/postgres?pgbouncer=true',
  'postgresql://postgres.hebpjnonvchszcrcvchl:RafaDote%401336@db.hebpjnonvchszcrcvchl.supabase.co:5432/postgres',
];

async function test() {
  for (const url of urls) {
    try {
      const { PrismaClient } = require('@prisma/client');
      const p = new PrismaClient({ datasources: { db: { url } } });
      await p.$connect();
      console.log('✅ OK:', url.substring(0, 60) + '...');
      await p.$disconnect();
    } catch (e) {
      console.log('❌', e.message?.substring(0, 80));
    }
  }
}
test();
