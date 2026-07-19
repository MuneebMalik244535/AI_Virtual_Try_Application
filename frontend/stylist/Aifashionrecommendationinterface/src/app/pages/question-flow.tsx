import { useState } from "react";
import { useNavigate } from "react-router";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Progress } from "../components/ui/progress";
import { Slider } from "../components/ui/slider";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { PreferencesProvider, usePreferences } from "../context/preferences-context";
import { motion, AnimatePresence } from "motion/react";

const COLORS = [
  { name: "Black", value: "#000000" },
  { name: "White", value: "#FFFFFF" },
  { name: "Beige", value: "#F5F5DC" },
  { name: "Navy", value: "#001F3F" },
  { name: "Olive", value: "#808000" },
  { name: "Burgundy", value: "#800020" },
];

const OCCASIONS = [
  { id: "casual", label: "Casual", icon: "👕" },
  { id: "office", label: "Office", icon: "💼" },
  { id: "party", label: "Party", icon: "🎉" },
  { id: "wedding", label: "Wedding", icon: "💍" },
];

const SEASONS = [
  { id: "spring", label: "Spring", icon: "🌸" },
  { id: "summer", label: "Summer", icon: "☀️" },
  { id: "autumn", label: "Autumn", icon: "🍂" },
  { id: "winter", label: "Winter", icon: "❄️" },
];

const BODY_TYPES = [
  { id: "athletic", label: "Athletic" },
  { id: "pear", label: "Pear" },
  { id: "apple", label: "Apple" },
  { id: "hourglass", label: "Hourglass" },
  { id: "rectangle", label: "Rectangle" },
];

const SKIN_TONES = [
  { id: "fair", label: "Fair", color: "#FFE4C4" },
  { id: "light", label: "Light", color: "#E3BC9A" },
  { id: "medium", label: "Medium", color: "#C68642" },
  { id: "olive", label: "Olive", color: "#8D5524" },
  { id: "tan", label: "Tan", color: "#A0785A" },
  { id: "deep", label: "Deep", color: "#51341A" },
];

const STYLES = [
  { id: "minimal", label: "Minimal", emoji: "⚪" },
  { id: "streetwear", label: "Streetwear", emoji: "👟" },
  { id: "formal", label: "Formal", emoji: "👔" },
  { id: "sporty", label: "Sporty", emoji: "⚽" },
];

const GENDERS = [
  { id: "women", label: "Women's Fashion" },
  { id: "men", label: "Men's Fashion" },
  { id: "unisex", label: "Unisex" },
];

function QuestionFlowContent() {
  const [currentStep, setCurrentStep] = useState(0);
  const { preferences, updatePreferences } = usePreferences();
  const navigate = useNavigate();

  const totalSteps = 8;
  const progress = ((currentStep + 1) / totalSteps) * 100;

  const handleNext = () => {
    if (currentStep < totalSteps - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate("/upload");
    }
  };

  const handleBack = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    } else {
      navigate("/");
    }
  };

  const questions = [
    {
      title: "What's your budget range?",
      component: (
        <div className="space-y-8">
          <div className="text-center">
            <p className="text-5xl font-semibold">${preferences.budget}</p>
            <p className="text-neutral-500 mt-2">Maximum budget per outfit</p>
          </div>
          <Slider
            value={[preferences.budget]}
            onValueChange={(value) => updatePreferences({ budget: value[0] })}
            min={50}
            max={2000}
            step={50}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-neutral-500">
            <span>$50</span>
            <span>$2000</span>
          </div>
        </div>
      ),
    },
    {
      title: "What's the occasion?",
      component: (
        <div className="grid grid-cols-2 gap-4">
          {OCCASIONS.map((occasion) => (
            <button
              key={occasion.id}
              onClick={() => updatePreferences({ occasion: occasion.id })}
              className={`p-6 rounded-xl border-2 transition-all hover:border-black ${
                preferences.occasion === occasion.id
                  ? "border-black bg-black text-white"
                  : "border-neutral-200"
              }`}
            >
              <div className="text-4xl mb-2">{occasion.icon}</div>
              <div className="font-medium">{occasion.label}</div>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "Which season?",
      component: (
        <div className="grid grid-cols-2 gap-4">
          {SEASONS.map((season) => (
            <button
              key={season.id}
              onClick={() => updatePreferences({ season: season.id })}
              className={`p-6 rounded-xl border-2 transition-all hover:border-black ${
                preferences.season === season.id
                  ? "border-black bg-black text-white"
                  : "border-neutral-200"
              }`}
            >
              <div className="text-4xl mb-2">{season.icon}</div>
              <div className="font-medium">{season.label}</div>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "Preferred colors?",
      subtitle: "Select all that apply",
      component: (
        <div className="grid grid-cols-3 gap-4">
          {COLORS.map((color) => (
            <button
              key={color.value}
              onClick={() => {
                const isSelected = preferences.colors.includes(color.value);
                updatePreferences({
                  colors: isSelected
                    ? preferences.colors.filter((c) => c !== color.value)
                    : [...preferences.colors, color.value],
                });
              }}
              className={`p-4 rounded-xl border-2 transition-all hover:border-black ${
                preferences.colors.includes(color.value)
                  ? "border-black"
                  : "border-neutral-200"
              }`}
            >
              <div
                className="w-full h-16 rounded-lg mb-2"
                style={{
                  backgroundColor: color.value,
                  border: color.value === "#FFFFFF" ? "1px solid #e5e5e5" : "none",
                }}
              />
              <div className="text-sm font-medium">{color.name}</div>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "What's your height?",
      component: (
        <div className="space-y-8">
          <div className="text-center">
            <p className="text-5xl font-semibold">{preferences.height} cm</p>
            <p className="text-neutral-500 mt-2">
              {Math.floor(preferences.height / 30.48 / 12)}'{Math.round((preferences.height / 30.48) % 12)}"
            </p>
          </div>
          <Slider
            value={[preferences.height]}
            onValueChange={(value) => updatePreferences({ height: value[0] })}
            min={140}
            max={210}
            step={1}
            className="w-full"
          />
          <div className="flex justify-between text-sm text-neutral-500">
            <span>140 cm</span>
            <span>210 cm</span>
          </div>
        </div>
      ),
    },
    {
      title: "Body type?",
      component: (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {BODY_TYPES.map((type) => (
            <button
              key={type.id}
              onClick={() => updatePreferences({ bodyType: type.id })}
              className={`p-6 rounded-xl border-2 transition-all hover:border-black ${
                preferences.bodyType === type.id
                  ? "border-black bg-black text-white"
                  : "border-neutral-200"
              }`}
            >
              <div className="font-medium">{type.label}</div>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "Skin tone?",
      component: (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {SKIN_TONES.map((tone) => (
            <button
              key={tone.id}
              onClick={() => updatePreferences({ skinTone: tone.id })}
              className={`p-6 rounded-xl border-2 transition-all hover:border-black ${
                preferences.skinTone === tone.id
                  ? "border-black"
                  : "border-neutral-200"
              }`}
            >
              <div
                className="w-12 h-12 rounded-full mx-auto mb-2"
                style={{ backgroundColor: tone.color }}
              />
              <div className="font-medium">{tone.label}</div>
            </button>
          ))}
        </div>
      ),
    },
    {
      title: "Style preference?",
      component: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            {STYLES.map((style) => (
              <button
                key={style.id}
                onClick={() => updatePreferences({ style: style.id })}
                className={`p-6 rounded-xl border-2 transition-all hover:border-black ${
                  preferences.style === style.id
                    ? "border-black bg-black text-white"
                    : "border-neutral-200"
                }`}
              >
                <div className="text-4xl mb-2">{style.emoji}</div>
                <div className="font-medium">{style.label}</div>
              </button>
            ))}
          </div>
          <div className="pt-8 border-t">
            <p className="text-sm text-neutral-600 mb-4">Gender preference</p>
            <div className="flex gap-3">
              {GENDERS.map((gender) => (
                <button
                  key={gender.id}
                  onClick={() => updatePreferences({ gender: gender.id })}
                  className={`flex-1 p-4 rounded-lg border-2 transition-all hover:border-black ${
                    preferences.gender === gender.id
                      ? "border-black bg-black text-white"
                      : "border-neutral-200"
                  }`}
                >
                  <div className="text-sm font-medium">{gender.label}</div>
                </button>
              ))}
            </div>
          </div>
        </div>
      ),
    },
  ];

  const currentQuestion = questions[currentStep];

  return (
    <div className="min-h-screen bg-neutral-50 flex items-center justify-center p-4">
      <div className="w-full max-w-3xl">
        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-neutral-600">
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span className="text-sm text-neutral-600">{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Question Card */}
        <Card className="p-8 md:p-12 border-neutral-200 shadow-lg">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
            >
              <h2 className="text-3xl font-semibold mb-2">{currentQuestion.title}</h2>
              {currentQuestion.subtitle && (
                <p className="text-neutral-600 mb-8">{currentQuestion.subtitle}</p>
              )}
              <div className="my-8">{currentQuestion.component}</div>
            </motion.div>
          </AnimatePresence>

          {/* Navigation */}
          <div className="flex justify-between mt-12">
            <Button
              variant="outline"
              onClick={handleBack}
              className="border-neutral-300"
            >
              <ChevronLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              className="bg-black text-white hover:bg-black/90"
            >
              {currentStep === totalSteps - 1 ? "Continue" : "Next"}
              <ChevronRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </Card>
      </div>
    </div>
  );
}

export function QuestionFlow() {
  return (
    <PreferencesProvider>
      <QuestionFlowContent />
    </PreferencesProvider>
  );
}
