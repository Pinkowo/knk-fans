"use client";

import { useRouter } from "next/navigation";

import MemberModal from "@/components/members/MemberModal";
import type { Member } from "@/types/member";

interface MemberModalRouteProps {
  member: Member;
}

export default function MemberModalRoute({ member }: MemberModalRouteProps) {
  const router = useRouter();

  return (
    <MemberModal
      member={member}
      onClose={() => {
        router.back();
      }}
    />
  );
}
