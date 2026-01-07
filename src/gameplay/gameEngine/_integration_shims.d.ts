declare module '../game' {
  interface default {
    mode?: string; modeData?: any;
    getPlayers(): { id: string; name: string }[];
    getPlayerUsername(playerId: string): string;
    currentPlayerId(): string;
    getLastProposerId(): string;
    getCurrentMordredId(): string;
    setPlayerModeMeta(playerId: string, mode: string, meta: any): void;
    getPlayerModeMeta<T = any>(playerId: string, mode: string): T;
    submitMissionVote(playerId: string, payload: any): void;
    allMissionVotesIn(): boolean;
    getMissionVotes(): Record<string, any>;
    getCurrentMissionParticipants(): { id: string }[];
    prepareNextPickingTeam(): void;
    sendPrivate(playerId: string, text: string): void;
    sendPublic(text: string): void;
    logBanner(evt: any): void;
    showGlobalWait(text: string, opts?: { except?: string }): void;
    swapRoleLabels(a: string, b: string): void;
    enterAssassinationPhaseForAlliances(): void;
    finishGameWithOppositionVictory(): void;
    finishWithWinnerLabel(label: string): void;
    wasLastMissionReplay?(): boolean;
  }
}