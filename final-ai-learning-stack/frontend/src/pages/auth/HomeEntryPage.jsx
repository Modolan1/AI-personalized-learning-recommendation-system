import { useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Input from '../../components/common/Input';
import Button from '../../components/common/Button';
import { useAuth } from '../../hooks/useAuth';

const PASSWORD_MIN = 8;
const PASSWORD_MAX = 128;
const UPPERCASE_RE = /[A-Z]/;
const SPECIAL_RE = /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?`~]/;

const onboardingSteps = [
  {
    key: 'learningGoal',
    title: 'What is your main learning goal?',
    options: [
      'Get job-ready skills for my career',
      'Improve for school and exams',
      'Switch into a new tech field',
      'Learn for personal growth',
    ],
  },
  {
    key: 'preferredSubject',
    title: 'Which subject do you want to focus on first?',
    options: ['Web Development', 'Data Science', 'Math', 'Programming Fundamentals'],
  },
  {
    key: 'skillLevel',
    title: 'What is your current level?',
    options: ['Beginner', 'Intermediate', 'Advanced'],
  },
  {
    key: 'preferredLearningStyle',
    title: 'How do you learn best?',
    options: ['Visual', 'Practice-based', 'Reading-first', 'Project-based'],
  },
  {
    key: 'weeklyLearningGoalHours',
    title: 'How many hours can you study weekly?',
    options: ['3', '5', '8', '12'],
  },
];

function getPasswordChecks(password) {
  return [
    { label: `At least ${PASSWORD_MIN} characters`, met: password.length >= PASSWORD_MIN },
    { label: `No more than ${PASSWORD_MAX} characters`, met: password.length > 0 && password.length <= PASSWORD_MAX },
    { label: 'At least one uppercase letter', met: UPPERCASE_RE.test(password) },
    { label: 'At least one special character (!@#$%^&*…)', met: SPECIAL_RE.test(password) },
  ];
}

function buildRecommendation(answers) {
  const subject = answers.preferredSubject || 'your selected subject';
  const style = answers.preferredLearningStyle || 'project-based';
  const level = answers.skillLevel || 'Beginner';
  const weeklyHours = Number(answers.weeklyLearningGoalHours || 5);

  const pace = weeklyHours >= 8 ? 'accelerated path' : weeklyHours >= 5 ? 'balanced path' : 'steady path';

  return {
    title: `${level} ${subject} ${pace}`,
    points: [
      `Start with ${subject} modules tailored for ${level.toLowerCase()} learners.`,
      `Use a ${style.toLowerCase()} approach with hands-on checkpoints.`,
      `Follow a ${weeklyHours}-hour weekly schedule with AI review sessions.`,
    ],
  };
}

function Modal({ title, onClose, children, maxWidthClass = 'max-w-2xl' }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/45 p-4">
      <div className={`w-full ${maxWidthClass} rounded-2xl bg-white p-6 shadow-2xl`}>
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-xl font-bold text-slate-900">{title}</h3>
          <button type="button" onClick={onClose} className="rounded-lg px-3 py-1 text-sm text-slate-500 hover:bg-slate-100">Close</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function HomeEntryPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, register } = useAuth();

  const [activeSection, setActiveSection] = useState('home');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const [showLogin, setShowLogin] = useState(false);
  const [showQuestionnaire, setShowQuestionnaire] = useState(false);
  const [showRegister, setShowRegister] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: '', password: '' });
  const [loginError, setLoginError] = useState('');

  const [stepIndex, setStepIndex] = useState(0);
  const [onboardingAnswers, setOnboardingAnswers] = useState({
    learningGoal: '',
    preferredSubject: '',
    skillLevel: '',
    preferredLearningStyle: '',
    weeklyLearningGoalHours: '',
  });

  const [registerForm, setRegisterForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    role: 'student',
  });
  const [registerError, setRegisterError] = useState('');
  const [passwordTouched, setPasswordTouched] = useState(false);

  useEffect(() => {
    if (location.pathname === '/login') {
      setShowLogin(true);
    }

    if (location.pathname === '/register') {
      setShowQuestionnaire(true);
    }
  }, [location.pathname]);

  useEffect(() => {
    const sections = ['home', 'about', 'contact'];
    const elements = sections
      .map((id) => document.getElementById(id))
      .filter(Boolean);

    if (!elements.length) return undefined;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);

        if (visible.length) {
          setActiveSection(visible[0].target.id);
        }
      },
      {
        root: null,
        threshold: [0.2, 0.45, 0.7],
        rootMargin: '-80px 0px -40% 0px',
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  const passwordChecks = getPasswordChecks(registerForm.password);
  const allPasswordChecksMet = passwordChecks.every((check) => check.met);
  const recommendation = useMemo(() => buildRecommendation(onboardingAnswers), [onboardingAnswers]);

  const currentStep = onboardingSteps[stepIndex];
  const currentValue = onboardingAnswers[currentStep?.key] || '';
  const questionProgress = Math.round(((stepIndex + 1) / onboardingSteps.length) * 100);

  const openQuestionnaire = () => {
    setStepIndex(0);
    setOnboardingAnswers({
      learningGoal: '',
      preferredSubject: '',
      skillLevel: '',
      preferredLearningStyle: '',
      weeklyLearningGoalHours: '',
    });
    setShowQuestionnaire(true);
  };

  const handleSectionNav = (id) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
      setActiveSection(id);
    }
    setMobileMenuOpen(false);
  };

  const completeQuestionnaire = () => {
    setShowQuestionnaire(false);
    setShowRegister(true);
  };

  const handleLogin = async (event) => {
    event.preventDefault();

    try {
      const user = await login(loginForm.email, loginForm.password);
      setShowLogin(false);
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
    } catch (error) {
      setLoginError(error?.response?.data?.message || 'Login failed');
    }
  };

  const handleRegister = async (event) => {
    event.preventDefault();
    setPasswordTouched(true);

    if (!allPasswordChecksMet) return;

    const payload = {
      ...registerForm,
      ...onboardingAnswers,
      weeklyLearningGoalHours: Number(onboardingAnswers.weeklyLearningGoalHours || 5),
      recommendationOptIn: true,
    };

    try {
      const user = await register(payload);
      setShowRegister(false);
      navigate(user.role === 'admin' ? '/admin/dashboard' : '/student/dashboard');
    } catch (error) {
      setRegisterError(error?.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_#dbeafe,_#f8fafc_45%,_#e2e8f0)] text-slate-900">
      <header className="sticky top-0 z-20 border-b border-slate-200/70 bg-white/80 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3 sm:px-6">
          <button type="button" onClick={() => handleSectionNav('home')} className="text-xl font-bold tracking-tight text-indigo-700">LearnAI</button>
          <nav className="hidden items-center gap-6 text-sm font-medium text-slate-600 md:flex">
            <button type="button" onClick={() => handleSectionNav('about')} className={`transition hover:text-indigo-700 ${activeSection === 'about' ? 'text-indigo-700' : ''}`}>About</button>
            <button type="button" onClick={() => handleSectionNav('contact')} className={`transition hover:text-indigo-700 ${activeSection === 'contact' ? 'text-indigo-700' : ''}`}>Contact</button>
            <button type="button" onClick={() => setShowLogin(true)} className="hover:text-indigo-700">Login</button>
            <Button onClick={openQuestionnaire}>Get Started</Button>
          </nav>
          <div className="md:hidden">
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="rounded-lg border border-slate-300 bg-white px-3 py-2 text-xs font-semibold text-slate-700"
            >
              {mobileMenuOpen ? 'Close' : 'Menu'}
            </button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="border-t border-slate-200 bg-white px-4 py-3 md:hidden">
            <div className="flex flex-col gap-2 text-sm font-medium text-slate-700">
              <button type="button" onClick={() => handleSectionNav('about')} className={`rounded-lg px-3 py-2 text-left ${activeSection === 'about' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50'}`}>About</button>
              <button type="button" onClick={() => handleSectionNav('contact')} className={`rounded-lg px-3 py-2 text-left ${activeSection === 'contact' ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-slate-50'}`}>Contact</button>
              <button
                type="button"
                onClick={() => {
                  setShowLogin(true);
                  setMobileMenuOpen(false);
                }}
                className="rounded-lg px-3 py-2 text-left hover:bg-slate-50"
              >
                Login
              </button>
              <Button
                onClick={() => {
                  openQuestionnaire();
                  setMobileMenuOpen(false);
                }}
                className="w-full"
              >
                Get Started
              </Button>
            </div>
          </div>
        )}
      </header>

      <main id="home" className="mx-auto max-w-6xl px-4 py-12 sm:px-6 sm:py-14">
        <section className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <div className="inline-block rounded-full bg-indigo-100 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-indigo-700">
              AI Personal Learning Platform
            </div>
            <h1 className="mt-4 text-4xl font-black leading-tight tracking-tight sm:text-5xl">
              One smart start.
              <br />
              Personalized learning that adapts to you.
            </h1>
            <p className="mt-4 max-w-xl text-base text-slate-600">
              Answer a short set of onboarding questions, get AI-powered recommendations like modern learning platforms, and start with a dashboard tailored to your goals.
            </p>
            <div className="mt-7 flex flex-wrap gap-3">
              <Button onClick={openQuestionnaire}>Get Started</Button>
              <Button variant="secondary" onClick={() => setShowLogin(true)}>Login</Button>
            </div>
          </div>
          <div className="rounded-3xl border border-white/80 bg-white/90 p-6 shadow-xl shadow-indigo-100">
            <h2 className="text-lg font-semibold">How it works</h2>
            <ol className="mt-4 space-y-3 text-sm text-slate-700">
              <li>1. Complete a quick onboarding question series.</li>
              <li>2. Get AI recommendation profile based on your answers.</li>
              <li>3. Create account and enter your personalized dashboard.</li>
            </ol>
          </div>
        </section>

        <section id="about" className="mt-20 grid gap-6 md:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-semibold">Adaptive Learning Paths</h3>
            <p className="mt-2 text-sm text-slate-600">AI continuously aligns topics and learning style to your progress.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-semibold">Document Intelligence</h3>
            <p className="mt-2 text-sm text-slate-600">Upload documents, extract key concepts, generate flashcards and quizzes instantly.</p>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-5">
            <h3 className="font-semibold">Actionable Progress</h3>
            <p className="mt-2 text-sm text-slate-600">Track scores, strengths, weak areas, and recommendations in one dashboard.</p>
          </div>
        </section>

        <section id="contact" className="mt-20 rounded-3xl border border-slate-200 bg-white p-8">
          <h2 className="text-2xl font-bold">Contact</h2>
          <p className="mt-2 text-sm text-slate-600">Questions or support request? Reach us at support@learnai.local</p>
        </section>
      </main>

      {showLogin && (
        <Modal title="Login" onClose={() => { setShowLogin(false); setLoginError(''); }} maxWidthClass="max-w-md">
          <form onSubmit={handleLogin} className="space-y-4">
            <Input label="Email" type="email" value={loginForm.email} onChange={(event) => setLoginForm((prev) => ({ ...prev, email: event.target.value }))} />
            <Input label="Password" type="password" value={loginForm.password} onChange={(event) => setLoginForm((prev) => ({ ...prev, password: event.target.value }))} />
            {loginError && <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{loginError}</div>}
            <Button type="submit" className="w-full">Sign In</Button>
          </form>
        </Modal>
      )}

      {showQuestionnaire && (
        <Modal title="Get Started Questionnaire" onClose={() => setShowQuestionnaire(false)}>
          <div className="mb-4">
            <div className="mb-2 flex items-center justify-between text-xs text-slate-500">
              <span>Step {stepIndex + 1} of {onboardingSteps.length}</span>
              <span>{questionProgress}%</span>
            </div>
            <div className="h-2 rounded-full bg-slate-100">
              <div className="h-2 rounded-full bg-indigo-600" style={{ width: `${questionProgress}%` }} />
            </div>
          </div>

          <h4 className="text-lg font-semibold text-slate-900">{currentStep.title}</h4>
          <div className="mt-4 grid gap-2 sm:grid-cols-2">
            {currentStep.options.map((option) => (
              <button
                type="button"
                key={option}
                onClick={() => setOnboardingAnswers((prev) => ({ ...prev, [currentStep.key]: option }))}
                className={`rounded-xl border px-4 py-3 text-left text-sm transition ${currentValue === option ? 'border-indigo-500 bg-indigo-50 text-indigo-700' : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'}`}
              >
                {option}
              </button>
            ))}
          </div>

          <div className="mt-6 flex gap-2">
            <Button variant="secondary" onClick={() => setStepIndex((prev) => Math.max(0, prev - 1))} disabled={stepIndex === 0}>Previous</Button>
            {stepIndex < onboardingSteps.length - 1 ? (
              <Button onClick={() => setStepIndex((prev) => Math.min(onboardingSteps.length - 1, prev + 1))} disabled={!currentValue}>Next</Button>
            ) : (
              <Button onClick={completeQuestionnaire} disabled={!currentValue}>Continue to Registration</Button>
            )}
          </div>
        </Modal>
      )}

      {showRegister && (
        <Modal title="Create Your Account" onClose={() => setShowRegister(false)}>
          <div className="mb-4 rounded-xl border border-indigo-100 bg-indigo-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-indigo-700">Your AI Recommendation</p>
            <p className="mt-1 text-sm font-semibold text-slate-900">{recommendation.title}</p>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm text-slate-700">
              {recommendation.points.map((point) => <li key={point}>{point}</li>)}
            </ul>
          </div>

          <form onSubmit={handleRegister} className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="First Name" value={registerForm.firstName} onChange={(event) => setRegisterForm((prev) => ({ ...prev, firstName: event.target.value }))} />
              <Input label="Last Name" value={registerForm.lastName} onChange={(event) => setRegisterForm((prev) => ({ ...prev, lastName: event.target.value }))} />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <Input label="Email" type="email" value={registerForm.email} onChange={(event) => setRegisterForm((prev) => ({ ...prev, email: event.target.value }))} />
              <div>
                <Input
                  label="Password"
                  type="password"
                  value={registerForm.password}
                  onChange={(event) => { setRegisterForm((prev) => ({ ...prev, password: event.target.value })); setPasswordTouched(true); }}
                />
                {passwordTouched && (
                  <ul className="mt-2 space-y-1">
                    {passwordChecks.map((check) => (
                      <li key={check.label} className={`flex items-center gap-1.5 text-xs ${check.met ? 'text-emerald-600' : 'text-rose-500'}`}>
                        <span>{check.met ? '✓' : '✗'}</span>
                        {check.label}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>

            {registerError && <div className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{registerError}</div>}

            <Button type="submit" className="w-full" disabled={passwordTouched && !allPasswordChecksMet}>Create Account & Go to Dashboard</Button>
          </form>
        </Modal>
      )}
    </div>
  );
}
