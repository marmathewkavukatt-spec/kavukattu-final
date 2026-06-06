import { permanentRedirect } from "next/navigation";

export default function TestimoniesRedirectPage() {
  permanentRedirect("/admin/dashboard/favours-recieved/view");
}
