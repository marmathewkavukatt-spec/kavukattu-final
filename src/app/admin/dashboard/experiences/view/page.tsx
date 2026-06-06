import { permanentRedirect } from "next/navigation";

export default function AdminViewOldFavoursRecievedRedirectPage() {
  permanentRedirect("/admin/dashboard/favours-recieved/view");
}
