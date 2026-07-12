import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";
import {
  formatTagDateRange,
  formatTagVenue,
  getTagDetailLines,
  mmToPt,
  resolveTagTheme,
  TAG_HEIGHT_PT,
  TAG_WIDTH_PT,
} from "@/lib/name-tag";
import { PDF_FONT_FAMILY, registerPdfFonts } from "@/lib/pdf-fonts";
import type { RegistrationUI } from "@/validators/types/event";

registerPdfFonts();

const SIDEBAR_WIDTH = mmToPt(7);
const BODY_HEIGHT =
  TAG_HEIGHT_PT - mmToPt(7) - mmToPt(16) - mmToPt(11);

function createStyles(primary: string, secondary: string) {
  return StyleSheet.create({
    page: {
      width: TAG_WIDTH_PT,
      height: TAG_HEIGHT_PT,
      fontFamily: PDF_FONT_FAMILY,
      fontWeight: 400,
      backgroundColor: secondary,
    },
    badge: {
      width: TAG_WIDTH_PT,
      height: TAG_HEIGHT_PT,
      overflow: "hidden",
      backgroundColor: secondary,
    },
    punchHole: {
      alignItems: "center",
      paddingTop: mmToPt(2),
      paddingBottom: mmToPt(1.5),
      backgroundColor: secondary,
    },
    hole: {
      width: mmToPt(4),
      height: mmToPt(4),
      borderRadius: mmToPt(2),
      borderWidth: 1,
      borderColor: primary,
      backgroundColor: "#ffffff",
    },
    header: {
      paddingHorizontal: mmToPt(3),
      paddingVertical: mmToPt(3),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: primary,
      minHeight: mmToPt(16),
    },
    headerText: {
      fontSize: mmToPt(3),
      fontFamily: PDF_FONT_FAMILY,
      fontWeight: 800,
      color: "#ffffff",
      textAlign: "center",
      textTransform: "uppercase",
      lineHeight: 1.2,
    },
    bodyRow: {
      height: BODY_HEIGHT,
      flexDirection: "row",
      backgroundColor: secondary,
    },
    sidebar: {
      width: SIDEBAR_WIDTH,
      justifyContent: "center",
      alignItems: "center",
      paddingVertical: mmToPt(2),
      backgroundColor: primary,
    },
    sidebarText: {
      fontSize: mmToPt(2),
      fontFamily: PDF_FONT_FAMILY,
      fontWeight: 700,
      color: "#ffffff",
      textTransform: "uppercase",
      transform: "rotate(-90deg)",
      width: BODY_HEIGHT - mmToPt(4),
      textAlign: "center",
      lineHeight: 1.35,
    },
    content: {
      flex: 1,
      paddingHorizontal: mmToPt(3),
      paddingTop: mmToPt(2.5),
      paddingBottom: mmToPt(2),
    },
    topRow: {
      flexDirection: "row",
      gap: mmToPt(2.5),
      marginBottom: mmToPt(2.5),
    },
    photoFrame: {
      width: mmToPt(24),
      height: mmToPt(28),
      borderWidth: 1.5,
      borderColor: primary,
      backgroundColor: "#ffffff",
      alignItems: "center",
      justifyContent: "center",
      overflow: "hidden",
    },
    photo: {
      width: mmToPt(24),
      height: mmToPt(28),
      objectFit: "cover",
    },
    photoPlaceholder: {
      fontSize: mmToPt(2),
      fontFamily: PDF_FONT_FAMILY,
      fontWeight: 400,
      color: "#666666",
      textAlign: "center",
      paddingHorizontal: mmToPt(1.5),
    },
    qrBlock: {
      flex: 1,
      alignItems: "center",
    },
    qr: {
      width: mmToPt(28),
      height: mmToPt(28),
    },
    dateText: {
      marginTop: mmToPt(1.5),
      fontSize: mmToPt(2.3),
      fontFamily: PDF_FONT_FAMILY,
      fontWeight: 700,
      color: primary,
      textTransform: "uppercase",
      textAlign: "center",
    },
    venueText: {
      marginTop: mmToPt(1),
      fontSize: mmToPt(2),
      fontFamily: PDF_FONT_FAMILY,
      fontWeight: 400,
      color: primary,
      textAlign: "center",
      lineHeight: 1.25,
    },
    detailBox: {
      borderWidth: 1,
      borderColor: primary,
      paddingHorizontal: mmToPt(2),
      paddingVertical: mmToPt(1.5),
      marginBottom: mmToPt(1.5),
      minHeight: mmToPt(8),
      justifyContent: "center",
      backgroundColor: "#ffffff",
    },
    detailText: {
      fontSize: mmToPt(2.3),
      fontFamily: PDF_FONT_FAMILY,
      fontWeight: 600,
      color: primary,
      textTransform: "uppercase",
      lineHeight: 1.25,
      textAlign: "center",
    },
    footer: {
      paddingHorizontal: mmToPt(3),
      paddingVertical: mmToPt(2.5),
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: primary,
      minHeight: mmToPt(11),
    },
    footerText: {
      fontSize: mmToPt(2.1),
      fontFamily: PDF_FONT_FAMILY,
      fontWeight: 700,
      color: "#ffffff",
      textAlign: "center",
      textTransform: "uppercase",
      lineHeight: 1.25,
    },
  });
}

function buildSidebarText(registration: RegistrationUI) {
  const shortId = registration.id.slice(-8).toUpperCase();
  const groupLine = registration.assignedGroup
    ? `BIBLE STUDY CLASS ${registration.assignedGroup.toUpperCase()}`
    : "BIBLE STUDY CLASS";

  return `REG ID: ${shortId}     ${groupLine}`;
}

function renderDetailText(line: { label: string; value: string }) {
  if (!line.label) {
    return line.value;
  }

  return `${line.label}: ${line.value}`;
}

export function RegistrationConfirmationDocument({
  registration,
  qrDataUrl,
}: {
  registration: RegistrationUI;
  qrDataUrl: string;
}) {
  const theme = resolveTagTheme(registration);
  const styles = createStyles(theme.primary, theme.secondary);
  const detailLines = getTagDetailLines(registration, 3);
  const dateRange = formatTagDateRange(
    registration.eventStartDate,
    registration.eventEndDate
  );
  const venue = formatTagVenue(registration.eventVenue);

  return (
    <Document title={`Name tag — ${registration.contactName || "Guest"}`}>
      <Page size="A6" style={styles.page}>
        <View style={styles.badge}>
          <View style={styles.punchHole}>
            <View style={styles.hole} />
          </View>

          <View style={styles.header}>
            <Text style={styles.headerText}>{registration.eventTitle}</Text>
          </View>

          <View style={styles.bodyRow}>
            <View style={styles.sidebar}>
              <Text style={styles.sidebarText}>{buildSidebarText(registration)}</Text>
            </View>

            <View style={styles.content}>
              <View style={styles.topRow}>
                <View style={styles.photoFrame}>
                  {registration.photoUrl ? (
                    <Image src={registration.photoUrl} style={styles.photo} />
                  ) : (
                    <Text style={styles.photoPlaceholder}>No photo</Text>
                  )}
                </View>

                <View style={styles.qrBlock}>
                  <Image src={qrDataUrl} style={styles.qr} />
                  <Text style={styles.dateText}>{dateRange}</Text>
                  <Text style={styles.venueText}>{venue}</Text>
                </View>
              </View>

              {detailLines.map((line, index) => (
                <View key={`${line.label}-${index}`} style={styles.detailBox}>
                  <Text style={styles.detailText}>{renderDetailText(line)}</Text>
                </View>
              ))}
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>{theme.footer}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
