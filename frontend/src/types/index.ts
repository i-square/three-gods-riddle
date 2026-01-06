export interface User {
  id: string;
  is_admin: boolean;
  must_change_password: boolean;
  tutorial_completed: boolean;
  created_at: string;
}

export interface TokenResponse {
  access_token: string;
  token_type: string;
  must_change_password: boolean;
  is_admin: boolean;
}

export interface GameSession {
  session_id: number;
  message: string;
}

export interface AskResponse {
  answer: string;
  questions_left: number;
  history: MoveHistory[];
}

export interface MoveHistory {
  round: number;
  god_index: number;
  question: string;
  answer: string;
}

export interface GameResult {
  win: boolean;
  identities: string[];
  language_map: { Yes: string; No: string };
}

export interface GameHistoryItem {
  id: number;
  date: string;
  win: boolean;
  completed: boolean;
  questions_asked: number;
}

export interface GameDetail {
  id: number;
  date: string;
  win: boolean;
  completed: boolean;
  god_identities: string[];
  language_map: { Yes: string; No: string };
  move_history: MoveHistory[];
  user_guesses: string[] | null;
}

export interface AdminUser {
  id: string;
  is_admin: boolean;
  is_disabled: boolean;
  created_at: string;
  total_games: number;
  wins: number;
  win_rate: number;
}

export interface AdminStats {
  total_users: number;
  total_games: number;
  completed_games: number;
  total_wins: number;
  overall_win_rate: number;
}
