import React from "react";
import { motion } from "framer-motion";
import { FileText, Shield, Database, Share2, BarChart2, Code2 } from "lucide-react";

const ARTIFACTS = [
  { icon: FileText, label: "SOP Report",      ext: ".pdf",     color: "#67E8F9", desc: "Standard Operating Procedure" },
  { icon: Database, label: "Data Card",        ext: ".json",    color: "#93C5FD", desc: "Dataset documentation" },
  { icon: Shield,   label: "Privacy Report",  ext: ".jsonld",  color: "#86EFAC", desc: "PII scan results" },
  { icon: BarChart2,label: "Metric Bundle",   ext: ".json",    color: "#C4B5FD", desc: "Gini, Coverage@K, Sparsity" },
  { icon: Code2,    label: "JSON-LD Graph",   ext: ".jsonld",  color: "#67E8F9", desc: "Compliance evidence graph" },
  { icon: Share2,   label: "Dashboard Export",ext: ".json",    color: "#94a3b8", desc: "Publishable payload" },
];

export function AuditArtifactStack() {
  return (
    <div className="space-y-2 w-full">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs text-slate-400 font-medium uppercase tracking-wider">Audit Artifacts</span>
        <span className="badge-ok text-xs">6 generated</span>
      </div>
      {ARTIFACTS.map((a, i) => {
        const Icon = a.icon;
        return (
          <motion.div
            key={a.label}
            initial={{ opacity: 0, x: 16 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, delay: i * 0.08 }}
            className="flex items-center gap-3 rounded-lg px-3 py-2.5"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            <div
              className="w-7 h-7 rounded flex items-center justify-center flex-shrink-0"
              style={{ background: `${a.color}15` }}
            >
              <Icon size={13} style={{ color: a.color }} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-slate-200">{a.label}</span>
                <span className="text-xs text-slate-600 font-mono">{a.ext}</span>
              </div>
              <p className="text-xs text-slate-500 truncate">{a.desc}</p>
            </div>
            <motion.div
              className="w-2 h-2 rounded-full flex-shrink-0"
              style={{ background: a.color }}
              animate={{ opacity: [0.4, 1, 0.4] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            />
          </motion.div>
        );
      })}
    </div>
  );
}
