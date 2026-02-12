"use client";

import { ExerciseDayResponse } from "@/app/types/exercise";
import { Minus, Plus } from "lucide-react";
import { useState } from "react";

interface SessionsSectionProps {
  exercise: ExerciseDayResponse;
  day: number;
}
const SessionTrackForm = ({ exercise, day }: SessionsSectionProps) => {
  const initialSetsState = exercise.todayGoal.reps.split("/").map(Number);
  const [status, setStatus] = useState({
    loading: false,
    message: "",
    error: false,
    success: false,
  });
  const [sets, setSets] = useState(
    initialSetsState.map((reps, index) => ({
      setNumber: index + 1,
      weight: exercise.lastSession.weight || 0,
      reps,
    })),
  );

  const targetReps = exercise.todayGoal.reps.split("/").map(Number);
  const allSetsComplete = sets.every((set) => set.reps > 0);
  const dominated =
    allSetsComplete &&
    sets.every(
      (set, i) =>
        set.reps >= (targetReps[i] || targetReps[targetReps.length - 1] || 0),
    );

  const removeSet = () => {
    if (sets.length > 1) {
      setSets((prev) => prev.slice(0, -1));
    }
  };

  const addSet = () => {
    setSets((prev) => [
      ...prev,
      {
        setNumber: prev.length + 1,
        weight:
          prev[prev.length - 1]?.weight || exercise.lastSession.weight || 0,
        reps: 0,
      },
    ]);
  };

  const updateSet = (
    index: number,
    field: "weight" | "reps",
    value: number,
  ) => {
    setSets((prev) =>
      prev.map((set, i) => (i === index ? { ...set, [field]: value } : set)),
    );
  };

  const handleSave = () => {
    sendDataToBackend();
  };

  const sendDataToBackend = async () => {
    setStatus({ ...status, loading: true });
    const res = await fetch("/api/workout-sets", {
      method: "POST",
      body: JSON.stringify({
        personId: exercise.person.id,
        exerciseId: exercise.exercise.id,
        day,
        sets: sets,
      }),
    });

    if (res.status === 200) {
      setStatus({
        ...status,
        loading: false,
        message: "Sets guardados",
        success: true,
        error: false,
      });

      // after 2000 ms, change the success to default
      setTimeout(() => {
        setStatus({
          ...status,
          loading: false,
          message: "",
          success: false,
          error: false,
        });
      }, 2000);
    } else {
      setStatus({
        ...status,
        loading: false,
        message: "Error al guardar los sets",
        success: false,
        error: true,
      });
    }
  };

  return (
    <div className="px-6 mt-6">
      {/* Sets Input */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-white">Guarda tus sets</h3>
          <div className="flex items-center gap-2">
            <button
              onClick={removeSet}
              disabled={sets.length <= 1}
              className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white disabled:opacity-30 disabled:cursor-not-allowed transition-all"
            >
              <Minus className="w-4 h-4" />
            </button>
            <button
              onClick={addSet}
              className="p-2 rounded-lg bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white transition-all"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="space-y-3">
          {sets.map((set, index) => (
            <div
              key={index}
              className="bg-zinc-900 rounded-xl p-5 border border-zinc-800"
            >
              <div className="flex items-center gap-4">
                {/* Set Number */}
                <div className="shrink-0 w-10 h-10 rounded-full bg-zinc-800 flex items-center justify-center">
                  <span className="text-white font-bold">{set.setNumber}</span>
                </div>

                {/* Weight Input */}
                <div className="flex-1">
                  <label className="block text-xs text-zinc-500 mb-1">
                    Peso (kg)
                  </label>
                  <input
                    type="number"
                    value={set.weight}
                    onChange={(e) =>
                      updateSet(index, "weight", parseInt(e.target.value) || 0)
                    }
                    className="w-full bg-zinc-800 text-white text-lg font-semibold rounded-lg px-4 py-3 border border-zinc-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="0"
                  />
                </div>

                {/* Reps Input */}
                <div className="flex-1">
                  <label className="block text-xs text-zinc-500 mb-1">
                    Reps
                  </label>
                  <input
                    type="number"
                    value={set.reps || ""}
                    onChange={(e) =>
                      updateSet(index, "reps", parseInt(e.target.value) || 0)
                    }
                    className="w-full bg-zinc-800 text-white text-lg font-semibold rounded-lg px-4 py-3 border border-zinc-700 focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all"
                    placeholder="0"
                  />
                </div>
              </div>

              {/* Target indicator for this set */}
              {targetReps[index] && (
                <div className="mt-3 text-xs text-zinc-500">
                  Objetivo: {targetReps[index]} reps
                  {set.reps >= targetReps[index] && set.reps > 0 && (
                    <span className="ml-2 text-green-400">✓</span>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Progression Feedback */}
      {allSetsComplete && (
        <div
          className={`rounded-xl p-5 border mb-6 ${
            dominated
              ? "bg-green-500/10 border-green-500/30"
              : "bg-yellow-500/10 border-yellow-500/30"
          }`}
        >
          <div className="flex items-start gap-3">
            <div className="text-2xl">{dominated ? "🔓" : "👀"}</div>
            <div>
              <h4
                className={`font-semibold mb-1 ${
                  dominated ? "text-green-400" : "text-yellow-400"
                }`}
              >
                {dominated ? "Dominado 🔓" : "Se esta cocinando 👀"}
              </h4>
              <p className="text-sm text-zinc-300">
                {dominated
                  ? "Inc rementa peso o reps la siguiente sesion!"
                  : "Mante el ritmo, Ya casi lo tienes 👊"}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Fixed Bottom Button */}
      <div className="fixed bottom-0 left-0 right-0 p-6 bg-linear-to-t from-zinc-950 via-zinc-950 to-transparent">
        <button
          onClick={handleSave}
          disabled={!allSetsComplete || status.loading}
          className="w-full bg-blue-600 hover:bg-blue-700 active:bg-blue-800 disabled:bg-zinc-800 disabled:text-zinc-500 text-white font-semibold py-4 rounded-xl transition-all disabled:cursor-not-allowed shadow-lg shadow-blue-600/20 disabled:shadow-none"
        >
          {status.loading && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              Cargando...
            </div>
          )}

          {status.success && (
            <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
              Guardado!
            </div>
          )}

          {!status.loading && !status.success && "Guardar Sets"}
        </button>
      </div>
    </div>
  );
};

export default SessionTrackForm;
