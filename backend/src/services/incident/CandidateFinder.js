import { Incident, Report } from '../../models/index.js';

// CandidateFinder: finds nearby incidents by location and recent time window
async function findCandidates(reportId, options = {}) {
  const report = await Report.findById(reportId);
  if (!report) throw new Error('Report not found');

  // The Report schema stores location as:
  //   location.coordinates = { type: 'Point', coordinates: [lng, lat] }
  const geoPoint = report.location && report.location.coordinates;
  const coords = geoPoint && geoPoint.coordinates;
  if (!coords || coords.length !== 2) return [];

  const [lng, lat] = coords;
  const maxDistanceMeters = options.maxDistanceMeters || 1000; // 1 km
  const recentMinutes = options.recentMinutes || 60 * 24; // 24 hours
  const since = new Date(Date.now() - recentMinutes * 60 * 1000);

  const candidates = await Incident.find({
    'location.coordinates': {
      $nearSphere: {
        $geometry: { type: 'Point', coordinates: [lng, lat] },
        $maxDistance: maxDistanceMeters,
      },
    },
    updatedAt: { $gte: since },
    status: { $ne: 'resolved' },
  })
    .limit(10)
    .lean();

  return candidates;
}

export default { findCandidates };
