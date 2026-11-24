import {
  useCallback,
  useMemo,
  useRef,
  useState,
  type PropsWithChildren,
  type ReactNode,
} from "react";
import {
  KeyboardAvoidingView,
  Modal,
  Pressable,
  ScrollView,
  StyleSheet,
  View,
} from "react-native";
import Animated from "react-native-reanimated";
import { cn, type Tone } from "../../theme";
import { Button } from "./Button";
import { DialogDismissContext } from "./dismiss";
import { DialogFocusContext } from "./focus";
import { LAYOUT } from "./motion";
import { Surface } from "./Surface";
import { Text } from "./Text";

const AnimatedSurface = Animated.createAnimatedComponent(Surface);

type DialogSize = "sm" | "md" | "lg";

const sizeStyles: Record<DialogSize, string> = {
  sm: "w-[400px]",
  md: "w-[480px]",
  lg: "h-[70%] w-[560px]",
};

type DialogProps = {
  onClose: () => void;
  size?: DialogSize;
  /** Tono de la superficie del diálogo. Todo lo de adentro lo hereda. */
  tone?: Tone;
  className?: string;
};

export function Dialog({
  onClose,
  size = "md",
  tone = "light",
  className,
  children,
}: PropsWithChildren<DialogProps>) {
  const [dismiss, setDismiss] = useState<{
    tick: number;
    except: string | null;
  }>({ tick: 0, except: null });
  const touched = useRef<string | null>(null);
  const protect = useCallback((id: string) => {
    touched.current = id;
  }, []);
  const value = useMemo(() => ({ ...dismiss, protect }), [dismiss, protect]);
  const [focus] = useState<{ first?: string }>({});

  // Se ejecuta en la fase de captura (antes que cualquier hijo) y devuelve
  // false, así que no interfiere con ningún botón. Los controles que están
  // bajo el toque se anuncian con `protect` durante este mismo evento; cuando
  // termina (microtask) se avisa a los demás que se cierren.
  const onTouch = () => {
    touched.current = null;
    queueMicrotask(() => {
      const except = touched.current;
      setDismiss((p) => ({ tick: p.tick + 1, except }));
    });
    return false;
  };

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
        <AnimatedSurface
          layout={LAYOUT}
          tone={tone}
          className={cn(
            "max-h-[80%] max-w-full gap-4 p-6 pt-4",
            sizeStyles[size],
            className,
          )}
          onStartShouldSetResponderCapture={onTouch}
        >
          <DialogDismissContext.Provider value={value}>
            <DialogFocusContext.Provider value={focus}>
              {children}
            </DialogFocusContext.Provider>
          </DialogDismissContext.Provider>
        </AnimatedSurface>
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
  cancelVariant?: "soft" | "ghost";
  loading?: boolean;
  disabled?: boolean;
  className?: string;
};

export function DialogActions({
  confirmTitle,
  onConfirm,
  onCancel,
  cancelTitle = "Cancelar",
  cancelVariant = "soft",
  loading,
  disabled,
  className,
}: ActionsProps) {
  return (
    <View className={cn("flex-row items-center justify-end gap-2", className)}>
      {onCancel && (
        <Button
          title={cancelTitle}
          variant={cancelVariant}
          onPress={onCancel}
        />
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
