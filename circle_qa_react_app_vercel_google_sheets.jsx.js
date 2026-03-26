// 🚀 FINAL VERSION (Vercel + Supabase DB + Downloadable Reports)
// ✅ Typeform QA
// ✅ Supabase DB (no Apps Script)
// ✅ Screenshot upload (Supabase Storage)
// ✅ Export data (CSV download)

import { useState } from "react";
import { createClient } from "@supabase/supabase-js";

// 🔥 REPLACE THESE
const supabase = createClient(
  "https://ymuwxxucpxobhwlxcxta.supabase.co",
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InltdXd4eHVjcHhvYmh3bHhjeHRhIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQ1MTI5NDAsImV4cCI6MjA5MDA4ODk0MH0.gs6ZgPR6sHvmTQgvsKAc8lGly2q5luDCHvPx9x20CZ"
);

const testCases = [
  { id: "1.1", title: "Sign In", steps: "Open app → Sign in", expected: "Home loads" },
  { id: "1.2", title: "Mood Check-in", steps: "Select mood → save", expected: "Animation + aura" },
  { id: "1.3", title: "Mood History", steps: "Open history", expected: "Entries visible" },
  { id: "1.4", title: "Circles", steps: "Open circle", expected: "Feed loads" },
  { id: "1.5", title: "Offline Crisis", steps: "Turn off internet", expected: "Loads offline" }
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

    const { data, error } = await supabase.storage
      .from("screenshots")
      .upload(fileName, file);

    if (error) return null;

    const { data: publicUrl } = supabase.storage
      .from("screenshots")
      .getPublicUrl(fileName);

    return publicUrl.publicUrl;
  };

  const next = async () => {
    let screenshotUrl = null;

    if (file) {
      screenshotUrl = await uploadFile(file);
    }

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
      <div className="h-screen flex flex-col items-center justify-center gap-4">
        <p>✅ Testing Complete</p>
        <button onClick={downloadCSV} className="bg-green-600 p-2">
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
            <input placeholder="Name" onChange={e=>setTesterName(e.target.value)} />
            <input placeholder="Device" onChange={e=>setDevice(e.target.value)} />
            <input placeholder="OS" onChange={e=>setOsVersion(e.target.value)} />
            <select onChange={e=>setPlatform(e.target.value)}>
              <option value="">Platform</option>
              <option>Android</option>
              <option>iOS</option>
            </select>
          </div>
        )}

        <h2>{current.id} {current.title}</h2>
        <p>{current.steps}</p>
        <p>{current.expected}</p>

        {!result && (
          <div className="flex gap-2 mt-3">
            <button onClick={()=>setResult("Pass")}>Pass</button>
            <button onClick={()=>setResult("Fail")}>Fail</button>
          </div>
        )}

        {result === "Fail" && (
          <div>
            <textarea onChange={e=>setIssue(e.target.value)} />
            <input type="file" onChange={e=>setFile(e.target.files[0])} />
          </div>
        )}

        {result && (
          <button onClick={next}>Next</button>
        )}
      </div>
    </div>
  );
}

/*
🚀 SUPABASE SETUP

1. Create project → supabase.com
2. Go to SQL Editor → run:

CREATE TABLE qa_reports (
  id uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  tester_name text,
  device text,
  os_version text,
  platform text,
  test_case text,
  result text,
  issue text,
  screenshot_url text,
  created_at timestamp default now()
);

3. Storage → Create bucket: screenshots (public)

4. Settings → API → copy URL + anon key

5. Paste in code above

--------------------------------
🎯 RESULT
--------------------------------

- All data stored in Supabase
- Screenshots in Storage
- One-click CSV export
- Share with clients easily

*/
