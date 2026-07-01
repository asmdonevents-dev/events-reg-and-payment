import EventRegisterPage from "@/components/pages/Events/EventRegister";

export default async function EventRegisterRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <EventRegisterPage slug={slug} />;
}
