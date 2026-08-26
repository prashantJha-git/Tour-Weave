from __future__ import annotations

import math

# name -> (latitude, longitude). Approximate airport reference-point
# coordinates -- precise to the kilometer, which is all a "how
# accessible is this place" signal needs.
MAJOR_AIRPORTS: dict[str, tuple[float, float]] = {
    "Delhi (IGI)": (28.5562, 77.1000),
    "Mumbai (CSMIA)": (19.0896, 72.8656),
    "Bengaluru (KIA)": (13.1986, 77.7066),
    "Chennai (MAA)": (12.9941, 80.1709),
    "Kolkata (CCU)": (22.6547, 88.4467),
    "Hyderabad (RGIA)": (17.2403, 78.4294),
    "Goa (Dabolim/Mopa)": (15.3800, 73.8310),
    "Kochi (COK)": (10.1520, 76.4019),
    "Ahmedabad (SVPI)": (23.0772, 72.6347),
    "Jaipur (JAI)": (26.8242, 75.8122),
    "Lucknow (CCS)": (26.7606, 80.8893),
    "Guwahati (LGBI)": (26.1061, 91.5859),
    "Amritsar (SXR-ATQ)": (31.7096, 74.7973),
    "Bhubaneswar (BBI)": (20.2444, 85.8178),
    "Srinagar (SXR)": (33.9871, 74.7742),
    "Varanasi (VNS)": (25.4524, 82.8593),
    "Coimbatore (CJB)": (11.0300, 77.0434),
    "Nagpur (NAG)": (21.0922, 79.0472),
}

EARTH_RADIUS_KM = 6371.0


def haversine_km(lat1: float, lon1: float, lat2: float, lon2: float) -> float:
    phi1, phi2 = math.radians(lat1), math.radians(lat2)
    d_phi = math.radians(lat2 - lat1)
    d_lambda = math.radians(lon2 - lon1)

    a = math.sin(d_phi / 2) ** 2 + math.cos(phi1) * math.cos(phi2) * math.sin(d_lambda / 2) ** 2
    c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
    return EARTH_RADIUS_KM * c


def nearest_airport(lat: float, lon: float) -> tuple[str, float]:
    best_name, best_dist = None, float("inf")
    for name, (a_lat, a_lon) in MAJOR_AIRPORTS.items():
        dist = haversine_km(lat, lon, a_lat, a_lon)
        if dist < best_dist:
            best_name, best_dist = name, dist
    return best_name, best_dist


def distance_to_nearest_airport_km(lat: float, lon: float) -> float:
    _, dist = nearest_airport(lat, lon)
    return round(dist, 1)
