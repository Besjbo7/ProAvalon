import usernamesIndexes from '../../../../myFunctions/usernamesIndexes';
import { ButtonSettings, IPhase, Phase } from '../types';
import { SocketUser } from '../../../../sockets/types';

type Faction3 = 'ARTHUR' | 'MORDRED' | 'MERLIN';
type MissionVote = 'succeed' | 'fight';

class AlliancesPreVotingMission implements IPhase {
  static phase = Phase.AlliancesPreVotingMission;
  phase = Phase.AlliancesPreVotingMission;
  showGuns = true;
  private thisRoom: any;

  constructor(thisRoom_: any) {
    this.thisRoom = thisRoom_;
  }

  gameMove(socket: SocketUser, buttonPressed: string, selectedPlayers: string[]): void {

console.log('APVM move', {
  phase: this.thisRoom.phase,
  user: socket.request.user.username,
  buttonPressed,
});

    // Only mission members vote; voters tracked via playersYetToVote (usernames)
    const username = socket.request.user.username;
    const i = this.thisRoom.playersYetToVote.indexOf(username);

    if (!(buttonPressed === 'yes' || buttonPressed === 'no')) return;
    if (i === -1) return; // already voted / not on mission

    const playerIndex = usernamesIndexes.getIndexFromUsername(
      this.thisRoom.playersInGame,
      username,
    );
    if (playerIndex === -1) return;

    const tiredSet: Set<string> =
      this.thisRoom.alliancesState?.tiredUsernames ?? new Set<string>();
    const isTired = tiredSet.has(username);

    // Map buttons:
    // yes => succeed
    // no  => fight for your own faction (unless tired; then forced succeed)
    let vote: MissionVote = 'succeed';
    if (buttonPressed === 'no' && !isTired) vote = 'fight';

    this.thisRoom.missionVotes[playerIndex] = vote;

    // remove from players yet to vote
    this.thisRoom.playersYetToVote.splice(i, 1);

    // when everyone voted, resolve mission
    if (this.thisRoom.playersYetToVote.length === 0) {
      this.resolveMission();
      this.thisRoom.requireSave = true;
    }

    this.thisRoom.distributeGameData();
  }

  private resolveMission(): void {
    const proposedTeam: string[] = this.thisRoom.proposedTeam ?? [];
    const votes: MissionVote[] = this.thisRoom.missionVotes ?? [];

    // Count fights by faction
    const counts: Record<Faction3, number> = { ARTHUR: 0, MORDRED: 0, MERLIN: 0 };

    for (const uname of proposedTeam) {
      const idx = usernamesIndexes.getIndexFromUsername(this.thisRoom.playersInGame, uname);
      if (idx === -1) continue;

      const v = votes[idx];
      if (v !== 'fight') continue;

      const faction: Faction3 = this.thisRoom.playersInGame[idx].faction3;
      if (faction === 'ARTHUR' || faction === 'MORDRED' || faction === 'MERLIN') {
        counts[faction] += 1;
      }
    }

    const max = Math.max(counts.ARTHUR, counts.MORDRED, counts.MERLIN);
    let winner: Faction3 | null = null;

    if (max > 0) {
      const top: Faction3[] = (Object.keys(counts) as Faction3[]).filter(
        (f) => counts[f] === max,
      );
      if (top.length === 1) winner = top[0];
    }

    // Everyone on mission becomes tired for the *next* mission
    this.thisRoom.alliancesState = this.thisRoom.alliancesState ?? {};
    this.thisRoom.alliancesState.tiredUsernames = new Set<string>(proposedTeam);

    // Track wins
    this.thisRoom.alliancesState.wins =
      this.thisRoom.alliancesState.wins ?? { ARTHUR: 0, MORDRED: 0, MERLIN: 0 };

    let msg = `Alliances mission resolved. Fights — Arthur: ${counts.ARTHUR}, Mordred: ${counts.MORDRED}, Merlin: ${counts.MERLIN}. `;

    if (winner === null) {
      msg += `Tie (or all succeeded). No faction wins; mission size repeats.`;
      // missionNum does NOT advance
    } else {
      this.thisRoom.alliancesState.wins[winner] += 1;
      msg += `${winner} wins the mission (wins: ${this.thisRoom.alliancesState.wins[winner]}).`;
      // missionNum advances toward 2/3/4/5 ladder; cap handled by getMissionTeamSize()
      this.thisRoom.missionNum += 1;
    }

    this.thisRoom.sendText(msg, 'gameplay-text');

    // Mark "mission happened" in legacy history so the rest of the app doesn't assume nothing happened.
    // (Purely a compatibility shim; UI will be wrong until you update it.)
    this.thisRoom.missionHistory = this.thisRoom.missionHistory ?? [];
    this.thisRoom.missionHistory.push(winner ? 'succeeded' : 'succeeded'); // keep stable; real history can be separate later

    // Reset proposal state for next round
    this.thisRoom.lastProposedTeam = proposedTeam;
    this.thisRoom.proposedTeam = [];
    this.thisRoom.missionVotes = [];
    this.thisRoom.pickNum = 1;

    // Rotate leader the same way Avalon does post-mission (matches your existing VotingMission logic)
    this.thisRoom.teamLeader--;
    if (this.thisRoom.teamLeader < 0) {
      this.thisRoom.teamLeader = this.thisRoom.playersInGame.length - 1;
    }
    this.thisRoom.hammer =
      (this.thisRoom.teamLeader - 5 + 1 + this.thisRoom.playersInGame.length) %
      this.thisRoom.playersInGame.length;

    // Alliance formation trigger (don’t transition yet; just announce)
    const w = this.thisRoom.alliancesState.wins;
    if (!this.thisRoom.alliancesState.allianceFormed && (w.ARTHUR >= 2 || w.MORDRED >= 2 || w.MERLIN >= 2)) {
      this.thisRoom.sendText(
        `A faction has reached 2 wins. Alliance formation is next (WIP). Continuing pre-alliance loop for now.`,
        'server-text',
      );
      // Later: this.thisRoom.changePhase(Phase.AllianceSelect);
    }

    this.thisRoom.changePhase(Phase.PickingTeam);
  }

  buttonSettings(indexOfPlayer: number): ButtonSettings {
    // Not a player
    if (indexOfPlayer === -1 || indexOfPlayer === undefined) {
      return {
        green: { hidden: true, disabled: true, setText: '' },
        red: { hidden: true, disabled: true, setText: '' },
      };
    }

    const username = this.thisRoom.playersInGame[indexOfPlayer]?.username;
    const stillNeedsToVote =
      this.thisRoom.playersYetToVote?.includes(username) ?? false;

    if (!stillNeedsToVote) {
      return {
        green: { hidden: true, disabled: true, setText: '' },
        red: { hidden: true, disabled: true, setText: '' },
      };
    }

    const tiredSet: Set<string> =
      this.thisRoom.alliancesState?.tiredUsernames ?? new Set<string>();
    const isTired = tiredSet.has(username);

    return {
      green: { hidden: false, disabled: false, setText: 'SUCCEED' },
      red: {
        hidden: isTired,         // tired players cannot fight
        disabled: isTired,
        setText: 'FAIL',
      },
    };
  }

  numOfTargets(indexOfPlayer: number): number {
    return null;
  }

  getStatusMessage(indexOfPlayer: number): string {
    // Spectator or non-mission member
    if (indexOfPlayer === -1 || indexOfPlayer === undefined) {
      return `Waiting for mission votes.`;
    }

    const username = this.thisRoom.playersInGame[indexOfPlayer]?.username;
    const needsToVote =
      this.thisRoom.playersYetToVote?.includes(username) ?? false;

    if (needsToVote) {
      const tiredSet: Set<string> =
        this.thisRoom.alliancesState?.tiredUsernames ?? new Set<string>();
      const isTired = tiredSet.has(username);

      if (isTired) return `You are tired this mission and must SUCCEED.`;
      return `Vote: SUCCEED or FIGHT (for your faction).`;
    }

    return `Waiting for mission votes.`;
  }

  getProhibitedIndexesToPick(indexOfPlayer: number): number[] {
    return [];
  }
}

export default AlliancesPreVotingMission;
