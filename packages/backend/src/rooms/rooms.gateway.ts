import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
} from '@nestjs/websockets';
import { Logger } from '@nestjs/common';
import { Server } from 'socket.io';
import { transformAndValidate } from '@proavalon/proto';
import {
  LobbySocketEvents,
  ChatResponse,
  ChatResponseType,
  ChatRequest,
} from '@proavalon/proto/lobby';
import {
  CreateRoomDto,
  RoomSocketEvents,
  GameIdDto,
} from '@proavalon/proto/room';

import { RoomsService } from './rooms.service';
import { SocketUser } from '../users/users.socket';
import { CommandsService } from '../commands/commands.service';

@WebSocketGateway()
export class RoomsGateway {
  @WebSocketServer() server!: Server;

  private readonly logger = new Logger(RoomsGateway.name);

  constructor(
    private roomsService: RoomsService,
    private commandsService: CommandsService,
  ) {}

  getSocketGameId = (socket: SocketUser) => {
    // Get the user's possible game rooms
    const gameRooms = Object.keys(socket.rooms).filter((room) =>
      room.includes('game'),
    );

    // If they have no rooms, check for their last roomId
    if (gameRooms.length === 0) {
      if (!socket.lastRoomId) {
        this.logger.warn(
          `${socket.user.displayUsername} does not have a single joined game. They are currently in: ${gameRooms}`,
        );
        return {
          roomKey: '-1',
          gameId: -1,
        };
      }

      return {
        roomKey: `game:${socket.lastRoomId}`,
        gameId: socket.lastRoomId,
      };
    }

    // If they have one joined socket room
    if (gameRooms.length === 1) {
      // socket.io-redis room name: 'game:<id>'
      const roomKey = gameRooms[0];
      const gameId = parseInt(roomKey.replace('game:', ''), 10);

      return {
        roomKey,
        gameId,
      };
    }

    // If we reach here then theres not much we can do.
    this.logger.warn(
      `${socket.user.displayUsername} does not have a single joined game. They are currently in: ${gameRooms}`,
    );
    return {
      roomKey: '-1',
      gameId: -1,
    };
  };

  async passRoomEvent(
    socket: SocketUser,
    event: RoomSocketEvents,
    gameId?: number,
  ) {
    if (!gameId) {
      gameId = this.getSocketGameId(socket).gameId; // eslint-disable-line
    }

    this.logger.log(
      `User ${socket.user.displayUsername} in room ${gameId} has sent event ${event}`,
    );

    if (gameId === -1) {
      const msg: ChatResponse = {
        text: 'You are not in a room!',
        username: '',
        timestamp: new Date(),
        type: ChatResponseType.ERROR,
      };
      socket.emit(LobbySocketEvents.ALL_CHAT_TO_CLIENT, msg);
      return false;
    }

    await this.roomsService.roomEvent(socket, gameId, event);

    return true;
  }

  @SubscribeMessage(RoomSocketEvents.ROOM_CHAT_TO_SERVER)
  async handleGameChat(socket: SocketUser, chatRequest: ChatRequest) {
    if (chatRequest.text) {
      // Commands
      if (chatRequest.text[0] === '/') {
        this.commandsService.runCommand(chatRequest.text, socket);
        return undefined;
      }

      const { roomKey, gameId } = this.getSocketGameId(socket);

      // Chat message
      this.logger.log(
        `Game ${gameId} chat message: ${socket.user.username}: ${chatRequest.text} `,
      );

      try {
        const chatResponse = await transformAndValidate(ChatResponse, {
          text: chatRequest.text,
          username: socket.user.displayUsername,
          timestamp: new Date(),
          type: ChatResponseType.CHAT,
        });

        this.roomsService.storeChat(gameId, chatResponse);

        this.server
          .to(roomKey)
          .emit(RoomSocketEvents.ROOM_CHAT_TO_CLIENT, chatResponse);
      } catch (err) {
        this.logger.error('Validation failed. Error: ', err);
      }
    }
    return undefined;
  }

  @SubscribeMessage(RoomSocketEvents.CREATE_ROOM)
  async handleCreateGame(socket: SocketUser, data: CreateRoomDto) {
    this.logger.log('Received create game request');

    const newGameId = await this.roomsService.createGame(socket, data);

    const msg = await transformAndValidate(ChatResponse, {
      text: `${socket.user.displayUsername} has created room ${newGameId}!`,
      username: socket.user.displayUsername,
      timestamp: new Date(),
      type: ChatResponseType.CREATE_GAME,
    });

    this.server.to('lobby').emit(LobbySocketEvents.ALL_CHAT_TO_CLIENT, msg);

    return newGameId;
  }

  @SubscribeMessage(RoomSocketEvents.JOIN_ROOM)
  async handleJoinGame(socket: SocketUser, joinGame: GameIdDto) {
    if (joinGame.id && (await this.roomsService.hasGame(joinGame.id))) {
      // Join the socket io room
      socket.join(`game:${joinGame.id}`);

      // Set last room ID
      socket.lastRoomId = joinGame.id; // eslint-disable-line

      // Join the user to the game
      await this.roomsService.roomEvent(
        socket,
        joinGame.id,
        RoomSocketEvents.JOIN_ROOM,
      );

      this.logger.log(
        `${socket.user.displayUsername} has joined game ${joinGame.id}.`,
      );

      // Send message to users
      const joinMessage = await transformAndValidate(ChatResponse, {
        text: `${socket.user.displayUsername} has joined the room.`,
        username: socket.user.displayUsername,
        timestamp: new Date(),
        type: ChatResponseType.PLAYER_JOIN_GAME,
      });

      this.server
        .to(`game:${joinGame.id}`)
        .emit(RoomSocketEvents.ROOM_CHAT_TO_CLIENT, joinMessage);

      return 'OK';
    }
    return `Game ${joinGame.id} not found.`;
  }

  @SubscribeMessage(RoomSocketEvents.LEAVE_ROOM)
  async handleLeaveGame(socket: SocketUser) {
    const { gameId } = this.getSocketGameId(socket);

    if (this.passRoomEvent(socket, RoomSocketEvents.LEAVE_ROOM, gameId)) {
      // Leave the socket io room
      socket.leave(`game:${gameId}`);

      // Send message to users
      const chatResponse = await transformAndValidate(ChatResponse, {
        text: `${socket.user.displayUsername} has left the room.`,
        username: socket.user.displayUsername,
        timestamp: new Date(),
        type: ChatResponseType.PLAYER_LEAVE_GAME,
      });

      this.roomsService.storeChat(gameId, chatResponse);

      this.server
        .to(`game:${gameId}`)
        .emit(RoomSocketEvents.ROOM_CHAT_TO_CLIENT, chatResponse);

      return 'OK';
    }

    return 'ERROR (user is likely not in a room)';
  }

  @SubscribeMessage(RoomSocketEvents.SIT_DOWN)
  async handleSitDown(socket: SocketUser) {
    if (this.passRoomEvent(socket, RoomSocketEvents.SIT_DOWN)) {
      return 'OK';
    }

    return 'ERROR (user is likely not in a room)';
  }

  @SubscribeMessage(RoomSocketEvents.STAND_UP)
  async handleStandUp(socket: SocketUser) {
    if (this.passRoomEvent(socket, RoomSocketEvents.STAND_UP)) {
      return 'OK';
    }

    return 'ERROR (user is likely not in a room)';
  }

  // TODO move this to games.gateway.ts later
  @SubscribeMessage(RoomSocketEvents.START_GAME)
  async handleStartGame(socket: SocketUser) {
    if (this.passRoomEvent(socket, RoomSocketEvents.START_GAME)) {
      return 'OK';
    }

    return 'ERROR (user is likely not in a room)';
  }
}
