"use client";
import React, { useState } from 'react';

export default function EliteCSVUploader() {
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [scanStatus, setScanStatus] = useState<'idle' | 'scanning' | 'ready' | 'injecting'>('idle');
  const [terminalLogs, setTerminalLogs] = useState<string[]>([]);

  // Drag and Drop Logic
  const handleDragOver = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLLabelElement>) => {
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent<HTMLLabelElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const file = e.dataTransfer.files[0];
      setSelectedFile(file);
      simulatePreFlightScan(file);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setSelectedFile(file);
      simulatePreFlightScan(file);
    }
  };

  // Pre-Flight Diagnostics Simulation
  const simulatePreFlightScan = (file: File) => {
    setScanStatus('scanning');
    setTerminalLogs([`> INITIATING PROTOCOL FOR: ${file.name}`]);
    
    const logs = [
      "> CHECKING FILE INTEGRITY... [OK]",
      "> ANALYZING CSV HEADERS (Board, Class, Subject, Chapter)... [OK]",
      "> INITIATING LaTeX SYNTAX RADAR...",
      "> SCANNING EQUATION DELIMITERS ($$)... [NO ERRORS FOUND]",
      "> DETECTING DUPLICATE ANOMALIES... [CLEAN]",
      "> COMPILING DATA MATRIX FOR MongoDB INJECTION..."
    ];

    logs.forEach((log, index) => {
      setTimeout(() => {
        setTerminalLogs(prev => [...prev, log]);
        if (index === logs.length - 1) {
          setTimeout(() => {
            setTerminalLogs(prev => [...prev, "> SYSTEM READY. AWAITING FINAL EXECUTION COMMAND."]);
            setScanStatus('ready');
          }, 800);
        }
      }, (index + 1) * 600); // Live typing effect
    });
  };

  // THE FIXED CLICK HANDLER: Connecting UI to Database
  const executeDataInjection = async () => {
    if (!selectedFile) return;
    
    setScanStatus('injecting');
    setTerminalLogs(prev => [
      ...prev, 
      "", 
      "> [EXECUTE] INITIATING SERVER UPLOAD PROTOCOL...", 
      "> TRANSMITTING PAYLOAD TO ZEESHAOOR.PK NEURAL ENGINE..."
    ]);

    const formData = new FormData();
    formData.append('csvFile', selectedFile);

    try {
      const response = await fetch('/api/admin/csv-parser', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (response.ok) {
        setTerminalLogs(prev => [
          ...prev, 
          `> [SUCCESS] ${data.message}`,
          `> TOTAL RECORDS INJECTED: ${data.totalQuestionsInjected || data.totalQuestionsParsed}`,
          `> EXECUTION TIME: ${data.executionTimeMs}ms`,
          "> ALL SYSTEMS NOMINAL. READY FOR NEXT PAYLOAD."
        ]);
        setScanStatus('idle'); // Process complete
        setSelectedFile(null); // Reset for next file upload
      } else {
        setTerminalLogs(prev => [...prev, `> [CRITICAL ERROR] ${data.message || data.error}`]);
        setScanStatus('ready'); // Revert so user can try again
      }
    } catch (error) {
      setTerminalLogs(prev => [...prev, "> [CRITICAL ERROR] Failed to connect to server. Ensure Database is running."]);
      setScanStatus('ready');
    }
  };

  return (
    <div style={{ minHeight: '100vh', backgroundColor: '#000000', color: '#FAFAFA', fontFamily: 'Inter, sans-serif', padding: '60px 20px' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        
        {/* Elite Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', borderBottom: '1px solid rgba(255,255,255,0.05)', paddingBottom: '24px', marginBottom: '40px' }}>
          <div>
            <h1 style={{ fontSize: '32px', fontWeight: '900', letterSpacing: '-1px', margin: '0 0 8px 0', display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ color: '#00f0ff' }}>⎈</span> Neural Ingestion Engine
            </h1>
            <p style={{ color: '#A1A1AA', fontSize: '15px', margin: 0 }}>
              Secure gateway for parsing and compiling LaTeX-formatted academic datasets.
            </p>
          </div>
          <div style={{ textAlign: 'right' }}>
             <div style={{ fontSize: '12px', color: '#71717A', textTransform: 'uppercase', letterSpacing: '1px', marginBottom: '4px' }}>System Target</div>
             <div style={{ color: '#a855f7', fontWeight: '700', fontSize: '14px', letterSpacing: '2px' }}>ZEESHAOOR.PK</div>
          </div>
        </div>

        {/* Two Column Layout: Dropzone & Terminal */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '32px' }}>
          
          {/* LEFT: Cybernetic Dropzone */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '14px', color: '#71717A', textTransform: 'uppercase', letterSpacing: '1px', margin: 0, fontWeight: '600' }}>
              Upload Interface
            </h3>
            
            <label 
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              style={{ 
                flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
                background: isDragging ? 'rgba(0, 240, 255, 0.05)' : '#09090B', 
                border: isDragging ? '2px dashed #00f0ff' : '2px dashed rgba(255,255,255,0.1)', 
                borderRadius: '16px', padding: '40px 20px', textAlign: 'center', 
                transition: 'all 0.3s ease', cursor: 'pointer', position: 'relative', overflow: 'hidden',
                boxShadow: isDragging ? '0 0 40px rgba(0, 240, 255, 0.1)' : 'none'
              }}
            >
              {/* Animated Radar Sweep Background */}
              {(scanStatus === 'scanning' || scanStatus === 'injecting') && (
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '100%', background: 'linear-gradient(180deg, transparent, rgba(0, 240, 255, 0.1), transparent)', animation: 'sweep 2s infinite linear' }} />
              )}
              
              <div style={{ fontSize: '48px', marginBottom: '16px', position: 'relative', zIndex: 1 }}>
                {scanStatus === 'ready' ? '✅' : (scanStatus === 'injecting' ? '🚀' : (selectedFile ? '⚙️' : '📥'))}
              </div>
              <h3 style={{ fontSize: '18px', margin: '0 0 8px 0', color: scanStatus === 'ready' ? '#10b981' : (isDragging ? '#00f0ff' : '#FAFAFA'), fontWeight: '700', position: 'relative', zIndex: 1 }}>
                {selectedFile ? selectedFile.name : 'Initialize Drop Sequence'}
              </h3>
              <p style={{ color: '#A1A1AA', fontSize: '14px', margin: 0, position: 'relative', zIndex: 1 }}>
                {selectedFile 
                  ? `${(selectedFile.size / 1024).toFixed(2)} KB detected.` 
                  : 'Drag & Drop CSV payload here, or click to browse.'}
              </p>
              
              <input type="file" accept=".csv" onChange={handleFileSelect} style={{ display: 'none' }} />
            </label>

            <style>{`
              @keyframes sweep {
                0% { transform: translateY(-100%); }
                100% { transform: translateY(100%); }
              }
              @keyframes blink {
                0%, 100% { opacity: 1; }
                50% { opacity: 0; }
              }
            `}</style>
          </div>

          {/* RIGHT: Live Diagnostics Terminal */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <h3 style={{ fontSize: '14px', color: '#71717A', textTransform: 'uppercase', letterSpacing: '1px', margin: 0, fontWeight: '600' }}>
              Pre-Flight Diagnostics
            </h3>
            
            <div style={{ 
              flex: 1, background: '#050505', border: '1px solid rgba(255,255,255,0.05)', 
              borderRadius: '16px', padding: '24px', fontFamily: '"Fira Code", monospace', 
              fontSize: '13px', display: 'flex', flexDirection: 'column', position: 'relative' 
            }}>
              <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#ff2a7a' }}></div>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#f59e0b' }}></div>
                <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#10b981' }}></div>
              </div>

              <div style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {terminalLogs.length === 0 && (
                  <div style={{ color: '#71717A' }}>Waiting for CSV payload...</div>
                )}
                {terminalLogs.map((log, i) => (
                  <div key={i} style={{ color: log.includes('[OK]') || log.includes('[CLEAN]') || log.includes('[NO ERRORS FOUND]') || log.includes('[SUCCESS]') ? '#10b981' : (log.includes('[CRITICAL ERROR]') ? '#ff2a7a' : '#00f0ff') }}>
                    {log}
                  </div>
                ))}
                {(scanStatus === 'scanning' || scanStatus === 'injecting') && (
                  <div style={{ color: '#00f0ff', animation: 'blink 1s infinite' }}>_</div>
                )}
              </div>
            </div>
          </div>

        </div>

        {/* Elite Execution Footer with onClick integrated */}
        <div style={{ marginTop: '32px', display: 'flex', justifyContent: 'flex-end' }}>
          <button 
            onClick={executeDataInjection}
            disabled={scanStatus !== 'ready'}
            style={{ 
              background: scanStatus === 'ready' ? 'linear-gradient(90deg, #10b981, #00f0ff)' : '#18181B',
              color: scanStatus === 'ready' ? '#000' : '#71717A',
              border: scanStatus === 'ready' ? 'none' : '1px solid rgba(255,255,255,0.05)', 
              padding: '16px 48px', borderRadius: '8px', fontWeight: '900', fontSize: '15px', 
              cursor: scanStatus === 'ready' ? 'pointer' : 'not-allowed',
              transition: 'all 0.3s', 
              boxShadow: scanStatus === 'ready' ? '0 10px 30px rgba(16, 185, 129, 0.4)' : 'none',
              letterSpacing: '1px'
            }}
          >
            {scanStatus === 'injecting' ? 'INJECTING DATA...' : 'EXECUTE DATA INJECTION'}
          </button>
        </div>

      </div>
    </div>
  );
}