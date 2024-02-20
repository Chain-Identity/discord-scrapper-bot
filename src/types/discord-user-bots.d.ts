declare module "discord-user-bots" {
  import {
    APIChannel,
    APIMessage,
    APIGuild,
    APIMessageComponentInteraction,
    APIUser,
  } from "discord-api-types/v9";

  export class Client {
    constructor(token: string);
    on: {
      ready: () => void;
      message_create: (message: APIMessage) => void;
      reply: (message: APIMessage) => void;
    };

    public fetch_messages(
      limit: number,
      channel_id: string,
      offset?: string
    ): Promise<APIMessage[]>;

    public get_guild(guild_id: string): Promise<Guild>;

    public send(
      channel_id: string,
      data: APIMessageComponentInteraction
    ): Promise<void>;

    info: {
      v: number;
      user: APIUser;
      users: APIUser[];
      guilds: Guild[];
    };
  }

  export type Channel = APIChannel;

  export type Guild = APIGuild & {
    channels: Channel[];
  };
}
