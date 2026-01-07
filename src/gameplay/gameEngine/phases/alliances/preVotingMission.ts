import { IPhase } from '../types';
import Game from '../../game';
import { PreAllianceVote, TriFaction } from '../../alliances/types';
import { preMissionIntro, preMissionResults, firstWinBanner, secondWinBanner } from '../../alliances/messages';

function countFights(votes: Record<string, PreAllianceVote>): Record<TriFaction, number> {
  return Object.values(votes).reduce((acc, v) => { if (v.kind === 'Fight') acc[v.faction] = (acc[v.faction] || 0) + 1; return acc; }, {} as Record<TriFaction, number>);
}

const PreVotingMissionV2: IPhase = {
  phase: 'AlliancesPreVotingMission',
  async onPhaseStart(room: Game) { const { size, replay } = room.modeAlliancesPreSizeAndReplay(); room.sendPublic(preMissionIntro(size, replay)); },
  async gameMove(room: Game, move: any) {
    if (move.kind === 'SubmitMissionVote') {
      room.submitMissionVote(move.playerId, move.payload as PreAllianceVote);
      if (room.allMissionVotesIn()) {
        const votes = room.getMissionVotes() as Record<string, PreAllianceVote>;
        const fights = countFights(votes);
        const size = room.modeAlliancesPreCurrentSize();
        room.sendPublic(preMissionResults(size, { Arthur: fights[TriFaction.Arthur] || 0, Merlin: fights[TriFaction.Merlin] || 0, Mordred: fights[TriFaction.Mordred] || 0 }));

        const entries = Object.entries(fights) as [TriFaction, number][]; entries.sort((a,b) => b[1]-a[1]);
        const top = entries[0] || [undefined as any, 0];
        const second = entries[1] || [undefined as any, 0];
        const uniqueWinner = top[1] > (second[1] || 0) && top[1] > 0;
        const participants = room.getCurrentMissionParticipants();
        room.modeAlliancesPreAddTired(participants.map(p => p.id));

        if (uniqueWinner) {
          const before = room.modeAlliancesGetWins(top[0]);
          room.modeAlliancesPreRecordWin(top[0]);
          const after = before + 1;
          room.sendPublic(after === 1 ? firstWinBanner(size, top[0]) : secondWinBanner(size, top[0]));
          if (room.modeAlliancesHasTwoWins(top[0])) { room.modeAlliancesEnterAllianceSelect(); return 'AllianceSelect'; }
          room.modeAlliancesAdvanceMissionSize();
        } else {
          room.logBanner({ kind: 'MissionTieReplay' });
        }
        room.prepareNextPickingTeam();
        return 'PickingTeam';
      }
    }
  },
  getPublicGameData(room: Game) { return room.modeAlliancesPrePublic(); },
};
export default PreVotingMissionV2;
