import { ButtonSettings, IPhase, Phase } from '../types';
import { SocketUser } from '../../../../sockets/types';

type Faction3 = 'ARTHUR' | 'MORDRED' | 'MERLIN';

function otherTwoFactions(winner: Faction3): [Faction3, Faction3] {
  // Stable ordering so yes/no mapping is deterministic
  if (winner === 'ARTHUR') return ['MORDRED', 'MERLIN'];
  if (winner === 'MORDRED') return ['ARTHUR', 'MERLIN'];
  return ['ARTHUR', 'MORDRED']; // winner === 'MERLIN'
}

function remainingFaction(a: Faction3, b: Faction3): Faction3 {
  const all: Faction3[] = ['ARTHUR', 'MORDRED', 'MERLIN'];
  return all.find((x) => x !== a && x !== b) as Faction3;
}

class AllianceSelect implements IPhase {
  static phase = Phase.AllianceSelect;
  phase = Phase.AllianceSelect;
  showGuns = true;
  private thisRoom: any;

  constructor(thisRoom_: any) {
    this.thisRoom = thisRoom_;
  }

  gameMove(socket: SocketUser, buttonPressed: string, selectedPlayers: string[]): void {
    // Only yes/no supported (green/red)
console.log('[AllianceSelect] move', socket.request.user.username, buttonPressed);
    if (!(buttonPressed === 'yes' || buttonPressed === 'no')) return;

    const chooser = this.thisRoom.alliancesState?.allianceChooserUsername;
    if (!chooser || socket.request.user.username !== chooser) return;

    const winningFaction: Faction3 = this.thisRoom.alliancesState?.pendingWinningFaction;
    if (!winningFaction) return;

    const [optYes, optNo] = otherTwoFactions(winningFaction);
    const partnerFaction: Faction3 = buttonPressed === 'yes' ? optYes : optNo;
    const oppositionFaction: Faction3 = remainingFaction(winningFaction, partnerFaction);

    // Build membership sets (6 vs 3)
    const allianceMembers = new Set<string>();
    const oppositionMembers = new Set<string>();

    for (const p of this.thisRoom.playersInGame) {
      if (p.faction3 === winningFaction || p.faction3 === partnerFaction) {
        allianceMembers.add(p.username);
      } else if (p.faction3 === oppositionFaction) {
        oppositionMembers.add(p.username);
      }
    }

    this.thisRoom.alliancesState.allianceFormed = true;
    this.thisRoom.alliancesState.winningFaction = winningFaction;
    this.thisRoom.alliancesState.partnerFaction = partnerFaction;
    this.thisRoom.alliancesState.oppositionFaction = oppositionFaction;

    this.thisRoom.alliancesState.allianceMembers = allianceMembers;
    this.thisRoom.alliancesState.oppositionMembers = oppositionMembers;

    // Tired no longer relevant post-alliance (per your spec)
    this.thisRoom.alliancesState.tiredUsernames = new Set<string>();

    // Post-alliance bookkeeping
    this.thisRoom.alliancesState.post = {
      allianceWins: 0,
      oppositionWins: 0,
      finalMissionIndex: 0, // 0->4p, 1->6p, 2->5p
    };

    this.thisRoom.sendText(
      `Alliance formed: ${winningFaction} allies with ${partnerFaction}. Opposition: ${oppositionFaction}.`,
      'gameplay-text',
    );

    this.thisRoom.changePhase(Phase.PickingTeam);
    this.thisRoom.requireSave = true;
    this.thisRoom.distributeGameData();
  }

  buttonSettings(indexOfPlayer: number): ButtonSettings {
    const pending: Faction3 = this.thisRoom.alliancesState?.pendingWinningFaction;
    const chooser = this.thisRoom.alliancesState?.allianceChooserUsername;

    // Spectators or missing data
    if (indexOfPlayer === -1 || !pending) {
      return {
        green: { hidden: true, disabled: true, setText: '' },
        red: { hidden: true, disabled: true, setText: '' },
      };
    }

    const username = this.thisRoom.playersInGame[indexOfPlayer]?.username;
    const isChooser = chooser && username === chooser;

    if (!isChooser) {
      return {
        green: { hidden: true, disabled: true, setText: '' },
        red: { hidden: true, disabled: true, setText: '' },
      };
    }

    const [optYes, optNo] = otherTwoFactions(pending);

return {
  green: { hidden: false, disabled: false, setText: 'Approve' },
  red:   { hidden: false, disabled: false, setText: 'Reject' },
};

  }

  numOfTargets(indexOfPlayer: number): number {
    // No player targeting in this phase
    return null;
  }

  getStatusMessage(indexOfPlayer: number): string {
    const pending: Faction3 = this.thisRoom.alliancesState?.pendingWinningFaction;
    const chooser = this.thisRoom.alliancesState?.allianceChooserUsername;

    if (!pending) return 'Waiting for Alliance selection.';

    const [optYes, optNo] = otherTwoFactions(pending);

    if (indexOfPlayer === -1) {
      return `Waiting for Alliance selection (winning: ${pending}).`;
    }

    const username = this.thisRoom.playersInGame[indexOfPlayer]?.username;
    if (chooser && username === chooser) {
      return `Choose the Alliance partner for ${pending}: Green = ${optYes}, Red = ${optNo}.`;
    }

    return `Waiting for ${this.thisRoom.anonymizer.anon(chooser)} to choose the Alliance.`;
  }

  getProhibitedIndexesToPick(indexOfPlayer: number): number[] {
    return [];
  }
}

export default AllianceSelect;
