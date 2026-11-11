import { Text } from "@/ui/components";
import { View } from "react-native";
import LabelRow from "./LabelRow";

export type Label = {
  title: string;
  totalCopies: number;
  remainingCopies: number;
  id: number;
};
type Props = {
  labels: Label[];
};
export default function PendingLabels({ labels }: Props) {
  return (
    <View className="flex flex-col gap-5">
      <View className="flex flex-row justify-between items-center">
        <Text>Etiquetas sin imprimir</Text>
        <View className="flex flex-row items-center ">
          <Text>Porcentaje</Text>
          <Text>35%</Text>
        </View>
      </View>
      <View>
        {labels.map((l) => (
          <LabelRow key={l.id} label={l} />
        ))}
      </View>
    </View>
  );
}
