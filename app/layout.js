import { preload } from "react-dom";
import localFont from "next/font/local";
import Providers from "../components/Providers";
import "./globals.css";
import { SITE } from "../lib/site";
const allo = localFont({ src: "../public/fonts/AlloVariable.woff2", variable: "--font-allo", weight: "100 900", display: "swap" });
const title = "Udupi, unhurried | Coastal Karnataka travel guide";
const description = "Explore Udupi district through its historic temples, fishing harbours, island geology, coastal cuisine, village traditions and the landscapes of the Western Ghats.";
export const metadata = {
  metadataBase: new URL(SITE), title: { default: title, template: "%s | Udupi, unhurried" }, description, applicationName: "Udupi, unhurried",
  keywords: ["Udupi", "Udupi travel guide", "Malpe beach", "St Mary’s Island", "Krishna Matha", "Karnataka coast", "Udupi food"],
  alternates: { canonical: "/" }, formatDetection: { telephone: false },
  openGraph: { title, description, type: "website", locale: "en_IN", siteName: "Udupi, unhurried", url: "/" }, twitter: { card: "summary_large_image", title, description },
};
export const viewport = { themeColor: "#061a20", viewportFit: "cover", width: "device-width", initialScale: 1 };
const ld = { "@context": "https://schema.org", "@type": "TouristDestination", name: "Udupi", description, geo: { "@type": "GeoCoordinates", latitude: 13.34, longitude: 74.74 }, containedInPlace: { "@type": "AdministrativeArea", name: "Karnataka, India" } };
export default function Layout({ children }) {
  preload("/img/malpe.jpg", { as: "image" });
  return (<html lang="en" className={allo.variable}><body><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ld) }} /><Providers>{children}</Providers></body></html>);
}
