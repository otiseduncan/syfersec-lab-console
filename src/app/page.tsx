'use client'

import { useMemo, useState } from 'react'

const assets = [
  {
    id: 1,
    hostname: 'kali-purple-lab',
    ip: '192.168.50.105',
    os: 'Kali Purple',
    environment: 'Security Lab',
    risk: 'Medium',
    lastSeen: 'Today',
    ports: ['22/tcp SSH', '80/tcp HTTP'],
  },
  {
    id: 2,
    hostname: 'metasploitable2',
    ip: '192.168.50.100',
    os: 'Ubuntu Linux',
    environment: 'Vulnerable Target',
    risk: 'Critical',
    lastSeen: 'Today',
    ports: ['21/tcp FTP', '22/tcp SSH', '139/tcp SMB', '445/tcp SMB'],
  },
  {
    id: 3,
    hostname: 'windows-test-host',
    ip: '192.168.50.120',
    os: 'Windows Server',
    environment: 'Test Target',
    risk: 'High',
    lastSeen: 'Yesterday',
    ports: ['3389/tcp RDP', '445/tcp SMB'],
  },
]

const findings = [
  {
    id: 1,
    title: 'Anonymous FTP access detected',
    asset: 'metasploitable2',
    severity: 'Critical',
    status: 'Open',
    remediation: 'Disable anonymous FTP and restrict access.',
  },
  {
    id: 2,
    title: 'SMB service exposed in lab network',
    asset: 'metasploitable2',
    severity: 'High',
    status: 'In Review',
    remediation: 'Validate shares, disable legacy SMB, restrict firewall rules.',
  },
  {
    id: 3,
    title: 'RDP exposed on Windows test host',
    asset: 'windows-test-host',
    severity: 'Medium',
    status: 'Planned',
    remediation: 'Limit RDP to trusted admin workstation.',
  },
]

const events = [
  {
    id: 1,
    type: 'Port Scan',
    source: '192.168.50.105',
    destination: '192.168.50.100',
    severity: 'Low',
    status: 'Reviewed',
    time: '09:15 AM',
  },
  {
    id: 2,
    type: 'Authentication Attempt',
    source: '192.168.50.105',
    destination: '192.168.50.120',
    severity: 'Medium',
    status: 'Open',
    time: '10:42 AM',
  },
  {
    id: 3,
    type: 'Service Enumeration',
    source: '192.168.50.105',
    destination: '192.168.50.100',
    severity: 'High',
    status: 'In Review',
    time: '11:08 AM',
  },
]

function severityClass(severity: string) {
  switch (severity) {
    case 'Critical':
      return 'border-red-500/40 bg-red-500/10 text-red-300'
    case 'High':
      return 'border-orange-500/40 bg-orange-500/10 text-orange-300'
    case 'Medium':
      return 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300'
    default:
      return 'border-cyan-500/40 bg-cyan-500/10 text-cyan-300'
  }
}

export default function Home() {
  const [selectedAsset, setSelectedAsset] = useState(assets[0])
  const [assetFilter, setAssetFilter] = useState('All')

  const filteredAssets = useMemo(() => {
    if (assetFilter === 'All') return assets
    return assets.filter((asset) => asset.risk === assetFilter)
  }, [assetFilter])

  const criticalFindings = findings.filter(
    (finding) => finding.severity === 'Critical'
  ).length

  const openFindings = findings.filter(
    (finding) => finding.status !== 'Resolved'
  ).length

  const highRiskAssets = assets.filter((asset) =>
    ['Critical', 'High'].includes(asset.risk)
  ).length

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="border-b border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-teal-400">
                SyferSec Lab Console
              </p>

              <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
                Security lab visibility for assets, findings, events, and
                evidence.
              </h1>

              <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-400">
                A cybersecurity portfolio dashboard for documenting lab systems,
                open ports, vulnerability notes, remediation status, and
                security event activity.
              </p>
            </div>

            <div className="rounded-2xl border border-teal-400/20 bg-teal-400/10 px-5 py-4 text-sm text-teal-200">
              Portfolio MVP • Defensive Security • Lab Tracking
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Total Assets</p>
          <h2 className="mt-2 text-3xl font-bold">{assets.length}</h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">High Risk Assets</p>
          <h2 className="mt-2 text-3xl font-bold text-orange-300">
            {highRiskAssets}
          </h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Open Findings</p>
          <h2 className="mt-2 text-3xl font-bold text-yellow-300">
            {openFindings}
          </h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900 p-5">
          <p className="text-sm text-slate-400">Critical Findings</p>
          <h2 className="mt-2 text-3xl font-bold text-red-300">
            {criticalFindings}
          </h2>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Asset Inventory</h2>
              <p className="text-sm text-slate-400">
                Track hosts, IPs, OS, and risk level.
              </p>
            </div>

            <select
              value={assetFilter}
              onChange={(event) => setAssetFilter(event.target.value)}
              className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-teal-400"
            >
              <option>All</option>
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredAssets.map((asset) => (
              <button
                key={asset.id}
                onClick={() => setSelectedAsset(asset)}
                className={`w-full rounded-xl border p-4 text-left transition hover:border-teal-400/50 ${
                  selectedAsset.id === asset.id
                    ? 'border-teal-400/50 bg-teal-400/10'
                    : 'border-white/10 bg-slate-950'
                }`}
              >
                <div className="mb-2 flex items-center justify-between gap-3">
                  <h3 className="font-semibold">{asset.hostname}</h3>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs ${severityClass(
                      asset.risk
                    )}`}
                  >
                    {asset.risk}
                  </span>
                </div>

                <p className="text-sm text-slate-400">
                  {asset.ip} • {asset.os}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">
          <h2 className="text-2xl font-bold">Asset Detail</h2>
          <p className="mt-1 text-sm text-slate-400">
            Selected host profile and service notes.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">Hostname</p>
              <p className="mt-1 font-semibold">{selectedAsset.hostname}</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">IP Address</p>
              <p className="mt-1 font-semibold">{selectedAsset.ip}</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">Operating System</p>
              <p className="mt-1 font-semibold">{selectedAsset.os}</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-950 p-4">
              <p className="text-sm text-slate-400">Last Seen</p>
              <p className="mt-1 font-semibold">{selectedAsset.lastSeen}</p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-white/10 bg-slate-950 p-4">
            <p className="mb-3 text-sm font-semibold text-slate-300">
              Open Ports / Services
            </p>

            <div className="flex flex-wrap gap-2">
              {selectedAsset.ports.map((port) => (
                <span
                  key={port}
                  className="rounded-full border border-teal-400/20 bg-teal-400/10 px-3 py-1 text-sm text-teal-300"
                >
                  {port}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-10 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">
          <h2 className="text-2xl font-bold">Findings Tracker</h2>
          <p className="mt-1 text-sm text-slate-400">
            Vulnerability notes and remediation status.
          </p>

          <div className="mt-6 space-y-4">
            {findings.map((finding) => (
              <div
                key={finding.id}
                className="rounded-xl border border-white/10 bg-slate-950 p-4"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-semibold">{finding.title}</h3>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs ${severityClass(
                      finding.severity
                    )}`}
                  >
                    {finding.severity}
                  </span>
                </div>

                <p className="text-sm text-slate-400">Asset: {finding.asset}</p>

                <p className="mt-2 text-sm text-slate-300">
                  Remediation: {finding.remediation}
                </p>

                <p className="mt-3 text-xs font-semibold uppercase tracking-wider text-teal-300">
                  Status: {finding.status}
                </p>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900 p-6">
          <h2 className="text-2xl font-bold">Security Events</h2>
          <p className="mt-1 text-sm text-slate-400">
            Recent lab activity and review queue.
          </p>

          <div className="mt-6 space-y-4">
            {events.map((event) => (
              <div
                key={event.id}
                className="rounded-xl border border-white/10 bg-slate-950 p-4"
              >
                <div className="mb-3 flex flex-wrap items-center justify-between gap-3">
                  <h3 className="font-semibold">{event.type}</h3>
                  <span
                    className={`rounded-full border px-3 py-1 text-xs ${severityClass(
                      event.severity
                    )}`}
                  >
                    {event.severity}
                  </span>
                </div>

                <p className="text-sm text-slate-400">
                  {event.source} → {event.destination}
                </p>

                <p className="mt-2 text-sm text-slate-300">
                  {event.time} • Status: {event.status}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-12">
        <div className="rounded-2xl border border-teal-400/20 bg-teal-400/10 p-6">
          <h2 className="text-2xl font-bold">Evidence & Reporting Roadmap</h2>
          <p className="mt-3 leading-8 text-slate-300">
            Next steps: add Supabase authentication, PostgreSQL tables,
            screenshot uploads, Nmap CSV/XML import, printable reports, and
            role-based access for lab documentation.
          </p>
        </div>
      </section>
    </main>
  )
}