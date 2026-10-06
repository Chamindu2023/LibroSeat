// Shared hook: returns the signed-in user's id.
// Until real login is wired up on the Login screen, this falls back to a
// fixed DEV_USER_ID so every other screen can be built and tested against
// real Supabase data right away.

import { useEffect, useState } from 'react';
import { supabase } from '../supabase/supabaseClient';

const DEV_USER_ID = 'dev-test-user'; // TODO: remove once real login is wired up

export function useCurrentUserId() {
  const [userId, setUserId] = useState(DEV_USER_ID);

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setUserId(data?.session?.user?.id ?? DEV_USER_ID);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUserId(session?.user?.id ?? DEV_USER_ID);
    });

    return () => listener.subscription.unsubscribe();
  }, []);

  return userId;
}