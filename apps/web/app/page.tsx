import Link from "next/link";
import { api } from "~/trpc/server";

export default async function Home() {
  const { status } = await api.health.getHealth.query();
  return (
    <main className="min-h-screen min-w-screen flex justify-center items-center">
      <div className="flex justify-center gap-1.5 flex-col">
        <h1 className="text-3xl">Leetcode ka clone</h1>
        <Link
          href={"/problemset"}
          className="mx-3 my-2 px-3 py-3 border-2 border-white bg-green-600 rounded-3xl"
        >
          Get started with Problems
        </Link>
        <h2>Server Status: {status}</h2>
      </div>
    </main>
  );
}
