import React, { useState } from "react";
import { HelpCircle, ChevronRight, Award, Trophy, Eye, Check } from "lucide-react";
import { CarImage } from "../ui/CarImage";

interface Question {
  id: number;
  text: string;
  options: { label: string; score: string }[];
}

interface BYDQuizProps {
  authToken: string;
  onQuizSuccess: (newPoints: number) => void;
}

export const BYDQuiz: React.FC<BYDQuizProps> = ({
  authToken,
  onQuizSuccess,
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [recommendedModel, setRecommendedModel] = useState<string | null>(null);
  const [pointsEarned, setPointsEarned] = useState<number | null>(null);

  const quizQuestions: Question[] = [
    {
      id: 1,
      text: "What is your primary driving environment typical pattern?",
      options: [
        { label: "Urban commuter streets & city lane parking", score: "compact" },
        { label: "Long-distance multi-state expressway touring", score: "sedan" },
        { label: "Tough mountain trails and off-road exploration", score: "offroad" },
        { label: "Executive business airport pickups & team shuttle", score: "mpv" },
      ],
    },
    {
      id: 2,
      text: "What matters most to you in an advanced Electric Vehicle?",
      options: [
        { label: "Incredible blade battery thermals safety record", score: "suv" },
        { label: "Sub-3-second acceleration and sports torque stats", score: "sport" },
        { label: "Budget-conscious energy saving & value pricing", score: "compact" },
        { label: "Massive active cabin room & executive comfort", score: "mpv" },
      ],
    },
    {
      id: 3,
      text: "How many passenger seats do you regularly coordinate?",
      options: [
        { label: "Mainly solo driving or with one companion", score: "compact" },
        { label: "Family of 4 with school bags & sports gear", score: "suv" },
        { label: "Up to 7 people with full heavy suitcases", score: "mpv" },
        { label: "Medium raw cargo freight and heavy utility tools", score: "offroad" },
      ],
    },
    {
      id: 4,
      text: "Which visual aesthetic profile matches your lifestyle vibe?",
      options: [
        { label: "Sleek low-slung aerodynamic sedan sportback", score: "sedan" },
        { label: "Big, bold, muscular high-clearance offground SUV", score: "offroad" },
        { label: "Agile, modern, cute and compact city hatch", score: "compact" },
        { label: "Sophisticated premium limousine with chrome grilles", score: "mpv" },
      ],
    },
  ];

  const handleSelectOption = (qId: number, score: string) => {
    setAnswers((prev) => ({ ...prev, [qId]: score }));
    if (currentStep < quizQuestions.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const calculateResult = () => {
    const scoreCounts: Record<string, number> = {};
    Object.values(answers).forEach((score) => {
      const scoreStr = score as string;
      scoreCounts[scoreStr] = (scoreCounts[scoreStr] || 0) + 1;
    });

    let bestScore = "suv";
    let maxCount = 0;
    Object.entries(scoreCounts).forEach(([score, cnt]) => {
      if (cnt > maxCount) {
        maxCount = cnt;
        bestScore = score;
      }
    });

    // Map high level score to matching luxury models
    if (bestScore === "compact") return "BYD Dolphin";
    if (bestScore === "sport") return "BYD Yangwang U9";
    if (bestScore === "offroad") return "BYD Yangwang U8";
    if (bestScore === "mpv") return "BYD Denza D9";
    if (bestScore === "sedan") return "BYD Seal";
    return "BYD Atto 3"; // default robust crossover
  };

  const handleSubmitQuiz = async () => {
    setSubmitting(true);
    const resolvedCar = calculateResult();
    try {
      const res = await fetch("/api/quiz/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ carModel: resolvedCar }),
      });

      const resJson = await res.json();
      if (res.ok) {
        setRecommendedModel(resolvedCar);
        setPointsEarned(resJson.points_earned);
        onQuizSuccess(resJson.new_points);
      } else {
        alert(resJson.error || "Quiz entry failed.");
      }
    } catch {
      alert("Unable to reach lifestyle recommendation database nodes.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setAnswers({});
    setCurrentStep(0);
    setRecommendedModel(null);
    setPointsEarned(null);
  };

  const progressPct = Math.round((currentStep / quizQuestions.length) * 100);

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 space-y-5 text-left" id="byd-personality-quiz">
      <div className="flex justify-between items-center pb-3 border-b border-slate-800">
        <div>
          <span className="text-[10px] uppercase font-mono tracking-widest text-slate-500 font-bold block">
            FLEET FIT SYSTEM
          </span>
          <h3 className="font-display font-semibold text-xs sm:text-sm text-slate-200 mt-0.5">
            Lifestyle Matchmaker Quiz
          </h3>
        </div>
        <HelpCircle className="w-4 h-4 text-cyan-400 animate-pulse" />
      </div>

      {recommendedModel ? (
        /* Result screen */
        <div className="space-y-4 animate-fade-in">
          <div className="p-4 bg-emerald-950/20 border border-emerald-500/20 rounded-xl flex items-center gap-3">
            <Trophy className="w-5 h-5 text-yellow-400 flex-shrink-0 animate-bounce" />
            <p className="text-xs font-mono text-emerald-300">
              QUIZ COMPLETE! Received <span className="font-bold text-white uppercase font-sans">+{pointsEarned} points</span>.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-center">
            <div className="aspect-video w-full rounded-xl overflow-hidden bg-black border border-slate-950">
              <CarImage model={recommendedModel} className="w-full h-full object-cover" />
            </div>
            <div className="space-y-1.5">
              <span className="text-[9px] uppercase font-mono tracking-widest font-bold text-cyan-400">
                YOUR PERFECT MATCH Recommendation:
              </span>
              <h4 className="text-base font-bold font-sans tracking-tight text-white">{recommendedModel}</h4>
              <p className="text-[11px] text-slate-400 leading-relaxed font-sans">
                Our advanced e-Platform selection engine analyzed your speed, capacity, and terrain preferences to allocate this flagship {recommendedModel} reference build path.
              </p>
            </div>
          </div>

          <button
            onClick={handleReset}
            className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition cursor-pointer"
          >
            Retake Matchmaker Quiz
          </button>
        </div>
      ) : (
        /* Question screen */
        <div className="space-y-4 font-sans">
          {/* Progress bar line */}
          <div className="space-y-1.5">
            <div className="flex justify-between items-baseline text-[9px] font-mono uppercase text-slate-500 leading-none">
              <span>Question {currentStep + 1} of {quizQuestions.length}</span>
              <span>{progressPct}% Done</span>
            </div>
            <div className="w-full h-1 bg-slate-950 rounded-full overflow-hidden">
              <div
                style={{ width: `${progressPct}%` }}
                className="h-full bg-cyan-400 transition-all duration-300"
              />
            </div>
          </div>

          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-200">
              {quizQuestions[currentStep].text}
            </h4>
            <div className="grid grid-cols-1 gap-2">
              {quizQuestions[currentStep].options.map((opt, idx) => {
                const isSelected = answers[quizQuestions[currentStep].id] === opt.score;
                return (
                  <button
                    key={idx}
                    onClick={() => handleSelectOption(quizQuestions[currentStep].id, opt.score)}
                    className={`p-3 text-left text-xs rounded-xl border transition duration-150 flex items-center justify-between cursor-pointer ${
                      isSelected
                        ? "bg-cyan-500/10 border-cyan-400 text-cyan-400 font-bold"
                        : "bg-slate-950 border-slate-850 hover:bg-slate-900 text-slate-300 hover:text-white"
                    }`}
                  >
                    <span>{opt.label}</span>
                    <ChevronRight className="w-3.5 h-3.5 opacity-50" />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Submit button on final question */}
          {Object.keys(answers).length === quizQuestions.length && (
            <button
              onClick={handleSubmitQuiz}
              disabled={submitting}
              className="w-full py-2.5 bg-cyan-500 hover:bg-cyan-400 text-slate-950 rounded-xl text-xs font-mono font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-1.5 shadow-lg"
            >
              <Check className="w-4 h-4" />
              <span>Settle Quiz & Claim Points</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
