// Minimal types to make current scaffolding compile.
// We can expand these when Alliances rules are implemented.

export enum TriFaction {
  Arthur = 'Arthur',
  Merlin = 'Merlin',
  Mordred = 'Mordred',
}

export enum AlliancePair {
  AlliedCamelot = 'AlliedCamelot',      // Arthur + Merlin
  AlliedArcana = 'AlliedArcana',        // Merlin + Mordred
  AlliedKnighthood = 'AlliedKnighthood' // Arthur + Mordred
}

export enum AlliancesRoleName {
  Merlin = 'Merlin',
  Disciple = 'Disciple',

  Arthur = 'Arthur',
  Tristan = 'Tristan',
  Isolde = 'Isolde',

  Mordred = 'Mordred',
  Morgana = 'Morgana',
  Oberon = 'Oberon',
}

// Optional helper types (safe to keep minimal for now)
export type PlayerAlliancesMeta = {
  triFaction: TriFaction;
  roleName: AlliancesRoleName;
};

export function factionDisplayName(f: TriFaction): string {
  return f === TriFaction.Arthur
    ? 'Servants of Arthur'
    : f === TriFaction.Merlin
      ? 'Disciples of Merlin'
      : 'Minions of Mordred';
}

export function alliancePairDisplayName(p: AlliancePair): string {
  return p;
}
