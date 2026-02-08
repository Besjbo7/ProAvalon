import usernamesIndexes from '../../../../myFunctions/usernamesIndexes';
import { ButtonSettings, IPhase, Phase } from '../types';
import { Alliance } from '../../types';
import { SocketUser } from '../../../../sockets/types';
import { Role } from '../../roles/types';
import { GameMode, strToGameMode } from '../../gameModes';

function isAlliancesRoom(room: any): boolean {
  try {
    return strToGameMode(room.gameMode) === GameMode.ALLIANCES;
  } catch {
    return (room.gameMode ?? '').toString().trim().toLowerCase() === 'alliances';
  }
}

class VotingMission implements IPhase {
  static phase = Phase.VotingMission;
  phase = Phase.VotingMission;
  showGuns = true;
  private thisRoom: any;

  constructor(thisRoom_: any) {
    this.thisRoom = thisRoom_;
  }

  gameMove(socket: SocketUser, buttonPressed: string, selectedPlayers: string[]): void {
    const username = socket.request.user.username;
    const i = this.thisRoom.playersYetToVote.indexOf(username);
    const isAlliances = isAlliancesRoom(this.thisRoom);

    // Only accept known buttons
    if (!(buttonPressed === 'yes' || buttonPressed === 'no')) {
      return;
    }

    // If vote is coming from someone who hasn't voted yet
    if (i !== -1) {
      const index = usernamesIndexes.getIndexFromUsername(
        this.thisRoom.playersInGame,
        username,
      );
      if (index === -1) return;

      if (buttonPressed === 'yes') {
        this.thisRoom.missionVotes[index] = 'succeed';
      } else {
        // buttonPressed === 'no'
        if (!isAlliances) {
          // Normal Avalon: Resistance can't fail (except Moregano behavior)
          if (
            this.thisRoom.playersInGame[index].alliance === Alliance.Resistance &&
            this.thisRoom.playersInGame[index].role !== Role.Moregano
          ) {
            socket.emit('danger-alert', 'You are resistance! Surely you want to succeed!');
            return;
          }

          const effectiveVote =
            this.thisRoom.playersInGame[index].role === Role.Moregano
              ? 'succeed'
              : 'fail';

          this.thisRoom.missionVotes[index] = effectiveVote;
        } else {
          // Alliances: "no" means "fight" unless you're tired (then forced succeed)
          const tired: Set<string> =
            this.thisRoom.alliancesState?.tiredUsernames ?? new Set<string>();

          const isTired = tired.has(username);
          this.thisRoom.missionVotes[index] = isTired ? 'succeed' : 'fail'; // fail = "fight"
        }
      }

      // remove the player from players yet to vote
      this.thisRoom.playersYetToVote.splice(i, 1);
    } else {
      console.log(`Player ${username} has already voted or is not in the game`);
    }

    // If we have all the votes in
    if (this.thisRoom.playersYetToVote.length === 0) {
      if (isAlliances) {
        this.resolveAlliancesPreAllianceMission();
      } else {
        // ---- existing Avalon resolution block (unchanged) ----
        const outcome = this.thisRoom.calcMissionVotes(this.thisRoom.missionVotes);
        if (outcome) {
          this.thisRoom.missionHistory.push(outcome);
        } else {
          console.log(`ERROR! Outcome was: ${outcome}`);
        }

        const numOfVotedFails = this.countFails(this.thisRoom.missionVotes);
        this.thisRoom.numFailsHistory.push(numOfVotedFails);

        if (outcome === 'succeeded') {
          if (numOfVotedFails === 0) {
            this.thisRoom.sendText(
              `Mission ${this.thisRoom.missionNum} succeeded.`,
              'gameplay-text-blue',
            );
          } else {
            this.thisRoom.sendText(
              `Mission ${this.thisRoom.missionNum} succeeded, but with ${numOfVotedFails} fail.`,
              'gameplay-text-blue',
            );
          }
        } else if (outcome === 'failed') {
          if (numOfVotedFails === 1) {
            this.thisRoom.sendText(
              `Mission ${this.thisRoom.missionNum} failed with ${numOfVotedFails} fail.`,
              'gameplay-text-red',
            );
          } else {
            this.thisRoom.sendText(
              `Mission ${this.thisRoom.missionNum} failed with ${numOfVotedFails} fails.`,
              'gameplay-text-red',
            );
          }
        }

        this.thisRoom.lastProposedTeam = this.thisRoom.proposedTeam;
        this.thisRoom.proposedTeam = [];
        this.thisRoom.missionVotes = [];

        let numOfSucceeds = 0;
        let numOfFails = 0;
        for (let j = 0; j < this.thisRoom.missionHistory.length; j++) {
          if (this.thisRoom.missionHistory[j] === 'succeeded') numOfSucceeds++;
          else if (this.thisRoom.missionHistory[j] === 'failed') numOfFails++;
        }

        if (numOfFails == 2) {
          this.thisRoom.critMission = true;
        }

        if (numOfFails >= 3) {
          this.thisRoom.winner = Alliance.Spy;
          this.thisRoom.howWasWon = 'Mission fails.';
          this.thisRoom.finishGame(Alliance.Spy);
        } else if (numOfSucceeds >= 3) {
          this.thisRoom.winner = Alliance.Resistance;
          this.thisRoom.howWasWon = 'Mission successes';
          this.thisRoom.finishGame(Alliance.Resistance);
        } else {
          this.thisRoom.missionNum++;
          this.thisRoom.pickNum = 1;

          this.thisRoom.teamLeader--;
          if (this.thisRoom.teamLeader < 0) {
            this.thisRoom.teamLeader = this.thisRoom.playersInGame.length - 1;
          }

          this.thisRoom.hammer =
            (this.thisRoom.teamLeader - 5 + 1 + this.thisRoom.playersInGame.length) %
            this.thisRoom.playersInGame.length;

          this.thisRoom.changePhase(Phase.PickingTeam);
        }
        this.thisRoom.requireSave = true;
        // ---- end Avalon block ----
      }
    }

    this.thisRoom.distributeGameData();
  } // <-- THIS CLOSING BRACE WAS EFFECTIVELY MISSING BEFORE

  buttonSettings(indexOfPlayer: number): ButtonSettings {
    const isAlliances = isAlliancesRoom(this.thisRoom);

    // If user has voted (or spectator)
    if (
      indexOfPlayer === -1 ||
      this.thisRoom.playersYetToVote.indexOf(
        this.thisRoom.playersInGame[indexOfPlayer].username,
      ) === -1
    ) {
      return {
        green: { hidden: true, disabled: true, setText: '' },
        red: { hidden: true, disabled: true, setText: '' },
      };
    }

    if (isAlliances) {
      const username = this.thisRoom.playersInGame[indexOfPlayer].username;
      const tired: Set<string> =
        this.thisRoom.alliancesState?.tiredUsernames ?? new Set<string>();
      const isTired = tired.has(username);

      return {
        green: { hidden: false, disabled: false, setText: 'SUCCEED' },
        red: { hidden: isTired, disabled: isTired, setText: 'FAIL' }, // FAIL = fight
      };
    }

    // Avalon: Resistance can't fail
    const redHidden =
      this.thisRoom.playersInGame[indexOfPlayer].alliance === Alliance.Resistance;

    return {
      green: { hidden: false, disabled: false, setText: 'SUCCEED' },
      red: { hidden: redHidden, disabled: redHidden, setText: 'FAIL' },
    };
  }

  numOfTargets(indexOfPlayer: number): number {
    return null;
  }

  getStatusMessage(indexOfPlayer: number): string {
    // keep your existing implementation (unchanged)
    if (indexOfPlayer === -1) {
      let str = 'Waiting for mission votes: ';
      for (let i = 0; i < this.thisRoom.playersYetToVote.length; i++) {
        str = `${str + this.thisRoom.anonymizer.anon(this.thisRoom.playersYetToVote[i])}, `;
      }
      str = str.slice(0, str.length - 2);
      str += '.';
      return str;
    }

    if (
      indexOfPlayer !== undefined &&
      this.thisRoom.playersYetToVote.indexOf(
        this.thisRoom.playersInGame[indexOfPlayer].username,
      ) !== -1
    ) {
      let str = `${this.thisRoom.anonymizer.anon(
        this.thisRoom.playersInGame[this.thisRoom.teamLeader].username,
      )} has picked: `;

      for (let i = 0; i < this.thisRoom.proposedTeam.length; i++) {
        str += `${this.thisRoom.anonymizer.anon(this.thisRoom.proposedTeam[i])}, `;
      }
      str = str.slice(0, str.length - 2);
      str += '.';
      return str;
    }

    let str = 'Waiting for mission votes: ';
    for (let i = 0; i < this.thisRoom.playersYetToVote.length; i++) {
      str = `${str + this.thisRoom.anonymizer.anon(this.thisRoom.playersYetToVote[i])}, `;
    }
    str = str.slice(0, str.length - 2);
    str += '.';
    return str;
  }

  private resolveAlliancesPreAllianceMission(): void {
    type Faction3 = 'ARTHUR' | 'MORDRED' | 'MERLIN';

    const proposedTeam: string[] = this.thisRoom.proposedTeam ?? [];
    const votes: string[] = this.thisRoom.missionVotes ?? [];

    const counts: Record<Faction3, number> = { ARTHUR: 0, MORDRED: 0, MERLIN: 0 };

    for (const uname of proposedTeam) {
      const idx = usernamesIndexes.getIndexFromUsername(this.thisRoom.playersInGame, uname);
      if (idx === -1) continue;

      if (votes[idx] !== 'fail') continue; // 'fail' = "fight" in Alliances

      const f: Faction3 = this.thisRoom.playersInGame[idx].faction3;
      if (f === 'ARTHUR' || f === 'MORDRED' || f === 'MERLIN') {
        counts[f] += 1;
      }
    }

    const max = Math.max(counts.ARTHUR, counts.MORDRED, counts.MERLIN);
    let winner: Faction3 | null = null;

    if (max > 0) {
      const top = (Object.keys(counts) as Faction3[]).filter((k) => counts[k] === max);
      if (top.length === 1) winner = top[0];
    }

 // tired next mission = ONLY players who fought (voted 'fail') on this mission
this.thisRoom.alliancesState = this.thisRoom.alliancesState ?? {};

const tiredNext = new Set<string>();
for (const uname of proposedTeam) {
  const idx = usernamesIndexes.getIndexFromUsername(this.thisRoom.playersInGame, uname);
  if (idx === -1) continue;

  if (votes[idx] === 'fail') {
    tiredNext.add(uname);
  }
}

this.thisRoom.alliancesState.tiredUsernames = tiredNext;


    // wins
    this.thisRoom.alliancesState.wins =
      this.thisRoom.alliancesState.wins ?? { ARTHUR: 0, MORDRED: 0, MERLIN: 0 };

    let msg = `Alliances mission resolved. Fights — Arthur: ${counts.ARTHUR}, Mordred: ${counts.MORDRED}, Merlin: ${counts.MERLIN}. `;
    if (winner === null) {
      msg += `Tie (or all succeeded). No faction wins; mission size repeats.`;
    } else {
      this.thisRoom.alliancesState.wins[winner] += 1;
      msg += `${winner} wins the mission (wins: ${this.thisRoom.alliancesState.wins[winner]}).`;
      this.thisRoom.missionNum += 1;
    }

    this.thisRoom.sendText(msg, 'gameplay-text');
// If someone hit 2 wins, go to AllianceSelect
if (!this.thisRoom.alliancesState.allianceFormed &&
    this.thisRoom.alliancesState.wins[winner] >= 2) {

  this.thisRoom.alliancesState.pendingWinningFaction = winner;

  // chooser is whoever proposed the last mission team
  this.thisRoom.alliancesState.allianceChooserUsername =
    this.thisRoom.lastMissionProposerUsername ??
    this.thisRoom.playersInGame[this.thisRoom.lastMissionProposerIndex ?? -1]?.username;

  // reset mission interaction state so we don't leak into the next phase
  this.thisRoom.lastProposedTeam = proposedTeam;
  this.thisRoom.proposedTeam = [];
  this.thisRoom.missionVotes = [];
  this.thisRoom.pickNum = 1;

  this.thisRoom.sendText(
    `${winner} has reached 2 wins. Alliance must now be chosen.`,
    'gameplay-text',
  );

  this.thisRoom.changePhase(Phase.AllianceSelect);
  this.thisRoom.requireSave = true;
  return;
}


    // reset
    this.thisRoom.lastProposedTeam = proposedTeam;
    this.thisRoom.proposedTeam = [];
    this.thisRoom.missionVotes = [];
    this.thisRoom.pickNum = 1;

    // rotate leader
    this.thisRoom.teamLeader--;
    if (this.thisRoom.teamLeader < 0) {
      this.thisRoom.teamLeader = this.thisRoom.playersInGame.length - 1;
    }
    this.thisRoom.hammer =
      (this.thisRoom.teamLeader - 5 + 1 + this.thisRoom.playersInGame.length) %
      this.thisRoom.playersInGame.length;

    this.thisRoom.changePhase(Phase.PickingTeam);
    this.thisRoom.requireSave = true;
  }

  private countFails(votes: string[]) {
    let numOfVotedFails = 0;
    for (let i = 0; i < votes.length; i++) {
      if (votes[i] === 'fail') numOfVotedFails++;
    }
    return numOfVotedFails;
  }

  getProhibitedIndexesToPick(indexOfPlayer: number): number[] {
    return [];
  }
}

export default VotingMission;
