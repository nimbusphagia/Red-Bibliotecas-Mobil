import type { ReactNode } from "react";
import { Image, type ImageSource } from "expo-image";
import {
  KeyboardAvoidingView,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Surface } from "../base/Surface";
import { Text } from "../base/Text";
import { cn, ToneContext, tones } from "../../theme";

type FormScreenProps = {
  title: string;
  subtitle?: string;
  background?: ImageSource;
  children: ReactNode;
};

export function FormScreen({
  title,
  subtitle,
  background,
  children,
}: FormScreenProps) {
  return (
    <ToneContext.Provider value="dark">
      <SafeAreaView className={cn("flex-1", tones.dark.surface)}>
        {background ? (
          <>
            <Image
              source={background}
              contentFit="cover"
              style={StyleSheet.absoluteFill}
            />
            <View className="absolute inset-0 bg-dark1/15" />
          </>
        ) : null}
        <KeyboardAvoidingView behavior="padding" className="flex-1">
          <ScrollView
            keyboardShouldPersistTaps="handled"
            contentContainerClassName="flex-grow items-center justify-center p-6"
          >
            <Surface
              tone="light"
              className="w-full max-w-xl gap-8 rounded-2xl px-8 py-6"
            >
              <View className="gap-1">
                <Text variant="display" className="font-sans-medium">
                  {title}
                </Text>
                {subtitle ? (
                  <Text variant="caption" className="text-[15px]">
                    {subtitle}
                  </Text>
                ) : null}
              </View>
              <View className="gap-6">{children}</View>
            </Surface>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ToneContext.Provider>
  );
}
