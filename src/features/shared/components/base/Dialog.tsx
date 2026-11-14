import type { PropsWithChildren } from "react";
import { Modal, Pressable, StyleSheet, View } from "react-native";

type Props = { onClose: () => void };

export function Dialog({ onClose, children }: PropsWithChildren<Props>) {
  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <View className="flex-1 items-center justify-center">
        <Pressable
          style={StyleSheet.absoluteFill}
          className="bg-black/5"
          onPress={onClose}
        />
        <View className="max-h-[80%] w-[480px] max-w-full gap-4 rounded-2xl border border-fg1 bg-bg p-7 pt-6">
          {children}
        </View>
      </View>
    </Modal>
  );
}
