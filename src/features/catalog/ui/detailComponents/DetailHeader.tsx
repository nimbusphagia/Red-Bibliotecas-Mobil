import { Button } from "@/features/shared/components";
import Header from "@/features/shared/components/header/Header";
import { colors } from "@/features/shared/theme";
import { PencilLine } from "lucide-react-native";
import { View } from "react-native";

type Props = {
  title: string;
};
export default function DetailHeader({ title }: Props) {
  return (
    <Header title={title}>
      <View className="flex-1 flex-row items-center pl-5 gap-4">
        <Button
          variant="pill"
          className="p-3"
          lucideIcon={<PencilLine size={16} color={colors.background} />}
        />
      </View>
    </Header>
  );
}
