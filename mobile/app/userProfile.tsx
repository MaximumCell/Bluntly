import { useLocalSearchParams } from 'expo-router';
import UserProfile from '@/components/userProfile';

export default function UserProfileScreen() {
    const { username } = useLocalSearchParams();

    return <UserProfile username={username as string} />;
}
