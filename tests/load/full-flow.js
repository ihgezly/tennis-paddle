import http from "k6/http";
import { check, sleep } from "k6";

export const options = {
  stages: [
    { duration: "30s", target: 20 },
    { duration: "1m", target: 50 },
    { duration: "30s", target: 100 },
    { duration: "1m", target: 0 },
  ],
  thresholds: {
    http_req_duration: ["p(95)<500", "p(99)<1000"],
    http_req_failed: ["rate<0.01"],
  },
};

export default function () {
  const res1 = http.get("http://localhost:3344/api/products");
  check(res1, { "products 200": (r) => r.status === 200 });

  const res2 = http.get("http://localhost:3344/api/products?q=racket");
  check(res2, { "search 200": (r) => r.status === 200 });

  sleep(1);
}
