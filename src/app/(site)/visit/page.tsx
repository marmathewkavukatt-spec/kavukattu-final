import VisitPageContent from "@/components/VisitPageContent";

export const metadata = {
  title: "Visit Us [Museum] - Mar Mathew Kavukatt",
  description:
    "Office hours, tomb services, and museum location for Mar Mathew Kavukatt Museum at St Mary's Metropolitan Church.",
};

const OFFICE_HOURS = [
  { days: "Monday, Wednesday, and Thursday", time: "10:00 AM to 12:00 PM" },
  {
    days: "Saturday, Sunday and public holidays",
    time: "10:00 AM to 12:30 PM & 2:30 PM - 4:30 PM",
  },
];

const THURSDAY_SERVICES = [
  { name: "Confession", time: "4:00 PM" },
  { name: "Eucharistic Adoration", time: "4:30 PM" },
  { name: "Prayer for Canonization", time: "5:00 PM" },
  { name: "Holy Qurbana", time: "5:10 PM" },
  { name: "Memorial Service at Tomb", time: "6:00 PM" },
];

const MAP_QUERY =
  "Mar Mathew Kavukatt Museum, St Mary's Metropolitan Church, Kavukatt, Changanassery, Kerala 686532";
const MAP_EMBED_URL = `https://www.google.com/maps?q=${encodeURIComponent(MAP_QUERY)}&output=embed`;
const MAP_OPEN_URL = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(MAP_QUERY)}`;

const LOCATION_CARD = {
  title: "Mar Mathew Kavukatt Museum",
  subtitle: "St Mary's Metropolitan Church",
  address:
    "Mar Mathew Kavukatt Museum\nSt Mary's Metropolitan Church\nKavukatt P.O., Changanassery\nKottayam District, Kerala - 686532\nIndia",
};

export default function VisitPage() {
  return (
    <VisitPageContent
      mapEmbedUrl={MAP_EMBED_URL}
      mapOpenUrl={MAP_OPEN_URL}
      locationCard={LOCATION_CARD}
      officeHours={OFFICE_HOURS}
      thursdayServices={THURSDAY_SERVICES}
    />
  );
}
