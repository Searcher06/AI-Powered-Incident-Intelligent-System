import { Incident, Report } from '../../models/index.js';

/**
 * Categories that are mutually exclusive — a report in one group
 * should NEVER be merged with an incident in a different group,
 * regardless of geographic proximity.
 *
 * Gemma can still make the final merge/create decision within a group,
 * but candidates from incompatible groups are filtered out before
 * Gemma even sees them.
 */
const CATEGORY_GROUPS = {
  infrastructure_damage: ['infrastructure_damage', 'power_outage', 'flood', 'earthquake'],
  power_outage:          ['power_outage', 'infrastructure_damage'],
  flood:                 ['flood', 'infrastructure_damage', 'road_blockage'],
  road_blockage:         ['road_blockage', 'flood'],
  road_accident:         ['road_blockage'], // accidents can cause road blockage
  fire:                  ['fire'],
  medical:               ['medical'],
  crime:                 ['crime', 'security'],
  security:              ['security', 'crime'],
  protest:               ['protest'],
  weather:               ['weather', 'flood'],
  hazmat:                ['hazmat'],
  sanitation:            ['sanitation', 'medical'],
  other:                 ['other'],
};

/**
 * Returns true if incidentCategory is compatible with reportCategory
 * and could reasonably represent the same real-world event.
 */
function isCompatibleCategory(reportCategory, incidentCategory) {
  if (!reportCategory || !incidentCategory) return true; // unknown — let Gemma decide
  if (reportCategory === incidentCategory) return true;  // exact match always compatible

  const allowedForReport = CATEGORY_GROUPS[reportCategory];
  if (!allowedForReport) return true; // unmapped category — let Gemma decide

  return allowedForReport.includes(incidentCategory);
}

// CandidateFinder: finds nearby incidents by location, time window,
// and category compatibility.
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
  const recentMinutes = options.recentMinutes || 60 * 24;      // 24 hours
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
    .limit(20) // fetch more, then filter
    .lean();

  // Filter out candidates whose category is incompatible with this report
  const reportCategory = report.understanding?.category || '';
  const compatible = candidates.filter((c) =>
    isCompatibleCategory(reportCategory, c.category)
  );

  if (candidates.length > compatible.length) {
    console.log(
      `[CandidateFinder] Filtered ${candidates.length - compatible.length} incompatible candidate(s)`,
      `(report: ${reportCategory || 'unknown'})`,
      `kept: ${compatible.map((c) => c.category).join(', ') || 'none'}`
    );
  }

  return compatible.slice(0, 10);
}

export default { findCandidates };
