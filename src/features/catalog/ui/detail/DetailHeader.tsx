import { Button, PageHeader } from "@/features/shared/components";
import { colors } from "@/features/shared/theme";
import { Link } from "expo-router";
import { PencilLine } from "lucide-react-native";

type Props = {
  id: number;
  title: string;
};
export default function DetailHeader({ id, title }: Props) {
  return (
    <PageHeader
      title={title}
      lead={
        <Link
          href={{ pathname: "/catalog/form", params: { id: String(id) } }}
          asChild
        >
          <Button
            variant="secondary"
            icon={
              <PencilLine
                size={16}
                strokeWidth={2.5}
                color={colors.highlight}
              />
            }
          />
        </Link>
      }
    />
  );
}
