import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  Sparkles,
  Search,
  ShieldCheck,
  Bell,
  ArrowRight,
  LayoutGrid,
  CalendarCheck,
  CheckCircle2,
} from 'lucide-react';
import Button from '../../components/Button';
import Card from '../../components/Card';

const fadeUp = {
  hidden: { opacity: 0, y: 16 },
  visible: (i = 0) => ({
    opacity: 1,
    y: 0,
    transition: { duration: 0.5, delay: i * 0.08, ease: 'easeOut' },
  }),
};

const FEATURES = [
  {
    icon: Search,
    title: 'Browse in real time',
    description: 'See which labs, halls, and equipment are actually available before you request a slot.',
  },
  {
    icon: ShieldCheck,
    title: 'No double-bookings',
    description: 'Overlapping requests — and anything inside the required buffer window — are blocked automatically.',
  },
  {
    icon: Bell,
    title: 'Live status updates',
    description: "Know the moment your booking is approved, rejected, or modified — no refreshing required.",
  },
];

const STEPS = [
  {
    icon: LayoutGrid,
    title: 'Browse & filter',
    description: 'Search across computer labs, seminar halls, projectors, cameras, and meeting rooms.',
  },
  {
    icon: CalendarCheck,
    title: 'Request a booking',
    description: 'Pick a date and time, add a reason, and accept the usage undertaking.',
  },
  {
    icon: CheckCircle2,
    title: 'Get notified instantly',
    description: "An admin reviews your request — you'll see the decision the moment it happens.",
  },
];

function LandingPage() {
  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-hidden">
        <div
          className="pointer-events-none absolute left-1/2 top-[-120px] h-[480px] w-[780px] -translate-x-1/2 rounded-full bg-accent/10 blur-[140px]"
          aria-hidden="true"
        />
        <div
          className="pointer-events-none absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              'linear-gradient(to right, #fafafa 1px, transparent 1px), linear-gradient(to bottom, #fafafa 1px, transparent 1px)',
            backgroundSize: '48px 48px',
          }}
          aria-hidden="true"
        />

        <div className="relative mx-auto max-w-6xl px-6 py-24 text-center sm:py-32">
          <motion.div
            initial="hidden"
            animate="visible"
            custom={0}
            variants={fadeUp}
            className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-muted"
          >
            <Sparkles className="h-3.5 w-3.5 text-accent" />
            Now with real-time booking updates
          </motion.div>

          <motion.h1
            initial="hidden"
            animate="visible"
            custom={1}
            variants={fadeUp}
            className="mx-auto mt-6 max-w-3xl text-4xl font-semibold tracking-tight text-foreground sm:text-6xl"
          >
            Book campus resources <span className="text-accent">without the back-and-forth</span>
          </motion.h1>

          <motion.p
            initial="hidden"
            animate="visible"
            custom={2}
            variants={fadeUp}
            className="mx-auto mt-5 max-w-xl text-base text-muted sm:text-lg"
          >
            Reserve labs, seminar halls, equipments, and meeting rooms in a few clicks —
            and know exactly where your booking stands, in real time.
          </motion.p>

          <motion.div
            initial="hidden"
            animate="visible"
            custom={3}
            variants={fadeUp}
            className="mt-9 flex flex-col items-center justify-center gap-3 sm:flex-row"
          >
            <Link to="/register">
              <Button variant="primary" size="lg">
                Get started <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
            <Link to="/login">
              <Button variant="secondary" size="lg">
                I already have an account
              </Button>
            </Link>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">
              Built for how campus bookings actually work
            </h2>
            <p className="mt-3 text-sm text-muted sm:text-base">
              Every rule below is enforced on the backend, not just hinted at in the UI.
            </p>
          </div>

          <div className="mt-12 grid gap-4 sm:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, description }) => (
              <Card
                key={title}
                className="transition-all duration-200 hover:-translate-y-0.5 hover:border-border-hover"
              >
                <div className="inline-flex h-9 w-9 items-center justify-center rounded-btn bg-accent/10 text-accent">
                  <Icon className="h-4 w-4" />
                </div>
                <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{description}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="border-t border-border bg-surface/30 py-20">
        <div className="mx-auto max-w-6xl px-6">
          <div className="mx-auto max-w-xl text-center">
            <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">Three steps, start to finish</h2>
          </div>

          <div className="mt-12 grid gap-8 sm:grid-cols-3">
            {STEPS.map(({ icon: Icon, title, description }, index) => (
              <div key={title}>
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background text-sm font-semibold text-accent">
                    {index + 1}
                  </div>
                  <Icon className="h-4 w-4 text-muted-foreground" />
                </div>
                <h3 className="mt-4 font-semibold text-foreground">{title}</h3>
                <p className="mt-1.5 text-sm leading-relaxed text-muted">{description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="border-t border-border py-20">
        <div className="mx-auto max-w-2xl px-6 text-center">
          <h2 className="text-2xl font-semibold text-foreground sm:text-3xl">Ready to book your first resource?</h2>
          <p className="mt-3 text-sm text-muted sm:text-base">
            Registration takes under a minute — no approval needed to create an account.
          </p>
          <div className="mt-7">
            <Link to="/register">
              <Button variant="primary" size="lg">
                Create your account <ArrowRight className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border py-8">
        <div className="mx-auto max-w-6xl px-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} ReserveOne. A full-stack web platform to manage campus facilities
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;