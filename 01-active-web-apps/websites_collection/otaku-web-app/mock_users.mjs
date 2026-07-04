import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.join(process.cwd(), '.env.local') });

const apiKey = process.env.VITE_FIREBASE_API_KEY;

if (!apiKey) {
  console.log('Error: VITE_FIREBASE_API_KEY is missing in .env.local');
  process.exit(1);
}

async function run() {
  console.log('Pretesting: Generating 15 mock accounts in Firebase Authentication...');
  let successCount = 0;
  
  for (let i = 1; i <= 15; i++) {
    const email = `mockuser${i}_${Date.now()}@otakutest.local`;
    const password = 'Password123!';
    
    try {
      const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          password,
          returnSecureToken: true
        })
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        console.error(`Error inserting user ${i}:`, data.error.message);
      } else {
        successCount++;
      }
    } catch (err) {
      console.error(`Network error for user ${i}:`, err.message);
    }
  }
  
  console.log(`✅ Successfully generated ${successCount} mock accounts for the pre-registration database.`);
}

run();
