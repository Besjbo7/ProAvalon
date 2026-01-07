import { IPhase } from '../types';
import Game from '../../game';
import { TriFaction, mapAlliancePair } from '../../alliances/types';
import { allianceFormedBanner, waitForMordredText, mordredDisguisePrompt, mordredAwakensPM, postMissionIntro } from '../../alliances/messages';

const AllianceSelectV2: IPhase = {
  phase: 'AllianceSelect',
  async gameMove(room: Game, move: any) {
    if (move.kind === 'ChooseAlly') {
      if (!room.modeAlliancesIsLastProposer(move.playerId)) return;
      room.modeAlliancesSetAlly(move.ally as TriFaction);
      const pub = room.modeAlliancesPublicAlliance();
      const pair = mapAlliancePair(pub.winner, pub.ally!);
      room.modeAlliancesSetPair(pair);
      room.sendPublic(allianceFormedBanner(pair));
      room.showGlobalWait(waitForMordredText(), { except: room.getCurrentMordredId() });
      room.sendPrivate(room.getCurrentMordredId(), mordredDisguisePrompt());
      return;
    }
    if (move.kind === 'MordredSwap') {
      if (!room.modeAlliancesSwapAvailable()) return;
      room.modeAlliancesPerformMordredSwap(move.with);
      const nowMordred = room.getCurrentMordredId();
      if (nowMordred) room.sendPrivate(nowMordred, mordredAwakensPM());
      return;
    }
    if (move.kind === 'ProceedToPostAlliance') {
      if (!room.modeAlliancesHasAlliancePair()) return;
      const { pair } = room.modeAlliancesGetAlliance()!;
      room.modeAlliancesEnterPostAlliance();
      room.sendPublic(postMissionIntro(0, pair!));
      return 'AlliancesPostVotingMission';
    }
  },
  getPublicGameData(room: Game) { return room.modeAlliancesPublicAlliance(); },
};
export default AllianceSelectV2;
