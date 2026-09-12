import { Link } from 'react-router-dom';
import {
  ArrowRight,
  BarChart3,
  Check,
  CircleCheck,
  Layers3,
  Menu,
  Play,
  Sparkles,
  Users,
  X,
} from 'lucide-react';
import { useState } from 'react';
import heroImage from '../assets/hero.png';

const features = [
  {
    icon: Layers3,
    eyebrow: 'One source of truth',
    title: 'Bring every moving part into focus.',
    text: 'Projects, issues, tasks, and team conversations stay connected in one calm workspace.',
  },
  {
    icon: BarChart3,
    eyebrow: 'Momentum, visible',
    title: 'Know what is moving and what is not.',
    text: 'See progress, blockers, and delivery signals before they become surprises.',
  },
  {
    icon: Users,
    eyebrow: 'Built for teams',
    title: 'Give everyone the right view.',
    text: 'Make ownership clear and keep collaborators aligned from kickoff to launch.',
  },
];

const steps = [
  ['01', 'Shape the work', 'Turn an idea into a project with milestones, owners, and a clear finish line.'],
  ['02', 'Move together', 'Plan sprints, assign tasks, and make the next best action obvious.'],
  ['03', 'Deliver with confidence', 'Use live progress and activity signals to keep momentum all the way through.'],
];

function Landing() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="min-h-screen overflow-hidden bg-[#fbf9f7] font-sans text-[#211b25]">
      <nav className="relative z-10 mx-auto flex h-[84px] max-w-[1240px] items-center justify-between px-5 sm:px-8" aria-label="Primary navigation">
        <Link className="inline-flex items-center gap-2.5 text-[17px] font-bold tracking-[-0.03em] text-[#211b25] no-underline" to="/" aria-label="ProjectPulse home">
          <span className="flex h-[34px] w-[34px] items-center justify-center rounded-[9px] bg-[#713450] font-serif text-[22px] text-white">P</span>
          <span>ProjectPulse</span>
        </Link>

        <div className={`${menuOpen ? 'flex' : 'hidden'} absolute left-0 right-0 top-[72px] flex-col items-stretch gap-0 border-b border-[#e7dedf] bg-[#fbf9f7] px-5 pb-5 pt-3 sm:static sm:flex sm:flex-row sm:items-center sm:gap-[30px] sm:border-0 sm:bg-transparent sm:p-0`}>
          <a className="py-3 text-[13px] font-semibold text-[#756b77] transition hover:text-[#713450] sm:p-0" href="#features" onClick={() => setMenuOpen(false)}>Features</a>
          <a className="py-3 text-[13px] font-semibold text-[#756b77] transition hover:text-[#713450] sm:p-0" href="#workflow" onClick={() => setMenuOpen(false)}>How it works</a>
          <a className="py-3 text-[13px] font-semibold text-[#756b77] transition hover:text-[#713450] sm:p-0" href="#teams" onClick={() => setMenuOpen(false)}>For teams</a>
          <div className="mt-2 flex items-center gap-5 border-t border-[#e7dedf] pt-4 sm:hidden">
            <Link className="text-[13px] font-semibold text-[#756b77]" to="/login">Log in</Link>
            <Link className="ml-auto inline-flex items-center justify-center gap-2.5 rounded-[5px] border border-[#713450] bg-[#713450] px-[15px] py-2.5 text-[13px] font-bold text-white shadow-[0_7px_18px_rgba(113,52,80,.14)]" to="/register">Get started <ArrowRight size={15} /></Link>
          </div>
        </div>

        <div className="hidden items-center gap-[30px] sm:flex">
          <Link className="text-[13px] font-semibold text-[#756b77] transition hover:text-[#713450]" to="/login">Log in</Link>
          <Link className="inline-flex items-center justify-center gap-2.5 rounded-[5px] border border-[#713450] bg-[#713450] px-[15px] py-2.5 text-[13px] font-bold text-white shadow-[0_7px_18px_rgba(113,52,80,.14)] transition hover:-translate-y-0.5 hover:bg-[#5e2943]" to="/register">Get started <ArrowRight size={15} /></Link>
        </div>
        <button className="p-1.5 text-[#211b25] sm:hidden" type="button" aria-label="Toggle menu" onClick={() => setMenuOpen((open) => !open)}>
          {menuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </nav>

      <section className="mx-auto grid max-w-[1240px] gap-9 px-5 pb-[70px] pt-[50px] sm:px-8 sm:pb-[100px] sm:pt-20 lg:min-h-[630px] lg:grid-cols-[minmax(370px,.9fr)_1.1fr] lg:gap-[50px]">
        <div className="self-center pb-3 lg:pt-2.5">
          <div className="inline-flex items-center gap-2 font-mono text-[10px] uppercase tracking-[.14em] text-[#b4627d]"><Sparkles size={14} /> The operating system for ambitious teams</div>
          <h1 className="mt-6 max-w-[600px] font-serif text-[clamp(52px,16vw,76px)] font-semibold leading-[.94] tracking-[-.065em] sm:text-[clamp(56px,7vw,92px)]">Make the work <em className="text-[#b4627d]">feel lighter.</em></h1>
          <p className="mt-6 max-w-[440px] text-[15px] leading-[1.65] text-[#756b77] sm:text-[17px]">ProjectPulse gives your team a clear, shared rhythm for planning, building, and shipping great work.</p>
          <div className="mt-8 flex flex-wrap items-center gap-6">
            <Link className="inline-flex items-center justify-center gap-2.5 rounded-[5px] border border-[#713450] bg-[#713450] px-5 py-[15px] text-[13px] font-bold text-white shadow-[0_7px_18px_rgba(113,52,80,.14)] transition hover:-translate-y-0.5 hover:bg-[#5e2943]" to="/register">Start your workspace <ArrowRight size={18} /></Link>
            <a className="inline-flex items-center gap-2 text-[13px] font-bold text-[#211b25]" href="#workflow"><span className="flex h-7 w-7 items-center justify-center rounded-full border border-[#cbbdc2]"><Play size={13} fill="currentColor" /></span> See how it works</a>
          </div>
          <div className="mt-5 flex items-center gap-1.5 text-[11px] text-[#9a8d96]"><CircleCheck size={16} className="text-[#b4627d]" /> Free to start · No credit card required</div>
        </div>

        <div className="relative self-center px-0 pb-7 sm:px-5 lg:min-w-0" aria-label="ProjectPulse workspace preview">
          <div className="absolute right-[10%] top-[17%] h-[65%] w-[70%] bg-[#eecfd9] opacity-55 blur-[55px]" />
          <div className="relative z-[1] rotate-[1.7deg] overflow-hidden rounded-[9px] border border-[#392634] bg-[#18131a] shadow-[20px_24px_50px_rgba(50,27,39,.2)]">
            <div className="flex h-[29px] items-center gap-1.5 bg-[#251b25] px-[13px]"><span className="h-1.5 w-1.5 rounded-full bg-[#6d4860]" /><span className="h-1.5 w-1.5 rounded-full bg-[#a8768b]" /><span className="h-1.5 w-1.5 rounded-full bg-[#d29cae]" /><small className="ml-auto font-mono text-[7px] tracking-[.1em] text-[#a995a3]">PROJECTPULSE / OVERVIEW</small></div>
            <img className="block h-auto w-full opacity-90 saturate-[.82]" src={heroImage} alt="A project management command center" />
            <div className="absolute right-[22px] top-[51px] flex items-center gap-2 rounded-[5px] border border-[#ecbdcd]/35 bg-[#281825]/90 px-3 py-2 text-[10px] text-[#f7e8ed] backdrop-blur-[10px]"><span className="h-[7px] w-[7px] rounded-full bg-[#87d3a5]" /> On track <strong className="ml-1 text-white">84%</strong></div>
            <div className="absolute bottom-5 left-5 flex items-center gap-2 rounded-[5px] border border-[#ecbdcd]/35 bg-[#281825]/90 px-3 py-2 text-[10px] text-[#f7e8ed] backdrop-blur-[10px]"><span className="flex"><i className="h-[18px] w-[18px] rounded-full border border-[#281a25] bg-[#dbb07e]" /><i className="-ml-1 h-[18px] w-[18px] rounded-full border border-[#281a25] bg-[#db9bae]" /><i className="-ml-1 h-[18px] w-[18px] rounded-full border border-[#281a25] bg-[#9d8fca]" /></span><strong className="text-white">12</strong> teammates aligned</div>
          </div>
          <div className="absolute -bottom-0.5 -right-1 flex rotate-[-4deg] flex-col items-start gap-0.5 font-mono text-[10px] uppercase tracking-[.12em] text-[#713450]"><span className="border-b border-[#b4627d] pb-1 text-base">01</span><span>Clarity</span><span>over chaos</span></div>
        </div>
      </section>

      <section className="mx-5 flex flex-col gap-4 border-y border-[#e7dedf] py-5 sm:mx-auto sm:max-w-[1176px] sm:flex-row sm:items-center sm:justify-between sm:gap-[30px] sm:py-6" aria-label="ProjectPulse highlights">
        <p className="m-0 font-serif text-base italic text-[#756b77]">Everything your team needs to move from thought to shipped.</p>
        <div className="flex flex-wrap gap-x-[18px] gap-y-3 text-[11px] text-[#756b77]"><span className="inline-flex items-center gap-1.5"><Check size={16} className="text-[#b4627d]" /> Unlimited projects</span><span className="inline-flex items-center gap-1.5"><Check size={16} className="text-[#b4627d]" /> Live collaboration</span><span className="inline-flex items-center gap-1.5"><Check size={16} className="text-[#b4627d]" /> Built for momentum</span></div>
      </section>

      <section className="mx-auto max-w-[1176px] px-5 py-[90px] sm:px-8 sm:py-[125px] lg:px-0" id="features">
        <div className="max-w-[550px]"><p className="font-mono text-[10px] uppercase tracking-[.14em] text-[#b4627d]">A clearer way to work</p><h2 className="my-[17px] font-serif text-[clamp(40px,5vw,62px)] font-semibold leading-none tracking-[-.05em]">Less chasing. More making.</h2><p className="m-0 max-w-[480px] text-[15px] leading-[1.7] text-[#756b77]">ProjectPulse turns scattered updates into a shared picture of progress, so your team can spend its energy where it matters.</p></div>
        <div className="mt-10 grid gap-[18px] sm:mt-[60px] md:grid-cols-3" id="teams">
          {features.map(({ icon: Icon, eyebrow, title, text }) => (
            <article className="relative min-h-[240px] border border-[#e7dedf] p-[26px] transition hover:-translate-y-1 hover:border-[#b4627d] sm:min-h-[275px]" key={title}>
              <div className="mb-[34px] flex h-11 w-11 items-center justify-center bg-[#f4e7ea] text-[#713450]"><Icon size={22} /></div>
              <p className="font-mono text-[9px] uppercase tracking-[.14em] text-[#b4627d]">{eyebrow}</p><h3 className="my-3 max-w-[240px] font-serif text-2xl font-semibold leading-[1.1] tracking-[-.03em]">{title}</h3><p className="m-0 max-w-[270px] text-[13px] leading-[1.6] text-[#756b77]">{text}</p><ArrowRight className="absolute bottom-[26px] right-[26px] text-[#b4627d]" size={19} />
            </article>
          ))}
        </div>
      </section>

      <section className="grid gap-[55px] bg-[#eee2e3] px-5 py-20 sm:px-8 lg:grid-cols-[.8fr_1.2fr] lg:gap-[100px] lg:px-[max(32px,calc((100%_-_1176px)_/_2))] lg:py-[115px]" id="workflow">
        <div><p className="font-mono text-[10px] uppercase tracking-[.14em] text-[#b4627d]">Your work, in rhythm</p><h2 className="my-[17px] font-serif text-[clamp(39px,4vw,56px)] font-semibold leading-none tracking-[-.05em]">From first thought to final handoff.</h2><p className="mb-[30px] max-w-[480px] text-[15px] leading-[1.7] text-[#756b77]">Every project has a pulse. Give yours a place to be seen, understood, and moved forward.</p><Link className="inline-flex items-center gap-2 text-[13px] font-bold text-[#713450]" to="/register">Build your first project <ArrowRight size={16} /></Link></div>
        <div className="self-center">{steps.map(([number, title, text]) => <div className="grid grid-cols-[45px_1fr] gap-[30px] border-t border-[#d5c3c8] py-6 first:pt-0 last:border-b last:pb-[27px]" key={number}><span className="pt-1 font-mono text-[11px] text-[#b4627d]">{number}</span><div><h3 className="m-0 mb-1.5 font-serif text-2xl font-semibold">{title}</h3><p className="m-0 max-w-[410px] text-[13px] leading-[1.6] text-[#756b77]">{text}</p></div></div>)}</div>
      </section>

      <section className="flex flex-col items-start justify-between gap-9 bg-[#713450] px-5 py-[75px] text-white sm:px-8 lg:flex-row lg:items-center lg:px-[max(32px,calc((100%_-_1176px)_/_2))] lg:py-[105px]"><div><p className="font-mono text-[10px] uppercase tracking-[.14em] text-[#e5abb9]">Ready when you are</p><h2 className="mt-[17px] font-serif text-[clamp(43px,5vw,66px)] font-semibold leading-[.99] tracking-[-.05em]">Give your best work<br /><em className="text-[#e8aabd]">somewhere to go.</em></h2></div><Link className="inline-flex items-center justify-center gap-2.5 rounded-[5px] border border-[#f6e9eb] bg-[#f6e9eb] px-5 py-[15px] text-[13px] font-bold text-[#713450] transition hover:bg-white" to="/register">Get started for free <ArrowRight size={18} /></Link></section>
      <footer className="flex flex-col items-start gap-5 bg-[#1e1720] px-5 py-[25px] text-[11px] text-[#a999a6] sm:flex-row sm:items-center sm:justify-between sm:gap-[30px] lg:px-[max(32px,calc((100%_-_1176px)_/_2))]"><Link className="inline-flex items-center gap-2.5 text-sm font-bold text-[#f7edf0]" to="/"><span className="flex h-[27px] w-[27px] items-center justify-center rounded-[9px] bg-[#713450] font-serif text-[17px] text-white">P</span><span>ProjectPulse</span></Link><span>© 2026 ProjectPulse. Made for teams in motion.</span><div className="flex gap-5"><Link className="text-[11px] text-[#c9b9c2]" to="/login">Log in</Link><Link className="text-[11px] text-[#c9b9c2]" to="/register">Sign up</Link></div></footer>
    </main>
  );
}

export default Landing;
