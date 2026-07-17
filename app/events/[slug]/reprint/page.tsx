import EventReprintTagPage from "@/components/pages/Events/EventReprintTag";

export default async function EventReprintRoute({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  return <EventReprintTagPage slug={slug} />;
}
