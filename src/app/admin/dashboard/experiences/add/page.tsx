import { permanentRedirect } from "next/navigation";

export default function AdminAddOldFavourRecievedRedirectPage() {
  permanentRedirect("/admin/dashboard/favours-recieved/add");
}
