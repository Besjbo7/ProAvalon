import Game from './game';
import { AlliancesState, AlliancePair, PostAllianceVote, TriFaction, computeEndTeam } from './alliances/types';

export function ensureAlliances(game: Game): asserts game is Game & { modeData: AlliancesState } { if (game.mode !== 'Alliances') throw new Error('Not in Alliances mode'); }
export function prePublic(game: Game) { ensureAlliances(game); return { sizeIndex: game.modeData.pre.sizeIndex, missionSize: game.modeData.pre.missionSizes[game.modeData.pre.sizeIndex], wins: game.modeData.pre.wins }; }
export function preAddTired(game: Game, ids: string[]) { ensureAlliances(game); ids.forEach(id => game.modeData.pre.tired.add(id)); }
export function preClearTired(game: Game) { ensureAlliances(game); game.modeData.pre.tired.clear(); }
export function preRecordWin(game: Game, f: TriFaction) { ensureAlliances(game); game.modeData.pre.wins[f]++; }
export function preGetWins(game: Game, f: TriFaction) { ensureAlliances(game); return game.modeData.pre.wins[f]; }
export function preHasTwoWins(game: Game, f: TriFaction) { ensureAlliances(game); return game.modeData.pre.wins[f] >= 2; }
export function preAdvanceSize(game: Game) { ensureAlliances(game); game.modeData.pre.sizeIndex = Math.min(game.modeData.pre.sizeIndex + 1, game.modeData.pre.missionSizes.length - 1); }
export function preCurrentSize(game: Game) { ensureAlliances(game); return game.modeData.pre.missionSizes[game.modeData.pre.sizeIndex]; }
export function preSizeAndReplay(game: Game) { ensureAlliances(game); return { size: preCurrentSize(game), replay: game.wasLastMissionReplay?.() ?? false }; }
export function enterAllianceSelect(game: Game) { ensureAlliances(game); const d = game.modeData; const lastProposerId = game.getLastProposerId(); d.phaseKind = 'AllianceSelect'; d.alliance = { winner: winnerFaction(d), lastProposerId, mordredSwapAvailable: true, mordredHasSwapped: false } as any; preClearTired(game); }
function winnerFaction(d: AlliancesState): TriFaction { const { wins } = d.pre; const max = Math.max(wins.Arthur, wins.Mordred, wins.Merlin); if (wins.Arthur === max) return TriFaction.Arthur; if (wins.Mordred === max) return TriFaction.Mordred; return TriFaction.Merlin; }
export function isLastProposer(game: Game, id: string) { ensureAlliances(game); return game.modeData.alliance?.lastProposerId === id; }
export function setAlly(game: Game, ally: TriFaction) { ensureAlliances(game); const a = game.modeData.alliance!; a.ally = ally; a.opposition = ([TriFaction.Arthur, TriFaction.Mordred, TriFaction.Merlin] as const).find(x => x !== a.winner && x !== ally)!; }
export function hasAlliancePair(game: Game) { ensureAlliances(game); return !!game.modeData.alliance?.ally; }
export function setPair(game: Game, pair: AlliancePair) { ensureAlliances(game); if (game.modeData.alliance) game.modeData.alliance.pair = pair; }
export function getAlliance(game: Game) { ensureAlliances(game); return game.modeData.alliance; }
export function performMordredSwap(game: Game, withRole: 'Morgana' | 'Oberon') { ensureAlliances(game); const a = game.modeData.alliance!; if (!a.mordredSwapAvailable || a.mordredHasSwapped) return; game.swapRoleLabels('Mordred', withRole); a.mordredHasSwapped = true; }
export function enterPostAlliance(game: Game) { ensureAlliances(game); game.modeData.phaseKind = 'PostAlliance'; game.modeData.post = { missionSizes: [4,6,5], index: 0, results: [] }; }
export function resolvePostMissionWithFails(game: Game) { ensureAlliances(game); const votes = game.getMissionVotes() as Record<string, PostAllianceVote>; const size = game.modeData.post!.missionSizes[game.modeData.post!.index]; const fails = Object.values(votes).filter(v => v.kind === 'Fail').length; const needTwo = size === 6; const result = (needTwo ? (fails >= 2) : (fails >= 1)) ? 'OppositionWin' : 'AllianceWin'; return { result, fails }; }
export function postAppendResult(game: Game, r: 'AllianceWin'|'OppositionWin') { ensureAlliances(game); game.modeData.post!.results.push(r); }
export function postScore(game: Game) { ensureAlliances(game); const a = game.modeData.post!.results.filter(x => x === 'AllianceWin').length; const o = game.modeData.post!.results.filter(x => x === 'OppositionWin').length; return { allianceWins: a, oppositionWins: o }; }
export function postAdvance(game: Game) { ensureAlliances(game); game.modeData.post!.index++; }
export function postPublic(game: Game) { ensureAlliances(game); return { index: game.modeData.post!.index, sizes: game.modeData.post!.missionSizes, results: game.modeData.post!.results, pair: game.modeData.alliance?.pair, opposition: game.modeData.alliance?.opposition }; }
export function postCurrentIndex(game: Game) { ensureAlliances(game); return game.modeData.post!.index; }
export function postContext(game: Game) { ensureAlliances(game); const idx = game.modeData.post!.index; const pair = game.modeData.alliance!.pair; const opposition = game.modeData.alliance!.opposition; const prev = idx > 0 ? game.modeData.post!.results[idx-1] : undefined; return { index: idx, pair, opposition, priorSucceeded: prev ? prev === 'AllianceWin' : undefined }; }
export function oppositionLeaderName(game: Game): 'Arthur'|'Merlin'|'Mordred' { ensureAlliances(game); const opp = game.modeData.alliance!.opposition!; return opp === 'Arthur' ? 'Arthur' : opp === 'Merlin' ? 'Merlin' : 'Mordred'; }
export function finishOppositionVictory(game: Game) { ensureAlliances(game); const opp = game.modeData.alliance?.opposition; const end = computeEndTeam(false, opp, game.modeData.alliance?.pair); game.finishWithWinnerLabel(end || 'Opposition'); }
export function enterAssassinationForAlliances(game: Game) { ensureAlliances(game); game.modeData.phaseKind = 'Assassination'; }
