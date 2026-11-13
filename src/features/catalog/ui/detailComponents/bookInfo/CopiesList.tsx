import { CopyItem } from "@/features/inventory/internal/copy/types";
import { Button, Text } from "@/features/shared/components";
import PillRow from "@/features/shared/components/list/PillRow";
import { COPY_STATUS_ES } from "@/features/shared/format/translate";
import { colors } from "@/features/shared/theme";
import { Link } from "expo-router";
import { BookDown, BookUp, ShelvingUnit } from "lucide-react-native";
import { View } from "react-native";

type Props = {
  copies: CopyItem[];
};
export default function CopiesList({ copies }: Props) {
  return (
    <View className="flex-1 gap-3 p-3">
      <Text variant="h2">Ejemplares</Text>
      {copies.map((c) => {
        const isAvailable = ["available", "damaged"].includes(c.status);
        return (
          <PillRow
            key={c.id}
            className="py-5"
            cols={[
              <Text variant="h3">{c.copyNumber}</Text>,
              <Text variant="h3">
                {c.shelfName === "Default" ? "General" : c.shelfName}
              </Text>,
              <Text
                variant="h3"
                className={
                  isAvailable
                    ? "bg-primary rounded-full px-5 py-2 text-background self-center text-center"
                    : "self-center text-center"
                }
              >
                {COPY_STATUS_ES[c.status]}
              </Text>,
              <Text variant="h3" className="w-400]">
                {c.labelText}
              </Text>,
              <View className="flex-1 flex-row items-center gap-6 justify-end">
                <Link href={`/shelves/${c.shelfId}`} asChild className="p-3">
                  <Button
                    variant="pill"
                    className="bg-foreground/80 border border-foreground"
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
                        <BookUp
                          size={20}
                          color={colors.background}
                          strokeWidth={2}
                        />
                      }
                    />
                  </Link>
                ) : (
                  <Link href={`/loans/${c.id}`} asChild className="p-3">
                    <Button
                      variant="pill"
                      className="bg-primary"
                      lucideIcon={
                        <BookDown
                          size={20}
                          color={colors.background}
                          strokeWidth={2}
                        />
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
