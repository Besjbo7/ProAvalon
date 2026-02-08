import { AlliancesRoleName, TriFaction, AlliancePair, factionDisplayName, alliancePairDisplayName, PlayerAlliancesMeta } from './types';

// --- Start-of-game reminders ---
export function startRoleReminder(roleName: AlliancesRoleName): string {
  switch (roleName) {
    case AlliancesRoleName.Merlin:
      return 'You are a Disciple of Merlin! Your role is Merlin. You know the faction of every player.';
    case AlliancesRoleName.Disciple:
      return 'You are a Disciple of Merlin! Your role is Disciple of Merlin.';
    case AlliancesRoleName.Arthur:
      return 'You are a Servant of Arthur! Your role is Arthur. You know who your loyal servants are.';
    case AlliancesRoleName.Tristan:
      return 'You are a Servant of Arthur! Your role is Tristan. You know who your loyal Isolde is.';
    case AlliancesRoleName.Isolde:
      return 'You are a Servant of Arthur! Your role is Isolde. You know who your loyal Tristan is.';
    case AlliancesRoleName.Mordred:
      return 'You are a Minion of Mordred! Your role is Mordred. When the Alliance is formed, you may switch roles with Morgana or Oberon.';
    case AlliancesRoleName.Morgana:
      return 'You are a Minion of Mordred! Your role is Morgana. Once when selecting a Mission, you may reveal your role to skip the vote.';
    case AlliancesRoleName.Oberon:
      return "You are a Minion of Mordred! Your role is Oberon. Once per game, you may sabotage a Mission with another faction's card.";
  }
}

// --- Deny messages ---
export function fightDenyMessage(roleName: AlliancesRoleName, tired: boolean, glamerUsed: boolean): string {
  if (tired) return 'You fought during the last mission! You are too tired to fight today!';
  switch (roleName) {
    case AlliancesRoleName.Merlin:
    case AlliancesRoleName.Disciple:
      return 'You are a Disciple of Merlin! Surely you do not wish to fight for another!';
    case AlliancesRoleName.Arthur:
    case AlliancesRoleName.Tristan:
    case AlliancesRoleName.Isolde:
      return 'You are a Servant of Arthur! Surely you do not wish to fight for another!';
    case AlliancesRoleName.Mordred:
    case AlliancesRoleName.Morgana:
    case AlliancesRoleName.Oberon:
      if (glamerUsed) return 'You have already used Glamer! You must cooperate or fight for Mordred!';
      return 'You are a Minion of Mordred! Surely you do not wish to fight for another!';
  }
}

export function oberonConfirm(): string {
  return 'Oberon, are you sure you want to use Glamer and fight for another faction? You may only do this once.';
}

export function morganaConfirm(): string {
  return 'Morgana, are you sure you want to use Bewitch to automatically approve your proposal? This will reveal your character to everyone.';
}

// --- Pre-alliance intros/results ---
export function preMissionIntro(size: number, replay: boolean): string {
  if (!replay) {
    if (size === 2) return 'The Lady of the Lake beckons! Two players must go on a Mission to win her favor.';
    if (size === 3) return 'The Round Table lies empty! Three players must go on a Mission to claim a seat.';
    if (size === 4) return 'Excalibur rests unclaimed! Four players must go on a Mission to prove themselves worthy.';
    if (size === 5) return 'Seek the Holy Grail, cries the Lady! Five players must go on a Mission to win the Grail, and with it the Kingdom.';
  } else {
    if (size === 2) return 'The Lady of the Lake remains unmoved! Two players must go on a Mission to win her favor.';
    if (size === 3) return 'The Round Table remains divided! Three players must go a Mission to claim a seat.';
    if (size === 4) return 'You have been measured, and found wanting! Four players must go on a Mission to prove themselves worthy.';
    if (size === 5) return 'The Grail eludes discovery! Five players must go on a Mission to win the Grail, and with it the Kingdom.';
  }
  return '';
}

export function preAllianceMissionResults(size: number, arthur: number, merlin: number, mordred: number): string {
  const name = size === 2 ? 'Lady of the Lake' : size === 3 ? 'Round Table' : size === 4 ? 'Excalibur' : 'Holy Grail';
  return `${name} Mission Results: ${arthur} fight for Arthur, ${merlin} fight for Merlin, ${mordred} fight for Mordred.`;
}

export function factionFirstWin(size: number, factionName: string): string {
  if (size === 2) return `The Lady of the Lake bestows her favor on the ${factionName}! ${factionName} is now influential.`;
  if (size === 3) return `The Round Table is dominated by the ${factionName}! ${factionName} is now influential.`;
  if (size === 4) return `Excalibur gleams in the worthy hands of the ${factionName}! ${factionName} is now influential.`;
  return '';
}

export function factionSecondWin(size: number, leaderName: string, factionName: string): string {
  if (size === 3) return `The Round Table is dominated by the ${factionName}! ${leaderName} has seized the crown and reigns over Avalon. They lack the numbers to reign alone, and must now choose an ally.`;
  if (size === 4) return `Excalibur gleams in the worthy hands of the ${factionName}! ${leaderName} has seized the crown and reigns over Avalon. They lack the numbers to reign alone, and must now choose an ally.`;
  if (size === 5) return `Avalon bows as the Holy Grail cements the authority of the ${factionName}! ${leaderName} has seized the crown and reigns over Avalon. They lack the numbers to reign alone, and must now choose an ally.`;
  return '';
}

export function allianceFormedBanner(pair: AlliancePair): string {
  switch (pair) {
    case AlliancePair.AlliedCamelot:
      return 'The realm must come first. Arthur and Merlin resolve their squabbles, and Allied Camelot rises again to crush the Minions of Mordred!';
    case AlliancePair.AlliedKnighthood:
      return 'Magic has become too great a threat. Mordred and Arthur pause their long feud, and Allied Knighthood rides with horse and sword to stamp out the Disciples of Merlin!';
    case AlliancePair.AlliedArcana:
      return 'The age of kings is ended. Merlin and Mordred meet quietly to seal their pact, and Allied Arcana prophesies the fall of the Servants of Arthur!';
  }
}

// --- Mordred-disguise banners (used by some stubs) ---
export function waitForMordredText(): string {
  return 'Waiting for Mordred to decide how to use Disguise...';
}
export function mordredDisguisePrompt(): string {
  return 'Choose one of the Minions of Mordred to switch roles with you and learn their teammates';
}
export function mordredAwakensPM(): string {
  return 'Your mask crumbles away, and you remember your true identity as Mordred! You know who your Minions are.';
}

// --- Post-alliance mission intro (used by some stubs) ---
export function postMissionIntro(size: number, allianceName: string): string {
  if (size === 4) return `The Alliance must secure the treasury! Four players must go on a Mission for the glory of ${allianceName}.`;
  if (size === 6) return `The Alliance must rally the masses! Six players must go on a Mission for the glory of ${allianceName}.`;
  if (size === 5) return `The Alliance must execute the traitors now, or all is lost! Five players must go on a Mission for the glory of ${allianceName}.`;
  return '';
}

// ===== Extra exports to satisfy phase imports (stubs / future wiring) =====

// V2-style aliases expected by some phase stubs
export function preMissionResults(size: number, counts: { Arthur: number; Merlin: number; Mordred: number }): string {
  const name = size === 2 ? 'Lady of the Lake' : size === 3 ? 'Round Table' : size === 4 ? 'Excalibur' : 'Holy Grail';
  return `${name} Mission Results: ${counts.Arthur} fight for Arthur, ${counts.Merlin} fight for Merlin, ${counts.Mordred} fight for Mordred.`;
}

export function firstWinBanner(size: number, faction: TriFaction): string {
  // Keep it simple for now; can be made fancier later.
  const F = factionDisplayName(faction);
  if (size === 2) return `The Lady of the Lake bestows her favor on the ${F}! ${F} is now influential.`;
  if (size === 3) return `The Round Table is dominated by the ${F}! ${F} is now influential.`;
  if (size === 4) return `Excalibur gleams in the worthy hands of the ${F}! ${F} is now influential.`;
  return '';
}

export function secondWinBanner(size: number, faction: TriFaction): string {
  const F = factionDisplayName(faction);
  const leader = faction === TriFaction.Arthur ? 'Arthur' : faction === TriFaction.Merlin ? 'Merlin' : 'Mordred';
  if (size === 3) return `The Round Table is dominated by the ${F}! ${leader} has seized the crown and reigns over Avalon. They lack the numbers to reign alone, and must now choose an ally.`;
  if (size === 4) return `Excalibur gleams in the worthy hands of the ${F}! ${leader} has seized the crown and reigns over Avalon. They lack the numbers to reign alone, and must now choose an ally.`;
  if (size === 5) return `Avalon bows as the Holy Grail cements the authority of the ${F}! ${leader} has seized the crown and reigns over Avalon. They lack the numbers to reign alone, and must now choose an ally.`;
  return '';
}

// Post-alliance mission name helpers (index-based)
function _postMissionName(index: number): 'Secure the Treasury' | 'Rally the Masses' | 'Execute the Traitors' {
  return index === 0 ? 'Secure the Treasury' : index === 1 ? 'Rally the Masses' : 'Execute the Traitors';
}

export function postMissionResultLine(index: number, succeeded: boolean, fails: number): string {
  const name = _postMissionName(index);
  if (succeeded) {
    if (index === 1 && fails === 1) return `${name} succeeded with 1 fail.`;
    return `${name} succeeded.`;
  }
  return `${name} failed with ${fails} fails.`;
}

export function postMissionBanner(index: number, succeeded: boolean, priorIndexSucceeded?: boolean): string {
  if (index === 0) {
    return succeeded
      ? 'The wealth of the crown is yours! Win the hearts of the people, and your enemies stand no chance.'
      : 'The treasures of the realm vanish from under your noses! Win the hearts of the people, before your enemies buy their loyalty.';
  }
  if (index === 1) {
    if (succeeded && priorIndexSucceeded === false) return 'Your faithful subjects answer the call! The kingdom stands on the brink of war.';
    if (!succeeded && priorIndexSucceeded === true) return 'Riots spread across the land! The kingdom stands on the brink of war.';
  }
  return '';
}

export function postOutcomeTwoFails(pair: AlliancePair, opposition: TriFaction): string {
  return `${alliancePairDisplayName(pair)} has collapsed! The ${factionDisplayName(opposition)} have won.`;
}

export function postOutcomeTwoSuccesses(pair: AlliancePair, opposition: TriFaction, leaderName: 'Arthur' | 'Merlin' | 'Mordred'): string {
  return `${alliancePairDisplayName(pair)} triumphs, and condemns the ${factionDisplayName(opposition)} to death! The only hope for ${leaderName} is assassination.`;
}

