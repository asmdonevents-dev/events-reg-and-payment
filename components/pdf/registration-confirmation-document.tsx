import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import moment from "moment";
import type { RegistrationUI } from "@/validators/types/event";

const colors = {
  lime: "#9ecc3a",
  terracotta: "#6d4c41",
  black: "#111111",
  white: "#ffffff",
  muted: "#666666",
  ivory: "#f7f5f0",
  cutLine: "#cccccc",
};

// Standard lanyard insert: 3.5" × 4.25"
const BADGE_WIDTH = 252;
const BADGE_HEIGHT = 306;

const styles = StyleSheet.create({
  sheet: {
    flex: 1,
    padding: 36,
    fontFamily: "Helvetica",
    backgroundColor: "#ffffff",
    alignItems: "center",
    justifyContent: "center",
  },
  main: {
    alignItems: "center",
  },
  badgeArea: {
    position: "relative",
    width: BADGE_WIDTH,
    height: BADGE_HEIGHT,
  },
  cutGuide: {
    position: "absolute",
    top: 0,
    left: 0,
    width: BADGE_WIDTH,
    height: BADGE_HEIGHT,
    borderWidth: 1,
    borderColor: colors.cutLine,
    borderStyle: "dashed",
  },
  cutHint: {
    marginTop: 16,
    maxWidth: BADGE_WIDTH + 40,
    fontSize: 7,
    color: colors.muted,
    textAlign: "center",
    lineHeight: 1.4,
  },
  badge: {
    width: BADGE_WIDTH,
    height: BADGE_HEIGHT,
    backgroundColor: colors.white,
    borderWidth: 2,
    borderColor: colors.black,
    overflow: "hidden",
  },
  punchHole: {
    alignItems: "center",
    paddingTop: 8,
    paddingBottom: 4,
  },
  hole: {
    width: 14,
    height: 14,
    borderRadius: 7,
    borderWidth: 1.5,
    borderColor: colors.muted,
    backgroundColor: colors.white,
  },
  header: {
    backgroundColor: colors.lime,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  brand: {
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.black,
    textTransform: "uppercase",
    letterSpacing: 1.2,
    marginBottom: 3,
  },
  eventTitle: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: colors.black,
    lineHeight: 1.3,
  },
  body: {
    flex: 1,
    paddingHorizontal: 14,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colors.ivory,
  },
  firstName: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    color: colors.black,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    lineHeight: 1.1,
  },
  lastName: {
    fontSize: 18,
    fontFamily: "Helvetica-Bold",
    color: colors.terracotta,
    textAlign: "center",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginTop: 2,
    lineHeight: 1.1,
  },
  role: {
    marginTop: 10,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.black,
    textTransform: "uppercase",
    letterSpacing: 1.5,
    backgroundColor: colors.lime,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  groupLabel: {
    marginTop: 8,
    fontSize: 8,
    fontFamily: "Helvetica-Bold",
    color: colors.black,
    textTransform: "uppercase",
    letterSpacing: 1,
    backgroundColor: colors.lime,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  extraLine: {
    marginTop: 6,
    fontSize: 8,
    color: colors.muted,
    textAlign: "center",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: colors.lime,
    backgroundColor: colors.white,
  },
  qr: {
    width: 52,
    height: 52,
    marginRight: 10,
  },
  footerMeta: {
    flex: 1,
  },
  idLabel: {
    fontSize: 6,
    color: colors.muted,
    textTransform: "uppercase",
    letterSpacing: 0.8,
  },
  idValue: {
    fontSize: 9,
    fontFamily: "Helvetica-Bold",
    color: colors.black,
    marginTop: 1,
    marginBottom: 4,
  },
  metaLine: {
    fontSize: 7,
    color: colors.muted,
    lineHeight: 1.3,
  },
});

function getParticipantName(registration: RegistrationUI) {
  return (
    registration.contactName ||
    registration.labeledResponses.find((entry) => /name/i.test(entry.label))?.value ||
    "Guest"
  );
}

function splitBadgeName(fullName: string) {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  if (parts.length <= 1) {
    return { first: parts[0] ?? "Guest", last: "" };
  }

  const last = parts.pop()!;
  return { first: parts.join(" "), last };
}

function getBadgeExtras(registration: RegistrationUI) {
  return registration.labeledResponses
    .filter((entry) => !/name|email|phone/i.test(entry.label))
    .slice(0, 2);
}

function formatBadgeDate(date: string) {
  return moment(date).format("MMM D, YYYY");
}

export function RegistrationConfirmationDocument({
  registration,
  qrDataUrl,
}: {
  registration: RegistrationUI;
  qrDataUrl: string;
}) {
  const { first, last } = splitBadgeName(getParticipantName(registration));
  const extras = getBadgeExtras(registration);
  const shortId = registration.id.slice(-8).toUpperCase();

  return (
    <Document title={`Name tag — ${getParticipantName(registration)}`}>
      <Page size="A4" style={styles.sheet}>
        <View style={styles.main}>
          <View style={styles.badgeArea}>
            <View style={styles.cutGuide} />
            <View style={styles.badge}>
              <View style={styles.punchHole}>
                <View style={styles.hole} />
              </View>

              <View style={styles.header}>
                <Text style={styles.brand}>Anglican Student Movement</Text>
                <Text style={styles.eventTitle}>{registration.eventTitle}</Text>
              </View>

              <View style={styles.body}>
                <Text style={styles.firstName}>{first}</Text>
                {last ? <Text style={styles.lastName}>{last}</Text> : null}
                {registration.assignedGroup ? (
                  <Text style={styles.groupLabel}>{registration.assignedGroup}</Text>
                ) : (
                  <Text style={styles.role}>Attendee</Text>
                )}
                {extras.map((entry) => (
                  <Text key={entry.label} style={styles.extraLine}>
                    {entry.label}: {entry.value}
                  </Text>
                ))}
              </View>

              <View style={styles.footer}>
                <Image src={qrDataUrl} style={styles.qr} />
                <View style={styles.footerMeta}>
                  <Text style={styles.idLabel}>Registration ID</Text>
                  <Text style={styles.idValue}>{shortId}</Text>
                  <Text style={styles.metaLine}>
                    {formatBadgeDate(registration.eventStartDate)}
                  </Text>
                  <Text style={styles.metaLine}>{registration.eventVenue}</Text>
                </View>
              </View>
            </View>
          </View>

          <Text style={styles.cutHint}>
            Cut along the dashed line, punch a hole at the top, and wear on a lanyard at
            the conference.
          </Text>
        </View>
      </Page>
    </Document>
  );
}
