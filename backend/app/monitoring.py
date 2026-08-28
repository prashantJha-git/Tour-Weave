from __future__ import annotations

import time
from collections import defaultdict, deque
from statistics import mean

from starlette.middleware.base import BaseHTTPMiddleware
from starlette.requests import Request
from starlette.responses import JSONResponse


class RateLimitMiddleware(BaseHTTPMiddleware):
    EXEMPT_PATHS = {"/health", "/docs", "/openapi.json", "/redoc"}

    def __init__(self, app, limit_per_minute: int = 120):
        super().__init__(app)
        self.limit = limit_per_minute
        self._windows: dict[str, tuple[int, float]] = {}  # ip -> (count, window_start)

    async def dispatch(self, request: Request, call_next):
        if request.url.path in self.EXEMPT_PATHS:
            return await call_next(request)

        client_ip = request.client.host if request.client else "unknown"
        now = time.time()
        count, window_start = self._windows.get(client_ip, (0, now))

        if now - window_start > 60:
            count, window_start = 0, now

        count += 1
        self._windows[client_ip] = (count, window_start)

        if count > self.limit:
            retry_after = max(0, int(60 - (now - window_start)))
            return JSONResponse(
                status_code=429,
                content={
                    "detail": (
                        f"Rate limit exceeded ({self.limit} requests/minute). "
                        f"Try again in {retry_after}s."
                    )
                },
                headers={"Retry-After": str(retry_after)},
            )

        return await call_next(request)


class RequestMetrics:
    def __init__(self, max_samples_per_route: int = 500):
        self._counts: dict[str, int] = defaultdict(int)
        self._errors: dict[str, int] = defaultdict(int)
        self._latencies: dict[str, deque] = defaultdict(lambda: deque(maxlen=max_samples_per_route))
        self.started_at = time.time()

    def record(self, route: str, status_code: int, duration_ms: float) -> None:
        self._counts[route] += 1
        self._latencies[route].append(duration_ms)
        if status_code >= 500:
            self._errors[route] += 1

    def snapshot(self) -> dict:
        routes = {}
        for route, count in self._counts.items():
            latencies = list(self._latencies[route])
            routes[route] = {
                "requests": count,
                "errors": self._errors.get(route, 0),
                "avg_latency_ms": round(mean(latencies), 2) if latencies else None,
                "p95_latency_ms": round(sorted(latencies)[int(len(latencies) * 0.95) - 1], 2)
                if latencies else None,
            }
        return {
            "uptime_seconds": round(time.time() - self.started_at, 1),
            "total_requests": sum(self._counts.values()),
            "total_errors": sum(self._errors.values()),
            "routes": routes,
        }


metrics = RequestMetrics()


class MetricsMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start = time.perf_counter()
        response = await call_next(request)
        duration_ms = (time.perf_counter() - start) * 1000

        route = request.scope.get("route")
        route_path = route.path if route else request.url.path
        metrics.record(route_path, response.status_code, duration_ms)
        response.headers["X-Response-Time-Ms"] = f"{duration_ms:.1f}"
        return response
