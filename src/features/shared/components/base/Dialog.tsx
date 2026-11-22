import type { PropsWithChildren, ReactNode } from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import { cn } from "../../theme";
import { Button } from "./Button";
import { Surface } from "./Surface";
import { Text } from "./Text";

type DialogSize = "md" | "lg";

const sizeStyles: Record<DialogSize, string> = {
  md: "w-[480px]",
  lg: "h-[70%] w-[560px]",
};

type DialogProps = {
  onClose: () => void;
  size?: DialogSize;
  className?: string;
};

export function Dialog({
  onClose,
  size = "md",
  className,
  children,
}: PropsWithChildren<DialogProps>) {
  return (
    <Modal transparent animationType="slide" onRequestClose={onClose}>
      <KeyboardAvoidingView
        behavior="padding"
        className="flex-1 items-center justify-center px-4"
      >
        <Pressable
          style={StyleSheet.absoluteFill}
          className="bg-black/10"
          onPress={onClose}
        />
        <Surface
          tone="dark"
          className={cn(
            "max-h-[80%] max-w-full gap-4 p-6 pt-4",
            sizeStyles[size],
            className,
          )}
        >
          {children}
        </Surface>
      </KeyboardAvoidingView>
    </Modal>
  );
}

type HeaderProps = { title: string; subtitle?: string; actions?: ReactNode };

export function DialogHeader({ title, subtitle, actions }: HeaderProps) {
  return (
    <View className="flex-row items-center justify-between gap-4">
      <View className="flex-1 gap-1">
        <Text variant="section" numberOfLines={1}>
          {title}
        </Text>
        {subtitle ? (
          <Text variant="caption" numberOfLines={1}>
            {subtitle}
          </Text>
        ) : null}
      </View>
      {actions ? (
        <View className="flex-row items-center gap-2">{actions}</View>
      ) : null}
    </View>
  );
}

export function DialogBody({
  className,
  children,
}: PropsWithChildren<{ className?: string }>) {
  return (
    <ScrollView
      keyboardShouldPersistTaps="handled"
      showsVerticalScrollIndicator={false}
      contentContainerClassName="gap-4"
      className={className}
    >
      {children}
    </ScrollView>
  );
}

type ActionsProps = {
  confirmTitle: string;
  onConfirm: () => void;
  onCancel?: () => void;
  cancelTitle?: string;
  loading?: boolean;
  disabled?: boolean;
};

export function DialogActions({
  confirmTitle,
  onConfirm,
  onCancel,
  cancelTitle = "Cancelar",
  loading,
  disabled,
}: ActionsProps) {
  return (
    <View className="flex-row items-center justify-end gap-2">
      {onCancel && (
        <Button title={cancelTitle} variant="soft" onPress={onCancel} />
      )}
      <Button
        variant="soft"
        weight="md"
        title={confirmTitle}
        loading={loading}
        disabled={disabled}
        onPress={onConfirm}
      />
    </View>
  );
}
