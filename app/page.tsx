import TaskManager from "@/components/TaskManager";
import QuoteBanner from "@/components/QuoteBanner";

export default function Home() {
  return (
    <div className="min-h-screen w-full bg-zinc-50 px-4 py-10 text-zinc-900 dark:bg-zinc-950 dark:text-zinc-100 sm:py-16">
      <main className="mx-auto w-full max-w-2xl">
        <header className="mb-8 text-center sm:text-left">
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            Task Manager
          </h1>
          <p className="mt-2 text-zinc-500 dark:text-zinc-400">
            Add, edit, complete, and delete your tasks.
          </p>
          <QuoteBanner />
        </header>
        <TaskManager />
      </main>
    </div>
  );
}
