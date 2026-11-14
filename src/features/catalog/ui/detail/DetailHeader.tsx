import { PageHeader } from "@/features/shared/components";

type Props = {
  id: number;
  title: string;
};
export default function DetailHeader({ id, title }: Props) {
  return <PageHeader title={title} />;
}
