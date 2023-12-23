export enum MessageType {
  common = "common",
  none = "none",
}

export enum MessageStatus {
  new = "new",
  sent = "sent",
  error = "error",
}

export enum FieldType {
  message = "message",
  reply = "reply",
}

export type Field = {
  content: string;
  type: FieldType;
};

export type Attachment = {
  url: string;
  proxy_url: string;
  filename: string;
};

export type CommonMessage = {
  content: string;
  attachments: Attachment[];
};

export type EmbedWithUrlField = {
  name: string;
  value: string;
  inline: boolean;
};

export type EmbedWithUrlMessage = {
  title: string;
  url: string;
  thumbnail?: string;
  description?: string;
  fields: EmbedWithUrlField[];
};

export type ImageMessage = {
  image: string;
};
