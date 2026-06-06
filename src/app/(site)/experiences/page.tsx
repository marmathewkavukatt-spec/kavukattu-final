import { permanentRedirect } from "next/navigation";

export default function OldFavoursRecievedRedirectPage() {
  permanentRedirect("/favours-recieved");
}
