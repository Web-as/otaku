import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '1m', target: 1000 },  // Quick ramp to 1k
    { duration: '4m', target: 10000 }, // Hold at 10k to saturate CPU
    { duration: '30s', target: 0 },
  ],
  thresholds: {
    http_req_duration: ['p(95)<1000'], // Allow up to 1s for NLP parsing
    http_req_failed: ['rate<0.05'],    // 5% error tolerance under CPU duress
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:3000';

const sampleInputs = [
  "I want to drink my health potion",
  "Roll investigation check on the door",
  "Cast fireball at the goblin",
  "Mark the latest manga chapter as read"
];

export default function () {
  const payload = JSON.stringify({
    text: sampleInputs[Math.floor(Math.random() * sampleInputs.length)],
  });

  const params = {
    headers: {
      'Content-Type': 'application/json',
    },
  };

  const res = http.post(`${BASE_URL}/api/nlp-parser`, payload, params);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'has confidence score': (r) => {
      try {
        return JSON.parse(r.body).confidence !== undefined;
      } catch (e) {
        return false;
      }
    },
  });

  sleep(Math.random() * 1 + 0.5); // Rapid fire
}
