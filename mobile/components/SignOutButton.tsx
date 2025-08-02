import { useSignOut } from "@/hooks/useSignOut";
import { Feather } from "@expo/vector-icons";
import { TouchableOpacity, ActivityIndicator } from "react-native";

const SignOutButton = () => {
  const { handleSignOut, isSigningOut } = useSignOut();

  return (
    <TouchableOpacity onPress={handleSignOut} disabled={isSigningOut}>
      {isSigningOut ? (
        <ActivityIndicator size="small" color="#E0245E" />
      ) : (
        <Feather name="log-out" size={24} color={"#E0245E"} />
      )}
    </TouchableOpacity>
  );
};
export default SignOutButton;