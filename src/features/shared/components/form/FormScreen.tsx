import type { ReactNode } from "react";
import { KeyboardAvoidingView, ScrollView, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Text } from "../base/Text";
import { useLayoutMode } from "../../hooks/useLayoutMode";
import { cn } from "../../theme";

type FormScreenProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function FormScreen({ title, subtitle, children }: FormScreenProps) {
  const { isExpanded } = useLayoutMode();

  return (
    <SafeAreaView className="flex-1 ">
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerClassName={cn(
            "flex-grow items-center justify-center",
            isExpanded ? "p-10" : "p-6",
          )}
        >
          <View className={cn("w-full max-w-lg", isExpanded ? "p-8" : "p-6")}>
            <View className="mb-6">
              <Text variant="title">{title}</Text>
              {subtitle ? <Text className="mt-1">{subtitle}</Text> : null}
            </View>
            <View className="gap-4">{children}</View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
