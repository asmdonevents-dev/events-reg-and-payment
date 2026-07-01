import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "@prisma/client";
import { DEFAULT_EVENT_FORM_FIELDS } from "../lib/form-fields";

const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString: process.env.DATABASE_URL! }),
});

const SEED_EVENTS = [
  {
    title: "Annual Organization Summit 2026",
    slug: "annual-organization-summit-2026",
    description:
      "Join leaders and members for a full-day summit featuring keynote sessions, networking, and organizational updates.",
    bannerImage:
      "https://images.unsplash.com/photo-1540575467063-178a50c2df87?auto=format&fit=crop&w=1200&q=80",
    startDate: new Date("2026-08-15T09:00:00.000Z"),
    endDate: new Date("2026-08-15T17:00:00.000Z"),
    venue: "ASM Conference Center, Lagos",
    capacity: 250,
    isFree: false,
    ticketPrice: 15000,
    status: "PUBLISHED" as const,
    formFields: {
      create: DEFAULT_EVENT_FORM_FIELDS.map((field, index) => ({
        label: field.label,
        fieldKey: field.fieldKey,
        fieldType: field.fieldType,
        placeholder: field.placeholder || null,
        helpText: field.helpText || null,
        required: field.required,
        options: field.options,
        sortOrder: index,
      })),
    },
    speakers: {
      create: [
        {
          name: "Rev. Dr. Samuel Adeyemi",
          role: "Keynote Speaker",
          bio: "National coordinator of the Anglican Student Movement with over 15 years of student ministry experience.",
          photoUrl:
            "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&w=400&q=80",
          sortOrder: 0,
        },
        {
          name: "Chinwe Okafor",
          role: "Workshop Facilitator",
          bio: "Leadership coach and ASM alumni mentor focused on campus ministry and community building.",
          photoUrl:
            "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80",
          sortOrder: 1,
        },
      ],
    },
  },
  {
    title: "Community Volunteer Day",
    slug: "community-volunteer-day",
    description:
      "A free community outreach event open to all volunteers. Registration helps us plan materials and refreshments.",
    bannerImage:
      "https://images.unsplash.com/photo-1529070538774-1843cb3265df?auto=format&fit=crop&w=1200&q=80",
    startDate: new Date("2026-07-20T08:00:00.000Z"),
    endDate: new Date("2026-07-20T14:00:00.000Z"),
    venue: "City Community Hall",
    capacity: 100,
    isFree: true,
    ticketPrice: null,
    status: "PUBLISHED" as const,
    formFields: {
      create: [
        ...DEFAULT_EVENT_FORM_FIELDS,
        {
          label: "T-shirt size",
          fieldKey: "tshirt_size",
          fieldType: "SELECT" as const,
          placeholder: "Choose your size",
          helpText: "We provide volunteer shirts on the day",
          required: true,
          options: ["Small", "Medium", "Large", "XL"],
          sortOrder: 3,
        },
      ].map((field, index) => ({
        label: field.label,
        fieldKey: field.fieldKey,
        fieldType: field.fieldType,
        placeholder: field.placeholder || null,
        helpText: field.helpText || null,
        required: field.required,
        options: field.options,
        sortOrder: index,
      })),
    },
  },
];

async function seed() {
  console.log("Seeding events...");
  let created = 0;
  let updated = 0;

  for (const event of SEED_EVENTS) {
    const { formFields, speakers, ...eventData } = event;
    const existing = await prisma.event.findUnique({ where: { slug: event.slug } });

    if (existing) {
      await prisma.event.update({ where: { id: existing.id }, data: eventData });
      await prisma.eventFormField.deleteMany({ where: { eventId: existing.id } });
      await prisma.eventSpeaker.deleteMany({ where: { eventId: existing.id } });
      await prisma.eventFormField.createMany({
        data: formFields.create.map((field) => ({
          eventId: existing.id,
          ...field,
        })),
      });
      if (speakers?.create?.length) {
        await prisma.eventSpeaker.createMany({
          data: speakers.create.map((speaker) => ({
            eventId: existing.id,
            ...speaker,
          })),
        });
      }
      updated++;
      continue;
    }

    await prisma.event.create({ data: event });
    created++;
  }

  console.log(`Done — ${created} created, ${updated} updated`);
}

seed()
  .catch((error) => {
    console.error("Seed failed:", error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
