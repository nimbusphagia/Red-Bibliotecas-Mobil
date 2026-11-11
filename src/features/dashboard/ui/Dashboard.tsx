import { View } from "react-native";
import DashboardHeader from "./components/header/Header";
import DashboardMain from "./components/main/Main";

export default function Dashboard() {
  return (
    <View>
      <DashboardHeader />
      <DashboardMain />
    </View>
  );
}
