"use client";

import { useEffect, useMemo, useState } from "react";

const scanModes = [
  { id: "quick-discovery", name: "Quick Discovery", description: "Find live hosts without checking ports.", depth: "Quick", confirm: false },
  { id: "basic-tcp", name: "Basic TCP Scan", description: "Check the top 100 TCP ports.", depth: "Standard", confirm: false },
  { id: "service-detection", name: "Service Detection", description: "Identify services and versions on common open ports.", depth: "Standard", confirm: false },
  { id: "deep-service", name: "Deep Service Scan", description: "Scan TCP ports 1-10000 with service detection.", depth: "Deep", confirm: false },
  { id: "full-tcp", name: "Full TCP Scan", description: "Scan every TCP port from 1-65535.", depth: "Full", confirm: false },
  { id: "full-tcp-service", name: "Full TCP + Service Detection", description: "Full TCP port scan with service and version detection.", depth: "Full", confirm: false },
  { id: "os-lab", name: "OS Detection Lab Only", description: "Attempt OS detection against authorized lab targets.", depth: "Advanced", confirm: true },
  { id: "udp-top", name: "UDP Top Ports Lab Scan", description: "Scan top UDP ports. This can be slow.", depth: "Advanced", confirm: true },
  { id: "custom-advanced", name: "Custom Advanced Lab Scan", description: "Build a controlled advanced scan using UI options.", depth: "Custom", confirm: false },
];

function Badge({ children, tone = "slate" }) {
  const tones = {
    slate: "bg-slate-700 text-slate-200 border-white/10",
    green: "bg-emerald-500/15 text-emerald-300 border-emerald-400/30",
    blue: "bg-cyan-500/15 text-cyan-300 border-cyan-400/30",
    yellow: "bg-amber-500/15 text-amber-300 border-amber-400/30",
    red: "bg-red-500/15 text-red-300 border-red-400/30",
    purple: "bg-purple-500/15 text-purple-300 border-purple-400/30",
  };

  return (
    <span className={`rounded-full border px-3 py-1 text-xs font-black ${tones[tone] || tones.slate}`}>
      {children}
    </span>
  );
}

function StatCard({ label, value, note }) {
  return (
    <div className="syfer-card min-w-0 rounded-3xl border border-white/10 bg-slate-900 p-5 shadow-xl shadow-black/20">
      <p className="text-sm text-slate-400">{label}</p>
      <p className="mt-2 break-words text-3xl font-black leading-tight text-white md:text-4xl">{value}</p>
      {note && <p className="mt-1 text-xs leading-5 text-slate-500 syfer-card-text">{note}</p>}
    </div>
  );
}


function ReportView({ scan, hosts, openPorts, findings }) {
  if (!scan) return null;

  const completedAt = scan.completedAt
    ? new Date(scan.completedAt).toLocaleString()
    : "Not available";

  const highCount = findings.filter((finding) => finding.severity === "High").length;
  const mediumCount = findings.filter((finding) => finding.severity === "Medium").length;
  const lowCount = findings.filter((finding) => finding.severity === "Low").length;
  const infoCount = findings.filter((finding) => finding.severity === "Info").length;

  return (
    <div id="print-report" className="max-w-full overflow-hidden rounded-3xl border border-white/10 bg-slate-950 p-6 text-slate-100">
      <div className="border-b border-white/10 pb-5">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <p className="text-sm font-black uppercase tracking-[0.3em] text-cyan-300">
              SyferSec Lab Console
            </p>
            <h2 className="mt-2 text-3xl font-black text-white">Nmap Scan Report</h2>
            <p className="mt-2 text-sm text-slate-400">
              Branded local lab report with discovered hosts, open ports, findings, and remediation guidance.
            </p>
          </div>

          <div className="rounded-2xl border border-white/10 bg-slate-900 p-4 text-sm">
            <p><strong>Report ID:</strong> {scan.id}</p>
            <p><strong>Status:</strong> {scan.status}</p>
            <p><strong>Completed:</strong> {completedAt}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-4">
          <p className="text-sm text-slate-400">Target</p>
          <p className="mt-2 break-words font-black text-white">{scan.target}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900 p-4">
          <p className="text-sm text-slate-400">Scan Mode</p>
          <p className="mt-2 font-black text-white">{scan.modeName || scan.presetName || "Nmap Scan"}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900 p-4">
          <p className="text-sm text-slate-400">Hosts Up</p>
          <p className="mt-2 text-3xl font-black text-white">{hosts.length}</p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900 p-4">
          <p className="text-sm text-slate-400">Open Ports</p>
          <p className="mt-2 text-3xl font-black text-white">{openPorts.length}</p>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900 p-4">
        <h3 className="text-xl font-black text-white">Executive Summary</h3>
        <p className="mt-3 text-sm leading-6 text-slate-300">
          This report documents the results of an authorized local Nmap scan performed through SyferSec Lab Console.
          The scan found {hosts.length} host(s), {openPorts.length} open port(s), and {findings.length} finding(s).
        </p>

        <div className="mt-4 grid gap-3 md:grid-cols-4">
          <div className="rounded-xl border border-red-400/30 bg-red-500/10 p-3">
            <p className="text-sm text-red-300">High</p>
            <p className="text-2xl font-black text-white">{highCount}</p>
          </div>

          <div className="rounded-xl border border-amber-400/30 bg-amber-500/10 p-3">
            <p className="text-sm text-amber-300">Medium</p>
            <p className="text-2xl font-black text-white">{mediumCount}</p>
          </div>

          <div className="rounded-xl border border-cyan-400/30 bg-cyan-500/10 p-3">
            <p className="text-sm text-cyan-300">Low</p>
            <p className="text-2xl font-black text-white">{lowCount}</p>
          </div>

          <div className="rounded-xl border border-slate-400/30 bg-slate-500/10 p-3">
            <p className="text-sm text-slate-300">Info</p>
            <p className="text-2xl font-black text-white">{infoCount}</p>
          </div>
        </div>
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900 p-4">
        <h3 className="text-xl font-black text-white">Open Ports and Services</h3>

        {openPorts.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">No open ports were discovered in this scan.</p>
        ) : (
          <div className="mt-4 max-w-full overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-left text-sm">
              <thead className="bg-slate-950 text-slate-400">
                <tr>
                  <th className="p-3">Host</th>
                  <th className="p-3">Port</th>
                  <th className="p-3">Protocol</th>
                  <th className="p-3">Service</th>
                  <th className="p-3">Version</th>
                </tr>
              </thead>
              <tbody>
                {openPorts.map((port) => (
                  <tr key={`${port.host}-${port.protocol}-${port.port}`} className="border-t border-white/10">
                    <td className="p-3">{port.host}</td>
                    <td className="p-3">{port.port}</td>
                    <td className="p-3">{port.protocol}</td>
                    <td className="p-3">{port.service}</td>
                    <td className="p-3">{[port.product, port.version].filter(Boolean).join(" ") || "Unknown"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900 p-4">
        <h3 className="text-xl font-black text-white">Findings and Remediation Recommendations</h3>

        {findings.length === 0 ? (
          <p className="mt-3 text-sm text-slate-400">
            No defensive findings were generated from this scan.
          </p>
        ) : (
          <div className="mt-4 space-y-4">
            {findings.map((finding, index) => (
              <div key={`${finding.title}-${index}`} className="rounded-xl border border-white/10 bg-slate-950 p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge tone={finding.severity === "High" ? "red" : finding.severity === "Medium" ? "yellow" : finding.severity === "Low" ? "blue" : "slate"}>
                    {finding.severity}
                  </Badge>
                  <span className="text-sm text-slate-400">{finding.host}</span>
                </div>

                <h4 className="mt-3 font-black text-white">{finding.title}</h4>
                <p className="mt-2 text-sm leading-6 text-slate-300">{finding.description}</p>
                <p className="mt-2 text-sm leading-6 text-emerald-300">
                  <strong>Recommendation:</strong> {finding.recommendation}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="mt-6 rounded-2xl border border-white/10 bg-slate-900 p-4">
        <h3 className="text-xl font-black text-white">Command and Raw Output</h3>
        <p className="mt-3 max-w-full break-all rounded-xl bg-black/40 p-3 text-sm text-emerald-300">
          {scan.safeCommandPreview || "Command preview not available"}
        </p>

        <pre className="mt-4 max-h-96 max-w-full overflow-auto whitespace-pre-wrap break-words rounded-xl bg-black p-4 text-xs leading-6 text-emerald-300">
          {scan.rawOutput || "Raw output not available"}
        </pre>
      </div>

      <div className="mt-6 border-t border-white/10 pt-4 text-xs text-slate-500">
        <p>Generated by SyferSec Lab Console.</p>
        <p>Scope: Authorized local lab scan. Review results before making production security decisions.</p>
      </div>
    </div>
  );
}
export default function SyferSecLabConsole() {
  const [nmapStatus, setNmapStatus] = useState(null);
  const [scanHistory, setScanHistory] = useState([]);
  const [activeScan, setActiveScan] = useState(null);
  const [activeTab, setActiveTab] = useState("summary");

  const [target, setTarget] = useState("127.0.0.1");
  const [modeId, setModeId] = useState("full-tcp");
  const [customPorts, setCustomPorts] = useState("1-65535");
  const [topPorts, setTopPorts] = useState("100");
  const [timing, setTiming] = useState("T3");
  const [serviceDetection, setServiceDetection] = useState(false);
  const [osDetection, setOsDetection] = useState(false);
  const [udpScan, setUdpScan] = useState(false);
  const [skipHostDiscovery, setSkipHostDiscovery] = useState(false);
  const [verboseOutput, setVerboseOutput] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [notes, setNotes] = useState("Authorized local lab scan");

  const [isRunning, setIsRunning] = useState(false);
  const [error, setError] = useState("");
  const [scanJob, setScanJob] = useState(null);
  const [liveOutput, setLiveOutput] = useState("");

  const selectedMode = useMemo(
    () => scanModes.find((mode) => mode.id === modeId),
    [modeId]
  );

  const needsConfirmation = Boolean(selectedMode?.confirm || osDetection || udpScan);

  const commandPreview = useMemo(() => {
    const base = selectedMode?.name || "Scan";
    const targetText = target || "<target>";
    return `${base} - ${timing} - ${customPorts || "top ports"} - ${targetText}`;
  }, [selectedMode, timing, customPorts, target]);

  function printReport() {
    if (!activeScan) return;
    setActiveTab("report");
    setTimeout(() => {
      window.print();
    }, 150);
  }
  async function loadStatusAndHistory() {
    try {
      const [statusRes, scansRes] = await Promise.all([
        fetch("/api/nmap/status"),
        fetch("/api/scans"),
      ]);

      const statusData = await statusRes.json();
      const scansData = await scansRes.json();

      setNmapStatus(statusData);
      setScanHistory(scansData.scans || []);

      if (!activeScan && scansData.scans?.length) {
        setActiveScan(scansData.scans[0]);
      }
    } catch {
      setError("Could not load Nmap status or scan history.");
    }
  }

  useEffect(() => {
    loadStatusAndHistory();
  }, []);

  async function runScan() {
    setError("");
    setIsRunning(true);
    setScanJob(null);
    setLiveOutput("");
    setActiveTab("summary");

    try {
      const response = await fetch("/api/scans/run", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          target,
          modeId,
          customPorts,
          topPorts,
          timing,
          serviceDetection,
          osDetection,
          udpScan,
          skipHostDiscovery,
          verboseOutput,
          confirmed,
          notes,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.error || "Scan failed.");
        setIsRunning(false);
        return;
      }

      if (data.jobId) {
        pollScanJob(data.jobId);
        return;
      }

      if (data.scan) {
        setActiveScan(data.scan);
        await loadStatusAndHistory();
      }
    } catch {
      setError("Scan failed. Check Nmap, target format, and scan options.");
      setIsRunning(false);
    }
  }

  async function pollScanJob(jobId) {
    let keepPolling = true;

    while (keepPolling) {
      try {
        const response = await fetch(`/api/scans/job?id=${encodeURIComponent(jobId)}`);
        const data = await response.json();

        if (!response.ok) {
          setError(data.error || "Could not read scan progress.");
          setIsRunning(false);
          return;
        }

        const job = data.job;
        setScanJob(job);
        setLiveOutput(job.liveOutput || "");

        if (job.status === "completed") {
          setActiveScan(job.scan);
          setIsRunning(false);
          await loadStatusAndHistory();
          keepPolling = false;
          return;
        }

        if (job.status === "failed") {
          setError(job.error || "Scan failed.");
          setIsRunning(false);
          keepPolling = false;
          return;
        }

        await new Promise((resolve) => setTimeout(resolve, 1000));
      } catch {
        setError("Lost connection to scan progress.");
        setIsRunning(false);
        keepPolling = false;
        return;
      }
    }
  }

  const hosts = activeScan?.parsed?.hosts || [];
  const openPorts = activeScan?.parsed?.openPorts || [];
  const findings = activeScan?.findings || [];
  const summary = activeScan?.parsed?.summary || { hostsUp: 0, openPorts: 0 };

  const scanButtonDisabled = isRunning || (needsConfirmation && !confirmed);

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-28 right-0 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
        <div className="absolute left-0 top-1/2 h-96 w-96 rounded-full bg-emerald-500/10 blur-3xl" />
      </div>

      <section className="relative z-10 mx-auto max-w-7xl px-5 py-8">
        <header className="mb-8 rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl shadow-black/20">
          <div className="flex flex-col justify-between gap-5 md:flex-row md:items-center">
            <div>
              <p className="text-sm font-bold uppercase tracking-[0.3em] text-cyan-300">
                SyferSec Lab Console
              </p>
              <h1 className="mt-3 text-4xl font-black tracking-tight text-white md:text-5xl">
                Advanced Nmap Lab Scanner
              </h1>
              <p className="mt-4 max-w-3xl text-slate-300">
                Full TCP scanning, custom ports, timing, service detection, OS detection,
                UDP scanning, parsed results, defensive findings, and local history.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-slate-950 p-4">
              {nmapStatus?.installed ? (
                <Badge tone="green">{nmapStatus.version}</Badge>
              ) : (
                <Badge tone="red">Nmap not found</Badge>
              )}
              <p className="mt-3 max-w-xs text-xs leading-5 text-slate-400">
                Path: {nmapStatus?.path || "checking..."}
              </p>
            </div>
          </div>
        </header>

        {error && (
          <div className="mb-6 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-red-200">
            {error}
          </div>
        )}

        <section className="mb-8 grid gap-4 md:grid-cols-4">
          <StatCard label="Total Scans" value={scanHistory.length} note="Saved locally" />
          <StatCard label="Hosts Found" value={summary.hostsUp} note="Current scan" />
          <StatCard label="Open Ports" value={summary.openPorts} note="Current scan" />
          <StatCard label="Findings" value={findings.length} note="Defensive review" />
        </section>

        <section className="grid gap-6 xl:grid-cols-[380px_minmax(0,1fr)]">
          <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl shadow-black/20">
            <div className="flex flex-col justify-between gap-3 md:flex-row md:items-center">
              <div>
                <h2 className="text-2xl font-black text-white">Build Scan</h2>
                <p className="mt-2 text-sm leading-6 text-slate-400">
                  Full TCP scan is default. Choose one host, multiple hosts, or a private CIDR range.
                </p>
              </div>
              <Badge tone="blue">Default: Full TCP</Badge>
            </div>

            <label className="mt-6 block text-sm font-bold text-slate-300">Target</label>
            <input
              value={target}
              onChange={(event) => setTarget(event.target.value)}
              placeholder="127.0.0.1, 192.168.50.100, or 192.168.50.0/24"
              className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
            />

            <div className="mt-3 grid grid-cols-1 gap-2 sm:grid-cols-4">
              <button type="button" onClick={() => setTarget("127.0.0.1")} className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-left text-xs font-bold text-slate-300 transition hover:border-cyan-400">Localhost<span className="block pt-1 font-normal text-slate-500">127.0.0.1</span></button>
              <button type="button" onClick={() => setTarget("192.168.50.100")} className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-left text-xs font-bold text-slate-300 transition hover:border-cyan-400">Single Host<span className="block pt-1 font-normal text-slate-500">192.168.50.100</span></button>
              <button type="button" onClick={() => setTarget("127.0.0.1,192.168.50.100")} className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-left text-xs font-bold text-slate-300 transition hover:border-cyan-400">Multiple<span className="block pt-1 font-normal text-slate-500">Comma separated</span></button>
              <button type="button" onClick={() => setTarget("192.168.50.0/24")} className="rounded-xl border border-white/10 bg-slate-950 px-3 py-2 text-left text-xs font-bold text-slate-300 transition hover:border-cyan-400">CIDR Range<span className="block pt-1 font-normal text-slate-500">Private /24</span></button>
            </div>

            <div className="mt-6 grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-bold text-slate-300">Scan Mode</label>
                <select
                  value={modeId}
                  onChange={(event) => {
                    setModeId(event.target.value);
                    setConfirmed(false);
                  }}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                >
                  {scanModes.map((mode) => (
                    <option key={mode.id} value={mode.id} className="bg-slate-950 text-white">
                      {mode.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300">Timing</label>
                <select
                  value={timing}
                  onChange={(event) => setTiming(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                >
                  <option className="bg-slate-950 text-white" value="T2">T2 - Polite</option>
                  <option className="bg-slate-950 text-white" value="T3">T3 - Normal</option>
                  <option className="bg-slate-950 text-white" value="T4">T4 - Fast Lab</option>
                  <option className="bg-slate-950 text-white" value="T5">T5 - Very Fast / Noisy Lab</option>
                </select>
              </div>
            </div>

            <div className="mt-5 rounded-2xl border border-cyan-400/30 bg-cyan-400/10 p-4">
              <div className="flex flex-wrap items-center gap-2">
                <Badge tone="blue">{selectedMode?.depth}</Badge>
                {needsConfirmation && <Badge tone="yellow">Confirmation required</Badge>}
              </div>
              <h3 className="mt-3 font-black text-cyan-100">{selectedMode?.name}</h3>
              <p className="mt-2 text-sm leading-6 text-slate-300">{selectedMode?.description}</p>
            </div>

            <div className="mt-5 grid gap-4 md:grid-cols-2">
              <div>
                <label className="block text-sm font-bold text-slate-300">Custom Ports</label>
                <input
                  value={customPorts}
                  onChange={(event) => setCustomPorts(event.target.value)}
                  placeholder="22,80,443 or 1-65535"
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-slate-300">Top Ports</label>
                <select
                  value={topPorts}
                  onChange={(event) => setTopPorts(event.target.value)}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-cyan-400"
                >
                  <option className="bg-slate-950 text-white" value="10">10</option>
                  <option className="bg-slate-950 text-white" value="50">50</option>
                  <option className="bg-slate-950 text-white" value="100">100</option>
                  <option className="bg-slate-950 text-white" value="500">500</option>
                  <option className="bg-slate-950 text-white" value="1000">1000</option>
                </select>
              </div>
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-2">
              {[
                ["Service Detection", serviceDetection, setServiceDetection],
                ["OS Detection", osDetection, setOsDetection],
                ["UDP Scan", udpScan, setUdpScan],
                ["Skip Host Discovery", skipHostDiscovery, setSkipHostDiscovery],
                ["Verbose Output", verboseOutput, setVerboseOutput],
              ].map(([label, checked, setter]) => (
                <label key={label} className="flex items-center gap-3 rounded-2xl border border-white/10 bg-slate-950 p-3 text-sm text-slate-300">
                  <input type="checkbox" checked={checked} onChange={(event) => setter(event.target.checked)} />
                  {label}
                </label>
              ))}
            </div>

            {needsConfirmation && (
              <label className="mt-5 flex gap-3 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100">
                <input type="checkbox" checked={confirmed} onChange={(event) => setConfirmed(event.target.checked)} />
                I confirm this is my authorized lab target.
              </label>
            )}

            <label className="mt-5 block text-sm font-bold text-slate-300">Notes</label>
            <textarea
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={3}
              className="mt-2 w-full resize-none rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none transition focus:border-cyan-400"
            />

            <div className="mt-5 rounded-2xl border border-white/10 bg-black/40 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-slate-500">Command preview</p>
              <code className="mt-2 block syfer-command-preview text-sm text-emerald-300">
                {activeScan?.safeCommandPreview || commandPreview}
              </code>
            </div>

            {isRunning && scanJob && (
              <div className="mt-5 rounded-2xl border border-cyan-400/30 bg-cyan-500/10 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="text-sm font-black text-cyan-200">
                      {scanJob.phase || "Scanning"}
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Job: {scanJob.id} - Elapsed: {Math.round((scanJob.durationMs || 0) / 1000)}s
                    </p>
                  </div>
                  <Badge tone="blue">{scanJob.progress || 1}%</Badge>
                </div>

                <div className="mt-3 h-4 overflow-hidden rounded-full bg-slate-950">
                  <div
                    className="h-full rounded-full bg-cyan-400 transition-all duration-500"
                    style={{ width: `${Math.max(1, Math.min(100, scanJob.progress || 1))}%` }}
                  />
                </div>

                {liveOutput && (
                  <pre className="mt-4 max-h-44 overflow-auto rounded-xl bg-black/60 p-3 text-xs leading-5 text-emerald-300">
                    {liveOutput}
                  </pre>
                )}
              </div>
            )}
            <button
              onClick={runScan}
              disabled={scanButtonDisabled}
              className="mt-6 w-full rounded-full bg-cyan-400 px-6 py-3 font-black text-slate-950 transition hover:bg-cyan-300 disabled:cursor-not-allowed disabled:bg-slate-700 disabled:text-slate-400"
            >
              {isRunning ? "Running Scan..." : "Run Scan"}
            </button>
          </div>

          <div className="min-w-0 space-y-6">
            <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl shadow-black/20">
              <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
                <div>
                  <h2 className="text-2xl font-black text-white">Scan Results</h2>
                  <p className="mt-2 text-sm leading-6 text-slate-400">
                    Parsed hosts, open ports, defensive findings, and raw XML output.
                  </p>
                </div>
                {activeScan && (
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge tone="green">{activeScan.status}</Badge>
                    <button
                      type="button"
                      onClick={printReport}
                      className="rounded-full border border-cyan-400/30 bg-cyan-500/10 px-4 py-2 text-sm font-bold text-cyan-200 transition hover:bg-cyan-400 hover:text-slate-950"
                    >
                      Print Report
                    </button>
                  </div>
                )}
              </div>

              {!activeScan ? (
                <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950 p-5 text-slate-400">
                  No scan selected yet. Run a scan against 127.0.0.1 to test.
                </div>
              ) : (
                <>
                  <div className="mt-5 flex flex-wrap gap-2">
                    {["summary", "hosts", "ports", "findings", "report", "raw"].map((tab) => (
                      <button
                        key={tab}
                        onClick={() => setActiveTab(tab)}
                        className={`rounded-full px-4 py-2 text-sm font-bold transition ${
                          activeTab === tab
                            ? "bg-cyan-400 text-slate-950"
                            : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                        }`}
                      >
                        {tab.toUpperCase()}
                      </button>
                    ))}
                  </div>

                  {activeTab === "summary" && (
                    <div className="mt-5 grid gap-4 md:grid-cols-3">
                      <StatCard label="Target" value={activeScan.target ? "Set" : "N/A"} note={activeScan.target} />
                      <StatCard label="Mode" value={activeScan.modeName || "Scan"} note={`${activeScan.durationMs} ms`} />
                      <StatCard label="Command" value="Ready" note={activeScan.safeCommandPreview} />
                    </div>
                  )}

                  {activeTab === "hosts" && (
                    <div className="mt-5 space-y-3">
                      {hosts.length === 0 && (
                        <p className="rounded-2xl border border-white/10 bg-slate-950 p-4 text-slate-400">
                          No hosts found in this scan.
                        </p>
                      )}

                      {hosts.map((host) => (
                        <div key={host.ip} className="rounded-2xl border border-white/10 bg-slate-950 p-4">
                          <div className="flex min-w-0 flex-col items-start justify-between gap-3 md:flex-row md:items-center">
                            <div>
                              <p className="font-black text-white">{host.ip}</p>
                              <p className="text-sm text-slate-400">
                                {host.hostname || "No hostname"} {host.osGuess ? `- ${host.osGuess}` : ""}
                              </p>
                            </div>
                            <Badge tone={host.status === "up" ? "green" : "slate"}>{host.status}</Badge>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "ports" && (
                    <div className="mt-5 max-w-full overflow-x-auto rounded-2xl border border-white/10">
                      {openPorts.length === 0 ? (
                        <p className="bg-slate-950 p-4 text-slate-400">No open ports found in this scan.</p>
                      ) : (
                        <table className="w-full text-left text-sm">
                          <thead className="bg-slate-950 text-slate-400">
                            <tr>
                              <th className="p-3">Host</th>
                              <th className="p-3">Port</th>
                              <th className="p-3">Service</th>
                              <th className="p-3">Version</th>
                            </tr>
                          </thead>
                          <tbody>
                            {openPorts.map((port) => (
                              <tr key={`${port.host}-${port.protocol}-${port.port}`} className="border-t border-white/10">
                                <td className="p-3 text-slate-300">{port.host}</td>
                                <td className="p-3 font-bold text-cyan-300">{port.port}/{port.protocol}</td>
                                <td className="p-3 text-slate-300">{port.service}</td>
                                <td className="p-3 text-slate-400">{[port.product, port.version].filter(Boolean).join(" ")}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      )}
                    </div>
                  )}

                  {activeTab === "findings" && (
                    <div className="mt-5 space-y-3">
                      {findings.length === 0 && (
                        <p className="rounded-2xl border border-white/10 bg-slate-950 p-4 text-slate-400">
                          No defensive findings generated from this scan.
                        </p>
                      )}

                      {findings.map((finding, index) => (
                        <div key={`${finding.title}-${index}`} className="rounded-2xl border border-white/10 bg-slate-950 p-4">
                          <div className="mb-2 flex flex-wrap gap-2">
                            <Badge tone={finding.severity === "High" ? "red" : finding.severity === "Medium" ? "yellow" : finding.severity === "Low" ? "blue" : "slate"}>
                              {finding.severity}
                            </Badge>
                            <Badge>{finding.host}</Badge>
                          </div>
                          <p className="font-black text-white">{finding.title}</p>
                          <p className="mt-2 text-sm leading-6 text-slate-400">{finding.description}</p>
                          <p className="mt-2 text-sm leading-6 text-emerald-300">{finding.recommendation}</p>
                        </div>
                      ))}
                    </div>
                  )}

                  {activeTab === "report" && (
                    <div className="mt-5">
                      <ReportView
                        scan={activeScan}
                        hosts={hosts}
                        openPorts={openPorts}
                        findings={findings}
                      />
                    </div>
                  )}
                  {activeTab === "raw" && (
                    <pre className="mt-5 max-h-96 max-w-full overflow-auto whitespace-pre-wrap break-words rounded-2xl bg-black p-4 text-xs leading-6 text-emerald-300">
                      {activeScan.rawOutput}
                    </pre>
                  )}
                </>
              )}
            </div>

            <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-6 shadow-2xl shadow-black/20">
              <h2 className="text-2xl font-black text-white">Recent Scans</h2>

              {scanHistory.length === 0 ? (
                <p className="mt-5 rounded-2xl border border-white/10 bg-slate-950 p-4 text-slate-400">
                  No saved scans yet.
                </p>
              ) : (
                <div className="mt-5 space-y-3">
                  {scanHistory.map((scan) => (
                    <button
                      key={scan.id}
                      onClick={() => {
                        setActiveScan(scan);
                        setActiveTab("summary");
                      }}
                      className="syfer-recent-row min-w-0 w-full overflow-hidden rounded-2xl border border-white/10 bg-slate-950 p-4 text-left transition hover:border-cyan-400"
                    >
                      <div className="flex min-w-0 flex-col items-start justify-between gap-3 md:flex-row md:items-center">
                        <div className="syfer-recent-text min-w-0"><p className="font-black text-white syfer-card-text">{scan.modeName || scan.presetName || "Scan"}</p>
                          <p className="text-sm leading-6 text-slate-400 syfer-card-text">{scan.target} - {scan.parsed?.summary?.hostsUp || 0} hosts - {scan.parsed?.summary?.openPorts || 0} open ports
                          </p>
                        </div>
                        <span className="syfer-badge-lock shrink-0"><Badge tone="green">Completed</Badge></span>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>
        </section>
      </section>
    </main>
  );
}
