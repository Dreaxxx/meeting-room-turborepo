import { execSync } from 'node:child_process';

beforeAll(() => {
  try {
    execSync('npx prisma migrate reset --force --skip-seed --skip-generate', {
      stdio: 'inherit',
    });
  } catch (e) {
    console.error('Prisma db push failed:', e);
    throw e;
  }
});
