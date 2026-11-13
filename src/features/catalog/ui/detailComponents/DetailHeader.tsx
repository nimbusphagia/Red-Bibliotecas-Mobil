import { Button } from "@/features/shared/components";
import Header from "@/features/shared/components/header/Header";
import { colors } from "@/features/shared/theme";
import { PencilLine } from "lucide-react-native";
import { View } from "react-native";
import { Link } from "expo-router";

type Props = {
  id: number;
  title: string;
};
export default function DetailHeader({ id, title }: Props) {
  return (
    <Header title={title}>
      <View className="flex-1 flex-row items-center pl-5">
        <Link
          href={{ pathname: "/catalog/form", params: { id: String(id) } }}
          asChild
        >
          <Button
            variant="pill-secondary"
            className="p-3 border-fg1 border"
            lucideIcon={
              <PencilLine
                size={16}
                strokeWidth={2.5}
                color={colors.highlight}
              />
            }
          />
        </Link>
      </View>
    </Header>
  );
}
