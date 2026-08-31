import { redirect } from "next/navigation";

// The app entry point. The proxy has already checked auth by the time we get
// here, so just send everyone to their dashboard (or the login page).
export default function RootPage() {
  redirect("/today");
}
