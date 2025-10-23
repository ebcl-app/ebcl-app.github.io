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

export interface PlayerStats {
  name: string;
  // Batting stats
  totalRuns?: number;
  totalBalls?: number;
  totalFours?: number;
  totalSixes?: number;
  totalNotOuts?: number;
  battingAverage?: number;
  battingStrikeRate?: number;
  // Bowling stats
  totalWickets?: number;
  totalOvers?: number;
  totalRunsConceded?: number;
  bowlingEconomy?: number;
  // Fielding stats
  totalCatches?: number;
  totalRunOuts?: number;
  totalStumpings?: number;
  // General stats
  matchesPlayed?: number;
}

/**
 * Calculate impact score for individual player contributions in a match
 * Used in PlayerDetails for per-match impact scores
 */
export const calculateMatchImpactScore = (contributions: PlayerContribution[]): number => {
  let totalImpact = 0;
  let totalCatches = 0;
  let totalRunOuts = 0;
  let totalStumpings = 0;

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

      // Accumulate fielding stats for centralized calculation
      if (action === 'catch') {
        totalCatches += count;
      } else if (action === 'run out') {
        totalRunOuts += count;
      } else if (action === 'stumping') {
        totalStumpings += count;
      }
    }
  });

  // Add fielding impact using centralized calculation
  totalImpact += calculateFieldingContribution(totalCatches, totalRunOuts, totalStumpings);

  // Ensure impact score doesn't go below 0 for poor performances
  return Math.max(0, Math.round(totalImpact)); // Round to whole number, minimum 0
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
    fieldingImpact = calculateFieldingContribution(
      performance.fielding.catches,
      performance.fielding.runOuts,
      performance.fielding.stumpings
    );
  }

  // Net impact
  const netImpact = battingImpact + bowlingImpact + fieldingImpact;

  return Math.max(0, Math.round(netImpact)); // Ensure non-negative whole number
};

/**
 * Legacy function for backward compatibility with PlayerDetails
 */
export const calculateImpactScore = calculateMatchImpactScore;

/**
 * Helper function to calculate fielding impact from different data formats
 * Centralizes fielding logic to avoid duplication
 */
const calculateFieldingContribution = (catches: number, runOuts: number, stumpings: number): number => {
  // Ensure valid numbers
  catches = Math.max(0, catches || 0);
  runOuts = Math.max(0, runOuts || 0);
  stumpings = Math.max(0, stumpings || 0);

  let impact = catches * 15; // Catches are most valuable
  impact += runOuts * 10; // Run-outs are valuable
  impact += stumpings * 12; // Stumpings are specialized

  // Multi-fielding bonus (matches backend logic)
  const totalFielding = catches + runOuts + stumpings;
  if (totalFielding > 1) impact += 5;

  return impact;
};

/**
 * Calculate batting-specific impact score for leaderboard rankings
 * Focuses on batting performance metrics
 */
export const calculateBattingImpactScore = (player: PlayerStats): number => {
  if (!player) return 0;

  const runs = player.totalRuns || 0;
  const balls = player.totalBalls || 0;
  const fours = player.totalFours || 0;
  const sixes = player.totalSixes || 0;
  const notOuts = player.totalNotOuts || 0;

  // Strike rate calculation
  const strikeRate = balls > 0 ? (runs / balls) * 100 : 0;

  // Boundaries (6s worth double)
  const boundaries = fours + (sixes * 2);

  // Not out bonus
  const notOutBonus = notOuts * 10;

  // Impact formula: runs + strike rate adjustment + boundaries + not out bonus
  const impact = runs + (strikeRate - 100) * 0.1 + boundaries + notOutBonus;

  return Math.max(0, Math.round(impact * 100) / 100); // Round to 2 decimal places
};

/**
 * Calculate bowling-specific impact score for leaderboard rankings
 * Focuses on bowling performance metrics
 */
export const calculateBowlingImpactScore = (player: PlayerStats): number => {
  if (!player) return 0;

  const wickets = player.totalWickets || 0;
  const overs = player.totalOvers || 0;
  const runs = player.totalRunsConceded || 0;

  // Economy rate calculation
  const economy = overs > 0 ? runs / overs : 0;

  // Impact formula: (wickets * 25) - (economy - 6) * 2 + overs bonus
  let impact = (wickets * 25) - (economy - 6) * 2;

  // Overs bonus (experience/reliability)
  if (overs >= 3) impact += Math.floor(overs) * 2;

  return Math.max(0, Math.round(impact * 100) / 100); // Round to 2 decimal places
};

/**
 * Calculate fielding-specific impact score for leaderboard rankings
 * Focuses on fielding performance metrics
 */
export const calculateFieldingImpactScore = (player: PlayerStats): number => {
  if (!player) return 0;

  const catches = player.totalCatches || 0;
  const runOuts = player.totalRunOuts || 0;
  const stumpings = player.totalStumpings || 0;

  const impact = calculateFieldingContribution(catches, runOuts, stumpings);

  return Math.max(0, Math.round(impact * 100) / 100); // Round to 2 decimal places
};

/**
 * Calculate overall impact score combining all aspects
 * Used for Rising Stars and general rankings
 */
export const calculateOverallImpactScore = (player: PlayerStats): number => {
  if (!player) return 0;

  const battingImpact = calculateBattingImpactScore(player);
  const bowlingImpact = calculateBowlingImpactScore(player);
  const fieldingImpact = calculateFieldingImpactScore(player);

  return Math.round((battingImpact + bowlingImpact + fieldingImpact) * 100) / 100; // Round to 2 decimal places
};