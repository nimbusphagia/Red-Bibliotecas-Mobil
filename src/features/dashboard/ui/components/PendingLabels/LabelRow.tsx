import { View } from "react-native";
import { Label } from "./PendingLabels";
import { Text } from "@/ui/components";

type Props = {
  label: Label;
};
export default function LabelRow({ label }: Props) {
  return (
    <View className="flex flex-row justify-between items-center">
      <Text>{label.title}</Text>
      <Text>
        {label.remainingCopies}/{label.totalCopies}
      </Text>
    </View>
  );
}
