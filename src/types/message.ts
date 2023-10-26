export enum MessageType {
  embed = 'embed',
  embedWithUrl = 'embedWithUrl',
  image = 'image',
  none = 'none',
}

export enum MessageStatus {
  new = 'new',
  sent = 'sent',
  error = 'error',
}

export enum FieldType {
  message= 'message',
  reply= 'reply',
}

export type Field = {
  content: string;
  type: FieldType;
}

export type EmbedMessage = {
  author: string;
  authorIcon: string;
  image: string | null;
  fields: Field[];
}

export type EmbedWithUrlField = {
  name: string;
  value: string;
  inline: boolean;
}

export type EmbedWithUrlMessage = {
  title: string;
  url: string;
  thumbnail?: string;
  description?: string;
  fields: EmbedWithUrlField[];
}

export type ImageMessage = {
  image: string;
}
