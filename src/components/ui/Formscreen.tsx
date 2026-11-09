import type { ReactNode } from "react";
import { KeyboardAvoidingView, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type FormScreenProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
  footer?: ReactNode;
};

export function FormScreen({
  title,
  subtitle,
  children,
  footer,
}: FormScreenProps) {
  return (
    <SafeAreaView className="flex-1 bg-slate-100">
      <KeyboardAvoidingView behavior="padding" className="flex-1">
        <ScrollView
          keyboardShouldPersistTaps="handled"
          contentContainerClassName="flex-grow items-center justify-center p-6 md:p-10"
        >
          <View className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 md:p-8">
            <View className="mb-6">
              <Text className="text-3xl font-bold text-slate-900">{title}</Text>
              {subtitle ? (
                <Text className="mt-1 text-base text-slate-500">
                  {subtitle}
                </Text>
              ) : null}
            </View>

            <View className="gap-4">{children}</View>

            {footer ? (
              <View className="mt-6 flex-row items-center justify-center gap-1">
                {footer}
              </View>
            ) : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
