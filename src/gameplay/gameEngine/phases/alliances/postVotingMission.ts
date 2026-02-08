import { ButtonSettings, IPhase, Phase } from '../types';
import { SocketUser } from '../../../../sockets/types';

class AlliancesPostVotingMission implements IPhase {
  static phase = Phase.AlliancesPostVotingMission;
  phase = Phase.AlliancesPostVotingMission;
  showGuns = true;
  private thisRoom: any;

  constructor(thisRoom_: any) {
    this.thisRoom = thisRoom_;
  }

  gameMove(socket: SocketUser, buttonPressed: string, selectedPlayers: string[]): void {
    // This phase should not be reachable until Alliances is implemented.
    this.thisRoom.sendText('Alliances (post-mission) is not implemented yet.', 'server-text');
  }

  buttonSettings(indexOfPlayer: number): ButtonSettings {
    return {
      green: { hidden: true, disabled: true, setText: '' },
      red: { hidden: true, disabled: true, setText: '' },
    };
  }

  numOfTargets(indexOfPlayer: number): number {
    return null;
  }

  getStatusMessage(indexOfPlayer: number): string {
    return 'Monkey monkey monkey.';
  }

  getProhibitedIndexesToPick(indexOfPlayer: number): number[] {
    return [];
  }
}

export default AlliancesPostVotingMission;
