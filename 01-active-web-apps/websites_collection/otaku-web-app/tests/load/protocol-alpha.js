import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  stages: [
    { duration: '30s', target: 100 }, // Phase 1: Baseline
    { duration: '1m', target: 1000 }, // Phase 2: Spike
    { duration: '3m', target: 10000 }, // Phase 3: The Siege
    { duration: '30s', target: 0 },    // Cool down
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'], // 95% of requests must complete below 500ms
    http_req_failed: ['rate<0.01'],   // Error rate must be less than 1%
  },
};

const BASE_URL = __ENV.TARGET_URL || 'http://localhost:3000';

export default function () {
  // Simulate a user hitting the system UI dashboard
  const res = http.get(`${BASE_URL}/app/dashboard`);

  check(res, {
    'status is 200': (r) => r.status === 200,
    'page loaded successfully': (r) => r.body.includes('OTAKU NEXUS'),
  });

  // Wait randomly between 1 and 3 seconds before next action to simulate human reading
  sleep(Math.random() * 2 + 1);
}
