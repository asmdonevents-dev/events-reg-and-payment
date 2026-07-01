import EventConfirmationPage from "@/components/pages/Events/EventConfirmation";

export default async function EventConfirmationRoute({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ ref?: string; status?: string }>;
}) {
  const { slug } = await params;
  const { ref, status } = await searchParams;

  return (
    <EventConfirmationPage slug={slug} registrationId={ref} status={status} />
  );
}
