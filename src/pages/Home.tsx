import React from 'react';
import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BookOpen,
  Brain,
  CheckCircle2,
  ChevronRight,
  GraduationCap,
  HeartHandshake,
  Lightbulb,
  Sparkles,
  Target,
  Trophy,
  Users,
  ClipboardCheck,
  Compass,
} from 'lucide-react';
import { ConceptLogo } from '../components/Logos';

const learningPaths = [
  {
    eyebrow: 'SCHOOL LEARNING',
    title: 'Classes 6–10',
    description: 'Build strong foundations, understand the “why”, and prepare with confidence for school assessments.',
    tags: ['Concept clarity', 'School subjects', 'Practice'],
    href: '/programs',
    tone: 'cream',
    icon: BookOpen,
  },
  {
    eyebrow: 'SENIOR SECONDARY',
    title: 'Classes 11–12',
    description: 'Strengthen subject fundamentals and develop a steady, structured approach to exam preparation.',
    tags: ['Subject mastery', 'Revision', 'Problem solving'],
    href: '/programs',
    tone: 'blue',
    icon: GraduationCap,
  },
  {
    eyebrow: 'ENTRANCE PREPARATION',
    title: 'JEE & NEET',
    description: 'Prepare through concept-led study, purposeful practice, and test-focused learning support.',
    tags: ['JEE', 'NEET', 'Test practice'],
    href: '/test-series',
    tone: 'gold',
    icon: Target,
  },
];

const principles = [
  {
    icon: Lightbulb,
    title: 'Understand first',
    description: 'Make room for clear explanations and the reasoning behind each concept—not just memorisation.',
  },
  {
    icon: ClipboardCheck,
    title: 'Practise with purpose',
    description: 'Use questions, revision, and test practice to turn what you learn into skills you can apply.',
  },
  {
    icon: HeartHandshake,
    title: 'Get support as you learn',
    description: 'Keep academic guidance and doubt support part of your learning journey.',
  },
];

const tools = [
  { icon: Brain, title: 'Study support', description: 'A focused place to continue your learning journey.', href: '/student-portal' },
  { icon: ClipboardCheck, title: 'Test practice', description: 'Explore test-series options and exam practice.', href: '/test-series' },
  { icon: Sparkles, title: 'Scholarship information', description: 'Review the available scholarship and fee-concession process.', href: '/scholarship' },
  { icon: Compass, title: 'Find your programme', description: 'Explore learning options that fit your academic stage.', href: '/programs' },
];

export default function Home() {
  return (
    <main className="overflow-hidden bg-[#FBFAF7] text-[#10264A] dark:bg-[#06152F] dark:text-white">
      {/* Hero */}
      <section className="relative isolate">
        <div aria-hidden="true" className="pointer-events-none absolute -right-24 -top-28 h-80 w-80 rounded-full bg-[#D7A52A]/15 blur-3xl" />
        <div aria-hidden="true" className="pointer-events-none absolute -left-28 bottom-0 h-72 w-72 rounded-full bg-blue-200/25 blur-3xl dark:bg-blue-500/10" />

        <div className="relative mx-auto grid max-w-7xl items-center gap-12 px-5 pb-16 pt-14 sm:px-8 sm:pb-20 sm:pt-20 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:px-10 lg:pb-24 lg:pt-24">
          <div className="relative z-10">
            <div className="mb-7 inline-flex items-center gap-2 rounded-full border border-[#D7A52A]/35 bg-white/80 px-4 py-2 text-[11px] font-extrabold uppercase tracking-[0.16em] text-[#10264A] shadow-sm dark:border-white/10 dark:bg-white/5 dark:text-[#F3D68A]">
              <span className="h-2 w-2 rounded-full bg-[#D7A52A]" />
              Learning built around understanding
            </div>

            <h1 className="max-w-3xl text-4xl font-black leading-[1.06] tracking-[-0.045em] sm:text-5xl md:text-6xl xl:text-[4.35rem]">
              Learn the concept.
              <span className="mt-1 block text-[#B98516] dark:text-[#E9C66E]">Own the outcome.</span>
            </h1>

            <p className="mt-6 max-w-2xl text-base leading-7 text-[#52617A] dark:text-slate-300 sm:text-lg sm:leading-8">
              Concept Made Easy Classes helps students build understanding, practise with purpose, and move forward with greater confidence—from school learning to JEE and NEET preparation.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                to="/programs"
                className="group inline-flex min-h-14 items-center justify-center gap-3 rounded-2xl bg-[#10264A] px-7 py-4 text-sm font-extrabold text-white shadow-[0_12px_30px_rgba(16,38,74,0.18)] transition hover:-translate-y-0.5 hover:bg-[#1A396B] focus:outline-none focus:ring-4 focus:ring-[#D7A52A]/30 dark:bg-[#E8C66D] dark:text-[#10264A] dark:hover:bg-[#F1D88F]"
              >
                Explore learning programmes
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
              <Link
                to="/about"
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-2xl border border-[#10264A]/15 bg-white/75 px-7 py-4 text-sm font-extrabold text-[#10264A] transition hover:border-[#D7A52A] hover:bg-white focus:outline-none focus:ring-4 focus:ring-[#D7A52A]/20 dark:border-white/15 dark:bg-white/5 dark:text-white dark:hover:bg-white/10"
              >
                Get to know CME
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>

            <div className="mt-9 flex flex-wrap gap-x-6 gap-y-3 border-t border-[#10264A]/10 pt-6 text-sm font-semibold text-[#52617A] dark:border-white/10 dark:text-slate-300">
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#B98516]" /> Concept-first learning</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#B98516]" /> Practice-led progress</span>
              <span className="inline-flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-[#B98516]" /> Student-focused support</span>
            </div>
          </div>

          <div className="relative mx-auto w-full max-w-xl lg:max-w-none">
            <div aria-hidden="true" className="absolute inset-5 rounded-[2.5rem] bg-[#D7A52A]/15 blur-2xl" />
            <div className="relative overflow-hidden rounded-[2rem] border border-white/80 bg-white p-5 shadow-[0_28px_80px_rgba(16,38,74,0.13)] dark:border-white/10 dark:bg-[#0B2043] sm:rounded-[2.5rem] sm:p-7">
              <div className="flex items-center justify-between border-b border-[#10264A]/10 pb-4 dark:border-white/10">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#B98516]">The CME approach</p>
                  <p className="mt-1 text-lg font-extrabold text-[#10264A] dark:text-white">A clearer way to learn</p>
                </div>
                <div className="grid h-11 w-11 place-items-center rounded-2xl bg-[#F7EBCB] text-[#10264A] dark:bg-[#D7A52A]/15 dark:text-[#E9C66E]">
                  <Sparkles className="h-5 w-5" />
                </div>
              </div>

              <div className="grid min-h-[270px] place-items-center py-5 sm:min-h-[320px]">
                <ConceptLogo className="h-auto max-h-[300px] w-full max-w-[330px] drop-shadow-sm" />
              </div>

              <div className="grid grid-cols-3 gap-2 sm:gap-3">
                {[
                  { n: '01', title: 'Understand', text: 'Build clarity' },
                  { n: '02', title: 'Practise', text: 'Apply learning' },
                  { n: '03', title: 'Progress', text: 'Keep improving' },
                ].map((step) => (
                  <div key={step.n} className="rounded-2xl bg-[#F7F5EF] p-3 dark:bg-white/5 sm:p-4">
                    <span className="text-[10px] font-black tracking-widest text-[#B98516]">{step.n}</span>
                    <p className="mt-1 text-xs font-extrabold text-[#10264A] dark:text-white sm:text-sm">{step.title}</p>
                    <p className="mt-1 text-[10px] leading-4 text-[#65718A] dark:text-slate-400 sm:text-xs">{step.text}</p>
                  </div>
                ))}
              </div>
            </div>
            <div className="absolute -bottom-4 -left-2 hidden items-center gap-3 rounded-2xl border border-white/80 bg-white px-4 py-3 shadow-lg dark:border-white/10 dark:bg-[#10264A] sm:flex">
              <div className="grid h-10 w-10 place-items-center rounded-xl bg-[#10264A] text-[#E9C66E] dark:bg-[#D7A52A]/15">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <p className="text-xs font-extrabold text-[#10264A] dark:text-white">Concept before memorisation</p>
                <p className="mt-0.5 text-[11px] text-[#65718A] dark:text-slate-400">A principle for every learner</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Learning paths */}
      <section className="border-y border-[#10264A]/8 bg-white/70 py-16 dark:border-white/10 dark:bg-white/[0.025] sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mb-10 flex flex-col gap-4 sm:mb-12 sm:flex-row sm:items-end sm:justify-between">
            <div className="max-w-2xl">
              <p className="text-xs font-black uppercase tracking-[0.2em] text-[#B98516]">Choose your learning path</p>
              <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-[#10264A] dark:text-white sm:text-4xl">A starting point for every stage.</h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-[#65718A] dark:text-slate-300 sm:text-base">Explore the learning options relevant to where you are today—and where you want to go next.</p>
            </div>
            <Link to="/programs" className="inline-flex items-center gap-2 text-sm font-extrabold text-[#10264A] transition hover:text-[#B98516] dark:text-[#E9C66E]">
              View all programmes <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-5 lg:grid-cols-3">
            {learningPaths.map(({ eyebrow, title, description, tags, href, tone, icon: Icon }) => (
              <article
                key={title}
                className={`group relative flex h-full flex-col overflow-hidden rounded-[1.75rem] border p-6 transition duration-300 hover:-translate-y-1 hover:shadow-[0_20px_50px_rgba(16,38,74,0.10)] sm:p-7 ${
                  tone === 'blue'
                    ? 'border-[#10264A] bg-[#10264A] text-white'
                    : tone === 'gold'
                    ? 'border-[#E4C66F]/60 bg-[#F8EDCF] text-[#10264A] dark:border-[#D7A52A]/30 dark:bg-[#D7A52A]/10 dark:text-white'
                    : 'border-[#10264A]/10 bg-[#FBFAF7] text-[#10264A] dark:border-white/10 dark:bg-[#0B2043] dark:text-white'
                }`}
              >
                <div className="mb-7 flex items-start justify-between">
                  <div className={`grid h-12 w-12 place-items-center rounded-2xl ${
                    tone === 'blue' ? 'bg-white/10 text-[#E9C66E]' : tone === 'gold' ? 'bg-white/70 text-[#9A6B0B] dark:bg-white/10 dark:text-[#E9C66E]' : 'bg-[#10264A] text-[#E9C66E] dark:bg-[#D7A52A]/15'
                  }`}>
                    <Icon className="h-6 w-6" />
                  </div>
                  <span className={`rounded-full px-3 py-1.5 text-[9px] font-black tracking-[0.14em] ${
                    tone === 'blue' ? 'bg-white/10 text-[#F3D68A]' : 'bg-[#D7A52A]/15 text-[#94660D] dark:text-[#E9C66E]'
                  }`}>{eyebrow}</span>
                </div>
                <h3 className="text-2xl font-black tracking-tight">{title}</h3>
                <p className={`mt-3 min-h-[72px] text-sm leading-6 ${tone === 'blue' ? 'text-white/75' : 'text-[#65718A] dark:text-slate-300'}`}>{description}</p>
                <div className="mt-5 flex flex-wrap gap-2">
                  {tags.map((tag) => (
                    <span key={tag} className={`rounded-full px-3 py-1.5 text-[10px] font-bold ${tone === 'blue' ? 'bg-white/10 text-white/85' : 'bg-[#10264A]/5 text-[#52617A] dark:bg-white/5 dark:text-slate-300'}`}>{tag}</span>
                  ))}
                </div>
                <Link to={href} className={`mt-7 inline-flex items-center gap-2 border-t pt-5 text-sm font-extrabold transition group-hover:gap-3 ${
                  tone === 'blue' ? 'border-white/15 text-[#F3D68A]' : 'border-[#10264A]/10 text-[#10264A] dark:border-white/10 dark:text-[#E9C66E]'
                }`}>
                  Explore this path <ArrowRight className="h-4 w-4" />
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      {/* Method */}
      <section className="py-16 sm:py-24">
        <div className="mx-auto grid max-w-7xl gap-12 px-5 sm:px-8 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:gap-20 lg:px-10">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#B98516]">The learning philosophy</p>
            <h2 className="mt-4 text-3xl font-black leading-tight tracking-[-0.04em] text-[#10264A] dark:text-white sm:text-4xl">Good learning goes beyond the answer.</h2>
            <p className="mt-5 text-sm leading-7 text-[#65718A] dark:text-slate-300 sm:text-base">
              It starts with a question, grows through understanding, and becomes stronger with practice. CME’s learning philosophy puts the process—not shortcuts—at the centre.
            </p>
            <Link to="/about" className="mt-7 inline-flex items-center gap-2 rounded-xl bg-[#10264A] px-5 py-3.5 text-sm font-extrabold text-white transition hover:bg-[#1A396B] dark:bg-[#E8C66D] dark:text-[#10264A]">
              Discover our approach <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="space-y-4">
            {principles.map(({ icon: Icon, title, description }, index) => (
              <div key={title} className="group flex gap-4 rounded-2xl border border-[#10264A]/10 bg-white p-5 transition hover:border-[#D7A52A]/50 hover:shadow-lg dark:border-white/10 dark:bg-white/[0.035] sm:gap-5 sm:p-6">
                <div className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#F7EBCB] text-[#10264A] dark:bg-[#D7A52A]/15 dark:text-[#E9C66E]">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-3">
                    <h3 className="text-base font-extrabold text-[#10264A] dark:text-white sm:text-lg">{title}</h3>
                    <span className="text-[10px] font-black tracking-widest text-[#B98516]">0{index + 1}</span>
                  </div>
                  <p className="mt-2 text-sm leading-6 text-[#65718A] dark:text-slate-300">{description}</p>
                </div>
                <ArrowRight className="mt-1 hidden h-4 w-4 shrink-0 text-[#B98516] transition group-hover:translate-x-1 sm:block" />
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Student tools */}
      <section className="bg-[#F1EFE8] py-16 dark:bg-[#091B38] sm:py-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
          <div className="mx-auto mb-10 max-w-2xl text-center sm:mb-12">
            <p className="text-xs font-black uppercase tracking-[0.2em] text-[#B98516]">Your next step</p>
            <h2 className="mt-3 text-3xl font-black tracking-[-0.035em] text-[#10264A] dark:text-white sm:text-4xl">Find the support you need.</h2>
            <p className="mt-4 text-sm leading-6 text-[#65718A] dark:text-slate-300 sm:text-base">Jump straight to a useful part of the CME learning experience.</p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tools.map(({ icon: Icon, title, description, href }) => (
              <Link key={title} to={href} className="group rounded-2xl border border-[#10264A]/10 bg-white p-5 transition duration-200 hover:-translate-y-1 hover:border-[#D7A52A]/60 hover:shadow-xl dark:border-white/10 dark:bg-white/[0.04] sm:p-6">
                <div className="flex items-center justify-between">
                  <div className="grid h-11 w-11 place-items-center rounded-xl bg-[#10264A] text-[#E9C66E] dark:bg-[#D7A52A]/15">
                    <Icon className="h-5 w-5" />
                  </div>
                  <ArrowRight className="h-4 w-4 text-[#B98516] transition-transform group-hover:translate-x-1" />
                </div>
                <h3 className="mt-5 text-base font-extrabold text-[#10264A] dark:text-white">{title}</h3>
                <p className="mt-2 text-sm leading-6 text-[#65718A] dark:text-slate-300">{description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="px-5 py-16 sm:px-8 sm:py-24 lg:px-10">
        <div className="relative mx-auto max-w-7xl overflow-hidden rounded-[2rem] bg-[#10264A] px-6 py-10 text-white shadow-[0_25px_70px_rgba(16,38,74,0.22)] sm:rounded-[2.5rem] sm:px-12 sm:py-14 lg:px-16">
          <div aria-hidden="true" className="pointer-events-none absolute -right-16 -top-24 h-72 w-72 rounded-full border-[45px] border-[#D7A52A]/10" />
          <div aria-hidden="true" className="pointer-events-none absolute -bottom-24 right-1/3 h-56 w-56 rounded-full bg-[#D7A52A]/10 blur-3xl" />
          <div className="relative flex flex-col items-start justify-between gap-8 md:flex-row md:items-center">
            <div className="max-w-2xl">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#E9C66E]/25 bg-white/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.18em] text-[#F3D68A]">
                <Trophy className="h-3.5 w-3.5" /> Take the next step
              </div>
              <h2 className="mt-5 text-3xl font-black leading-tight tracking-[-0.04em] sm:text-4xl">Your learning journey starts with one clear concept.</h2>
              <p className="mt-4 max-w-xl text-sm leading-6 text-white/70 sm:text-base">Explore programmes, learn about CME, or review scholarship information to find the next step that works for you.</p>
            </div>
            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row md:flex-col">
              <Link to="/programs" className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-[#E8C66D] px-6 py-3 text-sm font-extrabold text-[#10264A] transition hover:bg-[#F3D98E]">
                Explore programmes <ArrowRight className="h-4 w-4" />
              </Link>
              <Link to="/scholarship" className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/20 px-6 py-3 text-sm font-extrabold text-white transition hover:bg-white/10">
                Scholarship information
              </Link>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
