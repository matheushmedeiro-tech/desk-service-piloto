import { useAuth } from "@/lib/AuthContext";
import ITDashboard from "./ITDashboard";
import UserDashboard from "./UserDashboard";

export default function RouterGuard() {
  const { user } = useAuth();
  const isIT = user?.role === "admin" || user?.role === "it";
  return isIT ? <ITDashboard /> : <UserDashboard />;
}