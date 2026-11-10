import { Incident, ResponseTeam, TeamRecommendation, EmergencyCategory, ResourceType } from '../types';

/**
 * RESQ AI – Intelligent Location-Based Dispatch Engine
 * Uses the Haversine formula for exact geodesic distance calculations on the WGS-84 Earth ellipsoid.
 * Evaluates operational availability, category compatibility matrix, and distance ranking.
 */

const EARTH_RADIUS_KM = 6371;

/**
 * Calculates straight-line geodesic distance between two latitude/longitude points in kilometers.
 * Note: Clearly identified as straight-line geodesic distance, not road network navigation distance.
 */
export function calculateHaversineDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  if (!lat1 || !lon1 || !lat2 || !lon2) return 9999;
  if (lat1 === lat2 && lon1 === lon2) return 0;

  const toRad = (value: number) => (value * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = EARTH_RADIUS_KM * c;

  return Math.round(distance * 10) / 10; // Round to 1 decimal place (e.g. 3.4 km)
}

/**
 * Compatibility Matrix: Checks if a response team capability matches the emergency event category.
 */
export function isTeamCompatible(teamType: ResourceType, category: EmergencyCategory): { compatible: boolean; reason: string } {
  // General Emergency squads are trained and equipped for initial containment across all incident classes
  if (teamType === 'general_emergency') {
    return {
      compatible: true,
      reason: 'General Emergency unit equipped for multi-hazard initial containment',
    };
  }

  switch (category) {
    case 'fire':
      if (teamType === 'fire_rescue') {
        return { compatible: true, reason: 'Specialized thermal suppression and extrication apparatus' };
      }
      return { compatible: false, reason: 'Lacks high-capacity water tenders and structural fire protective equipment' };

    case 'road_accident':
      if (teamType === 'accident_squad' || teamType === 'fire_rescue') {
        return { compatible: true, reason: 'Equipped with hydraulic jaws-of-life and vehicular rescue systems' };
      }
      if (teamType === 'ambulance' || teamType === 'medical_team') {
        return { compatible: true, reason: 'Trauma life-support and emergency medical transit capability' };
      }
      return { compatible: false, reason: 'Secondary unit type without vehicular extrication machinery' };

    case 'medical':
      if (teamType === 'medical_team' || teamType === 'ambulance') {
        return { compatible: true, reason: 'Advanced Cardiac/Trauma Life Support (ALS) capabilities' };
      }
      return { compatible: false, reason: 'Non-medical unit without paramedic staffing' };

    case 'flood':
      if (teamType === 'flood_squad' || teamType === 'disaster_rescue') {
        return { compatible: true, reason: 'Inflatable rescue boats and swift-water survival equipment' };
      }
      return { compatible: false, reason: 'Lacks waterborne vessels and flood rescue gear' };

    case 'building_collapse':
      if (teamType === 'disaster_rescue' || teamType === 'fire_rescue') {
        return { compatible: true, reason: 'Urban Search and Rescue (USAR) acoustic listening & shoring tools' };
      }
      return { compatible: false, reason: 'Requires heavy structural collapse search equipment' };

    case 'rescue':
      if (teamType === 'disaster_rescue' || teamType === 'fire_rescue' || teamType === 'accident_squad') {
        return { compatible: true, reason: 'Technical rope and extrication rescue certified' };
      }
      return { compatible: false, reason: 'Not certified for technical hazard rescue' };

    default:
      return { compatible: true, reason: 'Standard incident responder assignment' };
  }
}

/**
 * Evaluates and ranks all available response teams for an emergency incident.
 */
export function getRecommendedTeams(incident: Incident, teams: ResponseTeam[]): TeamRecommendation[] {
  if (!incident.latitude || !incident.longitude) return [];

  // Filter only eligible teams (status === 'available')
  // Also calculate distance for every team
  const evaluatedTeams = teams.map((team) => {
    const distanceKm = calculateHaversineDistance(
      incident.latitude,
      incident.longitude,
      team.latitude,
      team.longitude
    );
    const { compatible, reason } = isTeamCompatible(team.type, incident.category);

    return {
      team,
      distanceKm,
      isCompatible: compatible,
      compatibilityReason: reason,
      rank: 0,
      isRecommended: false,
    };
  });

  // Sort: First by compatibility (compatible first), then by distance ascending
  evaluatedTeams.sort((a, b) => {
    // Both available check
    const isAvailA = a.team.status === 'available';
    const isAvailB = b.team.status === 'available';
    if (isAvailA !== isAvailB) return isAvailA ? -1 : 1;

    // Compatibility check
    if (a.isCompatible !== b.isCompatible) return a.isCompatible ? -1 : 1;

    // Distance check
    return a.distanceKm - b.distanceKm;
  });

  // Assign ranks and mark top recommendation
  let firstRecommended = false;
  return evaluatedTeams.map((rec, index) => {
    const isTopAvailableAndCompatible = rec.team.status === 'available' && rec.isCompatible && !firstRecommended;
    if (isTopAvailableAndCompatible) firstRecommended = true;

    return {
      ...rec,
      rank: index + 1,
      isRecommended: isTopAvailableAndCompatible,
    };
  });
}
