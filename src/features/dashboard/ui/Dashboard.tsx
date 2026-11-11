import { View } from "react-native";
import DashboardHeader from "./components/Header/Header";
import DashboardMain from "./components/Main/Main";

export default function Dashboard() {
  return (
    <View>
      <DashboardHeader />
      <DashboardMain />
    </View>
  );
}
