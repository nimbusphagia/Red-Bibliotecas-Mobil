import { CopyItem } from "@/features/inventory/internal/copy/types";
import { Button, Text } from "@/features/shared/components";
import PillRow from "@/features/shared/components/list/PillRow";
import { COPY_STATUS_ES } from "@/features/shared/format/translate";
import { cn, colors } from "@/features/shared/theme";
import { Link } from "expo-router";
import { BookDown, BookUp, ShelvingUnit } from "lucide-react-native";
import { View } from "react-native";

type Props = {
  copies: CopyItem[];
};
export default function CopiesList({ copies }: Props) {
  return (
    <View className="flex-1 gap-5 py-3">
      {copies.map((c) => {
        const isAvailable = ["available", "damaged"].includes(c.status);
        return (
          <PillRow
            key={c.id}
            className="py-3"
            cols={[
              <Text variant="h3">{c.copyNumber}</Text>,
              <Text variant="subtitle" className="text-primary">
                {c.shelfName === "Default" ? "General" : c.shelfName}
              </Text>,

              <Text
                variant="subtitle"
                className={cn(
                  "text-primary",
                  isAvailable
                    ? "bg-fg1 rounded-full px-4 py-[5px] border border-fg1 self-center text-center"
                    : "self-center text-center",
                )}
              >
                {COPY_STATUS_ES[c.status]}
              </Text>,
              <Text
                variant="h3"
                className="border-fg1 border px-2 py-[5px] rounded-lg bg-secondary text-bg text-center rounded-full"
              >
                {c.labelText}
              </Text>,
              <View className="flex-1 flex-row items-center gap-6 justify-end">
                <Link href={`/shelves/${c.shelfId}`} asChild className="p-3">
                  <Button
                    variant="pill"
                    className="bg-fg2 border border-fg1"
                    lucideIcon={
                      <ShelvingUnit
                        size={20}
                        color={colors.highlight}
                        strokeWidth={2}
                      />
                    }
                  />
                </Link>
                {isAvailable ? (
                  <Link href={`/loans/new`} asChild className="p-3">
                    <Button
                      variant="pill"
                      className="bg-primary"
                      lucideIcon={
                        <BookUp size={20} color={colors.bg} strokeWidth={2} />
                      }
                    />
                  </Link>
                ) : (
                  <Link href={`/loans/${c.id}`} asChild className="p-3">
                    <Button
                      variant="pill"
                      className="bg-primary"
                      lucideIcon={
                        <BookDown size={20} color={colors.bg} strokeWidth={2} />
                      }
                    />
                  </Link>
                )}
              </View>,
            ]}
          />
        );
      })}
    </View>
  );
}
