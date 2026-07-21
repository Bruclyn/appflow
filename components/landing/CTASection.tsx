import Link from 'next/link'

export function CTASection() {
  return (
    <section className="bg-[#0F172A] py-24">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Ready to hire based on what candidates can actually do?
        </h2>
        <div className="mt-10 flex flex-col justify-center gap-3 sm:flex-row">
          <Link
            href="/register"
            className="inline-flex h-12 items-center justify-center rounded-full bg-primary px-7 text-base font-semibold text-white transition hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 focus-visible:ring-offset-2 focus-visible:ring-offset-[#0F172A]"
          >
            Start Hiring
          </Link>
          <Link
            href="/register"
            className="inline-flex h-12 items-center justify-center rounded-full border border-white/30 bg-transparent px-7 text-base font-semibold text-white transition hover:bg-white/10"
          >
            Find Opportunities
          </Link>
        </div>
      </div>
    </section>
  )
}
