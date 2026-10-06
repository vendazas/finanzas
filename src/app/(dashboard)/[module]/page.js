import { ModulePlaceholder } from "@/components/dashboard/ModulePlaceholder";
import { MODULES } from "@/constants/navigation";
import { notFound } from "next/navigation";

export function generateStaticParams() {
  return MODULES.filter((item) => item.slug !== "dashboard").map(({ slug }) => ({ module: slug }));
}

export default async function ModulePage({ params }) {
  const { module } = await params;
  const currentModule = MODULES.find((item) => item.slug === module && item.slug !== "dashboard");

  if (!currentModule) {
    notFound();
  }

  return <ModulePlaceholder module={currentModule} />;
}
