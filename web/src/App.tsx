import { AuthProvider } from "./contexts/AuthContext";
import { CallsProvider } from "./contexts/CallsContext";
import { Routes } from "./routes";

export function App() {
  return (
    <AuthProvider>
      <CallsProvider>
        <Routes />
      </CallsProvider>
    </AuthProvider>
  );
}
