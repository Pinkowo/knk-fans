export type MemberStatus = "current" | "former";

export interface Member {
  id: string;
  name: string;
  status: MemberStatus;
  bio: string;
  position?: string;
  debutDate?: string;
  photo?: string;
  cover?: string;
  birthday?: string;
  age?: string;
  zodiac?: string;
  bloodType?: string;
  mbti?: string;
  height?: string;
  representativeAnimal?: string;
  favoriteFood?: string;
  dislikedFood?: string;
  alcoholTolerance?: string;
  hobbies?: string;
  specialSkills?: string;
  soloActivities?: string;
  joinDate?: string;
  leaveDate?: string;
  links?: Array<{
    label: string;
    url: string;
  }>;
}
