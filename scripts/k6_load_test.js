import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 1,
  duration: '1m',
};

export default function () {
  // Step 1: Obtain the token
  const authResponse = http.post('https://your-auth-endpoint.com/token', {
    username: 'your-username',
    password: 'your-password',
  });
  
  check(authResponse, {
    'token request successful': (r) => r.status === 200,
  });

  // Extract the token from the response
  const token = authResponse.json('access_token');

  // Step 2: Use the token to make authenticated requests
  const res = http.get('https://your-api-endpoint.com/protected-resource', {
    headers: {
      'Authorization': `Bearer ${token}`,
    },
  });

  check(res, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1); // Optional: Sleep to simulate user think time
}