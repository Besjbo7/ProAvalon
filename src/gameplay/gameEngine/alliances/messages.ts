// Central store of all private/public messages & prompts for Alliances.

import { AlliancesRoleName, TriFaction, AlliancePair } from './types';

export function startRoleReminder(roleName: AlliancesRoleName): string {
  switch (roleName) {
    case AlliancesRoleName.Merlin:
      return "You are a Disciple of Merlin! Your role is Merlin. You know the faction of every player.";
    case AlliancesRoleName.Disciple:
      return "You are a Disciple of Merlin! Your role is Disciple of Merlin.";
    case AlliancesRoleName.Arthur:
      return "You are a Servant of Arthur! Your role is Arthur. You know who your loyal servants are.";
    case AlliancesRoleName.Tristan:
      return "You are a Servant of Arthur! Your role is Tristan. You know who your loyal Isolde is.";
    case AlliancesRoleName.Isolde:
      return "You are a Servant of Arthur! Your role is Isolde. You know who your loyal Tristan is.";
    case AlliancesRoleName.Mordred:
      return "You are a Minion of Mordred! Your role is Mordred. When the Alliance is formed, you may switch roles with Morgana or Oberon.";
    case AlliancesRoleName.Morgana:
      return "You are a Minion of Mordred! Your role is Morgana. Once when selecting a Mission, you may reveal your role to skip the vote.";
    case AlliancesRoleName.Oberon:
      return "You are a Minion of Mordred! Your role is Oberon. Once per game, you may sabotage a Mission with another faction's card.";
  }
}

export function fightDenyMessage(roleName: AlliancesRoleName, tired: boolean, glamerUsed: boolean): string {
  if (tired) return "You fought during the last mission! You are too tired to fight today!";
  switch (roleName) {
    case AlliancesRoleName.Merlin:
    case AlliancesRoleName.Disciple:
      return "You are a Disciple of Merlin! Surely you do not wish to fight for another!";
    case AlliancesRoleName.Arthur:
    case AlliancesRoleName.Tristan:
    case AlliancesRoleName.Isolde:
      return "You are a Servant of Arthur! Surely you do not wish to fight for another!";
    case AlliancesRoleName.Mordred:
    case AlliancesRoleName.Morgana:
    case AlliancesRoleName.Oberon:
      if (glamerUsed) return "You have already used Glamer! You must cooperate or fight for Mordred!";
      return "You are a Minion of Mordred! Surely you do not wish to fight for another!";
  }
}

export function oberonConfirm(): string {
  return "Oberon, are you sure you want to use Glamer and fight for another faction? You may only do this once.";
}

export function morganaConfirm(): string {
  return "Morgana, are you sure you want to use Bewitch to automatically approve your proposal? This will reveal your character to everyone.";
}

export function preAllianceMissionIntro(size: number, replay: boolean): string {
  if (!replay) {
    if (size === 2) return "The Lady of the Lake beckons! Two players must go on a Mission to win her favor.";
    if (size === 3) return "The Round Table lies empty! Three players must go on a Mission to claim a seat.";
    if (size === 4) return "Excalibur rests unclaimed! Four players must go on a Mission to prove themselves worthy.";
    if (size === 5) return "Seek the Holy Grail, cries the Lady! Five players must go on a Mission to win the Grail, and with it the Kingdom.";
  } else {
    if (size === 2) return "The Lady of the Lake remains unmoved! Two players must go on a Mission to win her favor.";
    if (size === 3) return "The Round Table remains divided! Three players must go a Mission to claim a seat.";
    if (size === 4) return "You have been measured, and found wanting! Four players must go on a Mission to prove themselves worthy.";
    if (size === 5) return "The Grail eludes discovery! Five players must go on a Mission to win the Grail, and with it the Kingdom.";
  }
  return "";
}

export function preAllianceMissionResults(size: number, arthur: number, merlin: number, mordred: number): string {
  const name = size===2?"Lady of the Lake": size===3?"Round Table": size===4?"Excalibur":"Holy Grail";
  return `${name} Mission Results: ${arthur} fight for Arthur, ${merlin} fight for Merlin, ${mordred} fight for Mordred.`;
}

export function factionFirstWin(size: number, factionName: string): string {
  if (size===2) return `The Lady of the Lake bestows her favor on the ${factionName}! ${factionName} is now influential.`;
  if (size===3) return `The Round Table is dominated by the ${factionName}! ${factionName} is now influential.`;
  if (size===4) return `Excalibur gleams in the worthy hands of the ${factionName}! ${factionName} is now influential.`;
  return "";
}

export function factionSecondWin(size: number, leaderName: string, factionName: string): string {
  if (size===3) return `The Round Table is dominated by the ${factionName}! ${leaderName} has seized the crown and reigns over Avalon. They lack the numbers to reign alone, and must now choose an ally.`;
  if (size===4) return `Excalibur gleams in the worthy hands of the ${factionName}! ${leaderName} has seized the crown and reigns over Avalon. They lack the numbers to reign alone, and must now choose an ally.`;
  if (size===5) return `Avalon bows as the Holy Grail cements the authority of the ${factionName}! ${leaderName} has seized the crown and reigns over Avalon. They lack the numbers to reign alone, and must now choose an ally.`;
  return "";
}

export function allianceFormation(pair: AlliancePair): string {
  switch (pair) {
    case AlliancePair.AlliedCamelot:
      return "The realm must come first. Arthur and Merlin resolve their squabbles, and Allied Camelot rises again to crush the Minions of Mordred!";
    case AlliancePair.AlliedKnighthood:
      return "Magic has become too great a threat. Mordred and Arthur pause their long feud, and Allied Knighthood rides with horse and sword to stamp out the Disciples of Merlin!";
    case AlliancePair.AlliedArcana:
      return "The age of kings is ended. Merlin and Mordred meet quietly to seal their pact, and Allied Arcana prophesies the fall of the Servants of Arthur!";
  }
}

export function postAllianceMissionIntro(size: number, allianceName: string): string {
  if (size===4) return `The Alliance must secure the treasury! Four players must go on a Mission for the glory of ${allianceName}.`;
  if (size===6) return `The Alliance must rally the masses! Six players must go on a Mission for the glory of ${allianceName}.`;
  if (size===5) return `The Alliance must execute the traitors now, or all is lost! Five players must go on a Mission for the glory of ${allianceName}.`;
  return "";
}

export function postAllianceMissionResult(size: number, succeeded: boolean, fails: number): string {
  const name = size===4?"Secure the Treasury": size===6?"Rally the Masses":"Execute the Traitors";
  if (succeeded) {
    if (size===6 && fails===1) return `${name} succeeded with 1 fail.`;
    return `${name} succeeded.`;
  }
  return `${name} failed with ${fails} fails.`;
}

export function postAllianceOutcome(size: number, success: boolean, prevSuccess?: boolean): string {
  if (size===4) return success?"The wealth of the crown is yours! Win the hearts of the people, and your enemies stand no chance.":"The treasures of the realm vanish from under your noses! Win the hearts of the people, before your enemies buy their loyalty.";
  if (size===6) {
    if (success && !prevSuccess) return "Your faithful subjects answer the call! The kingdom stands on the brink of war.";
    if (!success && prevSuccess) return "Riots spread across the land! The kingdom stands on the brink of war.";
  }
  return "";
}

export function postAllianceCollapse(allianceName: string, factionName: string): string {
  return `${allianceName} has collapsed! The ${factionName} have won.`;
}

export function assassinationStart(allianceName: string, oppositionFaction: string, leaderName: string): string {
  return `${allianceName} triumphs, and condemns the ${oppositionFaction} to death! The only hope for ${leaderName} is assassination.`;
}

export function assassinationResult(correct: boolean, assassinName: string, targetName: string, targetLeader: string, factionName: string, allianceName: string): string {
  if (correct) return `${assassinName} has assassinated ${targetName}! The Alliance crumbles into endless recrimination. The ${factionName} have won.`;
  return `${assassinName} has assassinated ${targetName}! ${targetLeader} is unharmed, and executes the rebels on the spot. The ${allianceName} have won.`;
}

// =============================================
// V2 ADD-ON: Flavor & Reminder Text Layer + Phase Wiring
// =============================================
// Drop these files in and prefer the V2 versions of phases/mode where duplicates exist.

// =============================================
// FILE: src/gameplay/gameEngine/alliances/messages.ts
// =============================================
import { AlliancesRoleName, AlliancePair, TriFaction, PlayerAlliancesMeta } from './types';
import { factionDisplayName, alliancePairDisplayName } from './types';

// --- Start-of-game reminders ---
export function startRoleReminder(meta: PlayerAlliancesMeta): string {
  switch (meta.roleName) {
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

// --- Mission names (pre- and post-alliance) ---
export function preMissionName(size: number): 'Lady of the Lake'|'Round Table'|'Excalibur'|'Holy Grail' {
  if (size === 2) return 'Lady of the Lake';
  if (size === 3) return 'Round Table';
  if (size === 4) return 'Excalibur';
  return 'Holy Grail';
}

export function postMissionName(index: number): 'Secure the Treasury'|'Rally the Masses'|'Execute the Traitors' {
  return index === 0 ? 'Secure the Treasury' : index === 1 ? 'Rally the Masses' : 'Execute the Traitors';
}

// --- Pre-alliance mission intros ---
export function preMissionIntro(size: number, replay: boolean): string {
  if (!replay) {
    switch (size) {
      case 2: return 'The Lady of the Lake beckons! Two players must go on a Mission to win her favor.';
      case 3: return 'The Round Table lies empty! Three players must go on a Mission to claim a seat.';
      case 4: return 'Excalibur rests unclaimed! Four players must go on a Mission to prove themselves worthy.';
      case 5: return 'Seek the Holy Grail, cries the Lady! Five players must go on a Mission to win the Grail, and with it the Kingdom.';
    }
  } else {
    switch (size) {
      case 2: return 'The Lady of the Lake remains unmoved! Two players must go on a Mission to win her favor.';
      case 3: return 'The Round Table remains divided! Three players must go a Mission to claim a seat.';
      case 4: return 'You have been measured, and found wanting! Four players must go on a Mission to prove themselves worthy.';
      case 5: return 'The Grail eludes discovery! Five players must go on a Mission to win the Grail, and with it the Kingdom.';
    }
  }
  return '';
}

// --- Pre-alliance mission results (fight counts) ---
export function preMissionResults(size: number, counts: { Arthur: number; Merlin: number; Mordred: number }): string {
  const name = preMissionName(size);
  return `${name} Mission Results: ${counts.Arthur} fight for Arthur, ${counts.Merlin} fight for Merlin, ${counts.Mordred} fight for Mordred.`;
}

// --- First/second win banners ---
export function firstWinBanner(size: number, faction: TriFaction): string {
  const F = factionDisplayName(faction);
  switch (size) {
    case 2: return `The Lady of the Lake bestows her favor on the ${F}! ${F} is now influential.`;
    case 3: return `The Round Table is dominated by the ${F}! ${F} is now influential.`;
    case 4: return `Excalibur gleams in the worthy hands of the ${F}! ${F} is now influential.`;
    default: return '';
  }
}

export function secondWinBanner(size: number, faction: TriFaction): string {
  const F = factionDisplayName(faction);
  const leader = faction === TriFaction.Arthur ? 'Arthur' : faction === TriFaction.Merlin ? 'Merlin' : 'Mordred';
  switch (size) {
    case 3:
      return `The Round Table is dominated by the ${F}! ${leader} has seized the crown and reigns over Avalon. They lack the numbers to reign alone, and must now choose an ally.`;
    case 4:
      return `Excalibur gleams in the worthy hands of the ${F}! ${leader} has seized the crown and reigns over Avalon. They lack the numbers to reign alone, and must now choose an ally.`;
    case 5:
      return `Avalon bows as the Holy Grail cements the authority of the ${F}! ${leader} has seized the crown and reigns over Avalon. They lack the numbers to reign alone, and must now choose an ally.`;
    default: return '';
  }
}

// --- Alliance formed banners ---
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

// --- Mordred Disguise prompts ---
export function waitForMordredText(): string { return 'Waiting for Mordred to decide how to use Disguise...'; }
export function mordredDisguisePrompt(): string { return 'Choose one of the Minions of Mordred to switch roles with you and learn their teammates'; }
export function mordredAwakensPM(): string { return 'Your mask crumbles away, and you remember your true identity as Mordred! You know who your Minions are.'; }

// --- Post-alliance mission intros & outcomes ---
export function postMissionIntro(index: number, pair: AlliancePair): string {
  const A = alliancePairDisplayName(pair);
  switch (index) {
    case 0: return `The Alliance must secure the treasury! Four players must go on a Mission for the glory of ${A}.`;
    case 1: return `The Alliance must rally the masses! Six players must go on a Mission for the glory of ${A}.`;
    case 2: return `The Alliance must execute the traitors now, or all is lost! Five players must go on a Mission for the glory of ${A}.`;
  }
}

export function postMissionResultLine(index: number, succeeded: boolean, fails: number): string {
  const name = postMissionName(index);
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
export function postOutcomeTwoSuccesses(pair: AlliancePair, opposition: TriFaction, leaderName: 'Arthur'|'Merlin'|'Mordred'): string {
  return `${alliancePairDisplayName(pair)} triumphs, and condemns the ${factionDisplayName(opposition)} to death! The only hope for ${leaderName} is assassination.`;
}

// --- Validation / popups ---
export function denyWrongFaction(meta: PlayerAlliancesMeta): string {
  switch (meta.triFaction) {
    case TriFaction.Merlin: return 'You are a Disciple of Merlin! Surely you do not wish to fight for another!';
    case TriFaction.Arthur: return 'You are a Servant of Arthur! Surely you do not wish to fight for another!';
    case TriFaction.Mordred: return 'You are a Minion of Mordred! Surely you do not wish to fight for another!';
  }
}
export function denyTired(): string { return 'You fought during the last mission! You are too tired to fight today!'; }

// Oberon special
export function oberonConfirm(): string { return 'Oberon, are you sure you want to use Glamer and fight for another faction? You may only do this once.'; }
export const OBERON_CONFIRM_BUTTONS = { confirm: 'Use Glamer', back: 'Go Back' } as const;
export function oberonAlreadyUsed(): string { return 'You have already used Glamer! You must cooperate or fight for Mordred!'; }

// Morgana special
export const MORGANA_CHOICE_BUTTONS = { ok: 'OK', bewitch: 'Bewitch' } as const;
export function morganaConfirm(): string { return 'Morgana, are you sure you want to use Bewitch to automatically approve your proposal? This will reveal your character to everyone.'; }
export const MORGANA_CONFIRM_BUTTONS = { bewitch: 'Bewitch', back: 'Go Back' } as const;
export function morganaPublicReveal(username: string): string { return `${username} is Morgana! You are bewitched into approving this proposal.`; }

// Post-alliance fail-prevent for allied members
export function denyAllianceFail(): string { return 'You are in the Alliance! Surely you want to succeed!'; }

// Assassination phase prompts
export function waitingForLeader(username: string): string { return `Waiting for ${username} to assassinate...`; }
export function assassinationPickConfirm(leaderName: 'Arthur'|'Merlin'|'Mordred'): string { return `Are you sure you want to assassinate ${leaderName}? This decision cannot be changed.`; }
export function assassinationSuccess(killerUser: string, targetUser: string, faction: TriFaction): string { return `${killerUser} has assassinated ${targetUser}! The Alliance crumbles into endless recrimination. The ${factionDisplayName(faction)} have won.`; }
export function assassinationFail(killerUser: string, targetUser: string, pair: AlliancePair, targetLeader: 'Arthur'|'Merlin'|'Mordred'): string { return `${killerUser} has assassinated ${targetUser}! ${targetLeader} is unharmed, and executes the rebels on the spot. The ${alliancePairDisplayName(pair)} have won.`; }
