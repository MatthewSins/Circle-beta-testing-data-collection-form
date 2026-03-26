import React, { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { CheckCircle2, XCircle, ChevronRight, Upload, Smartphone, User, Layers, ShieldAlert } from 'lucide-react';

// --- CONFIGURATION ---
const SUPABASE_URL = 'https://ymuwxxucpxobhwlxcxta.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltdXd4eHVjcHhvYmh3bHhjeHRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MTI5NDAsImV4cCI6MjA5MDA4ODk0MH0.gs6ZgPR6sHvmTQgvsKAc8lGly2q5luDCHvPx9x20CZ';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const TEST_SESSIONS = [
  { id: "1.1", section: "Core Flow", title: "Sign In", steps: ["Open the app", "Sign in with existing account (Email/Google/Apple)"], expected: "Land on Home screen without errors" },
  { id: "1.2", section: "Core Flow", title: "Mood Check-in", steps: ["Tap mood check-in on Home", "Select mood level + note/photo", "Save"], expected: "Celebration animation plays, aura updates, return to Home" },
  { id: "1.3", section: "Core Flow", title: "Mood History", steps: ["Tap calendar/history icon", "Scroll through past entries"], expected: "All entries load, no blank cards" },
  { id: "1.4", section: "Core Flow", title: "Circles", steps: ["Tap Circles tab", "Open an existing circle", "Scroll feed"], expected: "Posts load, no spinning/errors" },
  { id: "1.5", section: "Core Flow", title: "Crisis Resources (Offline)", steps: ["Turn off Wi-Fi/Data", "Navigate to Help & Support / Settings"], expected: "NZ Crisis numbers (1737, Lifeline) show without internet" },
  { id: "1.6", section: "Core Flow", title: "Account Settings", steps: ["Open Profile", "Tap Settings/Account"], expected: "Settings load, no crashes" },
  { id: "2.1", section: "New Features", title: "Day 7 Aura Unlock", steps: ["Check in for 7 consecutive/recent days"], expected: "Full-screen gradient celebration with Share button appears once" },
  { id: "2.3", section: "New Features", title: "Low-Mood Response", steps: ["Log mood ≤ 3", "Tap through to Breathing Exercise"], expected: "Supportive overlay appears; 60s breathing exercise launches" },
  { id: "2.4", section: "New Features", title: "Monthly Mood Summary", steps: ["Go to Mood History", "Tap 'View Summary' for a completed month"], expected: "Summary card with avg mood/headline and Share button appears" },
  { id: "2.5", section: "New Features", title: "Aura Sharing", steps: ["Open Profile/History", "Tap 'Share Aura'"], expected: "Branded aura card generated; native share sheet opens" },
  { id: "2.6", section: "New Features", title: "Circle Invite Link", steps: ["Open owned circle", "Tap Invite -> Share Link tab", "Tap Copy/Share"], expected: "Link format: mycircle.co.nz/join/..." },
  { id: "2.10", section: "New Features", title: "Reach Out (Peer Support)", steps: ["Home screen -> 'Reach out to your circle'", "Toggle anonymous, tap Send"], expected: "Confirmation modal; 24hr rate limit applied" },
  { id: "3.1", section: "Payments", title: "Premium Upgrade Flow", steps: ["Profile -> Settings -> Upgrade to Premium"], expected: "Pricing, plan comparison, and monthly/annual options visible" },
  { id: "3.4", section: "Payments", title: "Sandbox Purchase", steps: ["Tap Subscribe", "Complete Sandbox transaction"], expected: "Account upgrades to Premium; features unlocked" }
];

export default function CircleTestApp() {
  const [step, setStep] = useState('setup'); // setup, testing, finished
  const [currentIndex, setCurrentIndex] = useState(0);
  const [testerInfo, setTesterInfo] = useState({ name: '', device: '', os: '', platform: 'iOS' });
  const [failData, setFailData] = useState({ steps: '', imageUrl: '' });
  const [isFailing, setIsFailing] = useState(false);
  const [loading, setLoading] = useState(false);

  const currentTest = TEST_SESSIONS[currentIndex];

  const handleStart = (e) => {
    e.preventDefault();
    if (testerInfo.name && testerInfo.device) setStep('testing');
  };

  const submitResult = async (status) => {
    setLoading(true);
    const { error } = await supabase.from('test_results').insert([{
      ...testerInfo,
      test_id: currentTest.id,
      status,
      steps_to_reproduce: status === 'FAIL' ? failData.steps : null,
      image_url: failData.imageUrl
    }]);

    if (error) alert("Error saving to database: " + error.message);

    setLoading(false);
    setIsFailing(false);
    setFailData({ steps: '', imageUrl: '' });

    if (currentIndex < TEST_SESSIONS.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setStep('finished');
    }
  };

  if (step === 'setup') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-100">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent mb-2">Circle v3.1.1</h1>
          <p className="text-slate-500 mb-8 font-medium">Internal QA Testing Suite</p>
          
          <form onSubmit={handleStart} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-1">Tester Name</label>
              <input required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none transition" 
                onChange={e => setTesterInfo({...testerInfo, name: e.target.value})} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Device (e.g. S20)</label>
                <input required className="w-full px-4 py-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-purple-500 outline-none" 
                  onChange={e => setTesterInfo({...testerInfo, device: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-slate-700 mb-1">Platform</label>
                <select className="w-full px-4 py-3 rounded-xl border border-slate-200 bg-white" 
                  onChange={e => setTesterInfo({...testerInfo, platform: e.target.value})}>
                  <option>iOS</option>
                  <option>Android</option>
                </select>
              </div>
            </div>
            <button className="w-full py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-2xl font-bold shadow-lg hover:opacity-90 transition transform active:scale-95">
              Start Final Test
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (step === 'finished') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 to-indigo-50 flex items-center justify-center p-6 text-center">
        <div className="max-w-sm animate-in fade-in zoom-in duration-500">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle2 className="text-green-600 w-12 h-12" />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-4">All Done!</h1>
          <p className="text-slate-600 text-lg mb-8">Your feedback directly shapes what ships to real users. Thank you for your help!</p>
          <button onClick={() => window.location.reload()} className="text-purple-600 font-semibold hover:underline">Restart Test</button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-6">
          <span className="px-4 py-1 bg-white border border-slate-200 rounded-full text-xs font-bold text-slate-500 shadow-sm">
            {currentTest.section} • {currentIndex + 1} / {TEST_SESSIONS.length}
          </span>
          <div className="flex gap-2 text-slate-400">
            <Smartphone size={16} /> <span className="text-xs">{testerInfo.device}</span>
          </div>
        </div>

        <div className="bg-white rounded-[2rem] shadow-sm border border-slate-100 overflow-hidden mb-6">
          <div className="p-8">
            <h2 className="text-2xl font-bold text-slate-900 mb-6 flex items-center gap-3">
              <span className="w-10 h-10 bg-purple-100 text-purple-600 rounded-xl flex items-center justify-center text-base">{currentTest.id}</span>
              {currentTest.title}
            </h2>

            <div className="space-y-6">
              <section>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 mb-3">Steps to follow</h3>
                <ul className="space-y-3">
                  {currentTest.steps.map((s, i) => (
                    <li key={i} className="flex gap-3 text-slate-700 font-medium">
                      <div className="mt-1.5 w-1.5 h-1.5 rounded-full bg-purple-400 shrink-0" />
                      {s}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="bg-purple-50 p-5 rounded-2xl border border-purple-100">
                <h3 className="text-xs font-bold uppercase tracking-wider text-purple-400 mb-1">Expected Outcome</h3>
                <p className="text-purple-900 font-semibold">{currentTest.expected}</p>
              </section>
            </div>
          </div>

          {!isFailing ? (
            <div className="grid grid-cols-2 border-t border-slate-50">
              <button 
                onClick={() => setIsFailing(true)}
                className="py-6 flex items-center justify-center gap-2 font-bold text-red-500 hover:bg-red-50 transition"
              >
                <XCircle size={20} /> Fail
              </button>
              <button 
                onClick={() => submitResult('PASS')}
                disabled={loading}
                className="py-6 flex items-center justify-center gap-2 font-bold text-white bg-gradient-to-r from-purple-600 to-indigo-600 hover:opacity-90 transition"
              >
                {loading ? 'Saving...' : <><CheckCircle2 size={20} /> Pass & Next</>}
              </button>
            </div>
          ) : (
            <div className="p-8 border-t border-slate-50 bg-slate-50 animate-in slide-in-from-bottom-4">
              <h3 className="font-bold text-slate-900 mb-4">Report Issue</h3>
              <textarea 
                placeholder="Steps to reproduce / What went wrong..."
                className="w-full p-4 rounded-xl border border-slate-200 mb-4 h-32 focus:ring-2 focus:ring-purple-500 outline-none"
                onChange={e => setFailData({...failData, steps: e.target.value})}
              />
              <div className="flex gap-3">
                <button 
                  onClick={() => setIsFailing(false)}
                  className="flex-1 py-3 font-semibold text-slate-500"
                >
                  Cancel
                </button>
                <button 
                  disabled={loading}
                  onClick={() => submitResult('FAIL')}
                  className="flex-[2] py-3 bg-red-500 text-white rounded-xl font-bold shadow-lg shadow-red-200"
                >
                  {loading ? 'Submitting...' : 'Submit Failure'}
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-2 text-slate-400 text-sm italic">
          <ShieldAlert size={14} />
          Note: Look for blank screens, spinner loops, or "Shame language"
        </div>
      </div>
    </div>
  );
}
