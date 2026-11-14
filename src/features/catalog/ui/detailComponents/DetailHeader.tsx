import { Button, PageHeader } from "@/features/shared/components";
import { colors } from "@/features/shared/theme";
import { Link } from "expo-router";
import { PencilLine } from "lucide-react-native";
import { View } from "react-native";

type Props = {
  id: number;
  title: string;
};
export default function DetailHeader({ id, title }: Props) {
  return (
    <PageHeader title={title}>
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
    </PageHeader>
  );
}
