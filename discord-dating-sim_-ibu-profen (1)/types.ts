
export enum GameStatus {
  START = 'START',
  PLAYING = 'PLAYING',
  WON = 'WON', // ご褒美フルコース
  WON_FRIEND = 'WON_FRIEND', // 最高の親友
  LOST_SOCIAL = 'LOST_SOCIAL',
  LOST_MENTAL = 'LOST_MENTAL'
}

export interface Choice {
  id: string;
  text: string;
  nextMessage: string;
  isBest?: boolean;
  isGood?: boolean;
  isBad?: boolean;
}

export interface Message {
  id: string;
  sender: 'profen' | 'user' | 'system';
  content: string;
  timestamp: string;
  image?: string;
  isError?: boolean;
}

export interface RoundData {
  id: number;
  profenPrompt: string;
  choices: Choice[];
  branchId?: '6A' | '6B';
}
