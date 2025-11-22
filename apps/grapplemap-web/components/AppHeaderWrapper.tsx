'use client';

import { useSession, signOut } from 'next-auth/react';
import { AppHeader } from '@grapplemap/ui';

export default function AppHeaderWrapper() {
  const { data: session } = useSession();

  return (
    <AppHeader
      user={session?.user}
      onSignOut={() => signOut({ callbackUrl: '/auth/signin' })}
      showNetworkLinks={!!session}
    />
  );
}
