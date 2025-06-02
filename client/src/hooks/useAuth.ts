import { useQuery } from '@tanstack/react-query';
import { User } from '@shared/schema';

export function useAuth() {
  const { data: user } = useQuery<User>({
    queryKey: ['/api/student/profile'],
  });

  return {
    user,
    isAuthenticated: !!user,
  };
} 