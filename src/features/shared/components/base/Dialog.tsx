import type { PropsWithChildren } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Pressable,
  StyleSheet,
  View,
} from "react-native";
import { cn } from "../../theme";

type Props = { onClose: () => void; className?: string };

export function Dialog({
  onClose,
  className,
  children,
}: PropsWithChildren<Props>) {
  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior="padding"
        className="flex-1 items-center justify-center"
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          className="bg-black/5"
          onPress={onClose}
        />
        <View
          className={cn(
            "max-h-[80%] w-[480px] max-w-full gap-4 rounded-2xl border border-fg1 bg-bg p-7 pt-6",
            className,
          )}
        >
          {children}
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}
