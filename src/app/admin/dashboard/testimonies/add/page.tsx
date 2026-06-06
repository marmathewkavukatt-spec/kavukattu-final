import { permanentRedirect } from "next/navigation";

export default function AddTestimonyRedirectPage() {
  permanentRedirect("/admin/dashboard/favours-recieved/add");
}
