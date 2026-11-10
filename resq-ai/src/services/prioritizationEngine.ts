import { Incident, PriorityScoreResult, PriorityTier, PriorityFactor } from '../types';

/**
 * RESQ AI – Intelligent Incident Prioritization Engine
 * Explainable, transparent scoring algorithm (0 to 100 points).
 * Evaluates: Severity (40%), Affected People (25%), Category Hazard (15%), Time Aging (15%), Status (5%).
 */

export function calculateIncidentPriority(incident: Partial<Incident>): PriorityScoreResult {
  const reasons: string[] = [];
  const factors: PriorityFactor[] = [];

  // 1. Severity Factor (0 - 40 points)
  let severityScore = 16;
  const severity = incident.severity || 'medium';
  if (severity === 'critical') {
    severityScore = 40;
    reasons.push('Maximum severity classification assigned (+40 pts)');
  } else if (severity === 'high') {
    severityScore = 28;
    reasons.push('High severity threat level (+28 pts)');
  } else if (severity === 'medium') {
    severityScore = 16;
    reasons.push('Standard moderate severity level (+16 pts)');
  } else {
    severityScore = 6;
    reasons.push('Low initial severity classification (+6 pts)');
  }
  factors.push({
    name: 'Severity Classification',
    score: severityScore,
    maxScore: 40,
    description: `Assigned based on initial incident triage rating (${severity.toUpperCase()})`,
  });

  // 2. Affected Individuals (0 - 25 points)
  const affected = Number(incident.affectedPeople) || 1;
  let affectedScore = 4;
  if (affected >= 15) {
    affectedScore = 25;
    reasons.push(`Mass casualty incident: ${affected} individuals at risk (+25 pts)`);
  } else if (affected >= 6) {
    affectedScore = 18;
    reasons.push(`Multiple individuals affected: ${affected} victims (+18 pts)`);
  } else if (affected >= 2) {
    affectedScore = 11;
    reasons.push(`${affected} casualties reported (+11 pts)`);
  } else {
    affectedScore = 5;
    reasons.push(`Single individual reported affected (+5 pts)`);
  }
  factors.push({
    name: 'Population at Risk',
    score: affectedScore,
    maxScore: 25,
    description: `${affected} person(s) directly impacted by the emergency event`,
  });

  // 3. Category Inherent Hazard (0 - 15 points)
  const category = incident.category || 'other';
  let categoryScore = 8;
  switch (category) {
    case 'fire':
    case 'building_collapse':
      categoryScore = 15;
      reasons.push(`Active thermal/structural collapse risk with rapid escalation potential (+15 pts)`);
      break;
    case 'flood':
    case 'rescue':
      categoryScore = 13;
      reasons.push(`Water ingress/trapped victims requiring specialized rescue deployment (+13 pts)`);
      break;
    case 'road_accident':
    case 'medical':
      categoryScore = 12;
      reasons.push(`Acute vehicular trauma/medical intervention required (+12 pts)`);
      break;
    default:
      categoryScore = 7;
      reasons.push(`General emergency profile (+7 pts)`);
      break;
  }
  factors.push({
    name: 'Hazard Escalation Potential',
    score: categoryScore,
    maxScore: 15,
    description: `Dynamic risk escalation inherent to ${category.replace('_', ' ')} incidents`,
  });

  // 4. Elapsed Time Aging Factor (0 - 15 points)
  let agingScore = 0;
  if (incident.status !== 'resolved' && incident.createdAt) {
    const elapsedMinutes = Math.max(0, (Date.now() - new Date(incident.createdAt).getTime()) / (1000 * 60));
    if (elapsedMinutes > 60) {
      agingScore = 15;
      reasons.push(`Significant delay: incident waiting over 60m (+15 pts urgency)`);
    } else if (elapsedMinutes > 30) {
      agingScore = 10;
      reasons.push(`Prolonged response lag: incident waiting over 30m (+10 pts urgency)`);
    } else if (elapsedMinutes > 15) {
      agingScore = 6;
      reasons.push(`Incident awaiting resolution for 15+ minutes (+6 pts urgency)`);
    } else {
      agingScore = 2;
      reasons.push(`Recent incident report under 15 minutes (+2 pts)`);
    }
  } else if (incident.status === 'resolved') {
    agingScore = 0;
    reasons.push('Incident fully resolved (0 pts time aging)');
  }
  factors.push({
    name: 'Time Elapsed Urgency',
    score: agingScore,
    maxScore: 15,
    description: 'Dynamic time decay factor increasing priority of unaddressed incidents',
  });

  // 5. Incident Status Factor (0 - 5 points)
  let statusScore = 5;
  const status = incident.status || 'reported';
  if (status === 'reported' || status === 'pending') {
    statusScore = 5;
    reasons.push('Unverified/unassigned status demands immediate dispatch review (+5 pts)');
  } else if (status === 'assigned') {
    statusScore = 3;
    reasons.push('Assigned to response squad; deployment en route (+3 pts)');
  } else if (status === 'in_progress') {
    statusScore = 2;
    reasons.push('Active operational deployment underway (+2 pts)');
  } else {
    statusScore = 0;
    reasons.push('Incident resolved and cleared (0 pts)');
  }
  factors.push({
    name: 'Operational Status Factor',
    score: statusScore,
    maxScore: 5,
    description: `Current operational triage phase: ${status.toUpperCase()}`,
  });

  // Total raw score
  let totalScore = severityScore + affectedScore + categoryScore + agingScore + statusScore;
  if (incident.status === 'resolved') {
    totalScore = Math.min(totalScore, 25); // Capped when resolved
  }
  totalScore = Math.min(100, Math.max(0, totalScore));

  // Determine Priority Tier
  let tier: PriorityTier = 'medium';
  let urgencyBadge = 'MODERATE PRIORITY';

  if (totalScore >= 80) {
    tier = 'critical';
    urgencyBadge = 'CRITICAL CODE RED – IMMEDIATE DISPATCH';
  } else if (totalScore >= 60) {
    tier = 'high';
    urgencyBadge = 'HIGH PRIORITY – DISPATCH REQUIRED';
  } else if (totalScore >= 40) {
    tier = 'medium';
    urgencyBadge = 'MEDIUM PRIORITY – MONITOR SITUATION';
  } else {
    tier = 'low';
    urgencyBadge = 'LOW PRIORITY – ROUTINE RESPONSE';
  }

  return {
    score: totalScore,
    tier,
    factors,
    reasons,
    urgencyBadge,
  };
}

export function sortIncidentsByPriority(incidents: Incident[]): Incident[] {
  return [...incidents].sort((a, b) => {
    const scoreA = a.priorityScore ?? calculateIncidentPriority(a).score;
    const scoreB = b.priorityScore ?? calculateIncidentPriority(b).score;
    return scoreB - scoreA;
  });
}
