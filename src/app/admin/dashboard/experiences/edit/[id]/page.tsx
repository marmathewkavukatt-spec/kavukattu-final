import { permanentRedirect } from "next/navigation";

export default function AdminEditOldFavourRecievedRedirectPage({
  params,
}: {
  params: { id: string };
}) {
  permanentRedirect(`/admin/dashboard/favours-recieved/edit/${params.id}`);
}
