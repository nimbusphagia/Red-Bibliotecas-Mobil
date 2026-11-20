import DashboardHeader from "./components/Header";
import DashboardMain from "./components/Main";
import { ScreenBody } from "@/features/shared/layout/Screen";

export default function Dashboard() {
  return (
    <>
      <DashboardHeader />
      <ScreenBody>
        <DashboardMain />
      </ScreenBody>
    </>
  );
}
