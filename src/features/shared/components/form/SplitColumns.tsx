import { Children, Fragment, type ReactNode } from "react";
import { View } from "react-native";
import { useLayoutMode } from "../../hooks/useLayoutMode";
import { cn } from "../../theme";
import { Divider } from "./FormSection";

export function SplitColumns({ children }: { children: ReactNode }) {
  const { isExpanded } = useLayoutMode();

  return (
    <View className={cn("gap-8", isExpanded && "flex-row")}>
      {Children.toArray(children).map((child, i) => (
        <Fragment key={i}>
          {i > 0 && <Divider vertical={isExpanded} />}
          <View className={cn(isExpanded && "flex-1")}>{child}</View>
        </Fragment>
      ))}
    </View>
  );
}
