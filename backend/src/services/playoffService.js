const ApiError = require('../utils/ApiError');
const sportPointsModel = require('../models/sportPoints');
const matchModel = require('../models/match');
const sportModel = require('../models/sport');
const { pool } = require('../config/db');

/**
 * Returns teams for a sport ordered by league standings (points).
 * Used to seed playoffs (top 3/4).
 */
async function getStandingsForPlayoffs(sportId) {
  const rows = await sportPointsModel.findBySportId(sportId);
  return rows.map((r, i) => ({
    team_id: r.team_id,
    team_name: r.team_name,
    rank: i + 1,
  }));
}

/**
 * Initial playoff generation based on league standings and sport.playoff_format.
 * - knockout: create two semi-finals (1v4, 2v3)
 * - ipl:      create Qualifier 1 (1v2) and Eliminator (3v4)
 * - wpl:      create single Semi (2v3)
 *
 * Subsequent matches (Qualifier 2, Finals) are created automatically
 * by advancePlayoffsIfNeeded() when earlier matches complete.
 */
async function generatePlayoffMatches(sport) {
  const sportId = sport.id;
  const standings = await getStandingsForPlayoffs(sportId);
  if (standings.length < 2) {
    throw new ApiError(400, 'Need at least 2 teams in points table to generate playoffs');
  }

  const existing = await matchModel.findBySportId(sportId);
  const hasPlayoff = existing.some((m) =>
    ['qualifier1', 'eliminator', 'qualifier2', 'semi', 'final'].includes(m.match_type)
  );
  if (hasPlayoff) {
    throw new ApiError(409, 'Playoff matches already exist for this sport');
  }

  const t1 = standings[0]?.team_id;
  const t2 = standings[1]?.team_id;
  const t3 = standings[2]?.team_id;
  const t4 = standings[3]?.team_id;

  const format = sport.playoff_format || 'knockout';
  const matchesToCreate = [];

  if (format === 'knockout') {
    // 1 vs 4, 2 vs 3 -> winners will later play Final
    if (!t4) throw new ApiError(400, 'Knockout requires top 4 teams');
    matchesToCreate.push(
      { team1_id: t1, team2_id: t4, match_type: 'semi' },
      { team1_id: t2, team2_id: t3, match_type: 'semi' }
    );
  } else if (format === 'ipl') {
    // Qualifier 1: 1 vs 2, Eliminator: 3 vs 4
    if (!t4) throw new ApiError(400, 'IPL format requires top 4 teams');
    matchesToCreate.push(
      { team1_id: t1, team2_id: t2, match_type: 'qualifier1' },
      { team1_id: t3, team2_id: t4, match_type: 'eliminator' }
    );
  } else if (format === 'wpl') {
    // Semi: 2 vs 3, winner later faces 1 in Final
    if (!t3) throw new ApiError(400, 'WPL format requires top 3 teams');
    matchesToCreate.push({ team1_id: t2, team2_id: t3, match_type: 'semi' });
  }

  const created = [];
  for (const m of matchesToCreate) {
    const row = await matchModel.create({
      sport_id: sportId,
      team1_id: m.team1_id,
      team2_id: m.team2_id,
      match_type: m.match_type,
      status: 'upcoming',
    });
    created.push(row);
  }

  return created;
}

async function getPlayoffMatches(sportId) {
  const rows = await matchModel.findBySportId(sportId);
  return rows.filter((m) =>
    ['qualifier1', 'eliminator', 'qualifier2', 'semi', 'final'].includes(m.match_type)
  );
}

/**
 * After a playoff match is completed, this function may create the next
 * bracket matches (Qualifier 2 / Final) depending on the format.
 *
 * - knockout: when both semis are completed, create Final (semi1 winner vs semi2 winner)
 * - ipl:
 *   - after Qualifier 1 + Eliminator completed and no Qualifier 2: create Qualifier 2
 *   - after Qualifier 2 completed and no Final: create Final
 * - wpl: after Semi completed and no Final: create Final (1st seed vs semi winner)
 */
async function advancePlayoffsIfNeeded(match) {
  if (match.status !== 'completed' || !match.winner_team_id) return;

  const sport = await sportModel.findById(match.sport_id);
  if (!sport) return;
  const sportId = sport.id;
  const format = sport.playoff_format || 'knockout';

  const all = await matchModel.findBySportId(sportId);

  if (format === 'knockout') {
    const semis = all.filter((m) => m.match_type === 'semi');
    const final = all.find((m) => m.match_type === 'final');
    if (final || semis.length < 2) return;
    if (!semis.every((m) => m.status === 'completed' && m.winner_team_id)) return;

    const [semi1, semi2] = semis;
    await matchModel.create({
      sport_id: sportId,
      team1_id: semi1.winner_team_id,
      team2_id: semi2.winner_team_id,
      match_type: 'final',
      status: 'upcoming',
    });
  } else if (format === 'ipl') {
    const qualifier1 = all.find((m) => m.match_type === 'qualifier1');
    const eliminator = all.find((m) => m.match_type === 'eliminator');
    const qualifier2 = all.find((m) => m.match_type === 'qualifier2');
    const final = all.find((m) => m.match_type === 'final');

    // Create Qualifier 2 after Qualifier 1 and Eliminator are completed
    if (!qualifier2 && qualifier1 && eliminator) {
      if (
        qualifier1.status === 'completed' &&
        qualifier1.winner_team_id &&
        eliminator.status === 'completed' &&
        eliminator.winner_team_id
      ) {
        const q1Loser =
          qualifier1.winner_team_id === qualifier1.team1_id
            ? qualifier1.team2_id
            : qualifier1.team1_id;
        await matchModel.create({
          sport_id: sportId,
          team1_id: q1Loser,
          team2_id: eliminator.winner_team_id,
          match_type: 'qualifier2',
          status: 'upcoming',
        });
        // refresh matches state
        const updatedAll = await matchModel.findBySportId(sportId);
        const newQualifier2 = updatedAll.find((m) => m.match_type === 'qualifier2');
        if (final || !newQualifier2) return;
        // final will be created in following block once qualifier2 is completed
      }
    }

    // Create Final after Qualifier 2 is completed
    const latestQualifier2 = qualifier2 || all.find((m) => m.match_type === 'qualifier2');
    if (!final && qualifier1 && latestQualifier2) {
      if (
        qualifier1.status === 'completed' &&
        qualifier1.winner_team_id &&
        latestQualifier2.status === 'completed' &&
        latestQualifier2.winner_team_id
      ) {
        await matchModel.create({
          sport_id: sportId,
          team1_id: qualifier1.winner_team_id,
          team2_id: latestQualifier2.winner_team_id,
          match_type: 'final',
          status: 'upcoming',
        });
      }
    }
  } else if (format === 'wpl') {
    const semi = all.find((m) => m.match_type === 'semi');
    const final = all.find((m) => m.match_type === 'final');
    if (!semi || final) return;
    if (semi.status !== 'completed' || !semi.winner_team_id) return;

    // Seed 1 goes straight to final; fetch from standings
    const standings = await getStandingsForPlayoffs(sportId);
    const top1 = standings[0]?.team_id;
    if (!top1) return;

    await matchModel.create({
      sport_id: sportId,
      team1_id: top1,
      team2_id: semi.winner_team_id,
      match_type: 'final',
      status: 'upcoming',
    });
  }
}

module.exports = {
  getStandingsForPlayoffs,
  generatePlayoffMatches,
  getPlayoffMatches,
  advancePlayoffsIfNeeded,
};
