import brandLogo from '../brand-logo.png';
import LoginForm from './LoginForm.jsx';
import Dashboard from './Dashboard.jsx';

export default function AdminPage({ session, updateSession, onError, homeContent, setHomeContent }) {
  return <div className="studio-site min-h-screen bg-stone-50 text-stone-900">
    <header className="studio-header !sticky !top-0 !z-20 !border-b !border-rose-100 !bg-white/95 !shadow-sm !backdrop-blur"><a className="brand" href="/" aria-label="Blossom Snaps home"><img src={brandLogo} alt="Blossom Snaps" /></a><span className="!rounded-full !border !border-rose-100 !bg-rose-50 !px-3 !py-2 !text-xs !font-semibold !text-red-800">Private studio</span></header>
    {!session?.admin
      ? <LoginForm session={session} updateSession={updateSession} />
      : <Dashboard session={session} updateSession={updateSession} onError={onError} homeContent={homeContent} setHomeContent={setHomeContent} />}
  </div>;
}
