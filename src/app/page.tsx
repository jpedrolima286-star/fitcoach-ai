'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Checkbox } from '@/components/ui/checkbox'
import { Dumbbell, Apple, Pill, TrendingUp, User, LogOut, Activity, Calendar, MessageSquare, Users } from 'lucide-react'

type UserProfile = {
  name: string
  age: number
  weight: number
  height: number
  gender: 'male' | 'female' | 'other'
  experience: 'beginner' | 'intermediate' | 'advanced'
  goal: 'lose_weight' | 'gain_muscle' | 'maintain' | 'endurance'
  restrictions: string[]
  frequency: number
  equipment: string[]
  bmi?: number
  calories?: number
}

type WorkoutPlan = {
  day: string
  exercises: {
    name: string
    sets: number
    reps: string
    rest: string
    videoUrl?: string
  }[]
}

type MealPlan = {
  meal: string
  time: string
  foods: string[]
  macros: { protein: number; carbs: number; fats: number; calories: number }
}

export default function FitCoachAI() {
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [userProfile, setUserProfile] = useState<Partial<UserProfile>>({})
  const [activeTab, setActiveTab] = useState('dashboard')
  const [workoutPlan, setWorkoutPlan] = useState<WorkoutPlan[]>([])
  const [mealPlan, setMealPlan] = useState<MealPlan[]>([])

  // Login Screen
  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-md p-8 bg-white/90 backdrop-blur-sm shadow-2xl">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-green-500 rounded-full mb-4">
              <Dumbbell className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              FitCoach AI
            </h1>
            <p className="text-gray-600 mt-2">Seu personal trainer digital</p>
          </div>

          <div className="space-y-4">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" placeholder="seu@email.com" className="mt-1" />
            </div>
            <div>
              <Label htmlFor="password">Senha</Label>
              <Input id="password" type="password" placeholder="••••••••" className="mt-1" />
            </div>
            <Button 
              onClick={() => setIsLoggedIn(true)} 
              className="w-full bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
            >
              Entrar
            </Button>
            <Button 
              variant="outline" 
              className="w-full"
              onClick={() => setIsLoggedIn(true)}
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continuar com Google
            </Button>
          </div>

          <p className="text-xs text-center text-gray-500 mt-6">
            Ao continuar, você concorda com nossos Termos de Uso
          </p>
        </Card>
      </div>
    )
  }

  // Onboarding Flow
  if (currentStep < 5) {
    const calculateBMI = () => {
      if (userProfile.weight && userProfile.height) {
        const heightInMeters = userProfile.height / 100
        return Number((userProfile.weight / (heightInMeters * heightInMeters)).toFixed(1))
      }
      return 0
    }

    const calculateCalories = () => {
      if (!userProfile.weight || !userProfile.height || !userProfile.age || !userProfile.gender) return 0
      
      // Fórmula de Harris-Benedict
      let bmr = 0
      if (userProfile.gender === 'male') {
        bmr = 88.362 + (13.397 * userProfile.weight) + (4.799 * userProfile.height) - (5.677 * userProfile.age)
      } else {
        bmr = 447.593 + (9.247 * userProfile.weight) + (3.098 * userProfile.height) - (4.330 * userProfile.age)
      }

      // Multiplicador de atividade
      const activityMultiplier = userProfile.frequency ? 1.2 + (userProfile.frequency * 0.1) : 1.2

      // Ajuste por objetivo
      let calories = bmr * activityMultiplier
      if (userProfile.goal === 'lose_weight') calories -= 500
      if (userProfile.goal === 'gain_muscle') calories += 500

      return Math.round(calories)
    }

    const handleNext = () => {
      if (currentStep === 4) {
        const bmi = calculateBMI()
        const calories = calculateCalories()
        setUserProfile({ ...userProfile, bmi, calories })
        generateWorkoutPlan()
        generateMealPlan()
      }
      setCurrentStep(currentStep + 1)
    }

    const generateWorkoutPlan = () => {
      const goal = userProfile.goal || 'maintain'
      const experience = userProfile.experience || 'beginner'
      
      let plans: WorkoutPlan[] = []

      if (goal === 'lose_weight') {
        plans = [
          {
            day: 'Segunda-feira',
            exercises: [
              { name: 'Corrida na esteira', sets: 1, reps: '30 min', rest: '-', videoUrl: 'https://www.youtube.com/embed/vnvetRDdt4' },
              { name: 'Burpees', sets: 3, reps: '15', rest: '60s' },
              { name: 'Mountain climbers', sets: 3, reps: '20', rest: '45s' },
              { name: 'Jump squats', sets: 3, reps: '15', rest: '60s' }
            ]
          },
          {
            day: 'Quarta-feira',
            exercises: [
              { name: 'HIIT Bike', sets: 1, reps: '25 min', rest: '-' },
              { name: 'Prancha', sets: 3, reps: '45s', rest: '30s' },
              { name: 'Jumping jacks', sets: 3, reps: '30', rest: '45s' }
            ]
          },
          {
            day: 'Sexta-feira',
            exercises: [
              { name: 'Circuito funcional', sets: 4, reps: '12', rest: '90s' },
              { name: 'Box jumps', sets: 3, reps: '12', rest: '60s' },
              { name: 'Battle ropes', sets: 3, reps: '30s', rest: '45s' }
            ]
          }
        ]
      } else if (goal === 'gain_muscle') {
        plans = [
          {
            day: 'Segunda-feira - Peito/Tríceps',
            exercises: [
              { name: 'Supino reto', sets: 4, reps: '8-12', rest: '90s', videoUrl: 'https://www.youtube.com/embed/rT7DgCr-3pg' },
              { name: 'Supino inclinado', sets: 4, reps: '8-12', rest: '90s' },
              { name: 'Crucifixo', sets: 3, reps: '12-15', rest: '60s' },
              { name: 'Tríceps testa', sets: 3, reps: '10-12', rest: '60s' },
              { name: 'Tríceps corda', sets: 3, reps: '12-15', rest: '60s' }
            ]
          },
          {
            day: 'Quarta-feira - Costas/Bíceps',
            exercises: [
              { name: 'Barra fixa', sets: 4, reps: '8-12', rest: '90s' },
              { name: 'Remada curvada', sets: 4, reps: '8-12', rest: '90s' },
              { name: 'Pulldown', sets: 3, reps: '12-15', rest: '60s' },
              { name: 'Rosca direta', sets: 3, reps: '10-12', rest: '60s' },
              { name: 'Rosca martelo', sets: 3, reps: '12-15', rest: '60s' }
            ]
          },
          {
            day: 'Sexta-feira - Pernas/Ombros',
            exercises: [
              { name: 'Agachamento', sets: 4, reps: '8-12', rest: '120s' },
              { name: 'Leg press', sets: 4, reps: '10-15', rest: '90s' },
              { name: 'Stiff', sets: 3, reps: '12-15', rest: '60s' },
              { name: 'Desenvolvimento', sets: 4, reps: '8-12', rest: '90s' },
              { name: 'Elevação lateral', sets: 3, reps: '12-15', rest: '60s' }
            ]
          }
        ]
      } else {
        plans = [
          {
            day: 'Segunda-feira - Full Body',
            exercises: [
              { name: 'Agachamento', sets: 3, reps: '12', rest: '60s' },
              { name: 'Flexão', sets: 3, reps: '15', rest: '60s' },
              { name: 'Remada', sets: 3, reps: '12', rest: '60s' },
              { name: 'Prancha', sets: 3, reps: '45s', rest: '30s' }
            ]
          },
          {
            day: 'Quinta-feira - Cardio + Core',
            exercises: [
              { name: 'Corrida moderada', sets: 1, reps: '25 min', rest: '-' },
              { name: 'Abdominal', sets: 3, reps: '20', rest: '45s' },
              { name: 'Russian twist', sets: 3, reps: '30', rest: '45s' }
            ]
          }
        ]
      }

      setWorkoutPlan(plans)
    }

    const generateMealPlan = () => {
      const goal = userProfile.goal || 'maintain'
      const calories = calculateCalories()
      
      let meals: MealPlan[] = []

      if (goal === 'lose_weight') {
        meals = [
          {
            meal: 'Café da manhã',
            time: '07:00',
            foods: ['2 ovos mexidos', 'Pão integral (2 fatias)', 'Café sem açúcar', 'Mamão'],
            macros: { protein: 20, carbs: 30, fats: 10, calories: 280 }
          },
          {
            meal: 'Lanche da manhã',
            time: '10:00',
            foods: ['Iogurte grego natural', '1 colher de aveia', 'Frutas vermelhas'],
            macros: { protein: 15, carbs: 20, fats: 5, calories: 180 }
          },
          {
            meal: 'Almoço',
            time: '12:30',
            foods: ['Peito de frango grelhado (150g)', 'Arroz integral (3 col)', 'Brócolis', 'Salada verde'],
            macros: { protein: 40, carbs: 45, fats: 8, calories: 400 }
          },
          {
            meal: 'Lanche da tarde',
            time: '16:00',
            foods: ['Whey protein', 'Banana', 'Pasta de amendoim (1 col)'],
            macros: { protein: 30, carbs: 25, fats: 8, calories: 280 }
          },
          {
            meal: 'Jantar',
            time: '19:30',
            foods: ['Salmão grelhado (120g)', 'Batata doce (100g)', 'Aspargos', 'Salada'],
            macros: { protein: 35, carbs: 30, fats: 12, calories: 360 }
          }
        ]
      } else if (goal === 'gain_muscle') {
        meals = [
          {
            meal: 'Café da manhã',
            time: '07:00',
            foods: ['4 ovos inteiros', 'Aveia (50g)', 'Banana', 'Pasta de amendoim'],
            macros: { protein: 30, carbs: 50, fats: 20, calories: 480 }
          },
          {
            meal: 'Lanche da manhã',
            time: '10:00',
            foods: ['Whey protein', 'Batata doce (150g)', 'Castanhas'],
            macros: { protein: 30, carbs: 40, fats: 12, calories: 380 }
          },
          {
            meal: 'Almoço',
            time: '13:00',
            foods: ['Carne vermelha magra (200g)', 'Arroz branco (5 col)', 'Feijão', 'Legumes'],
            macros: { protein: 50, carbs: 70, fats: 15, calories: 600 }
          },
          {
            meal: 'Pré-treino',
            time: '16:00',
            foods: ['Pão integral', 'Peito de peru', 'Banana', 'Café'],
            macros: { protein: 25, carbs: 45, fats: 5, calories: 320 }
          },
          {
            meal: 'Pós-treino',
            time: '18:30',
            foods: ['Whey protein', 'Dextrose', 'Creatina'],
            macros: { protein: 30, carbs: 50, fats: 2, calories: 330 }
          },
          {
            meal: 'Jantar',
            time: '20:30',
            foods: ['Frango (200g)', 'Arroz integral', 'Brócolis', 'Azeite'],
            macros: { protein: 45, carbs: 50, fats: 15, calories: 500 }
          }
        ]
      } else {
        meals = [
          {
            meal: 'Café da manhã',
            time: '07:30',
            foods: ['Omelete (2 ovos)', 'Pão integral', 'Frutas', 'Café'],
            macros: { protein: 20, carbs: 35, fats: 12, calories: 320 }
          },
          {
            meal: 'Almoço',
            time: '12:30',
            foods: ['Proteína magra (150g)', 'Arroz/Macarrão', 'Legumes', 'Salada'],
            macros: { protein: 35, carbs: 50, fats: 10, calories: 420 }
          },
          {
            meal: 'Lanche',
            time: '16:00',
            foods: ['Iogurte', 'Granola', 'Frutas'],
            macros: { protein: 15, carbs: 30, fats: 8, calories: 240 }
          },
          {
            meal: 'Jantar',
            time: '19:30',
            foods: ['Peixe/Frango (150g)', 'Legumes', 'Salada', 'Azeite'],
            macros: { protein: 35, carbs: 25, fats: 12, calories: 340 }
          }
        ]
      }

      setMealPlan(meals)
    }

    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl p-8 bg-white/90 backdrop-blur-sm shadow-2xl">
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-800">Configure seu perfil</h2>
              <span className="text-sm text-gray-500">Passo {currentStep + 1} de 5</span>
            </div>
            <Progress value={(currentStep + 1) * 20} className="h-2" />
          </div>

          {currentStep === 0 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">Informações básicas</h3>
              <div>
                <Label htmlFor="name">Nome completo</Label>
                <Input 
                  id="name" 
                  value={userProfile.name ?? ''} 
                  onChange={(e) => setUserProfile({...userProfile, name: e.target.value})}
                  placeholder="Seu nome"
                  className="mt-1"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="age">Idade</Label>
                  <Input 
                    id="age" 
                    type="number" 
                    value={userProfile.age ?? ''} 
                    onChange={(e) => setUserProfile({...userProfile, age: Number(e.target.value)})}
                    placeholder="25"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="gender">Gênero</Label>
                  <Select onValueChange={(value: any) => setUserProfile({...userProfile, gender: value})}>
                    <SelectTrigger className="mt-1">
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="male">Masculino</SelectItem>
                      <SelectItem value="female">Feminino</SelectItem>
                      <SelectItem value="other">Outro</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="weight">Peso (kg)</Label>
                  <Input 
                    id="weight" 
                    type="number" 
                    value={userProfile.weight ?? ''} 
                    onChange={(e) => setUserProfile({...userProfile, weight: Number(e.target.value)})}
                    placeholder="70"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label htmlFor="height">Altura (cm)</Label>
                  <Input 
                    id="height" 
                    type="number" 
                    value={userProfile.height ?? ''} 
                    onChange={(e) => setUserProfile({...userProfile, height: Number(e.target.value)})}
                    placeholder="175"
                    className="mt-1"
                  />
                </div>
              </div>
            </div>
          )}

          {currentStep === 1 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">Experiência e objetivo</h3>
              <div>
                <Label>Nível de experiência</Label>
                <Select onValueChange={(value: any) => setUserProfile({...userProfile, experience: value})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione seu nível" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="beginner">Iniciante (0-6 meses)</SelectItem>
                    <SelectItem value="intermediate">Intermediário (6-24 meses)</SelectItem>
                    <SelectItem value="advanced">Avançado (2+ anos)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Objetivo principal</Label>
                <Select onValueChange={(value: any) => setUserProfile({...userProfile, goal: value})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Selecione seu objetivo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lose_weight">Emagrecer / Perder gordura</SelectItem>
                    <SelectItem value="gain_muscle">Ganhar massa muscular</SelectItem>
                    <SelectItem value="maintain">Manter forma / Saúde</SelectItem>
                    <SelectItem value="endurance">Melhorar resistência</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Frequência semanal de treinos</Label>
                <Select onValueChange={(value) => setUserProfile({...userProfile, frequency: Number(value)})}>
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Quantos dias por semana?" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="2">2 dias por semana</SelectItem>
                    <SelectItem value="3">3 dias por semana</SelectItem>
                    <SelectItem value="4">4 dias por semana</SelectItem>
                    <SelectItem value="5">5 dias por semana</SelectItem>
                    <SelectItem value="6">6 dias por semana</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">Restrições e limitações</h3>
              <div>
                <Label className="mb-3 block">Você tem alguma lesão ou limitação física?</Label>
                <div className="space-y-2">
                  {['Joelho', 'Ombro', 'Coluna', 'Tornozelo', 'Punho', 'Nenhuma'].map((item) => (
                    <div key={item} className="flex items-center space-x-2">
                      <Checkbox 
                        id={item}
                        onCheckedChange={(checked) => {
                          const current = userProfile.restrictions || []
                          if (checked) {
                            setUserProfile({...userProfile, restrictions: [...current, item]})
                          } else {
                            setUserProfile({...userProfile, restrictions: current.filter(r => r !== item)})
                          }
                        }}
                      />
                      <label htmlFor={item} className="text-sm cursor-pointer">{item}</label>
                    </div>
                  ))}
                </div>
              </div>
              <div>
                <Label className="mb-3 block">Restrições alimentares</Label>
                <div className="space-y-2">
                  {['Vegetariano', 'Vegano', 'Sem lactose', 'Sem glúten', 'Nenhuma'].map((item) => (
                    <div key={item} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`diet-${item}`}
                        onCheckedChange={(checked) => {
                          const current = userProfile.restrictions || []
                          if (checked) {
                            setUserProfile({...userProfile, restrictions: [...current, item]})
                          } else {
                            setUserProfile({...userProfile, restrictions: current.filter(r => r !== item)})
                          }
                        }}
                      />
                      <label htmlFor={`diet-${item}`} className="text-sm cursor-pointer">{item}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-4">
              <h3 className="text-xl font-semibold mb-4">Equipamentos disponíveis</h3>
              <div>
                <Label className="mb-3 block">Marque os equipamentos que você tem acesso:</Label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    'Halteres',
                    'Barras',
                    'Máquinas',
                    'Elásticos',
                    'Kettlebell',
                    'TRX',
                    'Esteira',
                    'Bike',
                    'Piscina',
                    'Apenas peso corporal'
                  ].map((item) => (
                    <div key={item} className="flex items-center space-x-2">
                      <Checkbox 
                        id={`equip-${item}`}
                        onCheckedChange={(checked) => {
                          const current = userProfile.equipment || []
                          if (checked) {
                            setUserProfile({...userProfile, equipment: [...current, item]})
                          } else {
                            setUserProfile({...userProfile, equipment: current.filter(e => e !== item)})
                          }
                        }}
                      />
                      <label htmlFor={`equip-${item}`} className="text-sm cursor-pointer">{item}</label>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h3 className="text-xl font-semibold mb-4">Resumo do seu perfil</h3>
              <div className="bg-gradient-to-br from-blue-50 to-green-50 p-6 rounded-lg space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Nome:</span>
                  <span className="font-semibold">{userProfile.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Idade:</span>
                  <span className="font-semibold">{userProfile.age} anos</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Peso / Altura:</span>
                  <span className="font-semibold">{userProfile.weight}kg / {userProfile.height}cm</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">IMC:</span>
                  <span className="font-semibold">{calculateBMI()}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Calorias diárias:</span>
                  <span className="font-semibold">{calculateCalories()} kcal</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Objetivo:</span>
                  <span className="font-semibold">
                    {userProfile.goal === 'lose_weight' && 'Emagrecer'}
                    {userProfile.goal === 'gain_muscle' && 'Ganhar massa'}
                    {userProfile.goal === 'maintain' && 'Manter forma'}
                    {userProfile.goal === 'endurance' && 'Resistência'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Frequência:</span>
                  <span className="font-semibold">{userProfile.frequency}x por semana</span>
                </div>
              </div>
              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <p className="text-sm text-yellow-800">
                  <strong>⚠️ Aviso importante:</strong> Este app não substitui orientação médica ou de profissionais de saúde. 
                  Consulte um médico antes de iniciar qualquer programa de exercícios ou suplementação.
                </p>
              </div>
            </div>
          )}

          <div className="flex justify-between mt-8">
            {currentStep > 0 && (
              <Button variant="outline" onClick={() => setCurrentStep(currentStep - 1)}>
                Voltar
              </Button>
            )}
            <Button 
              onClick={handleNext}
              className="ml-auto bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600"
            >
              {currentStep === 4 ? 'Finalizar' : 'Próximo'}
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  // Main Dashboard
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                FitCoach AI
              </h1>
            </div>
            <div className="flex items-center gap-4">
              <Button variant="ghost" size="icon">
                <User className="w-5 h-5" />
              </Button>
              <Button variant="ghost" size="icon" onClick={() => setIsLoggedIn(false)}>
                <LogOut className="w-5 h-5" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-6 lg:w-auto lg:inline-grid bg-white/90 backdrop-blur-sm">
            <TabsTrigger value="dashboard" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="workouts" className="gap-2">
              <Dumbbell className="w-4 h-4" />
              <span className="hidden sm:inline">Treinos</span>
            </TabsTrigger>
            <TabsTrigger value="nutrition" className="gap-2">
              <Apple className="w-4 h-4" />
              <span className="hidden sm:inline">Dieta</span>
            </TabsTrigger>
            <TabsTrigger value="supplements" className="gap-2">
              <Pill className="w-4 h-4" />
              <span className="hidden sm:inline">Suplementos</span>
            </TabsTrigger>
            <TabsTrigger value="progress" className="gap-2">
              <Activity className="w-4 h-4" />
              <span className="hidden sm:inline">Progresso</span>
            </TabsTrigger>
            <TabsTrigger value="community" className="gap-2">
              <Users className="w-4 h-4" />
              <span className="hidden sm:inline">Comunidade</span>
            </TabsTrigger>
          </TabsList>

          {/* Dashboard Tab */}
          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Peso Atual</h3>
                  <Activity className="w-8 h-8 opacity-80" />
                </div>
                <p className="text-3xl font-bold">{userProfile.weight} kg</p>
                <p className="text-sm opacity-90 mt-2">IMC: {userProfile.bmi}</p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-green-500 to-green-600 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Calorias Diárias</h3>
                  <Apple className="w-8 h-8 opacity-80" />
                </div>
                <p className="text-3xl font-bold">{userProfile.calories}</p>
                <p className="text-sm opacity-90 mt-2">Meta diária</p>
              </Card>

              <Card className="p-6 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold">Treinos/Semana</h3>
                  <Dumbbell className="w-8 h-8 opacity-80" />
                </div>
                <p className="text-3xl font-bold">{userProfile.frequency}x</p>
                <p className="text-sm opacity-90 mt-2">Frequência planejada</p>
              </Card>
            </div>

            <Card className="p-6 bg-white/90 backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-4">Próximos treinos</h3>
              <div className="space-y-3">
                {workoutPlan.slice(0, 2).map((plan, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Calendar className="w-5 h-5 text-blue-600" />
                      <div>
                        <p className="font-semibold">{plan.day}</p>
                        <p className="text-sm text-gray-600">{plan.exercises.length} exercícios</p>
                      </div>
                    </div>
                    <Button size="sm" className="bg-gradient-to-r from-blue-500 to-green-500">
                      Iniciar
                    </Button>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-white/90 backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-4">Refeições de hoje</h3>
              <div className="space-y-3">
                {mealPlan.slice(0, 3).map((meal, idx) => (
                  <div key={idx} className="flex items-center justify-between p-4 bg-gradient-to-r from-green-50 to-blue-50 rounded-lg">
                    <div>
                      <p className="font-semibold">{meal.meal}</p>
                      <p className="text-sm text-gray-600">{meal.time} • {meal.macros.calories} kcal</p>
                    </div>
                    <div className="text-right text-sm">
                      <p className="text-gray-600">P: {meal.macros.protein}g • C: {meal.macros.carbs}g • G: {meal.macros.fats}g</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </TabsContent>

          {/* Workouts Tab */}
          <TabsContent value="workouts" className="space-y-6">
            <Card className="p-6 bg-white/90 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-6">Seu plano de treino semanal</h2>
              <div className="space-y-6">
                {workoutPlan.map((plan, idx) => (
                  <div key={idx} className="border-l-4 border-blue-500 pl-4">
                    <h3 className="text-xl font-bold mb-4 text-blue-600">{plan.day}</h3>
                    <div className="space-y-4">
                      {plan.exercises.map((exercise, exIdx) => (
                        <div key={exIdx} className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg">
                          <div className="flex items-start justify-between mb-2">
                            <div className="flex-1">
                              <h4 className="font-semibold text-lg">{exercise.name}</h4>
                              <div className="flex gap-4 mt-2 text-sm text-gray-600">
                                <span>Séries: {exercise.sets}</span>
                                <span>Reps: {exercise.reps}</span>
                                <span>Descanso: {exercise.rest}</span>
                              </div>
                            </div>
                            {exercise.videoUrl && (
                              <Button size="sm" variant="outline" className="ml-4">
                                Ver vídeo
                              </Button>
                            )}
                          </div>
                          {exercise.videoUrl && (
                            <div className="mt-4 aspect-video rounded-lg overflow-hidden">
                              <iframe
                                width="100%"
                                height="100%"
                                src={exercise.videoUrl}
                                title={exercise.name}
                                frameBorder="0"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-blue-500 to-green-500 text-white">
              <h3 className="text-xl font-bold mb-2">💡 Dica do dia</h3>
              <p>Mantenha a forma correta em todos os exercícios. Qualidade é mais importante que quantidade!</p>
            </Card>
          </TabsContent>

          {/* Nutrition Tab */}
          <TabsContent value="nutrition" className="space-y-6">
            <Card className="p-6 bg-white/90 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-6">Plano alimentar diário</h2>
              <div className="space-y-4">
                {mealPlan.map((meal, idx) => (
                  <div key={idx} className="bg-gradient-to-r from-green-50 to-blue-50 p-6 rounded-lg">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h3 className="text-xl font-bold text-green-600">{meal.meal}</h3>
                        <p className="text-sm text-gray-600">{meal.time}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-2xl font-bold text-gray-800">{meal.macros.calories}</p>
                        <p className="text-sm text-gray-600">kcal</p>
                      </div>
                    </div>
                    <div className="mb-4">
                      <h4 className="font-semibold mb-2">Alimentos:</h4>
                      <ul className="list-disc list-inside space-y-1">
                        {meal.foods.map((food, foodIdx) => (
                          <li key={foodIdx} className="text-gray-700">{food}</li>
                        ))}
                      </ul>
                    </div>
                    <div className="flex gap-4 text-sm">
                      <div className="bg-white px-3 py-2 rounded">
                        <span className="text-gray-600">Proteína:</span>
                        <span className="font-bold ml-1">{meal.macros.protein}g</span>
                      </div>
                      <div className="bg-white px-3 py-2 rounded">
                        <span className="text-gray-600">Carboidratos:</span>
                        <span className="font-bold ml-1">{meal.macros.carbs}g</span>
                      </div>
                      <div className="bg-white px-3 py-2 rounded">
                        <span className="text-gray-600">Gorduras:</span>
                        <span className="font-bold ml-1">{meal.macros.fats}g</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-blue-50 border border-blue-200">
              <h3 className="text-lg font-bold mb-2 text-blue-800">💧 Lembrete de hidratação</h3>
              <p className="text-blue-700">Beba pelo menos 2-3 litros de água por dia. Mantenha-se hidratado durante os treinos!</p>
            </Card>

            <Card className="p-6 bg-white/90 backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-4">Lista de compras semanal</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h4 className="font-semibold mb-2 text-green-600">Proteínas</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Peito de frango (1kg)</li>
                    <li>Ovos (2 dúzias)</li>
                    <li>Salmão (500g)</li>
                    <li>Whey protein</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-orange-600">Carboidratos</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Arroz integral (1kg)</li>
                    <li>Batata doce (2kg)</li>
                    <li>Aveia (500g)</li>
                    <li>Pão integral</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-blue-600">Vegetais</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Brócolis</li>
                    <li>Aspargos</li>
                    <li>Salada verde</li>
                    <li>Tomate</li>
                  </ul>
                </div>
                <div>
                  <h4 className="font-semibold mb-2 text-purple-600">Outros</h4>
                  <ul className="list-disc list-inside space-y-1 text-sm">
                    <li>Azeite de oliva</li>
                    <li>Pasta de amendoim</li>
                    <li>Frutas variadas</li>
                    <li>Iogurte grego</li>
                  </ul>
                </div>
              </div>
            </Card>
          </TabsContent>

          {/* Supplements Tab */}
          <TabsContent value="supplements" className="space-y-6">
            <Card className="p-6 bg-yellow-50 border-2 border-yellow-300">
              <div className="flex items-start gap-3">
                <div className="bg-yellow-400 p-2 rounded-full">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div>
                  <h3 className="text-lg font-bold text-yellow-900 mb-2">Aviso Importante</h3>
                  <p className="text-yellow-800">
                    As recomendações abaixo são baseadas em guidelines científicos (NIH/ISSN), mas <strong>não substituem orientação médica</strong>. 
                    Consulte um médico ou nutricionista antes de iniciar qualquer suplementação.
                  </p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white/90 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-6">Suplementos recomendados para seu objetivo</h2>
              <div className="space-y-6">
                {/* Whey Protein */}
                <div className="border-l-4 border-blue-500 pl-4 bg-gradient-to-r from-blue-50 to-transparent p-4 rounded">
                  <h3 className="text-xl font-bold mb-2">Whey Protein</h3>
                  <p className="text-gray-700 mb-3">
                    Proteína de rápida absorção ideal para pós-treino e complementação proteica diária.
                  </p>
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Dosagem recomendada:</h4>
                    <p className="text-gray-700">
                      <strong>25-30g</strong> (1 scoop) após o treino ou entre refeições
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Baseado em: ISSN Position Stand - Protein and Exercise (2017)
                    </p>
                  </div>
                </div>

                {/* Creatina */}
                <div className="border-l-4 border-green-500 pl-4 bg-gradient-to-r from-green-50 to-transparent p-4 rounded">
                  <h3 className="text-xl font-bold mb-2">Creatina Monohidratada</h3>
                  <p className="text-gray-700 mb-3">
                    Melhora força, potência e ganho de massa muscular. Um dos suplementos mais estudados e eficazes.
                  </p>
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Dosagem recomendada:</h4>
                    <p className="text-gray-700">
                      <strong>3-5g por dia</strong>, qualquer horário (não precisa saturação)
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Baseado em: ISSN Position Stand - Creatine Supplementation (2017)
                    </p>
                  </div>
                </div>

                {/* Multivitamínico */}
                <div className="border-l-4 border-purple-500 pl-4 bg-gradient-to-r from-purple-50 to-transparent p-4 rounded">
                  <h3 className="text-xl font-bold mb-2">Multivitamínico</h3>
                  <p className="text-gray-700 mb-3">
                    Complementa possíveis deficiências nutricionais, especialmente em dietas restritivas.
                  </p>
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Dosagem recomendada:</h4>
                    <p className="text-gray-700">
                      <strong>1 cápsula por dia</strong> junto com refeição principal
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Baseado em: NIH Office of Dietary Supplements
                    </p>
                  </div>
                </div>

                {/* Ômega 3 */}
                <div className="border-l-4 border-orange-500 pl-4 bg-gradient-to-r from-orange-50 to-transparent p-4 rounded">
                  <h3 className="text-xl font-bold mb-2">Ômega 3 (EPA/DHA)</h3>
                  <p className="text-gray-700 mb-3">
                    Anti-inflamatório natural, melhora saúde cardiovascular e recuperação muscular.
                  </p>
                  <div className="bg-white p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Dosagem recomendada:</h4>
                    <p className="text-gray-700">
                      <strong>1-3g por dia</strong> (EPA + DHA combinados) junto com refeições
                    </p>
                    <p className="text-sm text-gray-600 mt-2">
                      Baseado em: American Heart Association Guidelines
                    </p>
                  </div>
                </div>

                {userProfile.goal === 'lose_weight' && (
                  <div className="border-l-4 border-red-500 pl-4 bg-gradient-to-r from-red-50 to-transparent p-4 rounded">
                    <h3 className="text-xl font-bold mb-2">Cafeína (opcional)</h3>
                    <p className="text-gray-700 mb-3">
                      Pode auxiliar na queima de gordura e melhorar performance no treino.
                    </p>
                    <div className="bg-white p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Dosagem recomendada:</h4>
                      <p className="text-gray-700">
                        <strong>200-400mg</strong> (2-4 xícaras de café) 30-60min antes do treino
                      </p>
                      <p className="text-sm text-gray-600 mt-2">
                        Baseado em: ISSN Position Stand - Caffeine and Exercise Performance
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </Card>

            <Card className="p-6 bg-blue-50 border border-blue-200">
              <h3 className="text-lg font-bold mb-2 text-blue-800">💊 Dica de suplementação</h3>
              <p className="text-blue-700">
                Comece com o básico (whey + creatina) e adicione outros suplementos gradualmente. 
                A alimentação sempre deve ser a prioridade!
              </p>
            </Card>
          </TabsContent>

          {/* Progress Tab */}
          <TabsContent value="progress" className="space-y-6">
            <Card className="p-6 bg-white/90 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-6">Acompanhe sua evolução</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Peso corporal</h3>
                  <div className="h-48 flex items-end justify-around gap-2">
                    {[72, 71.5, 71, 70.8, 70.5, 70.2, 70].map((weight, idx) => (
                      <div key={idx} className="flex flex-col items-center flex-1">
                        <div 
                          className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t"
                          style={{ height: `${(weight / 72) * 100}%` }}
                        />
                        <span className="text-xs mt-2">S{idx + 1}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-center mt-4 text-sm text-gray-600">Últimas 7 semanas</p>
                </div>

                <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
                  <h3 className="text-lg font-semibold mb-4">Treinos completados</h3>
                  <div className="h-48 flex items-end justify-around gap-2">
                    {[2, 3, 3, 4, 3, 4, 4].map((workouts, idx) => (
                      <div key={idx} className="flex flex-col items-center flex-1">
                        <div 
                          className="w-full bg-gradient-to-t from-green-500 to-green-400 rounded-t"
                          style={{ height: `${(workouts / 5) * 100}%` }}
                        />
                        <span className="text-xs mt-2">S{idx + 1}</span>
                      </div>
                    ))}
                  </div>
                  <p className="text-center mt-4 text-sm text-gray-600">Últimas 7 semanas</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-4 rounded-lg text-center">
                  <p className="text-sm text-purple-700 mb-1">Total de treinos</p>
                  <p className="text-3xl font-bold text-purple-900">24</p>
                </div>
                <div className="bg-gradient-to-br from-orange-100 to-orange-200 p-4 rounded-lg text-center">
                  <p className="text-sm text-orange-700 mb-1">Calorias queimadas</p>
                  <p className="text-3xl font-bold text-orange-900">8.4k</p>
                </div>
                <div className="bg-gradient-to-br from-pink-100 to-pink-200 p-4 rounded-lg text-center">
                  <p className="text-sm text-pink-700 mb-1">Dias consecutivos</p>
                  <p className="text-3xl font-bold text-pink-900">12</p>
                </div>
              </div>
            </Card>

            <Card className="p-6 bg-white/90 backdrop-blur-sm">
              <h3 className="text-xl font-bold mb-4">Fotos de progresso</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {['Início', 'Semana 4', 'Semana 8', 'Semana 12'].map((label, idx) => (
                  <div key={idx} className="aspect-square bg-gradient-to-br from-gray-100 to-gray-200 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <div className="w-12 h-12 bg-gray-300 rounded-full mx-auto mb-2 flex items-center justify-center">
                        <User className="w-6 h-6 text-gray-500" />
                      </div>
                      <p className="text-sm text-gray-600">{label}</p>
                      <Button size="sm" variant="ghost" className="mt-2 text-xs">
                        Adicionar foto
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-green-500 to-blue-500 text-white">
              <h3 className="text-xl font-bold mb-2">🎉 Parabéns!</h3>
              <p>Você está no caminho certo! Continue assim e os resultados virão.</p>
            </Card>
          </TabsContent>

          {/* Community Tab */}
          <TabsContent value="community" className="space-y-6">
            <Card className="p-6 bg-white/90 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-6">Chat com IA - Tire suas dúvidas</h2>
              <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg p-4 mb-4 h-96 overflow-y-auto">
                <div className="space-y-4">
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm flex-1">
                      <p className="text-sm">Olá! Sou seu assistente virtual. Como posso ajudar hoje?</p>
                    </div>
                  </div>
                  <div className="flex gap-3 justify-end">
                    <div className="bg-blue-500 text-white p-3 rounded-lg shadow-sm max-w-xs">
                      <p className="text-sm">Posso fazer supino todos os dias?</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-green-500 rounded-full flex items-center justify-center flex-shrink-0">
                      <MessageSquare className="w-4 h-4 text-white" />
                    </div>
                    <div className="bg-white p-3 rounded-lg shadow-sm flex-1">
                      <p className="text-sm">
                        Não é recomendado treinar o mesmo grupo muscular todos os dias. 
                        Os músculos precisam de 48-72h para recuperação adequada. 
                        Sugiro alternar entre diferentes grupos musculares.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-2">
                <Input placeholder="Digite sua pergunta..." className="flex-1" />
                <Button className="bg-gradient-to-r from-blue-500 to-green-500">
                  Enviar
                </Button>
              </div>
            </Card>

            <Card className="p-6 bg-white/90 backdrop-blur-sm">
              <h2 className="text-2xl font-bold mb-6">Fórum da comunidade</h2>
              <div className="space-y-4">
                {[
                  {
                    user: 'João Silva',
                    topic: 'Dicas para iniciantes na musculação',
                    replies: 23,
                    time: '2h atrás'
                  },
                  {
                    user: 'Maria Santos',
                    topic: 'Melhor horário para treinar?',
                    replies: 15,
                    time: '5h atrás'
                  },
                  {
                    user: 'Pedro Costa',
                    topic: 'Receitas fit para ganho de massa',
                    replies: 42,
                    time: '1 dia atrás'
                  }
                ].map((post, idx) => (
                  <div key={idx} className="bg-gradient-to-r from-blue-50 to-green-50 p-4 rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                    <div className="flex items-start justify-between">
                      <div className="flex gap-3 flex-1">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-green-400 rounded-full flex items-center justify-center">
                          <User className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3 className="font-semibold">{post.topic}</h3>
                          <p className="text-sm text-gray-600">por {post.user}</p>
                        </div>
                      </div>
                      <div className="text-right text-sm text-gray-600">
                        <p>{post.replies} respostas</p>
                        <p>{post.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <Button className="w-full mt-4 bg-gradient-to-r from-blue-500 to-green-500">
                Ver todos os tópicos
              </Button>
            </Card>

            <Card className="p-6 bg-gradient-to-br from-purple-100 to-pink-100 border border-purple-200">
              <h3 className="text-lg font-bold mb-2 text-purple-800">🔗 Integração com wearables</h3>
              <p className="text-purple-700 mb-4">
                Conecte seu Google Fit ou Apple Health para sincronizar automaticamente seus dados de atividade.
              </p>
              <div className="flex gap-3">
                <Button variant="outline" className="flex-1">
                  <Activity className="w-4 h-4 mr-2" />
                  Google Fit
                </Button>
                <Button variant="outline" className="flex-1">
                  <Activity className="w-4 h-4 mr-2" />
                  Apple Health
                </Button>
              </div>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}
