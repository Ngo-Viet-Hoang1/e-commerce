import { check } from 'k6';
import exec from 'k6/execution';
import http from 'k6/http';
import { Counter } from 'k6/metrics';

const successfulOrders = new Counter('successful_orders');
const outOfStockErrors = new Counter('out_of_stock_errors');

export const options = {
  scenarios: {
    overselling_stress_test: {
      executor: 'shared-iterations',
      vus: 100,
      iterations: 100,
      maxDuration: '30s',
    },
  },
  thresholds: {
    checks: ['rate==1.0'],
  },
};

const BASE_URL = 'http://localhost:3000/api/v1';

// Seeded target item to stress-test
const TARGET_PRODUCT_ID = 31;
const TARGET_VARIANT_ID = 145;

export function setup() {
  const loginPayload = JSON.stringify({
    email: 'admin@example.com',
    password: 'Admin@123',
  });

  const res = http.post(`${BASE_URL}/auth/login`, loginPayload, {
    headers: { 'Content-Type': 'application/json' },
  });

  const accessToken = res.json('data.accessToken');
  if (!accessToken) {
    throw new Error(`Authentication failed (HTTP ${res.status}): ${res.body}`);
  }

  return { accessToken };
}

export default function (data) {
  const vuId = exec.vu.idInTest;

  const orderPayload = JSON.stringify({
    items: [
      {
        productId: TARGET_PRODUCT_ID,
        variantId: TARGET_VARIANT_ID,
        quantity: 1,
      },
    ],
    shippingRecipientName: `LoadTester-VU-${vuId}`,
    shippingPhone: '0988776655',
    shippingAddressDetail: '123 Test Street, Hanoi',
    paymentMethod: 'cod',
  });

  const res = http.post(`${BASE_URL}/orders`, orderPayload, {
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${data.accessToken}`,
    },
  });

  if (res.status === 200 || res.status === 201) {
    successfulOrders.add(1);
  } else if (res.status === 400) {
    outOfStockErrors.add(1);
  }

  check(res, {
    'request handled cleanly (200 or 400)': (r) =>
      r.status === 200 || r.status === 201 || r.status === 400,
  });
}
