import { IPhase } from '../types';
import Game from '../../game';
import { postMissionIntro, postMissionResultLine, postMissionBanner, postOutcomeTwoFails, postOutcomeTwoSuccesses } from '../../alliances/messages';

const PostVotingMissionV2: IPhase = {
  phase: 'AlliancesPostVotingMission',
  async gameMove(room: Game, move: any) {
    if (move.kind === 'SubmitMissionVote') {
      room.submitMissionVote(move.playerId, move.payload);
      if (room.allMissionVotesIn()) {
        const { result, fails } = room.modeAlliancesResolvePostMissionWithFails();
        const { index, pair, opposition, priorSucceeded } = room.modeAlliancesPostContext();
        const succeeded = result === 'AllianceWin';
        room.sendPublic(postMissionResultLine(index, succeeded, fails));
        const banner = postMissionBanner(index, succeeded, priorSucceeded);
        if (banner) room.sendPublic(banner);

        room.modeAlliancesPostAppendResult(result);
        const tally = room.modeAlliancesPostScore();
        if (tally.allianceWins === 2) {
          room.sendPublic(postOutcomeTwoSuccesses(pair!, opposition!, room.modeAlliancesOppositionLeaderName()));
          room.enterAssassinationPhaseForAlliances();
          return 'Assassination';
        }
        if (tally.oppositionWins === 2) {
          room.sendPublic(postOutcomeTwoFails(pair!, opposition!));
          room.finishGameWithOppositionVictory();
          return 'Finished';
        }
        room.modeAlliancesPostAdvance();
        const nextIndex = room.modeAlliancesPostCurrentIndex();
        room.sendPublic(postMissionIntro(nextIndex, pair!));
        room.prepareNextPickingTeam();
        return 'PickingTeam';
      }
    }
  },
  getPublicGameData(room: Game) { return room.modeAlliancesPostPublic(); },
};
export default PostVotingMissionV2;