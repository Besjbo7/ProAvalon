import { AlliancesRoleName, PlayerAlliancesMeta, TriFaction } from './types';
import Game from '../game';
import { startRoleReminder } from './messages';

export function dealAlliancesRoles(room: Game): void {
  const players = room.getPlayers();
  if (players.length !== 9) throw new Error('Alliances mode requires exactly 9 players');

  const roleOrder: { roleName: AlliancesRoleName; triFaction: TriFaction }[] = [
    { roleName: AlliancesRoleName.Arthur, triFaction: TriFaction.Arthur },
    { roleName: AlliancesRoleName.Tristan, triFaction: TriFaction.Arthur },
    { roleName: AlliancesRoleName.Isolde, triFaction: TriFaction.Arthur },
    { roleName: AlliancesRoleName.Mordred, triFaction: TriFaction.Mordred },
    { roleName: AlliancesRoleName.Morgana, triFaction: TriFaction.Mordred },
    { roleName: AlliancesRoleName.Oberon, triFaction: TriFaction.Mordred },
    { roleName: AlliancesRoleName.Merlin, triFaction: TriFaction.Merlin },
    { roleName: AlliancesRoleName.Disciple, triFaction: TriFaction.Merlin },
    { roleName: AlliancesRoleName.Disciple, triFaction: TriFaction.Merlin },
  ];

  players.forEach((p, idx) => {
    const assigned = roleOrder[idx];
    const meta: PlayerAlliancesMeta = { triFaction: assigned.triFaction, roleName: assigned.roleName };
    room.setPlayerModeMeta(p.id, 'Alliances', meta);
  });

  players.forEach((p) => {
    const meta = room.getPlayerModeMeta<PlayerAlliancesMeta>(p.id, 'Alliances');
    room.sendPrivate(p.id, startRoleReminder(meta));
  });
}
