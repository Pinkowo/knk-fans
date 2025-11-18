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
  links?: Array<{
    label: string;
    url: string;
  }>;
}
