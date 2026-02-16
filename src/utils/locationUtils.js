export const getDistanceFromLatLonInKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371; // Radius of the earth in km
  const dLat = deg2rad(lat2 - lat1);
  const dLon = deg2rad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = R * c; // Distance in km
  return d;
};

const deg2rad = (deg) => {
  return deg * (Math.PI / 180);
};

// Calculate perpendicular distance from point P to line segment AB
// P: {latitude, longitude}, A: [lat, lon], B: [lat, lon]
export const getDistanceToSegment = (point, start, end) => {
  const lat1 = start[0];
  const lon1 = start[1];
  const lat2 = end[0];
  const lon2 = end[1];

  const P = { x: point.longitude, y: point.latitude };
  const A = { x: lon1, y: lat1 };
  const B = { x: lon2, y: lat2 };

  const l2 = dist2(A, B);
  if (l2 == 0) return getDistanceFromLatLonInKm(point.latitude, point.longitude, lat1, lon1);

  // Projection of P onto AB
  let t = ((P.x - A.x) * (B.x - A.x) + (P.y - A.y) * (B.y - A.y)) / l2;
  t = Math.max(0, Math.min(1, t));

  // Projection point in Lat/Lon
  const projectionLon = A.x + t * (B.x - A.x);
  const projectionLat = A.y + t * (B.y - A.y);

  // Return distance in km using Haversine
  return getDistanceFromLatLonInKm(point.latitude, point.longitude, projectionLat, projectionLon);
};

const dist2 = (v, w) => {
    return (v.x - w.x) * (v.x - w.x) + (v.y - w.y) * (v.y - w.y);
};

// Find the nearest segment within a threshold (e.g., 0.5km = 500m)
export const findNearestSegment = (userLocation, segments) => {
  // Default threshold 0.5km
  const thresholdKm = 0.5;
  let nearestSegment = null;
  let minDistance = Infinity;

  if (!userLocation || !segments) return null;

  for (const segment of segments) {
    if (segment.coords && segment.coords.length >= 2) {
      const start = segment.coords[0];
      const end = segment.coords[1];

      const distance = getDistanceToSegment(userLocation, start, end);

      if (distance < minDistance) {
        minDistance = distance;
        nearestSegment = segment;
      }
    }
  }

  if (minDistance <= thresholdKm) {
    return nearestSegment;
  }
  return null;
};
