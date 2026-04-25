'use client';

import React, { useState, useMemo } from 'react';

type RiskLevel = 'Critical' | 'High' | 'Medium' | 'Low';

type FindingStatus = 
  | 'Open' 
  | 'In Review' 
  | 'Planned' 
  | 'Resolved' 
  | 'Risk Accepted' 
  | 'False Positive';

type EventStatus = 
  | 'Open' 
  | 'In Review' 
  | 'Reviewed' 
  | 'Resolved';

type Asset = {
  id: string;
  hostname: string;
  ip: string;
  os: string;
  environment: string;
  risk: RiskLevel;
  lastSeen: string;
  ports: string;
  notes: string;
};

type Finding = {
  id: string;
  title: string;
  affectedAssetId: string;
  severity: RiskLevel;
  status: FindingStatus;
  description: string;
  evidence: string;
  recommendation: string;
  remediation: string;
  owner: string;
  dueDate: string;
};

type SecurityEvent = {
  id: string;
  eventType: string;
  sourceIP: string;
  destIP: string;
  severity: RiskLevel;
  status: EventStatus;
  timestamp: string;
  notes: string;
  relatedAssetId: string;
};

const severityColors: Record<RiskLevel, string> = {
  Critical: 'bg-red-500/20 text-red-400 border-red-500/30',
  High: 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  Medium: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
  Low: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
};

const statusColors: Record<FindingStatus | EventStatus, string> = {
  Open: 'bg-red-500/20 text-red-400',
  'In Review': 'bg-yellow-500/20 text-yellow-400',
  Planned: 'bg-purple-500/20 text-purple-400',
  Resolved: 'bg-green-500/20 text-green-400',
  'Risk Accepted': 'bg-purple-500/20 text-purple-400',
  'False Positive': 'bg-slate-500/20 text-slate-400',
  Reviewed: 'bg-green-500/20 text-green-400',
};

export default function SyferSecLabConsole() {
  // State
  const [assets, setAssets] = useState<Asset[]>([
    {
      id: 'a1',
      hostname: 'ubuntu-lab-01',
      ip: '192.168.50.10',
      os: 'Ubuntu 22.04 LTS',
      environment: 'Lab',
      risk: 'Medium',
      lastSeen: '2026-04-24',
      ports: '22/tcp SSH, 80/tcp HTTP, 443/tcp HTTPS',
      notes: 'Primary testing server',
    },
    {
      id: 'a2',
      hostname: 'win-test-02',
      ip: '192.168.50.20',
      os: 'Windows Server 2022',
      environment: 'Lab',
      risk: 'High',
      lastSeen: '2026-04-23',
      ports: '445/tcp SMB, 3389/tcp RDP, 135/tcp',
      notes: 'Domain controller simulation',
    },
  ]);

  const [findings, setFindings] = useState<Finding[]>([
    {
      id: 'f1',
      title: 'Outdated OpenSSL Version',
      affectedAssetId: 'a1',
      severity: 'High',
      status: 'Open',
      description: 'Server is running OpenSSL 1.1.1t which contains known vulnerabilities.',
      evidence: 'nmap -sV output + vulners script results',
      recommendation: 'Upgrade to OpenSSL 3.x or apply vendor patches.',
      remediation: 'apt update && apt upgrade openssl',
      owner: 'Security Analyst',
      dueDate: '2026-05-01',
    },
  ]);

  const [events, setEvents] = useState<SecurityEvent[]>([
    {
      id: 'e1',
      eventType: 'Failed SSH Login',
      sourceIP: '203.0.113.45',
      destIP: '192.168.50.10',
      severity: 'Medium',
      status: 'Reviewed',
      timestamp: '2026-04-24T14:30:00',
      notes: 'Brute force attempt from known Tor exit node.',
      relatedAssetId: 'a1',
    },
  ]);

  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [activeTab, setActiveTab] = useState<'dashboard' | 'assets' | 'findings' | 'events' | 'report' | 'planning'>('dashboard');

  // Form states
  const [showAddAsset, setShowAddAsset] = useState(false);
  const [showAddFinding, setShowAddFinding] = useState(false);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showImportCSV, setShowImportCSV] = useState(false);

  // Asset form
  const [newAsset, setNewAsset] = useState({
    hostname: '',
    ip: '',
    os: '',
    environment: 'Lab',
    risk: 'Medium' as RiskLevel,
    lastSeen: new Date().toISOString().split('T')[0],
    ports: '',
    notes: '',
  });

  // Finding form
  const [newFinding, setNewFinding] = useState({
    title: '',
    affectedAssetId: '',
    severity: 'Medium' as RiskLevel,
    status: 'Open' as FindingStatus,
    description: '',
    evidence: '',
    recommendation: '',
    remediation: '',
    owner: '',
    dueDate: '',
  });

  // Event form
  const [newEvent, setNewEvent] = useState({
    eventType: '',
    sourceIP: '',
    destIP: '',
    severity: 'Medium' as RiskLevel,
    status: 'Open' as EventStatus,
    timestamp: new Date().toISOString().slice(0, 16),
    notes: '',
    relatedAssetId: '',
  });

  // CSV import
  const [csvInput, setCsvInput] = useState('');

  // Dashboard metrics
  const totalAssets = assets.length;
  const highRiskAssets = assets.filter(a => ['Critical', 'High'].includes(a.risk)).length;
  
  const openFindings = findings.filter(f => f.status === 'Open').length;
  const criticalFindings = findings.filter(f => f.severity === 'Critical').length;
  const highFindings = findings.filter(f => f.severity === 'High').length;

  const unresolvedEvents = events.filter(e => ['Open', 'In Review'].includes(e.status)).length;

  const assetMap = useMemo(() => {
    const map: Record<string, Asset> = {};
    assets.forEach(a => { map[a.id] = a; });
    return map;
  }, [assets]);

  // Helpers
  const getAssetName = (id: string) => assetMap[id]?.hostname || 'Unknown Asset';

  const addAsset = () => {
    if (!newAsset.hostname || !newAsset.ip) return;
    
    const asset: Asset = {
      ...newAsset,
      id: `a${Date.now()}`,
    };
    
    setAssets([...assets, asset]);
    setNewAsset({
      hostname: '', ip: '', os: '', environment: 'Lab', risk: 'Medium',
      lastSeen: new Date().toISOString().split('T')[0], ports: '', notes: '',
    });
    setShowAddAsset(false);
    setSelectedAsset(asset);
  };

  const addFinding = () => {
    if (!newFinding.title || !newFinding.affectedAssetId) return;
    
    const finding: Finding = {
      ...newFinding,
      id: `f${Date.now()}`,
    };
    
    setFindings([...findings, finding]);
    setNewFinding({
      title: '', affectedAssetId: '', severity: 'Medium', status: 'Open',
      description: '', evidence: '', recommendation: '', remediation: '',
      owner: '', dueDate: '',
    });
    setShowAddFinding(false);
  };

  const addEvent = () => {
    if (!newEvent.eventType) return;
    
    const event: SecurityEvent = {
      ...newEvent,
      id: `e${Date.now()}`,
    };
    
    setEvents([...events, event]);
    setNewEvent({
      eventType: '', sourceIP: '', destIP: '', severity: 'Medium', status: 'Open',
      timestamp: new Date().toISOString().slice(0, 16), notes: '', relatedAssetId: '',
    });
    setShowAddEvent(false);
  };

  const updateFindingStatus = (id: string, newStatus: FindingStatus) => {
    setFindings(findings.map(f => f.id === id ? { ...f, status: newStatus } : f));
  };

  const updateEventStatus = (id: string, newStatus: EventStatus) => {
    setEvents(events.map(e => e.id === id ? { ...e, status: newStatus } : e));
  };

  const importCSV = () => {
    if (!csvInput.trim()) return;
    
    const lines = csvInput.trim().split('\n');
    const newAssets: Asset[] = [];
    
    lines.forEach((line, index) => {
      if (index === 0 && line.toLowerCase().includes('hostname')) return; // skip header
      
      const parts = line.split(',').map(p => p.trim().replace(/^"|"$/g, ''));
      if (parts.length < 4) return;
      
      const [hostname, ip, os, riskStr, ports = ''] = parts;
      
      if (!hostname || !ip) return;
      
      const risk = (['Critical','High','Medium','Low'].includes(riskStr) ? riskStr : 'Medium') as RiskLevel;
      
      newAssets.push({
        id: `a${Date.now()}-${index}`,
        hostname,
        ip,
        os: os || 'Unknown',
        environment: 'Lab',
        risk,
        lastSeen: new Date().toISOString().split('T')[0],
        ports,
        notes: 'Imported via CSV',
      });
    });
    
    if (newAssets.length > 0) {
      setAssets([...assets, ...newAssets]);
      setCsvInput('');
      setShowImportCSV(false);
    }
  };

  const printReport = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-mono">
      {/* Header */}
      <header className="border-b border-white/10 bg-slate-900 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <div className="w-9 h-9 bg-teal-500 rounded flex items-center justify-center text-slate-950 font-bold">SS</div>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">SyferSec Lab Console</h1>
              <p className="text-xs text-slate-500 -mt-1">Local-state MVP • Data resets on refresh</p>
            </div>
          </div>
          
          <div className="flex items-center gap-6 text-sm">
            <button 
              onClick={() => setActiveTab('dashboard')}
              className={`hover:text-teal-400 transition-colors ${activeTab === 'dashboard' ? 'text-teal-400' : 'text-slate-400'}`}
            >
              Dashboard
            </button>
            <button 
              onClick={() => setActiveTab('assets')}
              className={`hover:text-teal-400 transition-colors ${activeTab === 'assets' ? 'text-teal-400' : 'text-slate-400'}`}
            >
              Assets
            </button>
            <button 
              onClick={() => setActiveTab('findings')}
              className={`hover:text-teal-400 transition-colors ${activeTab === 'findings' ? 'text-teal-400' : 'text-slate-400'}`}
            >
              Findings
            </button>
            <button 
              onClick={() => setActiveTab('events')}
              className={`hover:text-teal-400 transition-colors ${activeTab === 'events' ? 'text-teal-400' : 'text-slate-400'}`}
            >
              Events
            </button>
            <button 
              onClick={() => setActiveTab('report')}
              className={`hover:text-teal-400 transition-colors ${activeTab === 'report' ? 'text-teal-400' : 'text-slate-400'}`}
            >
              Report
            </button>
            <button 
              onClick={() => setActiveTab('planning')}
              className={`hover:text-teal-400 transition-colors ${activeTab === 'planning' ? 'text-teal-400' : 'text-slate-400'}`}
            >
              Scan Planning
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-8">
            <div>
              <h2 className="text-3xl font-semibold mb-2">Lab Overview</h2>
              <p className="text-slate-400">Real-time security posture • Local MVP</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
                <div className="text-slate-400 text-sm">Total Assets</div>
                <div className="text-5xl font-semibold mt-2">{totalAssets}</div>
              </div>
              <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
                <div className="text-slate-400 text-sm">High Risk Assets</div>
                <div className="text-5xl font-semibold mt-2 text-orange-400">{highRiskAssets}</div>
              </div>
              <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
                <div className="text-slate-400 text-sm">Open Findings</div>
                <div className="text-5xl font-semibold mt-2 text-red-400">{openFindings}</div>
              </div>
              <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
                <div className="text-slate-400 text-sm">Unresolved Events</div>
                <div className="text-5xl font-semibold mt-2 text-yellow-400">{unresolvedEvents}</div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Recent Assets */}
              <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
                <h3 className="font-medium mb-4 flex items-center justify-between">
                  Recent Assets
                  <button onClick={() => setActiveTab('assets')} className="text-teal-400 text-sm hover:underline">Manage →</button>
                </h3>
                <div className="space-y-3">
                  {assets.slice(0, 4).map(asset => (
                    <div 
                      key={asset.id}
                      onClick={() => { setSelectedAsset(asset); setActiveTab('assets'); }}
                      className="flex justify-between items-center p-3 bg-slate-950 hover:bg-slate-800 border border-white/5 rounded-lg cursor-pointer transition"
                    >
                      <div>
                        <div className="font-medium">{asset.hostname}</div>
                        <div className="text-xs text-slate-500">{asset.ip} • {asset.os}</div>
                      </div>
                      <div className={`px-3 py-1 text-xs rounded-full border ${severityColors[asset.risk]}`}>
                        {asset.risk}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Recent Findings */}
              <div className="bg-slate-900 border border-white/10 rounded-xl p-6">
                <h3 className="font-medium mb-4 flex items-center justify-between">
                  Recent Findings
                  <button onClick={() => setActiveTab('findings')} className="text-teal-400 text-sm hover:underline">Manage →</button>
                </h3>
                <div className="space-y-3">
                  {findings.slice(0, 4).map(finding => (
                    <div key={finding.id} className="p-3 bg-slate-950 border border-white/5 rounded-lg">
                      <div className="flex justify-between">
                        <div className="font-medium text-sm">{finding.title}</div>
                        <div className={`text-xs px-2 py-0.5 rounded ${severityColors[finding.severity]}`}>
                          {finding.severity}
                        </div>
                      </div>
                      <div className="text-xs text-slate-400 mt-1">{getAssetName(finding.affectedAssetId)}</div>
                      <div className={`inline-block mt-2 text-xs px-3 py-1 rounded-full ${statusColors[finding.status]}`}>
                        {finding.status}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ASSETS TAB */}
        {activeTab === 'assets' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-semibold">Asset Inventory</h2>
                <p className="text-slate-400">Tracked systems and risk posture</p>
              </div>
              <div className="flex gap-3">
                <button 
                  onClick={() => setShowImportCSV(true)}
                  className="px-5 py-2.5 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-lg text-sm flex items-center gap-2"
                >
                  Import Scan CSV
                </button>
                <button 
                  onClick={() => setShowAddAsset(true)}
                  className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 rounded-lg text-sm font-medium flex items-center gap-2"
                >
                  + Add Asset
                </button>
              </div>
            </div>

            {/* Asset List */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-slate-900 border border-white/10 rounded-2xl overflow-hidden">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-white/10 text-xs text-slate-400">
                        <th className="py-4 px-6 text-left">Hostname</th>
                        <th className="py-4 px-6 text-left">IP</th>
                        <th className="py-4 px-6 text-left">OS</th>
                        <th className="py-4 px-6 text-left">Risk</th>
                        <th className="py-4 px-6 text-left">Last Seen</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/10">
                      {assets.map(asset => (
                        <tr 
                          key={asset.id}
                          onClick={() => setSelectedAsset(asset)}
                          className={`hover:bg-slate-800/70 cursor-pointer transition ${selectedAsset?.id === asset.id ? 'bg-slate-800' : ''}`}
                        >
                          <td className="py-4 px-6 font-medium">{asset.hostname}</td>
                          <td className="py-4 px-6 text-slate-400 font-mono text-sm">{asset.ip}</td>
                          <td className="py-4 px-6 text-slate-400">{asset.os}</td>
                          <td className="py-4 px-6">
                            <span className={`px-4 py-1 text-xs rounded-full border ${severityColors[asset.risk]}`}>
                              {asset.risk}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-slate-400 text-sm">{asset.lastSeen}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Selected Asset Detail */}
              <div className="bg-slate-900 border border-white/10 rounded-2xl p-6">
                {selectedAsset ? (
                  <>
                    <h3 className="text-xl font-semibold mb-6">{selectedAsset.hostname}</h3>
                    <div className="space-y-6 text-sm">
                      <div>
                        <div className="text-slate-400 mb-1">IP Address</div>
                        <div className="font-mono">{selectedAsset.ip}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 mb-1">Operating System</div>
                        <div>{selectedAsset.os}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 mb-1">Environment</div>
                        <div>{selectedAsset.environment}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 mb-1">Risk Level</div>
                        <div className={`inline-block px-5 py-1 rounded-full border ${severityColors[selectedAsset.risk]}`}>
                          {selectedAsset.risk}
                        </div>
                      </div>
                      <div>
                        <div className="text-slate-400 mb-1">Open Ports / Services</div>
                        <div className="font-mono text-xs bg-slate-950 p-3 rounded border border-white/10">{selectedAsset.ports}</div>
                      </div>
                      <div>
                        <div className="text-slate-400 mb-1">Notes</div>
                        <div className="text-slate-300">{selectedAsset.notes || 'No notes.'}</div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="h-full flex items-center justify-center text-slate-500 text-center">
                    Select an asset from the table
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* FINDINGS TAB */}
        {activeTab === 'findings' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-semibold">Findings Tracker</h2>
                <p className="text-slate-400">Vulnerabilities and issues</p>
              </div>
              <button 
                onClick={() => setShowAddFinding(true)}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                + Add Finding
              </button>
            </div>

            <div className="space-y-4">
              {findings.map(finding => {
                const asset = assetMap[finding.affectedAssetId];
                return (
                  <div key={finding.id} className="bg-slate-900 border border-white/10 rounded-2xl p-6">
                    <div className="flex flex-wrap gap-4 justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-3">
                          <span className={`px-4 py-1 text-xs rounded-full border ${severityColors[finding.severity]}`}>
                            {finding.severity}
                          </span>
                          <span className={`px-4 py-1 text-xs rounded-full ${statusColors[finding.status]}`}>
                            {finding.status}
                          </span>
                        </div>
                        <h3 className="text-xl font-semibold mt-4">{finding.title}</h3>
                        <div className="text-teal-400 mt-1 text-sm">↳ {asset?.hostname}</div>
                      </div>
                      
                      <div className="flex flex-col items-end gap-2">
                        <select 
                          value={finding.status}
                          onChange={(e) => updateFindingStatus(finding.id, e.target.value as FindingStatus)}
                          className="bg-slate-800 border border-white/10 text-xs px-4 py-2 rounded-lg focus:outline-none focus:border-teal-500"
                        >
                          <option value="Open">Open</option>
                          <option value="In Review">In Review</option>
                          <option value="Planned">Planned</option>
                          <option value="Resolved">Resolved</option>
                          <option value="Risk Accepted">Risk Accepted</option>
                          <option value="False Positive">False Positive</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mt-8 text-sm">
                      <div>
                        <div className="uppercase text-xs tracking-widest text-slate-500 mb-2">DESCRIPTION</div>
                        <p className="text-slate-300 leading-relaxed">{finding.description}</p>
                      </div>
                      <div>
                        <div className="uppercase text-xs tracking-widest text-slate-500 mb-2">EVIDENCE</div>
                        <p className="text-slate-400 font-light italic">{finding.evidence}</p>
                      </div>
                    </div>

                    <div className="mt-8 pt-6 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-8">
                      <div>
                        <div className="uppercase text-xs tracking-widest text-slate-500 mb-2">RECOMMENDATION</div>
                        <p>{finding.recommendation}</p>
                      </div>
                      <div>
                        <div className="uppercase text-xs tracking-widest text-slate-500 mb-2">REMEDIATION ACTION</div>
                        <p className="font-mono text-xs bg-slate-950 p-4 rounded">{finding.remediation}</p>
                      </div>
                    </div>

                    <div className="mt-6 text-xs text-slate-500 flex gap-6">
                      {finding.owner && <div>Owner: {finding.owner}</div>}
                      {finding.dueDate && <div>Due: {finding.dueDate}</div>}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* EVENTS TAB */}
        {activeTab === 'events' && (
          <div>
            <div className="flex justify-between items-center mb-8">
              <div>
                <h2 className="text-3xl font-semibold">Security Events</h2>
                <p className="text-slate-400">Detected activity log</p>
              </div>
              <button 
                onClick={() => setShowAddEvent(true)}
                className="px-5 py-2.5 bg-teal-600 hover:bg-teal-500 rounded-lg text-sm font-medium flex items-center gap-2"
              >
                + Log Event
              </button>
            </div>

            <div className="space-y-4">
              {events.map(event => (
                <div key={event.id} className="bg-slate-900 border border-white/10 rounded-2xl p-6">
                  <div className="flex justify-between">
                    <div>
                      <div className="flex items-center gap-3">
                        <span className={`px-4 py-1 text-xs rounded-full border ${severityColors[event.severity]}`}>{event.severity}</span>
                        <span className={`px-4 py-1 text-xs rounded-full ${statusColors[event.status]}`}>{event.status}</span>
                      </div>
                      <h3 className="text-lg font-medium mt-4">{event.eventType}</h3>
                    </div>
                    <div className="text-right text-xs text-slate-400">
                      {new Date(event.timestamp).toLocaleString()}
                    </div>
                  </div>

                  <div className="mt-6 grid grid-cols-2 gap-8 text-sm">
                    <div>
                      <div className="text-slate-400">Source IP</div>
                      <div className="font-mono">{event.sourceIP}</div>
                    </div>
                    <div>
                      <div className="text-slate-400">Destination IP</div>
                      <div className="font-mono">{event.destIP}</div>
                    </div>
                  </div>

                  <div className="mt-6">
                    <div className="text-slate-400 text-xs mb-1">NOTES</div>
                    <p className="text-slate-300">{event.notes}</p>
                  </div>

                  <div className="mt-8 flex justify-between items-center">
                    <select 
                      value={event.status}
                      onChange={(e) => updateEventStatus(event.id, e.target.value as EventStatus)}
                      className="bg-slate-800 border border-white/10 text-xs px-5 py-2 rounded-lg"
                    >
                      <option value="Open">Open</option>
                      <option value="In Review">In Review</option>
                      <option value="Reviewed">Reviewed</option>
                      <option value="Resolved">Resolved</option>
                    </select>
                    {event.relatedAssetId && (
                      <div className="text-xs text-teal-400">Related: {getAssetName(event.relatedAssetId)}</div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* REPORT TAB */}
        {activeTab === 'report' && (
          <div className="print:bg-white print:text-slate-950">
            <div className="flex justify-between items-start mb-10 print:hidden">
              <div>
                <h2 className="text-3xl font-semibold">Executive Report</h2>
                <p className="text-slate-400">Generated {new Date().toLocaleDateString()}</p>
              </div>
              <button 
                onClick={printReport}
                className="px-8 py-3 bg-teal-600 hover:bg-teal-500 rounded-xl text-sm font-medium flex items-center gap-3"
              >
                🖨️ Print / Save PDF
              </button>
            </div>

            {/* Printable Content */}
            <div className="bg-slate-900 border border-white/10 rounded-3xl p-12 print:bg-white print:border-none print:shadow-none max-w-4xl mx-auto">
              <div className="text-center mb-12 print:mb-8">
                <div className="text-teal-500 text-4xl font-bold tracking-[4px] print:text-teal-700">SYFERSEC</div>
                <div className="text-2xl mt-3">Security Lab Assessment Report</div>
                <div className="text-sm text-slate-400 mt-1">As of {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</div>
              </div>

              <div className="prose prose-invert print:prose-slate max-w-none">
                <h3 className="text-xl border-b border-white/10 pb-3 print:border-slate-300">Executive Summary</h3>
                <p className="text-slate-300 print:text-slate-700">
                  This local lab console documents {totalAssets} assets with {openFindings} open findings. 
                  Risk posture is being actively managed in a controlled environment.
                </p>

                <h3 className="text-xl border-b border-white/10 pb-3 mt-12 print:mt-10">Asset Summary</h3>
                <p>{totalAssets} systems tracked • {highRiskAssets} high/critical risk</p>

                <h3 className="text-xl border-b border-white/10 pb-3 mt-12 print:mt-10">Priority Findings</h3>
                <div className="space-y-6 mt-6">
                  {findings.filter(f => ['Critical','High'].includes(f.severity)).map(f => (
                    <div key={f.id} className="border-l-4 border-red-500 pl-6">
                      <div className="font-medium">{f.title}</div>
                      <div className="text-sm text-slate-400">{getAssetName(f.affectedAssetId)} • {f.status}</div>
                      <div className="mt-2 text-sm">{f.recommendation}</div>
                    </div>
                  ))}
                </div>

                <h3 className="text-xl border-b border-white/10 pb-3 mt-12 print:mt-10">Key Recommendations</h3>
                <ul className="list-disc pl-6 space-y-2 mt-4 text-slate-300 print:text-slate-700">
                  {findings.map(f => (
                    <li key={f.id}>{f.recommendation}</li>
                  ))}
                </ul>

                <div className="mt-16 text-xs text-center text-slate-500 print:text-slate-400">
                  Local-state MVP demonstration portfolio. Prepared for professional review.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SCAN PLANNING */}
        {activeTab === 'planning' && (
          <div>
            <h2 className="text-3xl font-semibold mb-2">Controlled Scan Planning</h2>
            <p className="text-slate-400 mb-10">Safe, permission-based scan profiles (planning UI only)</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { name: "Discovery", color: "teal", desc: "Host discovery, port scan (top 1000), service version detection. Low impact." },
                { name: "Standard", color: "cyan", desc: "Full port scan, vulnerability scripts, OS detection. Moderate intensity." },
                { name: "Deep Lab", color: "amber", desc: "Aggressive enumeration, credentialed checks, web app scanning. Lab environment only." },
                { name: "Custom", color: "purple", desc: "User-defined parameters. For advanced users with explicit authorization." },
              ].map(profile => (
                <div key={profile.name} className="bg-slate-900 border border-white/10 rounded-2xl p-8 hover:border-teal-500/30 transition">
                  <div className={`inline px-5 py-1 text-xs rounded-full bg-${profile.color}-500/10 text-${profile.color}-400 border border-${profile.color}-500/30`}>
                    {profile.name}
                  </div>
                  <p className="mt-8 leading-relaxed text-slate-300">{profile.desc}</p>
                  <div className="mt-10 text-xs text-slate-500">• No live execution • Future Nmap integration placeholder</div>
                </div>
              ))}
            </div>

            <div className="mt-12 text-sm bg-slate-900/70 border border-white/10 p-6 rounded-2xl">
              <strong>Legal Note:</strong> Run scans only against systems you own or have explicit written permission to test. 
              Unauthorized scanning is illegal.
            </div>
          </div>
        )}
      </div>

      {/* ADD ASSET MODAL */}
      {showAddAsset && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-6">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-lg">
            <div className="p-8">
              <h3 className="text-2xl font-semibold mb-8">Add New Asset</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs text-slate-400 mb-2">HOSTNAME</label>
                  <input 
                    type="text" 
                    value={newAsset.hostname}
                    onChange={e => setNewAsset({...newAsset, hostname: e.target.value})}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-5 py-3 focus:outline-none focus:border-teal-500"
                    placeholder="web-server-01"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">IP ADDRESS</label>
                    <input 
                      type="text" 
                      value={newAsset.ip}
                      onChange={e => setNewAsset({...newAsset, ip: e.target.value})}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-5 py-3 focus:outline-none focus:border-teal-500 font-mono"
                      placeholder="192.168.1.100"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">RISK LEVEL</label>
                    <select 
                      value={newAsset.risk}
                      onChange={e => setNewAsset({...newAsset, risk: e.target.value as RiskLevel})}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-5 py-3 focus:outline-none focus:border-teal-500"
                    >
                      <option value="Critical">Critical</option>
                      <option value="High">High</option>
                      <option value="Medium">Medium</option>
                      <option value="Low">Low</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-2">OPERATING SYSTEM</label>
                  <input 
                    type="text" 
                    value={newAsset.os}
                    onChange={e => setNewAsset({...newAsset, os: e.target.value})}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-5 py-3 focus:outline-none focus:border-teal-500"
                    placeholder="Ubuntu 22.04 LTS"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-2">OPEN PORTS / SERVICES</label>
                  <textarea 
                    value={newAsset.ports}
                    onChange={e => setNewAsset({...newAsset, ports: e.target.value})}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-5 py-3 h-24 focus:outline-none focus:border-teal-500 resize-y"
                    placeholder="22/tcp SSH&#10;80/tcp HTTP"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-2">NOTES</label>
                  <textarea 
                    value={newAsset.notes}
                    onChange={e => setNewAsset({...newAsset, notes: e.target.value})}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-5 py-3 h-20 focus:outline-none focus:border-teal-500"
                  />
                </div>
              </div>
            </div>
            
            <div className="border-t border-white/10 p-4 flex gap-3">
              <button 
                onClick={() => setShowAddAsset(false)}
                className="flex-1 py-4 text-slate-400 hover:bg-slate-800 rounded-2xl"
              >
                Cancel
              </button>
              <button 
                onClick={addAsset}
                className="flex-1 py-4 bg-teal-600 hover:bg-teal-500 rounded-2xl font-medium"
              >
                Add Asset
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ADD FINDING MODAL */}
      {showAddFinding && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-6 overflow-auto">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-2xl my-8">
            <div className="p-8">
              <h3 className="text-2xl font-semibold mb-8">New Security Finding</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="md:col-span-2">
                  <label className="block text-xs text-slate-400 mb-2">TITLE</label>
                  <input 
                    type="text" 
                    value={newFinding.title}
                    onChange={e => setNewFinding({...newFinding, title: e.target.value})}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-5 py-3 focus:outline-none focus:border-teal-500"
                    placeholder="Weak TLS Configuration"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-2">AFFECTED ASSET</label>
                  <select 
                    value={newFinding.affectedAssetId}
                    onChange={e => setNewFinding({...newFinding, affectedAssetId: e.target.value})}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-5 py-3 focus:outline-none focus:border-teal-500"
                  >
                    <option value="">Select Asset...</option>
                    {assets.map(a => (
                      <option key={a.id} value={a.id}>{a.hostname}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-2">SEVERITY</label>
                  <select 
                    value={newFinding.severity}
                    onChange={e => setNewFinding({...newFinding, severity: e.target.value as RiskLevel})}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-5 py-3 focus:outline-none focus:border-teal-500"
                  >
                    <option value="Critical">Critical</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs text-slate-400 mb-2">DESCRIPTION</label>
                  <textarea 
                    value={newFinding.description}
                    onChange={e => setNewFinding({...newFinding, description: e.target.value})}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-5 py-4 h-24 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-xs text-slate-400 mb-2">EVIDENCE / REFERENCES</label>
                  <textarea 
                    value={newFinding.evidence}
                    onChange={e => setNewFinding({...newFinding, evidence: e.target.value})}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-5 py-4 h-20 focus:outline-none focus:border-teal-500"
                    placeholder="Nmap output, Burp screenshot, etc."
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-2">RECOMMENDATION</label>
                  <textarea 
                    value={newFinding.recommendation}
                    onChange={e => setNewFinding({...newFinding, recommendation: e.target.value})}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-5 py-4 h-24 focus:outline-none focus:border-teal-500"
                  />
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-2">REMEDIATION STEPS</label>
                  <textarea 
                    value={newFinding.remediation}
                    onChange={e => setNewFinding({...newFinding, remediation: e.target.value})}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-5 py-4 h-24 focus:outline-none focus:border-teal-500 font-mono text-xs"
                  />
                </div>
              </div>
            </div>
            
            <div className="border-t border-white/10 p-4 flex gap-3">
              <button onClick={() => setShowAddFinding(false)} className="flex-1 py-4 text-slate-400 hover:bg-slate-800 rounded-2xl">Cancel</button>
              <button onClick={addFinding} className="flex-1 py-4 bg-teal-600 hover:bg-teal-500 rounded-2xl font-medium">Create Finding</button>
            </div>
          </div>
        </div>
      )}

      {/* ADD EVENT MODAL */}
      {showAddEvent && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-6">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-lg">
            <div className="p-8">
              <h3 className="text-2xl font-semibold mb-8">Log Security Event</h3>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs text-slate-400 mb-2">EVENT TYPE</label>
                  <input 
                    type="text" 
                    value={newEvent.eventType}
                    onChange={e => setNewEvent({...newEvent, eventType: e.target.value})}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-5 py-3"
                    placeholder="Brute Force Attempt"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">SOURCE IP</label>
                    <input 
                      type="text" 
                      value={newEvent.sourceIP}
                      onChange={e => setNewEvent({...newEvent, sourceIP: e.target.value})}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-5 py-3 font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-2">DEST IP</label>
                    <input 
                      type="text" 
                      value={newEvent.destIP}
                      onChange={e => setNewEvent({...newEvent, destIP: e.target.value})}
                      className="w-full bg-slate-950 border border-white/10 rounded-xl px-5 py-3 font-mono"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-2">RELATED ASSET (optional)</label>
                  <select 
                    value={newEvent.relatedAssetId}
                    onChange={e => setNewEvent({...newEvent, relatedAssetId: e.target.value})}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-5 py-3"
                  >
                    <option value="">None</option>
                    {assets.map(a => <option key={a.id} value={a.id}>{a.hostname}</option>)}
                  </select>
                </div>

                <div>
                  <label className="block text-xs text-slate-400 mb-2">NOTES</label>
                  <textarea 
                    value={newEvent.notes}
                    onChange={e => setNewEvent({...newEvent, notes: e.target.value})}
                    className="w-full bg-slate-950 border border-white/10 rounded-xl px-5 py-4 h-32"
                  />
                </div>
              </div>
            </div>
            
            <div className="border-t border-white/10 p-4 flex gap-3">
              <button onClick={() => setShowAddEvent(false)} className="flex-1 py-4 text-slate-400 hover:bg-slate-800 rounded-2xl">Cancel</button>
              <button onClick={addEvent} className="flex-1 py-4 bg-teal-600 hover:bg-teal-500 rounded-2xl font-medium">Log Event</button>
            </div>
          </div>
        </div>
      )}

      {/* CSV IMPORT MODAL */}
      {showImportCSV && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-6">
          <div className="bg-slate-900 border border-white/10 rounded-3xl w-full max-w-lg">
            <div className="p-8">
              <h3 className="text-xl font-semibold mb-2">Import Assets from CSV</h3>
              <p className="text-xs text-slate-400 mb-6">Format: hostname,ip,os,risk,ports</p>
              
              <textarea 
                value={csvInput}
                onChange={e => setCsvInput(e.target.value)}
                className="w-full h-64 bg-slate-950 font-mono text-xs border border-white/10 rounded-2xl p-6 focus:outline-none focus:border-teal-500"
                placeholder="ubuntu-lab,192.168.50.10,Ubuntu Linux,Medium,&quot;22/tcp SSH, 80/tcp HTTP&quot;&#10;windows-test,192.168.50.20,Windows Server,High,&quot;445/tcp SMB&quot;"
              />
              
              <div className="text-[10px] text-amber-400 mt-4">⚠️ Only run authorized scans against your own lab systems.</div>
            </div>
            
            <div className="border-t border-white/10 p-4 flex gap-3">
              <button onClick={() => setShowImportCSV(false)} className="flex-1 py-4 text-slate-400 hover:bg-slate-800 rounded-2xl">Cancel</button>
              <button onClick={importCSV} className="flex-1 py-4 bg-teal-600 hover:bg-teal-500 rounded-2xl font-medium">Import Assets</button>
            </div>
          </div>
        </div>
      )}

      {/* Footer note */}
      <div className="text-center py-12 text-xs text-slate-600 border-t border-white/5 mt-20">
        SyferSec Lab Console • Portfolio demonstration • All data stored in browser memory only
      </div>
    </div>
  );
}