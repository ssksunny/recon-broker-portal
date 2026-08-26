import { redirect } from "next/navigation";

/**
 * A broker has exactly one home screen: their loads list. If they're not
 * actually authenticated, the (app) layout's client-side guard bounces
 * them to /login before anything protected renders.
 */
export default function RootPage() {
  redirect("/loads");
}
