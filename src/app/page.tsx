import { getServerSession } from "next-auth/next";
import { authOptions, ExtendedSession } from "@/lib/nextAuth";
import { redirect } from "next/navigation";

export default async function Home() {
  const session = (await getServerSession(authOptions)) as ExtendedSession;
  if (session?.error || !session?.user) {
    redirect("/api/auth/signin");
  }

  return (
    <div className="bg-black h-screen text-white">
      <h1>Hello World</h1>
      <p>{session?.user?.email}</p>
    </div>
  );
}
