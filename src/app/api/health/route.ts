import { sendSuccess } from '@/lib/response';

export async function GET() {
  return sendSuccess('Prismart Next.js API is running smoothly', {
    timestamp: new Date().toISOString(),
    status: 'online',
  });
}
