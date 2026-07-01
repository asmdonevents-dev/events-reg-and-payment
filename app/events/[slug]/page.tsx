import EventDetailPage from "@/components/pages/Events/EventDetail";

export default async function EventSlugPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return <EventDetailPage slug={slug} />;
}
