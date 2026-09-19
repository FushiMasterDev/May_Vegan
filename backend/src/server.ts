import app from './app';
import { env } from './config/env';
import { prisma } from './config/database';

async function main() {
  await prisma.$connect();
  console.log('Đã kết nối PostgreSQL thành công.');

  app.listen(env.PORT, () => {
    console.log(`Mây Vegan API đang chạy tại http://localhost:${env.PORT}`);
  });
}

main().catch((err) => {
  console.error('Không thể khởi động server:', err);
  process.exit(1);
});

process.on('SIGINT', async () => {
  await prisma.$disconnect();
  process.exit(0);
});
