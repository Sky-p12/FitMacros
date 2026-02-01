import React, { useMemo, useRef, useState } from 'react';
import { Download, Moon, Sun, Clipboard, Save } from 'lucide-react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

import { Button } from './components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './components/ui/card';
import { Input } from './components/ui/input';
import { Label } from './components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './components/ui/select';
import { Switch } from './components/ui/switch';
import { Progress, ProgressBar } from './components/ui/progress';
import { Badge } from './components/ui/badge';

const STORAGE_KEY = 'fitmacros.mealplanner';
const THEME_KEY = 'fitmacros.theme';
const LANGUAGE_KEY = 'fitmacros.language';

const translations = {
  en: {
    title: 'Bodybuilder Meal Planner',
    subtitle: 'AI-generated nutrition plans tailored to your physique goals.',
    inputs: 'Your inputs',
    generate: 'Generate meal plan',
    weight: 'Weight (kg)',
    height: 'Height (cm)',
    age: 'Age',
    gender: 'Gender',
    activity: 'Activity level',
    goal: 'Fitness goal',
    restrictions: 'Dietary restrictions',
    vegan: 'Vegan',
    vegetarian: 'Vegetarian',
    halal: 'Halal',
    glutenFree: 'Gluten-free',
    light: 'Light',
    dark: 'Dark',
    mealPlan: 'Your meal plan',
    breakfast: 'Breakfast',
    lunch: 'Lunch',
    dinner: 'Dinner',
    snack: 'Snack',
    nutrition: 'Nutrition',
    calories: 'Calories',
    protein: 'Protein',
    carbs: 'Carbs',
    fats: 'Fats',
    dailySummary: 'Daily nutrition summary',
    macroProgress: 'Macro progress',
    groceryList: 'Auto-generated grocery list',
    fitnessTips: 'Goal-specific fitness tips',
    export: 'Export tools',
    copy: 'Copy meal plan',
    save: 'Save to local storage',
    pdf: 'Download PDF',
    tdee: 'Estimated daily calories',
    hydration: 'Hydration target',
    sleep: 'Sleep target',
    steps: 'Steps goal',
    saved: 'Saved!',
    copied: 'Copied!',
    language: 'Language',
    generated: 'Generated just now'
  },
  fr: {
    title: 'Planificateur de repas bodybuilding',
    subtitle: 'Plans nutritionnels générés par IA selon vos objectifs physiques.',
    inputs: 'Vos informations',
    generate: 'Générer le plan',
    weight: 'Poids (kg)',
    height: 'Taille (cm)',
    age: 'Âge',
    gender: 'Genre',
    activity: "Niveau d'activité",
    goal: 'Objectif fitness',
    restrictions: 'Restrictions alimentaires',
    vegan: 'Vegan',
    vegetarian: 'Végétarien',
    halal: 'Halal',
    glutenFree: 'Sans gluten',
    light: 'Clair',
    dark: 'Sombre',
    mealPlan: 'Votre plan de repas',
    breakfast: 'Petit-déjeuner',
    lunch: 'Déjeuner',
    dinner: 'Dîner',
    snack: 'Collation',
    nutrition: 'Nutrition',
    calories: 'Calories',
    protein: 'Protéines',
    carbs: 'Glucides',
    fats: 'Lipides',
    dailySummary: 'Résumé nutritionnel',
    macroProgress: 'Progression des macros',
    groceryList: 'Liste de courses automatique',
    fitnessTips: 'Conseils fitness',
    export: "Outils d'export",
    copy: 'Copier le plan',
    save: 'Enregistrer',
    pdf: 'Télécharger PDF',
    tdee: 'Calories quotidiennes estimées',
    hydration: "Objectif d'hydratation",
    sleep: 'Objectif sommeil',
    steps: 'Objectif de pas',
    saved: 'Enregistré !',
    copied: 'Copié !',
    language: 'Langue',
    generated: "Généré à l'instant"
  },
  ar: {
    title: 'مخطط وجبات كمال الأجسام',
    subtitle: 'خطط غذائية بالذكاء الاصطناعي حسب هدفك الرياضي.',
    inputs: 'بياناتك',
    generate: 'إنشاء الخطة',
    weight: 'الوزن (كجم)',
    height: 'الطول (سم)',
    age: 'العمر',
    gender: 'الجنس',
    activity: 'مستوى النشاط',
    goal: 'الهدف الرياضي',
    restrictions: 'قيود غذائية',
    vegan: 'نباتي',
    vegetarian: 'نباتي مع منتجات',
    halal: 'حلال',
    glutenFree: 'خالٍ من الغلوتين',
    light: 'فاتح',
    dark: 'داكن',
    mealPlan: 'خطة الوجبات',
    breakfast: 'إفطار',
    lunch: 'غداء',
    dinner: 'عشاء',
    snack: 'سناك',
    nutrition: 'القيم الغذائية',
    calories: 'السعرات',
    protein: 'بروتين',
    carbs: 'كربوهيدرات',
    fats: 'دهون',
    dailySummary: 'ملخص يومي',
    macroProgress: 'تقدم الماكروز',
    groceryList: 'قائمة مشتريات',
    fitnessTips: 'نصائح لياقة',
    export: 'التصدير',
    copy: 'نسخ الخطة',
    save: 'حفظ',
    pdf: 'تنزيل PDF',
    tdee: 'السعرات اليومية المقدرة',
    hydration: 'هدف الترطيب',
    sleep: 'هدف النوم',
    steps: 'هدف الخطوات',
    saved: 'تم الحفظ!',
    copied: 'تم النسخ!',
    language: 'اللغة',
    generated: 'تم الإنشاء الآن'
  }
} as const;

const activityMultipliers = {
  sedentary: 1.2,
  light: 1.375,
  moderate: 1.55,
  active: 1.725,
  athlete: 1.9
};

const mealTemplates = [
  {
    category: 'breakfast',
    name: 'Protein oat bowl',
    ingredients: ['Rolled oats', 'Whey protein', 'Blueberries', 'Almond butter', 'Almond milk'],
    macros: { calories: 520, protein: 38, carbs: 60, fats: 14 },
    tags: ['vegetarian', 'glutenFree']
  },
  {
    category: 'breakfast',
    name: 'Mediterranean egg scramble',
    ingredients: ['Eggs', 'Spinach', 'Feta', 'Cherry tomatoes', 'Olive oil'],
    macros: { calories: 480, protein: 34, carbs: 20, fats: 26 },
    tags: ['halal', 'vegetarian', 'glutenFree']
  },
  {
    category: 'breakfast',
    name: 'Vegan chia power bowl',
    ingredients: ['Chia seeds', 'Soy yogurt', 'Banana', 'Pumpkin seeds', 'Maple syrup'],
    macros: { calories: 450, protein: 20, carbs: 50, fats: 20 },
    tags: ['vegan', 'vegetarian', 'glutenFree', 'halal']
  },
  {
    category: 'lunch',
    name: 'Grilled chicken quinoa salad',
    ingredients: ['Chicken breast', 'Quinoa', 'Cucumber', 'Mixed greens', 'Lemon vinaigrette'],
    macros: { calories: 620, protein: 52, carbs: 45, fats: 20 },
    tags: ['halal', 'glutenFree']
  },
  {
    category: 'lunch',
    name: 'Tofu teriyaki power bowl',
    ingredients: ['Tofu', 'Brown rice', 'Broccoli', 'Teriyaki sauce', 'Sesame oil'],
    macros: { calories: 600, protein: 32, carbs: 70, fats: 18 },
    tags: ['vegan', 'vegetarian']
  },
  {
    category: 'lunch',
    name: 'Mediterranean lentil wrap',
    ingredients: ['Lentils', 'Gluten-free wrap', 'Hummus', 'Roasted peppers', 'Arugula'],
    macros: { calories: 570, protein: 28, carbs: 75, fats: 16 },
    tags: ['vegan', 'vegetarian', 'glutenFree', 'halal']
  },
  {
    category: 'dinner',
    name: 'Salmon recovery plate',
    ingredients: ['Salmon', 'Sweet potato', 'Asparagus', 'Greek yogurt sauce'],
    macros: { calories: 720, protein: 50, carbs: 55, fats: 28 },
    tags: ['glutenFree', 'halal']
  },
  {
    category: 'dinner',
    name: 'Lean beef stir-fry',
    ingredients: ['Lean beef', 'Brown rice noodles', 'Bell peppers', 'Ginger', 'Sesame oil'],
    macros: { calories: 740, protein: 55, carbs: 60, fats: 24 },
    tags: ['halal']
  },
  {
    category: 'dinner',
    name: 'Vegan chickpea curry',
    ingredients: ['Chickpeas', 'Coconut milk', 'Basmati rice', 'Spinach', 'Curry spices'],
    macros: { calories: 680, protein: 28, carbs: 90, fats: 22 },
    tags: ['vegan', 'vegetarian', 'glutenFree', 'halal']
  },
  {
    category: 'snack',
    name: 'Greek yogurt parfait',
    ingredients: ['Greek yogurt', 'Granola', 'Honey', 'Berries'],
    macros: { calories: 320, protein: 24, carbs: 38, fats: 8 },
    tags: ['vegetarian']
  },
  {
    category: 'snack',
    name: 'Nutty energy bites',
    ingredients: ['Dates', 'Peanut butter', 'Oats', 'Cocoa powder'],
    macros: { calories: 280, protein: 10, carbs: 35, fats: 12 },
    tags: ['vegan', 'vegetarian', 'halal']
  },
  {
    category: 'snack',
    name: 'Cottage cheese crunch',
    ingredients: ['Cottage cheese', 'Pineapple', 'Almonds'],
    macros: { calories: 300, protein: 26, carbs: 22, fats: 10 },
    tags: ['vegetarian', 'glutenFree', 'halal']
  }
];

const initialForm = {
  weight: 80,
  height: 180,
  age: 28,
  gender: 'male',
  activity: 'moderate',
  goal: 'maintain',
  restrictions: {
    vegan: false,
    vegetarian: false,
    halal: false,
    glutenFree: false
  }
};

type FormState = typeof initialForm;

type Meal = {
  name: string;
  ingredients: string[];
  macros: { calories: number; protein: number; carbs: number; fats: number };
  category: string;
};

type Plan = {
  meals: Meal[];
  totals: { calories: number; protein: number; carbs: number; fats: number };
  targets: { calories: number; protein: number; carbs: number; fats: number };
  groceryList: string[];
  tips: string[];
  hydrationLiters: number;
  stepsGoal: number;
  sleepRange: string;
  generatedAt: string;
};

const goalTips: Record<string, string[]> = {
  bulk: [
    'Aim for progressive overload and track weekly strength increases.',
    'Prioritize calorie surplus with clean carb sources around training.',
    'Add 2-3 strength sessions focused on compound lifts.'
  ],
  cut: [
    'Keep protein high to preserve lean mass during the deficit.',
    'Add low-intensity cardio 2-3 times weekly for extra burn.',
    'Stay consistent with sleep to maintain recovery and hormones.'
  ],
  maintain: [
    'Balance strength and conditioning to stay lean year-round.',
    'Use weekly averages to keep calories steady.',
    'Mix hypertrophy and functional training for overall fitness.'
  ]
};

const languageOptions = [
  { value: 'en', label: 'English' },
  { value: 'fr', label: 'Français' },
  { value: 'ar', label: 'العربية' }
];

const formatNumber = (value: number) => Math.round(value);

const calculatePlan = (form: FormState): Plan => {
  const { weight, height, age, gender, activity, goal, restrictions } = form;
  const bmr =
    gender === 'male'
      ? 10 * weight + 6.25 * height - 5 * age + 5
      : 10 * weight + 6.25 * height - 5 * age - 161;
  const baseCalories = bmr * activityMultipliers[activity as keyof typeof activityMultipliers];
  const goalOffset = goal === 'bulk' ? 300 : goal === 'cut' ? -300 : 0;
  const calories = Math.max(baseCalories + goalOffset, 1600);
  const protein = Math.max(weight * (goal === 'bulk' ? 2.2 : goal === 'cut' ? 1.8 : 2), 110);
  const fats = Math.max(weight * 0.8, 45);
  const remainingCalories = Math.max(calories - protein * 4 - fats * 9, 200);
  const carbs = remainingCalories / 4;

  const targets = {
    calories: Math.round(calories),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fats: Math.round(fats)
  };

  const restrictionTags = Object.entries(restrictions)
    .filter(([, value]) => value)
    .map(([key]) => key);

  const matchesRestrictions = (meal: (typeof mealTemplates)[number]) =>
    restrictionTags.every((tag) => meal.tags.includes(tag));

  const pickMeal = (category: string) => {
    const options = mealTemplates.filter(
      (meal) => meal.category === category && (restrictionTags.length === 0 || matchesRestrictions(meal))
    );
    const fallback = mealTemplates.filter((meal) => meal.category === category);
    const pool = options.length ? options : fallback;
    return pool[Math.floor(Math.random() * pool.length)];
  };

  const mealTargets = [
    { label: 'breakfast', share: 0.25 },
    { label: 'lunch', share: 0.3 },
    { label: 'dinner', share: 0.3 },
    { label: 'snack', share: 0.075 },
    { label: 'snack', share: 0.075 }
  ];

  const meals: Meal[] = mealTargets.map((target) => {
    const template = pickMeal(target.label);
    const scale = (targets.calories * target.share) / template.macros.calories;
    return {
      category: target.label,
      name: template.name,
      ingredients: template.ingredients,
      macros: {
        calories: Math.round(template.macros.calories * scale),
        protein: Math.round(template.macros.protein * scale),
        carbs: Math.round(template.macros.carbs * scale),
        fats: Math.round(template.macros.fats * scale)
      }
    };
  });

  const totals = meals.reduce(
    (acc, meal) => {
      acc.calories += meal.macros.calories;
      acc.protein += meal.macros.protein;
      acc.carbs += meal.macros.carbs;
      acc.fats += meal.macros.fats;
      return acc;
    },
    { calories: 0, protein: 0, carbs: 0, fats: 0 }
  );

  const ingredientCounts = meals.flatMap((meal) => meal.ingredients).reduce<Record<string, number>>(
    (acc, ingredient) => {
      acc[ingredient] = (acc[ingredient] ?? 0) + 1;
      return acc;
    },
    {}
  );

  const groceryList = Object.entries(ingredientCounts).map(
    ([ingredient, count]) => `${count}x ${ingredient}`
  );

  const hydrationLiters = (weight * 35) / 1000;

  return {
    meals,
    totals: {
      calories: Math.round(totals.calories),
      protein: Math.round(totals.protein),
      carbs: Math.round(totals.carbs),
      fats: Math.round(totals.fats)
    },
    targets,
    groceryList,
    tips: goalTips[goal],
    hydrationLiters: Math.round(hydrationLiters * 10) / 10,
    stepsGoal: goal === 'cut' ? 11000 : goal === 'bulk' ? 9000 : 10000,
    sleepRange: '7-9 hours',
    generatedAt: new Date().toLocaleString()
  };
};

const App = () => {
  const storedState = useMemo(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored) as { form: FormState; plan?: Plan };
      } catch {
        return null;
      }
    }
    return null;
  }, []);

  const [form, setForm] = useState<FormState>(() => {
    if (storedState?.form) {
      return { ...initialForm, ...storedState.form };
    }
    return initialForm;
  });

  const [language, setLanguage] = useState<'en' | 'fr' | 'ar'>(() => {
    const stored = localStorage.getItem(LANGUAGE_KEY) as 'en' | 'fr' | 'ar' | null;
    return stored ?? 'en';
  });

  const [plan, setPlan] = useState<Plan>(() => storedState?.plan ?? calculatePlan(form));
  const [message, setMessage] = useState<string | null>(null);
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    const stored = localStorage.getItem(THEME_KEY) as 'light' | 'dark' | null;
    return stored ?? 'light';
  });

  const contentRef = useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark');
    localStorage.setItem(THEME_KEY, theme);
  }, [theme]);

  React.useEffect(() => {
    localStorage.setItem(LANGUAGE_KEY, language);
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const t = useMemo(() => translations[language], [language]);

  const handleGenerate = () => {
    const newPlan = calculatePlan(form);
    setPlan(newPlan);
  };

  const handleSave = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ form, plan }));
    setMessage(t.saved);
    setTimeout(() => setMessage(null), 2000);
  };

  const handleCopy = async () => {
    const mealText = plan.meals
      .map(
        (meal) =>
          `${meal.category.toUpperCase()}: ${meal.name}\n` +
          `Calories: ${meal.macros.calories} | P ${meal.macros.protein}g C ${meal.macros.carbs}g F ${meal.macros.fats}g\n` +
          `Ingredients: ${meal.ingredients.join(', ')}`
      )
      .join('\n\n');

    await navigator.clipboard.writeText(
      `${t.title}\n${mealText}\n\n${t.dailySummary}: ${plan.totals.calories} kcal`
    );
    setMessage(t.copied);
    setTimeout(() => setMessage(null), 2000);
  };

  const handleDownload = async () => {
    if (!contentRef.current) return;
    const canvas = await html2canvas(contentRef.current, { scale: 2, useCORS: true });
    const imgData = canvas.toDataURL('image/png');
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgProps = pdf.getImageProperties(imgData);
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = pdf.internal.pageSize.getHeight();
    const imgHeight = (imgProps.height * pdfWidth) / imgProps.width;
    let heightLeft = imgHeight;
    let position = 0;

    pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
    heightLeft -= pdfHeight;

    while (heightLeft > 0) {
      position = heightLeft - imgHeight;
      pdf.addPage();
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;
    }

    pdf.save('bodybuilder-meal-plan.pdf');
  };

  const macroProgress = [
    { label: t.protein, value: plan.totals.protein, target: plan.targets.protein },
    { label: t.carbs, value: plan.totals.carbs, target: plan.targets.carbs },
    { label: t.fats, value: plan.totals.fats, target: plan.targets.fats }
  ];

  const mealLabels = {
    breakfast: t.breakfast,
    lunch: t.lunch,
    dinner: t.dinner,
    snack: t.snack
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-16 dark:bg-slate-950">
      <header className="sticky top-0 z-10 border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-slate-950/90">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-4 px-4 py-4">
          <div>
            <p className="text-sm font-semibold text-brand">{t.title}</p>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{t.subtitle}</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Select value={language} onValueChange={(value) => setLanguage(value as 'en' | 'fr' | 'ar')}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder={t.language} />
              </SelectTrigger>
              <SelectContent>
                {languageOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 rounded-full border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200">
              {theme === 'dark' ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
              <span>{theme === 'dark' ? t.dark : t.light}</span>
              <Switch checked={theme === 'dark'} onCheckedChange={() => setTheme(theme === 'dark' ? 'light' : 'dark')} />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto mt-8 flex max-w-6xl flex-col gap-6 px-4">
        <div className="grid gap-6 lg:grid-cols-[1.1fr_1.4fr]">
          <Card>
            <CardHeader>
              <CardTitle>{t.inputs}</CardTitle>
              <CardDescription>{t.generated}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-5">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="weight">{t.weight}</Label>
                  <Input
                    id="weight"
                    type="number"
                    min={40}
                    max={200}
                    value={form.weight}
                    onChange={(event) => setForm({ ...form, weight: Number(event.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="height">{t.height}</Label>
                  <Input
                    id="height"
                    type="number"
                    min={140}
                    max={220}
                    value={form.height}
                    onChange={(event) => setForm({ ...form, height: Number(event.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="age">{t.age}</Label>
                  <Input
                    id="age"
                    type="number"
                    min={16}
                    max={80}
                    value={form.age}
                    onChange={(event) => setForm({ ...form, age: Number(event.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>{t.gender}</Label>
                  <Select value={form.gender} onValueChange={(value) => setForm({ ...form, gender: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.gender} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Male</SelectItem>
                      <SelectItem value="female">Female</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t.activity}</Label>
                  <Select value={form.activity} onValueChange={(value) => setForm({ ...form, activity: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.activity} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sedentary">Sedentary</SelectItem>
                      <SelectItem value="light">Light</SelectItem>
                      <SelectItem value="moderate">Moderate</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="athlete">Athlete</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>{t.goal}</Label>
                  <Select value={form.goal} onValueChange={(value) => setForm({ ...form, goal: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder={t.goal} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bulk">Bulk</SelectItem>
                      <SelectItem value="cut">Cut</SelectItem>
                      <SelectItem value="maintain">Maintain</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-3">
                <Label>{t.restrictions}</Label>
                <div className="grid gap-3 md:grid-cols-2">
                  {Object.entries(form.restrictions).map(([key, value]) => (
                    <label
                      key={key}
                      className="flex items-center justify-between rounded-lg border border-slate-200 px-3 py-2 text-sm dark:border-slate-800"
                    >
                      <span>{t[key as keyof typeof t]}</span>
                      <Switch
                        checked={value}
                        onCheckedChange={(checked) =>
                          setForm({
                            ...form,
                            restrictions: { ...form.restrictions, [key]: checked }
                          })
                        }
                      />
                    </label>
                  ))}
                </div>
              </div>

              <Button className="w-full" onClick={handleGenerate}>
                {t.generate}
              </Button>
              {message && <p className="text-center text-sm font-medium text-brand">{message}</p>}
            </CardContent>
          </Card>

          <div className="space-y-6" ref={contentRef}>
            <Card>
              <CardHeader>
                <CardTitle>{t.dailySummary}</CardTitle>
                <CardDescription>{t.tdee}: {plan.targets.calories} kcal</CardDescription>
              </CardHeader>
              <CardContent className="space-y-5">
                <div className="grid gap-4 md:grid-cols-3">
                  <div className="rounded-lg bg-brand/10 p-4">
                    <p className="text-xs uppercase text-slate-500 dark:text-slate-400">{t.hydration}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{plan.hydrationLiters}L</p>
                  </div>
                  <div className="rounded-lg bg-slate-100 p-4 dark:bg-slate-900">
                    <p className="text-xs uppercase text-slate-500 dark:text-slate-400">{t.steps}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{plan.stepsGoal.toLocaleString()}</p>
                  </div>
                  <div className="rounded-lg bg-slate-100 p-4 dark:bg-slate-900">
                    <p className="text-xs uppercase text-slate-500 dark:text-slate-400">{t.sleep}</p>
                    <p className="mt-2 text-2xl font-semibold text-slate-900 dark:text-white">{plan.sleepRange}</p>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm font-medium">
                    <span>{t.macroProgress}</span>
                    <span className="text-slate-500 dark:text-slate-400">{plan.totals.calories} kcal</span>
                  </div>
                  {macroProgress.map((macro) => (
                    <div key={macro.label} className="space-y-2">
                      <div className="flex items-center justify-between text-xs font-medium text-slate-500 dark:text-slate-400">
                        <span>{macro.label}</span>
                        <span>
                          {formatNumber(macro.value)} / {formatNumber(macro.target)}g
                        </span>
                      </div>
                      <Progress>
                        <ProgressBar style={{ width: `${Math.min((macro.value / macro.target) * 100, 100)}%` }} />
                      </Progress>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>{t.export}</CardTitle>
                <CardDescription>{plan.generatedAt}</CardDescription>
              </CardHeader>
              <CardContent className="grid gap-3 md:grid-cols-3">
                <Button variant="secondary" onClick={handleCopy}>
                  <Clipboard className="h-4 w-4" />
                  {t.copy}
                </Button>
                <Button variant="secondary" onClick={handleSave}>
                  <Save className="h-4 w-4" />
                  {t.save}
                </Button>
                <Button onClick={handleDownload}>
                  <Download className="h-4 w-4" />
                  {t.pdf}
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t.mealPlan}</CardTitle>
            <CardDescription>{t.subtitle}</CardDescription>
          </CardHeader>
          <CardContent className="grid gap-4 md:grid-cols-2">
            {plan.meals.map((meal, index) => (
              <Card key={`${meal.name}-${index}`} className="border-brand/20">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle>{mealLabels[meal.category as keyof typeof mealLabels]}</CardTitle>
                    <Badge>{meal.macros.calories} kcal</Badge>
                  </div>
                  <CardDescription>{meal.name}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-xs text-slate-500 dark:text-slate-400">
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{meal.macros.protein}g</p>
                      <p>{t.protein}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{meal.macros.carbs}g</p>
                      <p>{t.carbs}</p>
                    </div>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">{meal.macros.fats}g</p>
                      <p>{t.fats}</p>
                    </div>
                  </div>
                  <div className="text-sm text-slate-600 dark:text-slate-300">
                    <span className="font-medium text-slate-900 dark:text-white">Ingredients: </span>
                    {meal.ingredients.join(', ')}
                  </div>
                </CardContent>
              </Card>
            ))}
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
          <Card>
            <CardHeader>
              <CardTitle>{t.groceryList}</CardTitle>
              <CardDescription>Auto-matched to your plan.</CardDescription>
            </CardHeader>
            <CardContent className="grid gap-2 md:grid-cols-2">
              {plan.groceryList.map((item) => (
                <div
                  key={item}
                  className="rounded-lg border border-slate-200 bg-slate-50 px-3 py-2 text-sm text-slate-700 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
                >
                  {item}
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>{t.fitnessTips}</CardTitle>
              <CardDescription>Coach-mode highlights for your goal.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {plan.tips.map((tip) => (
                <div key={tip} className="rounded-lg border border-brand/20 bg-brand/10 p-3 text-sm text-slate-800 dark:text-slate-100">
                  {tip}
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default App;
