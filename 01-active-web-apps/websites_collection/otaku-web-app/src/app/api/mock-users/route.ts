import { NextResponse } from 'next/server';
import { signUp } from '@/lib/firebase/auth';
import { logOut } from '@/lib/firebase/auth';

export async function GET() {
  const results = [];
  try {
    for (let i = 1; i <= 15; i++) {
      const email = `mockuser${i}_${Date.now()}@test.com`;
      const password = 'Password123!';
      const username = `MockOtaku_${i}`;
      
      try {
        await signUp(email, password, username);
        await logOut(); // logout immediately so the next loop works cleanly
        results.push({ email, status: 'success' });
      } catch (err: any) {
        results.push({ email, status: 'error', error: err.message });
      }
    }
    
    return NextResponse.json({ message: 'Mock registration complete', results });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
