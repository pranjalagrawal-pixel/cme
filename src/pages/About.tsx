import React, { useState } from 'react';
import {
  ArrowUpRight,
  BookOpen,
  BriefcaseBusiness,
  GraduationCap,
  Handshake,
  ShieldCheck,
  Users,
  UserRound,
  Landmark,
  Calculator,
  MapPinned,
} from 'lucide-react';

const portalUrl = 'https://cme-internship-portal.vercel.app';

type Person = { name: string; role: string };
type TeamGroup = {
  title: string;
  note: string;
  icon: React.ElementType;
  people: Person[];
};

const teamGroups: TeamGroup[] = [
  {
    title: 'Leadership',
    note: 'Founder and co-founder',
    icon: Landmark,
    people: [
      { name: 'Pranjal Agrawal', role: 'Founder' },
      { name: 'Shambhavi Singh', role: 'Co-Founder' },
    ],
  },
  {
    title: 'Core Team',
    note: 'Core team members',
    icon: Users,
    people: [
      { name: 'Anjani Patel', role: 'Core Team Member' },
      { name: 'Anandi Dewangan', role: 'Core Team Member' },
    ],
  },
  {
    title: 'Operations & Administration',
    note: 'Coordination and administration',
    icon: BriefcaseBusiness,
    people: [
      {
        name: 'Kumbhokarnam Krishna Shree Shrutee Harshita',
        role: 'Operational Team Head',
      },
      {
        name: 'Neha Rawat',
        role: 'Manager — Internship & Training Systems',
      },
      { name: 'Navya Jaiswal', role: 'Accountant' },
    ],
  },
  {
    title: 'Academic Team',
    note: 'Teachers',
    icon: BookOpen,
    people: [
      { name: 'Nikhil', role: 'Teacher' },
      { name: 'Ansh', role: 'Teacher' },
      { name: 'Prerana', role: 'Teacher' },
      { name: 'Ritwika', role: 'Teacher' },
      { name: 'Vibhuti', role: 'Teacher' },
    ],
  },
  {
    title: 'Community & Team',
    note: 'Community and team coordination',
    icon: MapPinned,
    people: [
      { name: 'Chinmay Tiwari', role: 'Community Leader, CME' },
      { name: 'Basava Tejasvi Priya', role: 'CME Team Member' },
    ],
  },
];

function PersonCard({ name, role }: Person) {
  return (
    <li className="flex items-start gap-3 border-t border-[#061F48]/8 py-3 first:border-t-0">
      <span
        aria-hidden="true"
        className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-[#D09515]/20 bg-[#F8F5ED] text-[#8B6513]"
      >
        <UserRound className="h-4 w-4" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block break-words text-sm font-semibold leading-5 text-[#061F48]">
          {name}
        </span>
        <span className="mt-1 block text-xs leading-5 text-[#061F48]/60">
          {role}
        </span>
      </span>
    </li>
  );
}

export default function About() {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'leadership' | 'team' | 'partners'
  >('overview');

  const tabs = [
    { id: 'overview', label: 'About CME' },
    { id: 'leadership', label: 'Leadership' },
    { id: 'team', label: 'Full Team' },
    { id: 'partners', label: 'Partners' },
  ] as const;

  const leaders = [
    {
      name: 'Pranjal Agrawal',
      role: 'Founder',
      icon: Landmark,
      description:
        'Pranjal Agrawal is the Founder of Concept Made Easy Classes (CME) and is currently pursuing a B.Tech in Computer Science and Engineering (CSE), 2nd year, at Chouksey Engineering College. He leads CME’s vision, strategic direction, and organisational development. His focus is on building an accessible, student-centric learning environment that promotes conceptual clarity and practical learning. He aims to develop CME into a structured and impactful educational initiative.',
    },
    {
      name: 'Shambhavi Singh',
      role: 'Co-Founder',
      icon: Users,
      description:
        'Shambhavi Singh is the Co-Founder of Concept Made Easy Classes (CME) and is currently pursuing a B.Tech in Computer Science and Engineering (CSE), 2nd year, at Chouksey Engineering College. She contributes to CME’s organisational development and collaborative initiatives. Her role supports the organisation’s educational vision, teamwork, and continued growth. She works alongside the leadership team to help strengthen CME’s initiatives and learner-focused approach.',
    },
  ];

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-6 sm:px-6 sm:pt-9 lg:px-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-[#D09515]/25 bg-gradient-to-br from-[#061F48] via-[#082653] to-[#0D315D] px-6 py-10 text-white shadow-[0_22px_65px_rgba(6,31,72,.16)] sm:px-10 sm:py-14 lg:px-14">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute right-0 top-0 h-full w-1/3 opacity-20"
          style={{
            backgroundImage:
              'linear-gradient(135deg, transparent 45%, #D09515 45.2%, transparent 45.8%)',
            backgroundSize: '34px 34px',
          }}
        />
        <div className="relative max-w-3xl">
          <p className="text-[10px] font-bold uppercase tracking-[.22em] text-[#E5B94E]">
            Concept Made Easy Classes
          </p>
          <h1 className="mt-4 text-3xl font-semibold leading-tight tracking-[-.035em] sm:text-5xl">
            The people and purpose behind CME.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-7 text-white/75 sm:text-base">
            CME is an education initiative built around clear explanations,
            purposeful practice and helping learners ask better questions. Meet
            the team and explore our working relationships.
          </p>
          <a
            href={portalUrl}
            target="_blank"
            rel="noreferrer"
            className="mt-7 inline-flex min-h-11 items-center gap-2 rounded-lg bg-[#E5B94E] px-5 py-3 text-sm font-semibold text-[#061F48] transition hover:bg-white focus:outline-none focus:ring-2 focus:ring-white"
          >
            Internship &amp; Training Portal
            <ArrowUpRight className="h-4 w-4" />
          </a>
        </div>
      </section>

      <div className="sticky top-[4.5rem] z-30 mt-7 border-b border-[#061F48]/10 bg-[#F8F5ED]/95 py-3 backdrop-blur-xl dark:border-white/10 dark:bg-[#061F48]/95 sm:top-20">
        <div
          className="flex gap-2 overflow-x-auto pb-1"
          role="tablist"
          aria-label="About CME sections"
        >
          {tabs.map((tab) => (
            <button
              key={tab.id}
              role="tab"
              aria-selected={activeTab === tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`shrink-0 rounded-lg px-4 py-2.5 text-xs font-semibold transition sm:px-5 ${
                activeTab === tab.id
                  ? 'bg-[#061F48] text-white'
                  : 'border border-[#061F48]/10 bg-white text-[#061F48]/75 hover:border-[#D09515]/60'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mt-8">
        {activeTab === 'overview' && (
          <section className="grid gap-5 md:grid-cols-3">
            <article className="rounded-2xl border border-[#061F48]/10 bg-white p-6 md:col-span-2 sm:p-8">
              <BookOpen className="h-6 w-6 text-[#9A6B0C]" />
              <h2 className="mt-4 text-2xl font-semibold tracking-tight text-[#061F48]">
                A concept-first approach
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#061F48]/70">
                CME aims to support students through understandable
                explanations, guided practice and a learning environment where
                asking questions is encouraged. Current program details,
                eligibility and availability should be confirmed through
                official CME communication.
              </p>
            </article>
            <article className="rounded-2xl border border-[#D09515]/25 bg-[#FBF5E5] p-6 sm:p-8">
              <ShieldCheck className="h-6 w-6 text-[#9A6B0C]" />
              <h2 className="mt-4 text-xl font-semibold text-[#061F48]">
                People before profiles
              </h2>
              <p className="mt-3 text-sm leading-7 text-[#061F48]/70">
                This directory uses names, roles and simple icons rather than
                stock portraits or AI-generated faces. Personal biographies
                and qualifications are only added when confirmed.
              </p>
            </article>
          </section>
        )}

        {activeTab === 'leadership' && (
          <section>
            <div className="mb-6 max-w-2xl">
              <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#9A6B0C]">
                Leadership
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#061F48] sm:text-3xl">
                Founder &amp; Co-Founder
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#061F48]/65">
                Meet the leadership team behind Concept Made Easy Classes.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              {leaders.map((person) => {
                const Icon = person.icon;
                return (
                  <article
                    key={person.name}
                    className="rounded-3xl border border-[#061F48]/10 bg-white p-6 shadow-[0_8px_28px_rgba(6,31,72,.04)] dark:border-white/10 dark:bg-[#0A1E3D] sm:p-8"
                  >
                    <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-[#D09515]/25 bg-[#FBF5E5] text-[#8B6513]">
                      <Icon className="h-5 w-5" />
                    </div>
                    <p className="mt-5 text-[10px] font-bold uppercase tracking-[.18em] text-[#9A6B0C]">
                      {person.role}
                    </p>
                    <h3 className="mt-1 text-xl font-semibold tracking-tight text-[#061F48]">
                      {person.name}
                    </h3>
                    <p className="mt-3 text-sm leading-7 text-[#061F48]/70 dark:text-white/75">
                      {person.description}
                    </p>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {activeTab === 'team' && (
          <section>
            <div className="mb-6 max-w-2xl">
              <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#9A6B0C]">
                Team directory
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#061F48] sm:text-3xl">
                The wider CME team
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#061F48]/65">
                Names and roles currently available in CME&apos;s team
                information. No profile photos are used. Roles may be updated
                as responsibilities change.
              </p>
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-2">
              {teamGroups.map((group) => {
                const Icon = group.icon;
                return (
                  <article
                    key={group.title}
                    className="rounded-3xl border border-[#061F48]/10 bg-white p-5 shadow-[0_8px_28px_rgba(6,31,72,.04)] transition duration-300 hover:-translate-y-1 hover:border-[#D09515]/40 hover:shadow-[0_18px_42px_rgba(6,31,72,.08)] dark:border-white/10 dark:bg-[#0A1E3D] sm:p-6"
                  >
                    <div className="flex items-center gap-3 border-b border-[#061F48]/10 pb-4">
                      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#FBF5E5] text-[#8B6513]">
                        <Icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-[#061F48]">
                          {group.title}
                        </h3>
                        <p className="mt-0.5 text-xs text-[#061F48]/55">
                          {group.note}
                        </p>
                      </div>
                    </div>
                    <ul className="mt-2">
                      {group.people.map((person) => (
                        <PersonCard key={person.name} {...person} />
                      ))}
                    </ul>
                  </article>
                );
              })}
            </div>
          </section>
        )}

        {activeTab === 'partners' && (
          <section>
            <div className="mb-6 max-w-2xl">
              <p className="text-[10px] font-bold uppercase tracking-[.2em] text-[#9A6B0C]">
                Partnerships
              </p>
              <h2 className="mt-2 text-2xl font-semibold tracking-tight text-[#061F48] sm:text-3xl">
                Partners &amp; communities
              </h2>
              <p className="mt-3 text-sm leading-6 text-[#061F48]/65">
                Listed relationships are presented without implying
                endorsements or services beyond the information provided to
                CME.
              </p>
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <article className="rounded-3xl border border-[#061F48]/10 bg-white p-6 shadow-[0_8px_28px_rgba(6,31,72,.04)] dark:border-white/10 dark:bg-[#0A1E3D] sm:p-8">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FBF5E5] text-[#8B6513]">
                  <Handshake className="h-5 w-5" />
                </div>
                <p className="mt-4 text-[10px] font-bold uppercase tracking-[.18em] text-[#9A6B0C]">
                  Partner
                </p>
                <h3 className="mt-1 text-xl font-semibold text-[#061F48]">
                  Sarthak Singh
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#061F48]/65 dark:text-white/75">
                  Sarthak Singh is a partner of Concept Made Easy Classes (CME)
                  and is currently pursuing a B.Tech degree in his second year.
                  He is from Jharkhand and contributes to CME’s collaborative
                  initiatives and partnership activities. His association with
                  CME supports efforts to build meaningful connections and
                  create opportunities for students through education and
                  collaboration.
                </p>
              </article>
              <article className="rounded-3xl border border-[#061F48]/10 bg-white p-6 shadow-[0_8px_28px_rgba(6,31,72,.04)] dark:border-white/10 dark:bg-[#0A1E3D] sm:p-8">
                <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[#FBF5E5] text-[#8B6513]">
                  <BriefcaseBusiness className="h-5 w-5" />
                </div>
                <p className="mt-4 text-[10px] font-bold uppercase tracking-[.18em] text-[#9A6B0C]">
                  Partnered community
                </p>
                <h3 className="mt-1 text-xl font-semibold text-[#061F48]">
                  Knowledge Nexus
                </h3>
                <p className="mt-2 text-sm leading-6 text-[#061F48]/65 dark:text-white/75">
                  Knowledge Nexus is a student-focused community that helps
                  learners access free learning resources and discover
                  opportunities for personal and professional growth. Its
                  opportunities include job openings, internships, hackathons,
                  learning materials, and other student-oriented initiatives.
                  The community aims to help students explore new skills, stay
                  informed about opportunities, and connect with resources that
                  support their academic and career development.
                </p>
              </article>
            </div>
          </section>
        )}
      </div>

      <section className="mt-10 flex flex-col gap-4 rounded-2xl border border-[#061F48]/10 bg-white p-6 sm:flex-row sm:items-center sm:justify-between sm:p-8">
        <div className="flex gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#FBF5E5] text-[#8B6513]">
            <GraduationCap className="h-6 w-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-[#061F48]">
              Internship &amp; Training
            </h2>
            <p className="mt-1 text-sm leading-6 text-[#061F48]/65">
              Visit the dedicated CME portal for internship and training
              information.
            </p>
          </div>
        </div>
        <a
          href={portalUrl}
          target="_blank"
          rel="noreferrer"
          className="inline-flex min-h-11 shrink-0 items-center justify-center gap-2 rounded-lg bg-[#061F48] px-5 py-3 text-sm font-semibold text-white transition hover:bg-[#9A6B0C]"
        >
          Open portal
          <ArrowUpRight className="h-4 w-4" />
        </a>
      </section>

      <p className="mt-5 flex items-center gap-2 text-xs text-[#061F48]/55">
        <Calculator className="h-4 w-4" />
        For official enquiries, email{' '}
        <a
          className="font-semibold underline underline-offset-2"
          href="mailto:conceptmadeeasyclasses@gmail.com"
        >
          conceptmadeeasyclasses@gmail.com
        </a>
        .
      </p>
    </div>
  );
}
