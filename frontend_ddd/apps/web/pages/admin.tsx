import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function AdminRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/user-management');
  }, [router]);
  return null;
}
