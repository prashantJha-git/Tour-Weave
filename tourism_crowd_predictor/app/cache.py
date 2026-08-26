from __future__ import annotations

import functools
import hashlib
import json
import os
import threading
import time
from typing import Any, Callable, Optional


class _InMemoryCache:
    def __init__(self):
        self._store: dict[str, tuple[float, Any]] = {}
        self._lock = threading.Lock()
        self.hits = 0
        self.misses = 0

    def get(self, key: str) -> Optional[Any]:
        with self._lock:
            entry = self._store.get(key)
            if entry is None:
                self.misses += 1
                return None
            expires_at, value = entry
            if time.time() > expires_at:
                del self._store[key]
                self.misses += 1
                return None
            self.hits += 1
            return value

    def set(self, key: str, value: Any, ttl_seconds: int) -> None:
        with self._lock:
            self._store[key] = (time.time() + ttl_seconds, value)

    def clear(self) -> None:
        with self._lock:
            self._store.clear()
            self.hits = 0
            self.misses = 0

    def stats(self) -> dict:
        with self._lock:
            total = self.hits + self.misses
            hit_rate = (self.hits / total) if total else 0.0
            return {
                "backend": "in-memory",
                "keys_cached": len(self._store),
                "hits": self.hits,
                "misses": self.misses,
                "hit_rate": round(hit_rate, 4),
            }


class _RedisCache:
    def __init__(self, redis_url: str):
        import redis  # imported lazily -- only required if REDIS_URL is set

        self._client = redis.Redis.from_url(redis_url, decode_responses=True)
        self._client.ping()  # fail fast at startup, not on the first request
        self.hits = 0
        self.misses = 0

    def get(self, key: str) -> Optional[Any]:
        raw = self._client.get(key)
        if raw is None:
            self.misses += 1
            return None
        self.hits += 1
        return json.loads(raw)

    def set(self, key: str, value: Any, ttl_seconds: int) -> None:
        self._client.setex(key, ttl_seconds, json.dumps(value))

    def clear(self) -> None:
        self._client.flushdb()
        self.hits = 0
        self.misses = 0

    def stats(self) -> dict:
        total = self.hits + self.misses
        hit_rate = (self.hits / total) if total else 0.0
        return {
            "backend": "redis",
            "hits": self.hits,
            "misses": self.misses,
            "hit_rate": round(hit_rate, 4),
        }


def _build_cache():
    redis_url = os.environ.get("REDIS_URL")
    if redis_url:
        try:
            return _RedisCache(redis_url)
        except Exception as exc:  # pragma: no cover - defensive fallback
            print(
                f"[cache] could not connect to REDIS_URL ({exc}); "
                f"falling back to the in-memory cache."
            )
    return _InMemoryCache()


class Cache:
    def __init__(self):
        self._backend = _build_cache()

    def get(self, key: str):
        return self._backend.get(key)

    def set(self, key: str, value, ttl_seconds: int = 3600):
        return self._backend.set(key, value, ttl_seconds)

    def clear(self):
        return self._backend.clear()

    def stats(self) -> dict:
        return self._backend.stats()

    @staticmethod
    def make_key(prefix: str, *args, **kwargs) -> str:
        raw = json.dumps({"args": args, "kwargs": kwargs}, sort_keys=True, default=str)
        digest = hashlib.sha256(raw.encode()).hexdigest()[:16]
        return f"{prefix}:{digest}"

    def cached(self, ttl_seconds: int = 3600, prefix: Optional[str] = None):
        def decorator(fn: Callable):
            key_prefix = prefix or fn.__name__

            @functools.wraps(fn)
            def wrapper(*args, **kwargs):
                key = self.make_key(key_prefix, *args, **kwargs)
                hit = self.get(key)
                if hit is not None:
                    return hit
                result = fn(*args, **kwargs)
                self.set(key, result, ttl_seconds)
                return result

            return wrapper

        return decorator


# Single shared instance the whole app imports.
cache = Cache()
