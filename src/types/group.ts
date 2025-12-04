export interface GroupAchievement {
  title: string;
  description: string;
}

export interface GroupInfo {
  id: string;
  name: string;
  debutDate?: string;
  description?: string;
  achievements?: GroupAchievement[];
  membersCount?: number;
  cover?: string;
}
