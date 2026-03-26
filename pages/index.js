// 🚀 FINAL QA TESTER APP (FULL STRUCTURED TEST FLOW)
// ✅ Includes detailed steps + expected results
// ✅ Pass → auto next
// ❌ Fail → requires issue + screenshot
// ✅ Tester info captured
// ✅ Supabase + CSV export ready

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabase = createClient(
  "https://ymuwxxucpxobhwlxcxta.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltdXd4eHVjcHhvYmh3bHhjeHRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MTI5NDAsImV4cCI6MjA5MDA4ODk0MH0.gs6ZgPR6sHvmTQgvsKAc8lGly2q5luDCHvPx9x20CZ"
);

const testCases = [
  {
    id: "1.1",
    title: "Sign In",
    steps: [
      "Open the app",
      "Sign in with your account (Email/Google/Apple)"
    ],
    expected: "User lands on Home screen without errors"
  },
  {
    id: "1.2",
    title: "Mood Check-in",
    steps: [
      "Tap mood check-in on Home",
      "Select mood",
      "Add note/photo (optional)",
      "Save"
    ],
    expected: "Animation plays, aura updates, return to Home"
  },
  {
    id: "1.3",
    title: "Mood History",
    steps: [
      "Open history/calendar",
      "Scroll entries"
    ],
    expected: "Entries load correctly without blank cards"
  },
  {
    id: "1.4",
    title: "Circles",
    steps: [
      "Open Circles tab",
      "Enter a circle",
      "Scroll feed"
    ],
    expected: "Posts load properly without errors"
  },
  {
    id: "1.5",
    title: "Crisis Resources (Offline)",
    steps: [
      "Turn off internet",
      "Open Help/Support"
    ],
    expected: "Crisis numbers visible offline"
  }
];

export default function Home() {
  const [index, setIndex] = useState(0);
  const [result, setResult] = useState(null);
  const [issue, setIssue] = useState("");
  const [file, setFile] = useState(null);

  const [testerName, setTesterName] = useState("");
  const [device, setDevice] = useState("");
  const [osVersion, setOsVersion] = useState("");
  const [platform, setPlatform] = useState("");

  const current = testCases[index];

  const uploadFile = async (file) => {
    if (!file) return null;

    const fileName = `${Date.now()}-${file.name}`;

    const { error } = await supabase.storage
      .from("screenshots")
      .upload(fileName, file);

    if (error) return null;

    const { data } = supabase.storage
      .from("screenshots")
      .getPublicUrl(fileName);

    return data.publicUrl;
  };

  const next = async () => {
    if (result === "Fail" && (!issue || !file)) {
      alert("Please describe the issue and upload screenshot");
      return;
    }

    let screenshotUrl = null;
    if (file) screenshotUrl = await uploadFile(file);

    await supabase.from("qa_reports").insert([
      {
        tester_name: testerName,
        device,
        os_version: osVersion,
        platform,
        test_case: current.id + " " + current.title,
        result,
        issue,
        screenshot_url: screenshotUrl
      }
    ]);

    setResult(null);
    setIssue("");
    setFile(null);
    setIndex(index + 1);
  };

  const downloadCSV = async () => {
    const { data } = await supabase.from("qa_reports").select("*");

    const csv = [
      Object.keys(data[0]).join(","),
      ...data.map(row => Object.values(row).join(","))
    ].join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "qa-report.csv";
    a.click();
  };

  if (index >= testCases.length) {
    return (
      <div className="h-screen flex flex-col items-center justify-center gap-4 text-white bg-black">
        <p>✅ Testing Complete</p>
        <button onClick={downloadCSV} className="bg-green-600 p-2 rounded">
          Download Report
        </button>
      </div>
    );
  }

  return (
    <div className="h-screen flex items-center justify-center bg-black text-white p-4">
      <div className="max-w-md w-full bg-zinc-900 p-6 rounded-2xl">

        {index === 0 && (
          <div className="space-y-2 mb-4">
            <input placeholder="Tester Name" onChange={e=>setTesterName(e.target.value)} className="w-full p-2 text-black"/>
            <input placeholder="Device (e.g Samsung S20)" onChange={e=>setDevice(e.target.value)} className="w-full p-2 text-black"/>
            <input placeholder="OS Version (e.g Android 13 / iOS 18)" onChange={e=>setOsVersion(e.target.value)} className="w-full p-2 text-black"/>
            <select onChange={e=>setPlatform(e.target.value)} className="w-full p-2 text-black">
              <option value="">Platform</option>
              <option>Android</option>
              <option>iOS</option>
            </select>
          </div>
        )}

        <h2 className="font-bold text-lg mb-2">{current.id} {current.title}</h2>

        <div className="mb-2">
          <p className="text-sm opacity-70">Steps:</p>
          {current.steps.map((step, i) => (
            <p key={i}>[{" "}] {step}</p>
          ))}
        </div>

        <p className="text-sm opacity-70 mb-4">Expected: {current.expected}</p>

        {!result && (
          <div className="flex gap-2">
            <button onClick={()=>setResult("Pass")} className="bg-green-600 p-2 flex-1 rounded">Pass</button>
            <button onClick={()=>setResult("Fail")} className="bg-red-600 p-2 flex-1 rounded">Fail</button>
          </div>
        )}

        {result === "Fail" && (
          <div className="mt-3">
            <textarea
              placeholder="Describe issue + steps to reproduce"
              className="w-full p-2 text-black"
              onChange={e=>setIssue(e.target.value)}
            />
            <input type="file" className="mt-2" onChange={e=>setFile(e.target.files[0])} />
          </div>
        )}

        {result && (
          <button onClick={next} className="mt-4 w-full bg-blue-600 p-2 rounded">
            Next
          </button>
        )}
      </div>
    </div>
  );
}

/*
🔥 HOW TESTERS USE THIS

1. Enter basic info
2. Follow steps exactly
3. Compare with expected
4. If PASS → click pass → next auto
5. If FAIL → must describe + upload screenshot

🎯 DATA STORED IN SUPABASE
🎯 CSV EXPORT READY FOR CLIENT
*/
