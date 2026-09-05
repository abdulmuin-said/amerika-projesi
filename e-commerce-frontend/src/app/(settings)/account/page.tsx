import { redirect } from "next/navigation";

export default function MyAccount() {
    redirect("/account/settings");
};
