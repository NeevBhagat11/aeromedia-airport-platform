import { Campaign, Screen, DecisionLog, CandidateScore } from '@/types';
import { CalculatedAudience } from './audience';

export interface ScoringResult {
  decisionLog: DecisionLog;
  winningCampaign: Campaign;
}

/**
 * Deterministically scores all campaigns for a specific screen and audience context.
 * Implements hard filtering, base scoring, rule-based boosting, and evidence trail generation.
 */
export function scoreCampaignsForScreen(
  screen: Screen,
  audience: CalculatedAudience,
  campaigns: Campaign[],
  simTimeStr: string
): ScoringResult | null {
  const activeCampaigns = campaigns.filter(c => c.status === 'ACTIVE');
  if (activeCampaigns.length === 0) return null;

  const candidateScores: CandidateScore[] = [];
  const timestamp = simTimeStr;

  for (const campaign of activeCampaigns) {
    const reasons: string[] = [];
    const appliedBoosts: CandidateScore['appliedBoosts'] = [];
    let disqualified = false;
    let disqualificationReason: string | undefined;

    const filters = campaign.hardFilters;

    // Hard filter: Orientation match
    if (filters.requiredOrientation && filters.requiredOrientation !== 'ANY') {
      if (filters.requiredOrientation !== screen.orientation) {
        disqualified = true;
        disqualificationReason = `Screen orientation ${screen.orientation} does not match required ${filters.requiredOrientation}`;
      }
    }

    // Hard filter: Zone allowed
    if (!disqualified && filters.allowedZones && filters.allowedZones.length > 0) {
      if (!filters.allowedZones.includes(screen.zoneId)) {
        disqualified = true;
        disqualificationReason = `Zone ${screen.zoneId} is not in allowed campaign zones`;
      }
    }

    // Hard filter: Minimum Pax
    if (!disqualified && filters.minPax && audience.totalPax < filters.minPax) {
      disqualified = true;
      disqualificationReason = `Audience count (${audience.totalPax} pax) below campaign minimum of ${filters.minPax} pax`;
    }

    // Hard filter: Only if Delayed
    if (!disqualified && filters.onlyIfDelayed) {
      if (audience.maxDelayMinutes <= 0) {
        disqualified = true;
        disqualificationReason = `Campaign strictly requires flight delay; current delay is 0 mins`;
      }
    }

    // Hard filter: Minimum Dwell Minutes
    if (!disqualified && filters.minDwellMinutes && audience.dwellMinutesAvg < filters.minDwellMinutes) {
      disqualified = true;
      disqualificationReason = `Zone dwell time (${audience.dwellMinutesAvg}m) below required ${filters.minDwellMinutes}m`;
    }

    // Hard filter: Business percentage
    if (!disqualified && filters.minBusinessPct && audience.demographics.businessPct < filters.minBusinessPct) {
      disqualified = true;
      disqualificationReason = `Business demographic (${audience.demographics.businessPct}%) below required ${filters.minBusinessPct}%`;
    }

    // Hard filter: Holiday percentage
    if (!disqualified && filters.minHolidayPct && audience.demographics.holidayPct < filters.minHolidayPct) {
      disqualified = true;
      disqualificationReason = `Holiday demographic (${audience.demographics.holidayPct}%) below required ${filters.minHolidayPct}%`;
    }

    // Base Score computation:
    // CPM (weight: 40%) + Demographic Affinity (weight: 60%)
    let baseScore = campaign.cpm; // e.g. 20 - 50 points

    // Calculate affinity based on campaign category and target audience
    let affinityBonus = 0;
    if (campaign.category === 'Luxury Retail') {
      affinityBonus += (audience.demographics.businessPct * 0.4) + (audience.demographics.internationalPct * 0.3);
    } else if (campaign.category === 'Grab & Go F&B') {
      affinityBonus += Math.min(audience.dwellMinutesAvg * 0.6, 35);
    } else if (campaign.category === 'Travel & Resorts') {
      affinityBonus += (audience.demographics.holidayPct * 0.5) + (audience.demographics.internationalPct * 0.2);
    } else if (campaign.category === 'Business & Tech') {
      affinityBonus += (audience.demographics.businessPct * 0.6);
    } else {
      affinityBonus += 15;
    }

    baseScore = Number((baseScore + affinityBonus).toFixed(2));
    reasons.push(`Base CPM (${campaign.cpm}) + Demographic Affinity (${affinityBonus.toFixed(1)}pts) = ${baseScore}`);

    if (disqualified) {
      candidateScores.push({
        campaignId: campaign.id,
        advertiserName: campaign.advertiserName,
        title: campaign.title,
        baseScore,
        finalScore: 0,
        disqualified: true,
        disqualificationReason,
        appliedBoosts: [],
        reasons: [disqualificationReason || 'Disqualified by hard filter'],
      });
      continue;
    }

    // Evaluate Boost Rules
    let currentScore = baseScore;

    for (const rule of campaign.boostRules) {
      let isBoosted = false;

      switch (rule.conditionType) {
        case 'HIGH_DELAY':
          if (rule.threshold !== undefined && audience.maxDelayMinutes >= rule.threshold) {
            isBoosted = true;
          }
          break;
        case 'HIGH_BUSINESS':
          if (rule.threshold !== undefined && audience.demographics.businessPct >= rule.threshold) {
            isBoosted = true;
          }
          break;
        case 'HIGH_LEISURE':
          if (rule.threshold !== undefined && audience.demographics.holidayPct >= rule.threshold) {
            isBoosted = true;
          }
          break;
        case 'HIGH_DWELL':
          if (rule.threshold !== undefined && audience.dwellMinutesAvg >= rule.threshold) {
            isBoosted = true;
          }
          break;
        case 'DESTINATION_MATCH':
          if (audience.dominantFlight && rule.targetValue) {
            const targets = Array.isArray(rule.targetValue) ? rule.targetValue : [rule.targetValue];
            if (targets.includes(audience.dominantFlight.destination)) {
              isBoosted = true;
            }
          }
          break;
        case 'QUEUE_CONGESTION':
          if (rule.threshold !== undefined && audience.queueCongestion >= rule.threshold) {
            isBoosted = true;
          }
          break;
      }

      if (isBoosted) {
        const previousScore = currentScore;
        currentScore = Number((currentScore * rule.multiplier).toFixed(2));
        const pointsAdded = Number((currentScore - previousScore).toFixed(2));

        appliedBoosts.push({
          ruleId: rule.id,
          description: rule.description,
          multiplier: rule.multiplier,
          pointsAdded,
        });

        reasons.push(
          `Triggered Boost [${rule.conditionType}]: x${rule.multiplier} (${rule.description}) -> +${pointsAdded} pts`
        );
      }
    }

    candidateScores.push({
      campaignId: campaign.id,
      advertiserName: campaign.advertiserName,
      title: campaign.title,
      baseScore,
      finalScore: currentScore,
      disqualified: false,
      appliedBoosts,
      reasons,
    });
  }

  // Sort candidate scores descending
  candidateScores.sort((a, b) => b.finalScore - a.finalScore);

  // Pick top candidate
  const winningCandidate = candidateScores.find(c => !c.disqualified) || candidateScores[0];
  const winningCampaign = campaigns.find(c => c.id === winningCandidate.campaignId) || campaigns[0];

  // Build evidence trail
  const evidenceTrail: string[] = [
    `[${simTimeStr}] SCREEN EVALUATION: Screen ${screen.code} (${screen.name}, ${screen.orientation}) in ${screen.zoneId}.`,
    `[${simTimeStr}] AUDIENCE TELEMETRY: Total Pax = ${audience.totalPax}, Avg Dwell = ${audience.dwellMinutesAvg}m, Queue = ${audience.queueCongestion} pax.`,
    `[${simTimeStr}] DEMOGRAPHIC BREAKDOWN: Business: ${audience.demographics.businessPct}%, Holiday: ${audience.demographics.holidayPct}%, Family: ${audience.demographics.familyPct}%, International: ${audience.demographics.internationalPct}%.`,
  ];

  if (audience.dominantFlight) {
    evidenceTrail.push(
      `[${simTimeStr}] DOMINANT FLIGHT: ${audience.dominantFlight.flightNumber} to ${audience.dominantFlight.destination} (${audience.dominantFlight.destinationCity}), Status: ${audience.dominantFlight.status}, Delay: ${audience.dominantFlight.delayMinutes}m.`
    );
  }

  if (audience.maxDelayMinutes > 0) {
    evidenceTrail.push(
      `[${simTimeStr}] AIDX/AODB IMPACT: Delay of ${audience.maxDelayMinutes}m detected at gate. Dwell time boosted by +${Math.round(audience.maxDelayMinutes * 0.7)}m.`
    );
  }

  for (const boost of winningCandidate.appliedBoosts) {
    evidenceTrail.push(
      `[${simTimeStr}] WINNER BOOST APPLIED: "${boost.description}" (multiplier: ${boost.multiplier}x, added: +${boost.pointsAdded}pts).`
    );
  }

  evidenceTrail.push(
    `[${simTimeStr}] DECISION ENGINE WINNER: "${winningCandidate.advertiserName}" - "${winningCandidate.title}" with final score ${winningCandidate.finalScore}.`
  );

  const decisionLog: DecisionLog = {
    id: `DEC-${Date.now()}-${screen.code}`,
    screenId: screen.id,
    screenCode: screen.code,
    zoneId: screen.zoneId,
    timestamp,
    simTime: simTimeStr,
    winningCampaignId: winningCampaign.id,
    winningCampaignName: `${winningCampaign.advertiserName} - ${winningCampaign.title}`,
    score: winningCandidate.finalScore,
    evidenceTrail,
    candidateScores,
    audienceSnapshot: {
      totalPax: audience.totalPax,
      dwellMinutesAvg: audience.dwellMinutesAvg,
      demographics: audience.demographics,
      dominantFlightNumber: audience.dominantFlight?.flightNumber,
      dominantDestination: audience.dominantFlight?.destination,
      flightDelayMinutes: audience.maxDelayMinutes,
    },
  };

  return {
    decisionLog,
    winningCampaign,
  };
}
