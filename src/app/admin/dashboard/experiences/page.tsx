import { permanentRedirect } from "next/navigation";

export default function AdminOldFavoursRecievedRedirectPage() {
  permanentRedirect("/admin/dashboard/favours-recieved/view");
}
