import { PageHeader } from "@/features/shared/components";

type Props = {
  id: number;
  title: string;
  subtitle?: string;
};
export default function DetailHeader({ id, title, subtitle }: Props) {
  return <PageHeader title={title} subtitle={subtitle} />;
}
