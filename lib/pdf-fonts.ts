import { Font } from "@react-pdf/renderer";

export const PDF_FONT_FAMILY = "Poppins";

const POPPINS_BASE =
  "https://raw.githubusercontent.com/google/fonts/main/ofl/poppins";

let fontsRegistered = false;

export function registerPdfFonts() {
  if (fontsRegistered) return;
  fontsRegistered = true;

  Font.register({
    family: PDF_FONT_FAMILY,
    fonts: [
      {
        src: `${POPPINS_BASE}/Poppins-Regular.ttf`,
        fontWeight: 400,
      },
      {
        src: `${POPPINS_BASE}/Poppins-SemiBold.ttf`,
        fontWeight: 600,
      },
      {
        src: `${POPPINS_BASE}/Poppins-Bold.ttf`,
        fontWeight: 700,
      },
      {
        src: `${POPPINS_BASE}/Poppins-ExtraBold.ttf`,
        fontWeight: 800,
      },
    ],
  });
}
