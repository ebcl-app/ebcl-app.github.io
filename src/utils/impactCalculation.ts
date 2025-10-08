// Cricket Impact Score Calculation Utility
// Provides a common formula for calculating player impact across match details and player profiles

export interface PlayerContribution {
  type: 'batting' | 'bowling' | 'fielding';
  inningNumber: number;
  // Batting fields
  runs?: number;
  balls?: number;
  fours?: number;
  sixes?: number;
  dismissal?: string;
  strikeRate?: string;
  // Bowling fields
  overs?: string;
  maidens?: number;
  wickets?: number;
  economy?: string;
  // Fielding fields
  action?: string;
  count?: number;
}

export interface AggregatedPerformance {
  batting: {
    runs: number;
    balls: number;
    fours: number;
    sixes: number;
  };
  bowling: {
    wickets: number;
    runs: number;
    overs: number;
  };
  fielding?: {
    catches: number;
    runOuts: number;
    stumpings: number;
  };
}

/**
 * Calculate impact score for individual player contributions in a match
 * Used in PlayerDetails for per-match impact scores
 */
export const calculateMatchImpactScore = (contributions: PlayerContribution[]): number => {
  let totalImpact = 0;

  contributions.forEach(contribution => {
    if (contribution.type === 'batting') {
      const runs = contribution.runs || 0;
      const balls = contribution.balls || 0;
      const strikeRate = contribution.strikeRate ? parseFloat(contribution.strikeRate) : (balls > 0 ? (runs / balls) * 100 : 0);
      const boundaries = (contribution.fours || 0) + ((contribution.sixes || 0) * 2); // 6s worth double
      const isNotOut = !contribution.dismissal || contribution.dismissal === 'not out';

      // Batting impact: runs + strike rate bonus + boundaries + not out bonus
      totalImpact += runs;
      if (strikeRate > 0) { // Only apply strike rate bonus/penalty if valid
        totalImpact += (strikeRate - 100) * 0.1; // Strike rate contribution
      }
      totalImpact += boundaries; // Boundary bonus
      if (isNotOut && runs > 20) totalImpact += 5; // Not out bonus for decent innings

    } else if (contribution.type === 'bowling') {
      const wickets = contribution.wickets || 0;
      const overs = contribution.overs ? parseFloat(contribution.overs) : 0;
      const runs = contribution.runs || 0;
      const economy = contribution.economy ? parseFloat(contribution.economy) : (overs > 0 ? (runs / overs) : 0);

      // Bowling impact: wickets bonus - economy penalty + overs bonus
      totalImpact += wickets * 25; // Wickets are highly valuable
      if (economy > 0 && !isNaN(economy)) { // Only apply economy penalty if valid
        totalImpact -= Math.max(0, (economy - 6) * 2); // Economy penalty (6 is baseline), don't go below 0
      }
      if (overs >= 3 && !isNaN(overs)) totalImpact += Math.floor(overs) * 2; // Overs bonus

    } else if (contribution.type === 'fielding') {
      const action = contribution.action || '';
      const count = contribution.count || 0;

      // Fielding impact: catches and run-outs are valuable
      if (action === 'catch') {
        totalImpact += count * 15; // Catches are worth 15 points each
      } else if (action === 'run out') {
        totalImpact += count * 10; // Run-outs are worth 10 points each
      } else if (action === 'stumping') {
        totalImpact += count * 12; // Stumpings are worth 12 points each
      }
      // Add bonus for multiple fielding efforts in one match
      if (count > 1) totalImpact += 5; // Multi-fielding bonus
    }
  });

  // Ensure impact score doesn't go below 0 for poor performances
  return Math.max(0, Math.round(totalImpact * 100) / 100); // Round to 2 decimal places, minimum 0
};

/**
 * Calculate impact score for aggregated performance across a match
 * Used in MatchDetails for player impact rankings
 */
export const calculateAggregatedImpactScore = (performance: AggregatedPerformance): number => {
  // Calculate batting impact
  const battingRuns = performance.batting.runs;
  const battingBalls = performance.batting.balls;
  const strikeRate = battingBalls > 0 ? (battingRuns / battingBalls) * 100 : 0;
  const boundaries = performance.batting.fours + (performance.batting.sixes * 2); // 6s worth double

  const battingImpact = battingRuns + (strikeRate - 100) * 0.1 + boundaries;

  // Calculate bowling impact
  const bowlingWickets = performance.bowling.wickets;
  const bowlingOvers = performance.bowling.overs;
  const economy = bowlingOvers > 0 ? performance.bowling.runs / bowlingOvers : 0;

  let bowlingImpact = (bowlingWickets * 25) - (economy - 6) * 2;
  if (bowlingOvers >= 3) bowlingImpact += Math.floor(bowlingOvers) * 2; // Overs bonus

  // Calculate fielding impact (if available)
  let fieldingImpact = 0;
  if (performance.fielding) {
    fieldingImpact += performance.fielding.catches * 15;
    fieldingImpact += performance.fielding.runOuts * 10;
    fieldingImpact += performance.fielding.stumpings * 12;
    if ((performance.fielding.catches + performance.fielding.runOuts + performance.fielding.stumpings) > 1) {
      fieldingImpact += 5; // Multi-fielding bonus
    }
  }

  // Net impact
  const netImpact = battingImpact + bowlingImpact + fieldingImpact;

  return Math.max(0, parseFloat(netImpact.toFixed(2))); // Ensure non-negative
};

/**
 * Legacy function for backward compatibility with PlayerDetails
 */
export const calculateImpactScore = calculateMatchImpactScore;