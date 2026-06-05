import React from "react";
import { motion } from "framer-motion";

const EVENTS = [
  { actor: "learner_8f2a",  verb: "completed",   obj: "Module 3",       t: "12:04:31" },
  { actor: "learner_cc90",  verb: "attempted",   obj: "Quiz_Ch4",       t: "12:04:33" },
  { actor: "learner_3e17",  verb: "progressed",  obj: "Section 2.1",    t: "12:04:35" },
  { actor: "learner_a41b",  verb: "answered",    obj: "Q14",            t: "12:04:37" },
  { actor: "learner_09fd",  verb: "experienced", obj: "Video_Intro",    t: "12:04:39" },
];

const STAGES_LABEL = ["Schema validate", "Verb normalize", "Pseudonymise", "Profile"];
const STAGE_COLORS = ["#93C5FD", "#67E8F9", "#86EFAC", "#C4B5FD"];

const VERB_COLORS: Record<string, string> = {
  completed:   "#86EFAC",
  attempted:   "#FCD34D",
  progressed:  "#93C5FD",
  answered:    "#C4B5FD",
  experienced: "#67E8F9",
};

export function XapiEventStream() {
  return (
    <div className="relative w-full select-none">
      {/* Stage pipeline header */}
      <div className="flex items-center gap-1 mb-3 flex-wrap">
        {STAGES_LABEL.map((s, i) => (
          <React.Fragment key={s}>
            <span
              className="text-xs font-medium px-2 py-0.5 rounded"
              style={{ background: `${STAGE_COLORS[i]}18`, color: STAGE_COLORS[i], border: `1px solid ${STAGE_COLORS[i]}30` }}
            >
              {s}
            </span>
            {i < STAGES_LABEL.length - 1 && (
              <span className="text-slate-600 text-xs">→</span>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Event rows */}
      <div className="space-y-1.5">
        {EVENTS.map((ev, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, x: -12 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.35, delay: 0.2 + i * 0.15 }}
            className="flex items-center gap-2 rounded-lg px-3 py-2"
            style={{ background: "rgba(255,255,255,0.03)", border: "1px solid rgba(255,255,255,0.06)" }}
          >
            {/* Timestamp */}
            <span className="text-slate-600 text-xs font-mono flex-shrink-0">{ev.t}</span>

            {/* Actor (pseudonymised) */}
            <span className="text-slate-500 text-xs font-mono">{ev.actor}</span>

            {/* Verb badge */}
            <span
              className="text-xs font-medium px-1.5 py-0.5 rounded flex-shrink-0"
              style={{
                background: `${VERB_COLORS[ev.verb] ?? "#64748b"}18`,
                color: VERB_COLORS[ev.verb] ?? "#64748b",
                border: `1px solid ${VERB_COLORS[ev.verb] ?? "#64748b"}30`,
              }}
            >
              {ev.verb}
            </span>

            {/* Object */}
            <span className="text-slate-400 text-xs truncate">{ev.obj}</span>

            {/* Status dot (validated) */}
            <motion.span
              className="ml-auto flex-shrink-0 w-2 h-2 rounded-full bg-emerald-400"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, delay: i * 0.3 }}
            />
          </motion.div>
        ))}
      </div>

      {/* Scroll animation hint */}
      <motion.div
        className="mt-2 text-center text-xs text-slate-600"
        animate={{ opacity: [0.4, 0.8, 0.4] }}
        transition={{ duration: 2.5, repeat: Infinity }}
      >
        live xAPI event stream · pseudonymised · schema-validated
      </motion.div>
    </div>
  );
}
