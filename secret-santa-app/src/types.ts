export type Participant = {
  id: number;
  name: string;  
};

export type ParticipantIn = {
  name: string;
};

export type Exclusion = [number, number];

export type NameExclusion = [string, string];

export type Event = {
  id: string;
  name: string;
  code: string;
  participants: Participant[];
};

export type EventCreate = {
  name: string;
  participants: { name: string; excluded: string }[];
};

export type RevealResponse = {
  giftee: string;
};