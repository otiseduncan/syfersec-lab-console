'use client'

import { useMemo, useState } from 'react'

type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Low'
type FindingStatus =
  | 'Open'
  | 'In Review'
  | 'Planned'
  | 'Resolved'
  | 'Risk Accepted'
  | 'False Positive'
type EventStatus = 'Open' | 'In Review' | 'Reviewed' | 'Resolved'

type Asset = {
  id: number
  hostname: string
  ip: string
  os: string
  environment: string
  risk: RiskLevel
  lastSeen: string
  ports: string[]
}

type Finding = {
  id: number
  title: string
  asset: string
  severity: RiskLevel
  status: FindingStatus
  description: string
  remediation: string
  evidence: string
  recommendation: string
}

type SecurityEvent = {
  id: number
  type: string
  source: string
  destination: string
  severity: RiskLevel
  status: EventStatus
  time: string
  notes: string
}

const initialAssets: Asset[] = [
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

const initialFindings: Finding[] = [
  {
    id: 1,
    title: 'Anonymous FTP access detected',
    asset: 'metasploitable2',
    severity: 'Critical',
    status: 'Open',
    description:
      'The target exposes FTP services and appears to allow anonymous access in the lab environment.',
    remediation: 'Disable anonymous FTP and restrict access.',
    evidence: 'Detected open TCP port 21 during service enumeration.',
    recommendation:
      'Disable anonymous FTP, require authenticated access, restrict FTP by firewall rule, and replace FTP with SFTP where possible.',
  },
  {
    id: 2,
    title: 'SMB service exposed in lab network',
    asset: 'metasploitable2',
    severity: 'High',
    status: 'In Review',
    description:
      'SMB services are exposed on the target and should be reviewed for unnecessary shares or legacy protocol support.',
    remediation: 'Validate shares, disable legacy SMB, restrict firewall rules.',
    evidence: 'Detected open TCP ports 139 and 445.',
    recommendation:
      'Limit SMB access to trusted hosts, remove unnecessary shares, disable legacy SMB versions, and enforce host firewall restrictions.',
  },
  {
    id: 3,
    title: 'RDP exposed on Windows test host',
    asset: 'windows-test-host',
    severity: 'Medium',
    status: 'Planned',
    description:
      'Remote Desktop is exposed on the Windows test host and should be limited to trusted administration sources.',
    remediation: 'Limit RDP to trusted admin workstation.',
    evidence: 'Detected open TCP port 3389.',
    recommendation:
      'Restrict RDP with firewall rules, require strong authentication, enable account lockout policy, and consider VPN-only administration.',
  },
]

const initialEvents: SecurityEvent[] = [
  {
    id: 1,
    type: 'Port Scan',
    source: '192.168.50.105',
    destination: '192.168.50.100',
    severity: 'Low',
    status: 'Reviewed',
    time: '09:15 AM',
    notes: 'Authorized lab scan from Kali Purple to Metasploitable2.',
  },
  {
    id: 2,
    type: 'Authentication Attempt',
    source: '192.168.50.105',
    destination: '192.168.50.120',
    severity: 'Medium',
    status: 'Open',
    time: '10:42 AM',
    notes: 'Authentication activity requires review.',
  },
  {
    id: 3,
    type: 'Service Enumeration',
    source: '192.168.50.105',
    destination: '192.168.50.100',
    severity: 'High',
    status: 'In Review',
    time: '11:08 AM',
    notes: 'Service enumeration identified multiple exposed services.',
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

function statusClass(status: string) {
  switch (status) {
    case 'Resolved':
    case 'Reviewed':
      return 'border-green-500/40 bg-green-500/10 text-green-300'
    case 'Risk Accepted':
      return 'border-purple-500/40 bg-purple-500/10 text-purple-300'
    case 'False Positive':
      return 'border-slate-500/40 bg-slate-500/10 text-slate-300'
    case 'In Review':
      return 'border-blue-500/40 bg-blue-500/10 text-blue-300'
    case 'Planned':
      return 'border-teal-500/40 bg-teal-500/10 text-teal-300'
    default:
      return 'border-yellow-500/40 bg-yellow-500/10 text-yellow-300'
  }
}

export default function Home() {
  const [assetList, setAssetList] = useState<Asset[]>(initialAssets)
  const [findingList, setFindingList] = useState<Finding[]>(initialFindings)
  const [eventList, setEventList] = useState<SecurityEvent[]>(initialEvents)
  const [selectedAsset, setSelectedAsset] = useState<Asset>(initialAssets[0])
  const [assetFilter, setAssetFilter] = useState('All')

  const [newAsset, setNewAsset] = useState({
    hostname: '',
    ip: '',
    os: '',
    environment: 'Security Lab',
    risk: 'Medium' as RiskLevel,
    lastSeen: 'Today',
    ports: '',
  })

  const [newFinding, setNewFinding] = useState({
    title: '',
    asset: initialAssets[0].hostname,
    severity: 'Medium' as RiskLevel,
    status: 'Open' as FindingStatus,
    description: '',
    evidence: '',
    remediation: '',
    recommendation: '',
  })

  const [newEvent, setNewEvent] = useState({
    type: '',
    source: '',
    destination: '',
    severity: 'Low' as RiskLevel,
    status: 'Open' as EventStatus,
    time: '',
    notes: '',
  })

  function handleAddAsset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!newAsset.hostname.trim() || !newAsset.ip.trim() || !newAsset.os.trim()) {
      alert('Hostname, IP address, and operating system are required.')
      return
    }

    const assetToAdd: Asset = {
      id: Date.now(),
      hostname: newAsset.hostname.trim(),
      ip: newAsset.ip.trim(),
      os: newAsset.os.trim(),
      environment: newAsset.environment.trim() || 'Security Lab',
      risk: newAsset.risk,
      lastSeen: newAsset.lastSeen.trim() || 'Today',
      ports: newAsset.ports
        .split(',')
        .map((port) => port.trim())
        .filter(Boolean),
    }

    setAssetList((currentAssets) => [assetToAdd, ...currentAssets])
    setSelectedAsset(assetToAdd)
    setAssetFilter('All')
    setNewFinding((currentFinding) => ({
      ...currentFinding,
      asset: assetToAdd.hostname,
    }))

    setNewAsset({
      hostname: '',
      ip: '',
      os: '',
      environment: 'Security Lab',
      risk: 'Medium',
      lastSeen: 'Today',
      ports: '',
    })
  }

  function handleAddFinding(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!newFinding.title.trim() || !newFinding.remediation.trim()) {
      alert('Finding title and remediation recommendation are required.')
      return
    }

    const findingToAdd: Finding = {
      id: Date.now(),
      title: newFinding.title.trim(),
      asset: newFinding.asset,
      severity: newFinding.severity,
      status: newFinding.status,
      description:
        newFinding.description.trim() ||
        'Manual finding documented from lab review.',
      remediation: newFinding.remediation.trim(),
      evidence:
        newFinding.evidence.trim() ||
        'Evidence pending. Add scan output or screenshot reference.',
      recommendation:
        newFinding.recommendation.trim() || newFinding.remediation.trim(),
    }

    setFindingList((currentFindings) => [findingToAdd, ...currentFindings])

    setNewFinding({
      title: '',
      asset: selectedAsset.hostname,
      severity: 'Medium',
      status: 'Open',
      description: '',
      evidence: '',
      remediation: '',
      recommendation: '',
    })
  }

  function handleAddEvent(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!newEvent.type.trim() || !newEvent.source.trim() || !newEvent.destination.trim()) {
      alert('Event type, source, and destination are required.')
      return
    }

    const eventToAdd: SecurityEvent = {
      id: Date.now(),
      type: newEvent.type.trim(),
      source: newEvent.source.trim(),
      destination: newEvent.destination.trim(),
      severity: newEvent.severity,
      status: newEvent.status,
      time:
        newEvent.time.trim() ||
        new Date().toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        }),
      notes: newEvent.notes.trim() || 'Manual event entry.',
    }

    setEventList((currentEvents) => [eventToAdd, ...currentEvents])

    setNewEvent({
      type: '',
      source: '',
      destination: '',
      severity: 'Low',
      status: 'Open',
      time: '',
      notes: '',
    })
  }

  function updateFindingStatus(id: number, status: FindingStatus) {
    setFindingList((currentFindings) =>
      currentFindings.map((finding) =>
        finding.id === id ? { ...finding, status } : finding
      )
    )
  }

  function updateEventStatus(id: number, status: EventStatus) {
    setEventList((currentEvents) =>
      currentEvents.map((event) =>
        event.id === id ? { ...event, status } : event
      )
    )
  }

  const filteredAssets = useMemo(() => {
    if (assetFilter === 'All') return assetList
    return assetList.filter((asset) => asset.risk === assetFilter)
  }, [assetFilter, assetList])

  const criticalFindings = findingList.filter(
    (finding) => finding.severity === 'Critical'
  ).length

  const openFindings = findingList.filter(
    (finding) =>
      finding.status !== 'Resolved' &&
      finding.status !== 'Risk Accepted' &&
      finding.status !== 'False Positive'
  ).length

  const highRiskAssets = assetList.filter((asset) =>
    ['Critical', 'High'].includes(asset.risk)
  ).length

  const unresolvedFindings = findingList.filter(
    (finding) =>
      finding.status !== 'Resolved' &&
      finding.status !== 'Risk Accepted' &&
      finding.status !== 'False Positive'
  )

  const reportDate = new Date().toLocaleDateString()

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100">
      <section className="border-b border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-6 py-10 print:bg-white print:text-black">
        <div className="mx-auto max-w-7xl">
          <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
            <div>
              <p className="mb-3 text-sm font-semibold uppercase tracking-[0.25em] text-teal-400 print:text-slate-700">
                SyferSec Lab Console
              </p>

              <h1 className="text-4xl font-extrabold tracking-tight md:text-5xl">
                Security lab visibility for assets, findings, events, and
                evidence.
              </h1>

              <p className="mt-4 max-w-3xl text-lg leading-8 text-slate-400 print:text-slate-700">
                A cybersecurity portfolio dashboard for documenting lab systems,
                open ports, vulnerability notes, remediation status, and
                security event activity.
              </p>
            </div>

            <button
              onClick={() => window.print()}
              className="rounded-2xl border border-teal-400/20 bg-teal-400/10 px-5 py-4 text-left text-sm text-teal-200 transition hover:bg-teal-400/20 print:hidden"
            >
              Print / Save PDF Report
            </button>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 py-8 md:grid-cols-4">
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-5 print:border-slate-300 print:bg-white">
          <p className="text-sm text-slate-400 print:text-slate-600">Total Assets</p>
          <h2 className="mt-2 text-3xl font-bold">{assetList.length}</h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900 p-5 print:border-slate-300 print:bg-white">
          <p className="text-sm text-slate-400 print:text-slate-600">High Risk Assets</p>
          <h2 className="mt-2 text-3xl font-bold text-orange-300 print:text-black">
            {highRiskAssets}
          </h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900 p-5 print:border-slate-300 print:bg-white">
          <p className="text-sm text-slate-400 print:text-slate-600">Open Findings</p>
          <h2 className="mt-2 text-3xl font-bold text-yellow-300 print:text-black">
            {openFindings}
          </h2>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900 p-5 print:border-slate-300 print:bg-white">
          <p className="text-sm text-slate-400 print:text-slate-600">Critical Findings</p>
          <h2 className="mt-2 text-3xl font-bold text-red-300 print:text-black">
            {criticalFindings}
          </h2>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-8 print:hidden">
        <form
          onSubmit={handleAddAsset}
          className="rounded-2xl border border-white/10 bg-slate-900 p-6"
        >
          <div className="mb-5">
            <h2 className="text-2xl font-bold">Add New Asset</h2>
            <p className="text-sm text-slate-400">
              Add a lab host, IP address, operating system, risk level, and known
              ports.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-300">Hostname</span>
              <input
                value={newAsset.hostname}
                onChange={(event) =>
                  setNewAsset((currentAsset) => ({
                    ...currentAsset,
                    hostname: event.target.value,
                  }))
                }
                className="rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-teal-400"
                placeholder="ubuntu-lab-host"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-300">IP Address</span>
              <input
                value={newAsset.ip}
                onChange={(event) =>
                  setNewAsset((currentAsset) => ({
                    ...currentAsset,
                    ip: event.target.value,
                  }))
                }
                className="rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-teal-400"
                placeholder="192.168.50.10"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-300">Operating System</span>
              <input
                value={newAsset.os}
                onChange={(event) =>
                  setNewAsset((currentAsset) => ({
                    ...currentAsset,
                    os: event.target.value,
                  }))
                }
                className="rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-teal-400"
                placeholder="Ubuntu Linux"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-300">Environment</span>
              <input
                value={newAsset.environment}
                onChange={(event) =>
                  setNewAsset((currentAsset) => ({
                    ...currentAsset,
                    environment: event.target.value,
                  }))
                }
                className="rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-teal-400"
                placeholder="Security Lab"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-300">Risk Level</span>
              <select
                value={newAsset.risk}
                onChange={(event) =>
                  setNewAsset((currentAsset) => ({
                    ...currentAsset,
                    risk: event.target.value as RiskLevel,
                  }))
                }
                className="rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-teal-400"
              >
                <option>Critical</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-300">Last Seen</span>
              <input
                value={newAsset.lastSeen}
                onChange={(event) =>
                  setNewAsset((currentAsset) => ({
                    ...currentAsset,
                    lastSeen: event.target.value,
                  }))
                }
                className="rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-teal-400"
                placeholder="Today"
              />
            </label>

            <label className="grid gap-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-300">
                Open Ports / Services
              </span>
              <input
                value={newAsset.ports}
                onChange={(event) =>
                  setNewAsset((currentAsset) => ({
                    ...currentAsset,
                    ports: event.target.value,
                  }))
                }
                className="rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-teal-400"
                placeholder="22/tcp SSH, 80/tcp HTTP, 443/tcp HTTPS"
              />
            </label>

            <div className="flex items-end">
              <button
                type="submit"
                className="w-full rounded-lg bg-teal-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-teal-400"
              >
                Add Asset
              </button>
            </div>
          </div>
        </form>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-8 print:hidden">
        <form
          onSubmit={handleAddFinding}
          className="rounded-2xl border border-white/10 bg-slate-900 p-6"
        >
          <div className="mb-5">
            <h2 className="text-2xl font-bold">Add New Finding</h2>
            <p className="text-sm text-slate-400">
              Document vulnerability notes, evidence, recommendation, and
              remediation status.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="grid gap-2 md:col-span-2">
              <span className="text-sm font-semibold text-slate-300">Finding Title</span>
              <input
                value={newFinding.title}
                onChange={(event) =>
                  setNewFinding((currentFinding) => ({
                    ...currentFinding,
                    title: event.target.value,
                  }))
                }
                className="rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-teal-400"
                placeholder="Unpatched service detected"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-300">Affected Asset</span>
              <select
                value={newFinding.asset}
                onChange={(event) =>
                  setNewFinding((currentFinding) => ({
                    ...currentFinding,
                    asset: event.target.value,
                  }))
                }
                className="rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-teal-400"
              >
                {assetList.map((asset) => (
                  <option key={asset.id}>{asset.hostname}</option>
                ))}
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-300">Severity</span>
              <select
                value={newFinding.severity}
                onChange={(event) =>
                  setNewFinding((currentFinding) => ({
                    ...currentFinding,
                    severity: event.target.value as RiskLevel,
                  }))
                }
                className="rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-teal-400"
              >
                <option>Critical</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-300">Status</span>
              <select
                value={newFinding.status}
                onChange={(event) =>
                  setNewFinding((currentFinding) => ({
                    ...currentFinding,
                    status: event.target.value as FindingStatus,
                  }))
                }
                className="rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-teal-400"
              >
                <option>Open</option>
                <option>In Review</option>
                <option>Planned</option>
                <option>Resolved</option>
                <option>Risk Accepted</option>
                <option>False Positive</option>
              </select>
            </label>

            <label className="grid gap-2 md:col-span-3">
              <span className="text-sm font-semibold text-slate-300">Finding Description</span>
              <textarea
                value={newFinding.description}
                onChange={(event) =>
                  setNewFinding((currentFinding) => ({
                    ...currentFinding,
                    description: event.target.value,
                  }))
                }
                rows={2}
                className="rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-teal-400"
                placeholder="Describe the security concern."
              />
            </label>

            <label className="grid gap-2 md:col-span-3">
              <span className="text-sm font-semibold text-slate-300">Evidence Notes</span>
              <textarea
                value={newFinding.evidence}
                onChange={(event) =>
                  setNewFinding((currentFinding) => ({
                    ...currentFinding,
                    evidence: event.target.value,
                  }))
                }
                rows={2}
                className="rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-teal-400"
                placeholder="Example: Nmap showed port 445/tcp open."
              />
            </label>

            <label className="grid gap-2 md:col-span-3">
              <span className="text-sm font-semibold text-slate-300">Recommendation</span>
              <textarea
                value={newFinding.recommendation}
                onChange={(event) =>
                  setNewFinding((currentFinding) => ({
                    ...currentFinding,
                    recommendation: event.target.value,
                  }))
                }
                rows={2}
                className="rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-teal-400"
                placeholder="Write the client-friendly recommendation."
              />
            </label>

            <label className="grid gap-2 md:col-span-3">
              <span className="text-sm font-semibold text-slate-300">
                Remediation Action
              </span>
              <textarea
                value={newFinding.remediation}
                onChange={(event) =>
                  setNewFinding((currentFinding) => ({
                    ...currentFinding,
                    remediation: event.target.value,
                  }))
                }
                rows={3}
                className="rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-teal-400"
                placeholder="Describe the corrective action."
              />
            </label>

            <div className="flex items-end md:col-span-3">
              <button
                type="submit"
                className="w-full rounded-lg bg-teal-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-teal-400 md:w-auto md:px-8"
              >
                Add Finding
              </button>
            </div>
          </div>
        </form>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-8 print:hidden">
        <form
          onSubmit={handleAddEvent}
          className="rounded-2xl border border-white/10 bg-slate-900 p-6"
        >
          <div className="mb-5">
            <h2 className="text-2xl font-bold">Add Security Event</h2>
            <p className="text-sm text-slate-400">
              Record authorized lab activity, alerts, authentication attempts,
              or scan events.
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-300">Event Type</span>
              <input
                value={newEvent.type}
                onChange={(event) =>
                  setNewEvent((currentEvent) => ({
                    ...currentEvent,
                    type: event.target.value,
                  }))
                }
                className="rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-teal-400"
                placeholder="Port Scan"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-300">Source IP</span>
              <input
                value={newEvent.source}
                onChange={(event) =>
                  setNewEvent((currentEvent) => ({
                    ...currentEvent,
                    source: event.target.value,
                  }))
                }
                className="rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-teal-400"
                placeholder="192.168.50.105"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-300">Destination IP</span>
              <input
                value={newEvent.destination}
                onChange={(event) =>
                  setNewEvent((currentEvent) => ({
                    ...currentEvent,
                    destination: event.target.value,
                  }))
                }
                className="rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-teal-400"
                placeholder="192.168.50.100"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-300">Severity</span>
              <select
                value={newEvent.severity}
                onChange={(event) =>
                  setNewEvent((currentEvent) => ({
                    ...currentEvent,
                    severity: event.target.value as RiskLevel,
                  }))
                }
                className="rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-teal-400"
              >
                <option>Critical</option>
                <option>High</option>
                <option>Medium</option>
                <option>Low</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-300">Status</span>
              <select
                value={newEvent.status}
                onChange={(event) =>
                  setNewEvent((currentEvent) => ({
                    ...currentEvent,
                    status: event.target.value as EventStatus,
                  }))
                }
                className="rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-teal-400"
              >
                <option>Open</option>
                <option>In Review</option>
                <option>Reviewed</option>
                <option>Resolved</option>
              </select>
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-300">Time</span>
              <input
                value={newEvent.time}
                onChange={(event) =>
                  setNewEvent((currentEvent) => ({
                    ...currentEvent,
                    time: event.target.value,
                  }))
                }
                className="rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-teal-400"
                placeholder="11:45 AM"
              />
            </label>

            <label className="grid gap-2 md:col-span-3">
              <span className="text-sm font-semibold text-slate-300">Event Notes</span>
              <textarea
                value={newEvent.notes}
                onChange={(event) =>
                  setNewEvent((currentEvent) => ({
                    ...currentEvent,
                    notes: event.target.value,
                  }))
                }
                rows={3}
                className="rounded-lg border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-teal-400"
                placeholder="Describe what happened and how it was reviewed."
              />
            </label>

            <div className="flex items-end md:col-span-3">
              <button
                type="submit"
                className="w-full rounded-lg bg-teal-500 px-4 py-3 font-semibold text-slate-950 transition hover:bg-teal-400 md:w-auto md:px-8"
              >
                Add Event
              </button>
            </div>
          </div>
        </form>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-6 print:border-slate-300 print:bg-white">
          <div className="mb-5 flex items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold">Asset Inventory</h2>
              <p className="text-sm text-slate-400 print:text-slate-600">
                Track hosts, IPs, OS, and risk level.
              </p>
            </div>

            <select
              value={assetFilter}
              onChange={(event) => setAssetFilter(event.target.value)}
              className="rounded-lg border border-white/10 bg-slate-950 px-3 py-2 text-sm outline-none focus:border-teal-400 print:hidden"
            >
              <option>All</option>
              <option>Critical</option>
              <option>High</option>
              <option>Medium</option>
              <option>Low</option>
            </select>
          </div>

          <div className="space-y-3">
            {filteredAssets.map((asset) => (
              <button
                key={asset.id}
                onClick={() => setSelectedAsset(asset)}
                className={`w-full rounded-xl border p-4 text-left transition hover:border-teal-400/50 print:border-slate-300 print:bg-white ${
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

                <p className="text-sm text-slate-400 print:text-slate-600">
                  {asset.ip} • {asset.os}
                </p>
              </button>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900 p-6 print:border-slate-300 print:bg-white">
          <h2 className="text-2xl font-bold">Asset Detail</h2>
          <p className="mt-1 text-sm text-slate-400 print:text-slate-600">
            Selected host profile and service notes.
          </p>

          <div className="mt-6 grid gap-4 md:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-slate-950 p-4 print:border-slate-300 print:bg-white">
              <p className="text-sm text-slate-400 print:text-slate-600">Hostname</p>
              <p className="mt-1 font-semibold">{selectedAsset.hostname}</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-950 p-4 print:border-slate-300 print:bg-white">
              <p className="text-sm text-slate-400 print:text-slate-600">IP Address</p>
              <p className="mt-1 font-semibold">{selectedAsset.ip}</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-950 p-4 print:border-slate-300 print:bg-white">
              <p className="text-sm text-slate-400 print:text-slate-600">Operating System</p>
              <p className="mt-1 font-semibold">{selectedAsset.os}</p>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-950 p-4 print:border-slate-300 print:bg-white">
              <p className="text-sm text-slate-400 print:text-slate-600">Last Seen</p>
              <p className="mt-1 font-semibold">{selectedAsset.lastSeen}</p>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-white/10 bg-slate-950 p-4 print:border-slate-300 print:bg-white">
            <p className="mb-3 text-sm font-semibold text-slate-300 print:text-slate-700">
              Open Ports / Services
            </p>

            <div className="flex flex-wrap gap-2">
              {selectedAsset.ports.map((port) => (
                <span
                  key={port}
                  className="rounded-full border border-teal-400/20 bg-teal-400/10 px-3 py-1 text-sm text-teal-300 print:text-slate-700"
                >
                  {port}
                </span>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-7xl gap-6 px-6 pb-10 lg:grid-cols-2">
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-6 print:border-slate-300 print:bg-white">
          <h2 className="text-2xl font-bold">Findings Tracker</h2>
          <p className="mt-1 text-sm text-slate-400 print:text-slate-600">
            Vulnerability notes and remediation status.
          </p>

          <div className="mt-6 space-y-4">
            {findingList.map((finding) => (
              <div
                key={finding.id}
                className="rounded-xl border border-white/10 bg-slate-950 p-4 print:border-slate-300 print:bg-white"
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

                <p className="text-sm text-slate-400 print:text-slate-600">
                  Asset: {finding.asset}
                </p>

                <p className="mt-2 text-sm text-slate-300 print:text-slate-700">
                  Description: {finding.description}
                </p>

                <p className="mt-2 text-sm text-slate-300 print:text-slate-700">
                  Evidence: {finding.evidence}
                </p>

                <p className="mt-2 text-sm text-slate-300 print:text-slate-700">
                  Recommendation: {finding.recommendation}
                </p>

                <p className="mt-2 text-sm text-slate-300 print:text-slate-700">
                  Remediation: {finding.remediation}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs ${statusClass(
                      finding.status
                    )}`}
                  >
                    Status: {finding.status}
                  </span>

                  <select
                    value={finding.status}
                    onChange={(event) =>
                      updateFindingStatus(
                        finding.id,
                        event.target.value as FindingStatus
                      )
                    }
                    className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none focus:border-teal-400 print:hidden"
                  >
                    <option>Open</option>
                    <option>In Review</option>
                    <option>Planned</option>
                    <option>Resolved</option>
                    <option>Risk Accepted</option>
                    <option>False Positive</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-2xl border border-white/10 bg-slate-900 p-6 print:border-slate-300 print:bg-white">
          <h2 className="text-2xl font-bold">Security Events</h2>
          <p className="mt-1 text-sm text-slate-400 print:text-slate-600">
            Recent lab activity and review queue.
          </p>

          <div className="mt-6 space-y-4">
            {eventList.map((event) => (
              <div
                key={event.id}
                className="rounded-xl border border-white/10 bg-slate-950 p-4 print:border-slate-300 print:bg-white"
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

                <p className="text-sm text-slate-400 print:text-slate-600">
                  {event.source} → {event.destination}
                </p>

                <p className="mt-2 text-sm text-slate-300 print:text-slate-700">
                  {event.time} • {event.notes}
                </p>

                <div className="mt-3 flex flex-wrap items-center gap-3">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs ${statusClass(
                      event.status
                    )}`}
                  >
                    Status: {event.status}
                  </span>

                  <select
                    value={event.status}
                    onChange={(selectEvent) =>
                      updateEventStatus(
                        event.id,
                        selectEvent.target.value as EventStatus
                      )
                    }
                    className="rounded-lg border border-white/10 bg-slate-900 px-3 py-2 text-xs text-slate-100 outline-none focus:border-teal-400 print:hidden"
                  >
                    <option>Open</option>
                    <option>In Review</option>
                    <option>Reviewed</option>
                    <option>Resolved</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-6 pb-12">
        <div className="rounded-2xl border border-white/10 bg-slate-900 p-6 print:border-slate-300 print:bg-white">
          <div className="mb-6 flex flex-col justify-between gap-4 md:flex-row md:items-end">
            <div>
              <p className="text-sm font-semibold uppercase tracking-[0.25em] text-teal-400 print:text-slate-700">
                Printable Report
              </p>
              <h2 className="mt-2 text-2xl font-bold">
                Security Lab Summary Report
              </h2>
              <p className="mt-2 text-sm text-slate-400 print:text-slate-600">
                Report date: {reportDate}. Use the print button at the top to
                save this page as a PDF.
              </p>
            </div>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-slate-950 p-4 print:border-slate-300 print:bg-white">
              <h3 className="font-bold">Executive Summary</h3>
              <p className="mt-2 text-sm leading-7 text-slate-300 print:text-slate-700">
                This report summarizes the current security lab inventory,
                unresolved findings, observed security events, and recommended
                corrective actions. The console is designed to document authorized
                lab activity and track remediation progress.
              </p>
            </div>

            <div className="rounded-xl border border-white/10 bg-slate-950 p-4 print:border-slate-300 print:bg-white">
              <h3 className="font-bold">Remediation Priorities</h3>
              <ul className="mt-2 space-y-2 text-sm text-slate-300 print:text-slate-700">
                {unresolvedFindings.slice(0, 5).map((finding) => (
                  <li key={finding.id}>
                    • {finding.severity}: {finding.title} on {finding.asset}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="mt-6 rounded-xl border border-teal-400/20 bg-teal-400/10 p-4 print:border-slate-300 print:bg-white">
            <h3 className="font-bold">Next Build Steps</h3>
            <p className="mt-2 text-sm leading-7 text-slate-300 print:text-slate-700">
              Next planned phases: CSV/Nmap import, Supabase database,
              screenshot evidence uploads, and controlled scan profile planning.
            </p>
          </div>
        </div>
      </section>
    </main>
  )
}