import Game from '../../game';
import { AlliancesState } from '../alliances/types';
import { dealAlliancesRoles } from '../alliances/dealRoles';
import { preMissionIntro } from '../alliances/messages';

export const AlliancesModeV2 = {
  id: 'Alliances', displayName: 'Alliances (9p)', minPlayers: 9, maxPlayers: 9,
  setup(game: Game) {
    const state: AlliancesState = {
      phaseKind: 'PreAlliance',
      pre: { missionSizes: [2,3,4,5], sizeIndex: 0, wins: { Arthur: 0, Mordred: 0, Merlin: 0 } as any, tired: new Set<string>(), proposalRejectsInARow: 0, morganaAutoApproveUsed: false, oberonOffFactionUsedBy: new Set<string>() },
    } as any;
    game.mode = 'Alliances'; game.modeData = state as any; dealAlliancesRoles(game);
    const size = state.pre.missionSizes[state.pre.sizeIndex]; game.sendPublic(preMissionIntro(size, false));
  },
  getCurrentMissionSize(game: Game): number { const d = game.modeData as AlliancesState; if (d.phaseKind === 'PreAlliance') return d.pre.missionSizes[d.pre.sizeIndex]; if (d.phaseKind === 'PostAlliance' && d.post) return d.post.missionSizes[d.post.index]; return 0; },
  shouldAutoApproveOnFifthReject(game: Game): boolean { const d = game.modeData as AlliancesState; return d.phaseKind === 'PreAlliance'; },
  canProposerAutoApprove(game: Game, proposerId: string): boolean { const d = game.modeData as AlliancesState; if (d.phaseKind !== 'PreAlliance' || d.pre.morganaAutoApproveUsed) return false; const meta = game.getPlayerModeMeta(proposerId, 'Alliances'); return meta?.roleName === 'Morgana'; },
  onProposerAutoApprove(game: Game, proposerId: string) { const d = game.modeData as AlliancesState; d.pre.morganaAutoApproveUsed = true; const meta = game.getPlayerModeMeta(proposerId, 'Alliances'); if (meta) meta.revealedAsMorganaAt = Date.now(); const username = game.getPlayerUsername(proposerId); game.sendPublic(`${username} is Morgana! You are bewitched into approving this proposal.`); },
};