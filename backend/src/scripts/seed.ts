import dotenv from 'dotenv';
dotenv.config();
import connectDB from '../config/db';
import { seedDatabase } from '../controllers/seedController';

async function run() {
  console.log('Connecting to database for seeding...');
  await connectDB();

  const fakeReq = {} as any;
  const fakeRes = {
    json: (data: any) => console.log('Seed response:', JSON.stringify(data, null, 2)),
    status: (code: number) => {
      console.log('Status code:', code);
      return fakeRes;
    },
  } as any;

  await seedDatabase(fakeReq, fakeRes);
  process.exit(0);
}

run().catch(err => {
  console.error('Seed script error:', err);
  process.exit(1);
});
