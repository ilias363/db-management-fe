import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/stores/auth-store';

export function useLogout() {
    const router = useRouter();
    const { logout: storeLogout } = useAuth();

    const logout = async () => {
        await storeLogout();
        router.push('/login');
    };

    return logout;
}
