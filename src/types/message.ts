export enum MessageType {
  embed = 'embed',
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

export type ImageMessage = {
  image: string;
}
