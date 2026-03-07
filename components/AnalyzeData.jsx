"use client";

import { useState, useRef } from "react";

// ── Palette ─────────────────────────────────────────────────
const CARD = "#0e1623";
const BORDER = "#1a2535";
const CYAN = "#00e5ff";
const MUTED = "#4a6080";
const TEXT = "#e2eaf4";
const GREEN = "#00e676";
const RED = "#ff6b6b";

// ── Field mapping options ────────────────────────────────────
const FIELD_OPTIONS = [
  "-- Skip this column --",
  "Job Title",
  "Salary (Annual)",
  "Salary (Min)",
  "Salary (Max)",
  "Company Name",
  "Location / City",
  "Country",
  "Skills / Technologies",
  "Experience Level",
  "Employment Type",
  "Industry",
  "Date Posted",
  "Remote / On-site",
];

// ── Smart column guesser ─────────────────────────────────────
function guessField(colName) {
  const col = colName.toLowerCase().replace(/[_\s-]/g, "");
  if (col.includes("title") || col.includes("role") || col.includes("position"))
    return "Job Title";
  if (
    col.includes("avgsal") ||
    col.includes("annualsal") ||
    col.includes("salaryyear") ||
    col.includes("basepay")
  )
    return "Salary (Annual)";
  if (
    col.includes("salarymin") ||
    col.includes("minsal") ||
    col.includes("salaryfrom")
  )
    return "Salary (Min)";
  if (
    col.includes("salarymax") ||
    col.includes("maxsal") ||
    col.includes("salaryto")
  )
    return "Salary (Max)";
  if (
    col.includes("salary") ||
    col.includes("pay") ||
    col.includes("compensation") ||
    col.includes("wage")
  )
    return "Salary (Annual)";
  if (
    col.includes("company") ||
    col.includes("employer") ||
    col.includes("organization")
  )
    return "Company Name";
  if (
    col.includes("location") ||
    col.includes("city") ||
    col.includes("region")
  )
    return "Location / City";
  if (col.includes("country") || col.includes("nation")) return "Country";
  if (
    col.includes("skill") ||
    col.includes("tech") ||
    col.includes("stack") ||
    col.includes("tool")
  )
    return "Skills / Technologies";
  if (
    col.includes("experience") ||
    col.includes("level") ||
    col.includes("seniority")
  )
    return "Experience Level";
  if (
    col.includes("type") ||
    col.includes("employment") ||
    col.includes("contract")
  )
    return "Employment Type";
  if (
    col.includes("industry") ||
    col.includes("sector") ||
    col.includes("domain")
  )
    return "Industry";
  if (col.includes("date") || col.includes("posted") || col.includes("time"))
    return "Date Posted";
  if (
    col.includes("remote") ||
    col.includes("hybrid") ||
    col.includes("onsite")
  )
    return "Remote / On-site";
  return "-- Skip this column --";
}

// ── Hover Hook ───────────────────────────────────────────────
function useHover() {
  const [hovered, setHovered] = useState(false);
  return {
    hovered,
    onMouseEnter: () => setHovered(true),
    onMouseLeave: () => setHovered(false),
  };
}

// ── Upload Zone ──────────────────────────────────────────────
function UploadZone({ onFileLoaded, isMobile }) {
  const [dragging, setDragging] = useState(false);
  const inputRef = useRef(null);
  const { hovered, onMouseEnter, onMouseLeave } = useHover();

  const processFile = (file) => {
    if (!file || !file.name.endsWith(".csv")) {
      alert("Please upload a valid .csv file");
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target.result;
      const lines = text.split("\n").filter(Boolean);
      if (lines.length < 2) {
        alert("CSV appears to be empty.");
        return;
      }
      const headers = lines[0]
        .split(",")
        .map((h) => h.trim().replace(/^"|"$/g, ""));
      const preview = lines
        .slice(1, 4)
        .map((line) =>
          line.split(",").map((v) => v.trim().replace(/^"|"$/g, "")),
        );
      onFileLoaded({
        name: file.name,
        rows: lines.length - 1,
        headers,
        preview,
      });
    };
    reader.readAsText(file);
  };

  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      onDragOver={(e) => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={(e) => {
        e.preventDefault();
        setDragging(false);
        processFile(e.dataTransfer.files[0]);
      }}
      onClick={() => inputRef.current?.click()}
      style={{
        margin: isMobile ? "14px 14px 0" : "20px 32px 0",
        border: `2px dashed ${dragging ? CYAN : hovered ? CYAN + "88" : BORDER}`,
        borderRadius: isMobile ? 12 : 14,
        padding: isMobile ? "32px 20px" : "48px 32px",
        textAlign: "center",
        cursor: "pointer",
        background: dragging ? `${CYAN}0a` : hovered ? `${CYAN}05` : CARD,
        transition: "all 0.2s ease",
      }}
    >
      <input
        ref={inputRef}
        type="file"
        accept=".csv"
        style={{ display: "none" }}
        onChange={(e) => processFile(e.target.files[0])}
      />

      <div style={{ fontSize: isMobile ? 36 : 48, marginBottom: 12 }}>📂</div>
      <div
        style={{
          fontSize: isMobile ? 14 : 16,
          fontWeight: 700,
          color: TEXT,
          marginBottom: 6,
        }}
      >
        No Data Uploaded
      </div>
      <div
        style={{
          fontSize: isMobile ? 11 : 12,
          color: MUTED,
          marginBottom: 20,
          fontFamily: "monospace",
        }}
      >
        Drop your .csv file here or click to browse
      </div>
      <div
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 8,
          background: CYAN,
          color: "#000",
          fontWeight: 800,
          fontSize: isMobile ? 13 : 14,
          padding: isMobile ? "10px 24px" : "12px 32px",
          borderRadius: 10,
          fontFamily: "monospace",
          letterSpacing: 0.5,
          boxShadow: `0 0 20px ${CYAN}44`,
        }}
      >
        ⬆ UPLOAD CSV
      </div>
    </div>
  );
}

// ── File Info Bar ────────────────────────────────────────────
function FileInfoBar({ file, onReset, isMobile }) {
  return (
    <div
      style={{
        margin: isMobile ? "14px 14px 0" : "20px 32px 0",
        background: `${GREEN}0f`,
        border: `1px solid ${GREEN}44`,
        borderRadius: 10,
        padding: "12px 16px",
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span style={{ fontSize: 18 }}>✅</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 700, color: GREEN }}>
            {file.name}
          </div>
          <div style={{ fontSize: 11, color: MUTED, fontFamily: "monospace" }}>
            {file.rows.toLocaleString()} rows · {file.headers.length} columns
            detected
          </div>
        </div>
      </div>
      <button
        onClick={onReset}
        style={{
          background: `${RED}18`,
          border: `1px solid ${RED}44`,
          color: RED,
          borderRadius: 8,
          padding: "6px 12px",
          fontSize: 11,
          fontWeight: 700,
          cursor: "pointer",
          fontFamily: "monospace",
        }}
      >
        ✕ REMOVE
      </button>
    </div>
  );
}

// ── Schema Mapping Row ───────────────────────────────────────
function MappingRow({ col, sample, mapping, onChange, isMobile }) {
  const { hovered, onMouseEnter, onMouseLeave } = useHover();
  const isSkipped = mapping === "-- Skip this column --";
  return (
    <div
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
      style={{
        background: hovered ? `${CYAN}08` : "transparent",
        border: `1px solid ${isSkipped ? BORDER : CYAN + "33"}`,
        borderRadius: 10,
        padding: isMobile ? "12px" : "14px 16px",
        marginBottom: 8,
        transition: "all 0.15s ease",
      }}
    >
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 8,
        }}
      >
        <div
          style={{
            width: 18,
            height: 18,
            borderRadius: 4,
            flexShrink: 0,
            background: isSkipped ? BORDER : `${CYAN}22`,
            border: `1px solid ${isSkipped ? MUTED : CYAN}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 10,
            color: isSkipped ? MUTED : CYAN,
          }}
        >
          {isSkipped ? "" : "✓"}
        </div>

        <span style={{ fontSize: 11, color: MUTED, fontFamily: "monospace" }}>
          CSV COLUMN:
        </span>
        <span
          style={{
            fontSize: 13,
            fontWeight: 700,
            color: CYAN,
            fontFamily: "monospace",
          }}
        >
          "{col}"
        </span>
      </div>

      {/* Sample values */}
      {sample.length > 0 && (
        <div
          style={{
            display: "flex",
            gap: 6,
            marginBottom: 10,
            flexWrap: "wrap",
          }}
        >
          {sample.map(
            (s, i) =>
              s && (
                <span
                  key={i}
                  style={{
                    fontSize: 10,
                    color: MUTED,
                    background: "#0a1220",
                    border: `1px solid ${BORDER}`,
                    borderRadius: 4,
                    padding: "2px 6px",
                    fontFamily: "monospace",
                    maxWidth: 120,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    whiteSpace: "nowrap",
                  }}
                >
                  {s}
                </span>
              ),
          )}
        </div>
      )}

      {/* Mapping dropdown */}
      <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
        <span
          style={{
            fontSize: 10,
            color: MUTED,
            letterSpacing: 1,
            whiteSpace: "nowrap",
          }}
        >
          MAP TO FIELD
        </span>
        <select
          value={mapping}
          onChange={(e) => onChange(col, e.target.value)}
          style={{
            flex: 1,
            background: "#0a1220",
            border: `1px solid ${isSkipped ? BORDER : CYAN + "55"}`,
            borderRadius: 8,
            padding: "7px 10px",
            color: isSkipped ? MUTED : TEXT,
            fontSize: isMobile ? 11 : 12,
            fontFamily: "'JetBrains Mono', monospace",
            outline: "none",
            cursor: "pointer",
          }}
        >
          {FIELD_OPTIONS.map((opt) => (
            <option key={opt} value={opt} style={{ background: "#0e1623" }}>
              {opt}
            </option>
          ))}
        </select>
      </div>
    </div>
  );
}

// ── Schema Mapping Panel ─────────────────────────────────────
function SchemaMapping({ file, mappings, setMappings, isMobile }) {
  const mappedCount = Object.values(mappings).filter(
    (v) => v !== "-- Skip this column --",
  ).length;
  const totalCount = file.headers.length;

  return (
    <div style={{ margin: isMobile ? "14px 14px 0" : "20px 32px 0" }}>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 14,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: CYAN,
            }}
          />
          <span
            style={{
              fontSize: isMobile ? 14 : 16,
              fontWeight: 700,
              color: TEXT,
              letterSpacing: 1,
            }}
          >
            SCHEMA MAPPING
          </span>
        </div>
        <div
          style={{
            fontSize: 10,
            fontWeight: 700,
            padding: "3px 10px",
            borderRadius: 6,
            background: mappedCount > 0 ? `${CYAN}18` : `${RED}18`,
            border: `1px solid ${mappedCount > 0 ? CYAN + "44" : RED + "44"}`,
            color: mappedCount > 0 ? CYAN : RED,
            fontFamily: "monospace",
          }}
        >
          {mappedCount}/{totalCount} MAPPED
        </div>
      </div>

      {file.headers.map((col, i) => (
        <MappingRow
          key={col}
          col={col}
          sample={file.preview.map((row) => row[i] || "").slice(0, 3)}
          mapping={mappings[col] || "-- Skip this column --"}
          onChange={(c, v) => setMappings((prev) => ({ ...prev, [c]: v }))}
          isMobile={isMobile}
        />
      ))}
    </div>
  );
}

// ── Analyze Button ───────────────────────────────────────────
function AnalyzeButton({ mappings, isMobile }) {
  const { hovered, onMouseEnter, onMouseLeave } = useHover();
  const mappedCount = Object.values(mappings).filter(
    (v) => v !== "-- Skip this column --",
  ).length;
  const ready = mappedCount >= 2;

  return (
    <div style={{ margin: isMobile ? "20px 14px 0" : "24px 32px 0" }}>
      <button
        disabled={!ready}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
        style={{
          width: "100%",
          padding: isMobile ? "14px" : "16px",
          background: ready ? (hovered ? `${CYAN}dd` : CYAN) : BORDER,
          border: "none",
          borderRadius: 12,
          color: ready ? "#000" : MUTED,
          fontSize: isMobile ? 14 : 15,
          fontWeight: 800,
          fontFamily: "'JetBrains Mono', monospace",
          letterSpacing: 1,
          cursor: ready ? "pointer" : "not-allowed",
          transition: "all 0.2s ease",
          boxShadow: ready && hovered ? `0 0 24px ${CYAN}66` : "none",
        }}
      >
        {ready ? "⚡ RUN ANALYSIS" : `MAP AT LEAST 2 FIELDS TO CONTINUE`}
      </button>
      {ready && (
        <p
          style={{
            fontSize: 11,
            color: MUTED,
            textAlign: "center",
            marginTop: 8,
            fontFamily: "monospace",
          }}
        >
          {mappedCount} fields mapped · Analysis will generate charts
          automatically
        </p>
      )}
    </div>
  );
}

// ── Main Export ──────────────────────────────────────────────
export default function AnalyzeData({ isMobile }) {
  const [fileData, setFileData] = useState(null);
  const [mappings, setMappings] = useState({});

  const handleFileLoaded = (data) => {
    setFileData(data);
    // Auto-detect mappings
    const autoMappings = {};
    data.headers.forEach((col) => {
      autoMappings[col] = guessField(col);
    });
    setMappings(autoMappings);
  };

  const handleReset = () => {
    setFileData(null);
    setMappings({});
  };

  return (
    <div style={{ overflowY: "auto", flex: 1, paddingBottom: 32 }}>
      {/* Page Title */}
      <div style={{ padding: isMobile ? "14px 14px 0" : "24px 32px 0" }}>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            marginBottom: 4,
          }}
        >
          <div
            style={{
              width: 8,
              height: 8,
              borderRadius: "50%",
              background: CYAN,
            }}
          />
          <span
            style={{
              fontSize: isMobile ? 16 : 20,
              fontWeight: 800,
              color: TEXT,
              letterSpacing: 1,
            }}
          >
            ANALYZE_DATA<span style={{ color: MUTED }}>.csv</span>
          </span>
        </div>
        <p
          style={{
            fontSize: isMobile ? 11 : 12,
            color: MUTED,
            fontFamily: "monospace",
            marginLeft: 16,
          }}
        >
          Upload your job market CSV · AI-powered schema detection
        </p>
      </div>

      {/* Upload or File Info */}
      {!fileData ? (
        <UploadZone onFileLoaded={handleFileLoaded} isMobile={isMobile} />
      ) : (
        <FileInfoBar
          file={fileData}
          onReset={handleReset}
          isMobile={isMobile}
        />
      )}

      {/* Schema mapping — only shows after upload */}
      {fileData && (
        <>
          <SchemaMapping
            file={fileData}
            mappings={mappings}
            setMappings={setMappings}
            isMobile={isMobile}
          />
          <AnalyzeButton mappings={mappings} isMobile={isMobile} />
        </>
      )}

      <div style={{ height: 16 }} />
    </div>
  );
}
