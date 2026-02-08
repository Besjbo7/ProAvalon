import { Alliance } from '../types';
import { Role } from '../roles/types';


// Minimal base role class factory
class BaseAlliancesRole {
  role: Role;
  alliance: Alliance;
  private thisRoom: any;

  constructor(thisRoom_: any, role: Role, alliance: Alliance) {
    this.thisRoom = thisRoom_;
    this.role = role;
    this.alliance = alliance;
  }

see(): { spies: string[]; roleTags: Record<string, any> } {
  return { spies: [], roleTags: {} };
}

}

// Concrete classes (because initialiseGameDependencies expects constructors)
class Arthur extends BaseAlliancesRole {
  static role = Role.Arthur;
  constructor(r: any) { super(r, Role.Arthur, Alliance.Resistance); }
}
class Tristan extends BaseAlliancesRole {
  static role = Role.Tristan;
  constructor(r: any) { super(r, Role.Tristan, Alliance.Resistance); }
}
class Isolde extends BaseAlliancesRole {
  static role = Role.Isolde;
  constructor(r: any) { super(r, Role.Isolde, Alliance.Resistance); }
}
class Merlin extends BaseAlliancesRole {
  static role = Role.Merlin;
  constructor(r: any) { super(r, Role.Merlin, Alliance.Resistance); }
}
class DiscipleOfMerlin extends BaseAlliancesRole {
  static role = Role.DiscipleOfMerlin;
  constructor(r: any) { super(r, Role.DiscipleOfMerlin, Alliance.Resistance); }
}

class Mordred extends BaseAlliancesRole {
  static role = Role.Mordred;
  constructor(r: any) { super(r, Role.Mordred, Alliance.Spy); }
}
class Morgana extends BaseAlliancesRole {
  static role = Role.Morgana;
  constructor(r: any) { super(r, Role.Morgana, Alliance.Spy); }
}
class Oberon extends BaseAlliancesRole {
  static role = Role.Oberon;
  constructor(r: any) { super(r, Role.Oberon, Alliance.Spy); }
}

export const alliancesRoles = {
  [Role.Arthur]: Arthur,
  [Role.Tristan]: Tristan,
  [Role.Isolde]: Isolde,
  [Role.Merlin]: Merlin,
  [Role.DiscipleOfMerlin]: DiscipleOfMerlin,
  [Role.Mordred]: Mordred,
  [Role.Morgana]: Morgana,
  [Role.Oberon]: Oberon,
};
