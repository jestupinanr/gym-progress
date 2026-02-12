"use client";

import { ExerciseDayResponse } from "@/app/types/exercise";

interface SessionsSectionProps {
  exercise: ExerciseDayResponse;
}
const SessionsSection = ({ exercise }: SessionsSectionProps) => {
  return (
    <div>
      {/* Last Session Reference */}
      <div className="bg-zinc-900 rounded-xl p-5 border border-zinc-800 mb-6">
        <h3 className="text-sm font-semibold text-zinc-400 uppercase tracking-wide mb-3">
          Ultima seccion
        </h3>
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <span className="text-zinc-500 text-sm">Peso:</span>
            <span className="text-white font-semibold">
              {exercise.lastSession.weight} Kg
            </span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-zinc-500 text-sm">Reps:</span>
            <span className="text-white font-mono">
              {exercise.lastSession.reps}
            </span>
          </div>
        </div>
      </div>

      {/* Target Reference */}
      <div className="bg-blue-500/10 rounded-xl p-5 border border-blue-500/30 mb-6">
        <h3 className="text-sm font-semibold text-blue-400 uppercase tracking-wide mb-3">
          Objetivo
        </h3>
        <div className="flex items-center gap-3">
          <span className="text-blue-300 text-sm">Reps:</span>
          <span className="text-white font-mono font-semibold">
            {exercise.todayGoal.reps}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SessionsSection;
