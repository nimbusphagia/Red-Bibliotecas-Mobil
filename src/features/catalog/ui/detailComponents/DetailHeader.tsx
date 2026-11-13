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
      <View className="flex-1 flex-row items-center pl-5">
        <Button
          variant="pill-secondary"
          className="p-3 border-fg1 border"
          lucideIcon={
            <PencilLine size={16} strokeWidth={2.5} color={colors.highlight} />
          }
        />
      </View>
    </Header>
  );
}
