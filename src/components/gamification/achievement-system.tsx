'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Trophy, 
  Star, 
  Medal, 
  Target, 
  Users, 
  BookOpen, 
  Zap,
  Crown,
  Award,
  TrendingUp
} from "lucide-react"
import { getDepartmentDisplayName } from "@/lib/utils"

interface Achievement {
  id: string
  name: string
  description: string
  type: string
  iconUrl?: string
  criteria: {
    target: number
    current: number
  }
  isUnlocked: boolean
  unlockedAt?: Date
}

interface UserBadge {
  id: string
  badge: {
    name: string
    description: string
    type: string
    iconUrl?: string
  }
  awardedAt: Date
  reason?: string
}

interface LeaderboardEntry {
  userId: string
  userName: string
  department: string
  score: number
  rank: number
  achievements: number
  projectsCompleted: number
  coursesCompleted: number
}

export function AchievementSystem() {
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [userBadges, setUserBadges] = useState<UserBadge[]>([])
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([])
  const [departmentStats, setDepartmentStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchGameData()
  }, [])

  const fetchGameData = async () => {
    setLoading(true)
    
    // Mock data for demonstration
    setAchievements([
      {
        id: '1',
        name: 'First Steps',
        description: 'Complete your first AI project',
        type: 'PROJECT_COMPLETION',
        criteria: { target: 1, current: 1 },
        isUnlocked: true,
        unlockedAt: new Date('2024-01-15')
      },
      {
        id: '2',
        name: 'Learning Champion',
        description: 'Complete 5 training courses',
        type: 'COURSE_COMPLIANCE',
        criteria: { target: 5, current: 3 },
        isUnlocked: false
      },
      {
        id: '3',
        name: 'Innovation Master',
        description: 'Save 100+ hours through AI automation',
        type: 'INNOVATION_MILESTONE',
        criteria: { target: 100, current: 67 },
        isUnlocked: false
      },
      {
        id: '4',
        name: 'Team Leader',
        description: 'Lead 3 successful projects',
        type: 'PROJECT_COMPLETION',
        criteria: { target: 3, current: 1 },
        isUnlocked: false
      },
      {
        id: '5',
        name: 'Department Champion',
        description: 'Top performer in your department this quarter',
        type: 'DEPARTMENT_CHAMPION',
        criteria: { target: 1, current: 0 },
        isUnlocked: false
      }
    ])

    setUserBadges([
      {
        id: '1',
        badge: {
          name: 'Early Adopter',
          description: 'Among the first to join the AI platform',
          type: 'SPECIAL'
        },
        awardedAt: new Date('2024-01-10'),
        reason: 'Joined during beta launch'
      },
      {
        id: '2',
        badge: {
          name: 'Project Starter',
          description: 'Successfully completed first AI project',
          type: 'PROJECT_COMPLETION'
        },
        awardedAt: new Date('2024-01-15'),
        reason: 'Completed customer service automation project'
      }
    ])

    setLeaderboard([
      { userId: '1', userName: 'Alice Johnson', department: 'SME', score: 1250, rank: 1, achievements: 8, projectsCompleted: 5, coursesCompleted: 12 },
      { userId: '2', userName: 'Bob Chen', department: 'LAKA', score: 1180, rank: 2, achievements: 7, projectsCompleted: 4, coursesCompleted: 10 },
      { userId: '3', userName: 'Carol Davis', department: 'CX', score: 1150, rank: 3, achievements: 6, projectsCompleted: 6, coursesCompleted: 8 },
      { userId: '4', userName: 'David Wilson', department: 'WFM', score: 1100, rank: 4, achievements: 5, projectsCompleted: 3, coursesCompleted: 11 },
      { userId: '5', userName: 'Emma Brown', department: 'ONBOARDING', score: 1050, rank: 5, achievements: 6, projectsCompleted: 4, coursesCompleted: 9 }
    ])

    setDepartmentStats([
      { department: 'SME', totalScore: 8500, avgScore: 425, members: 20, rank: 1 },
      { department: 'CX', totalScore: 7800, avgScore: 390, members: 20, rank: 2 },
      { department: 'LAKA', totalScore: 7200, avgScore: 360, members: 20, rank: 3 },
      { department: 'WFM', totalScore: 6900, avgScore: 345, members: 20, rank: 4 },
      { department: 'ONBOARDING', totalScore: 6400, avgScore: 320, members: 20, rank: 5 },
      { department: 'SPECIALSERVICE', totalScore: 5800, avgScore: 290, members: 20, rank: 6 }
    ])

    setLoading(false)
  }

  const getAchievementIcon = (type: string) => {
    switch (type) {
      case 'PROJECT_COMPLETION':
        return <Target className="w-6 h-6" />
      case 'COURSE_COMPLIANCE':
        return <BookOpen className="w-6 h-6" />
      case 'INNOVATION_MILESTONE':
        return <Zap className="w-6 h-6" />
      case 'DEPARTMENT_CHAMPION':
        return <Crown className="w-6 h-6" />
      default:
        return <Award className="w-6 h-6" />
    }
  }

  const getRankIcon = (rank: number) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />
      case 3:
        return <Medal className="w-5 h-5 text-amber-600" />
      default:
        return <Star className="w-5 h-5 text-blue-500" />
    }
  }

  const getRankColor = (rank: number) => {
    switch (rank) {
      case 1: return 'bg-gradient-to-r from-yellow-400 to-yellow-600'
      case 2: return 'bg-gradient-to-r from-gray-300 to-gray-500'
      case 3: return 'bg-gradient-to-r from-amber-400 to-amber-600'
      default: return 'bg-gradient-to-r from-blue-400 to-blue-600'
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Achievement System</h2>
          <p className="text-gray-600">Track your progress and compete with colleagues</p>
        </div>
      </div>

      <Tabs defaultValue="achievements" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="achievements">My Achievements</TabsTrigger>
          <TabsTrigger value="badges">Badges</TabsTrigger>
          <TabsTrigger value="leaderboard">Leaderboard</TabsTrigger>
          <TabsTrigger value="departments">Departments</TabsTrigger>
        </TabsList>

        <TabsContent value="achievements">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {achievements.map((achievement) => (
              <Card key={achievement.id} className={`relative overflow-hidden ${achievement.isUnlocked ? 'border-green-200 bg-green-50' : 'border-gray-200'}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className={`p-2 rounded-full ${achievement.isUnlocked ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
                      {getAchievementIcon(achievement.type)}
                    </div>
                    {achievement.isUnlocked && (
                      <Badge variant="secondary" className="bg-green-100 text-green-700">
                        Unlocked!
                      </Badge>
                    )}
                  </div>
                  <CardTitle className={`text-lg ${achievement.isUnlocked ? 'text-green-800' : 'text-gray-600'}`}>
                    {achievement.name}
                  </CardTitle>
                  <CardDescription className={achievement.isUnlocked ? 'text-green-600' : 'text-gray-500'}>
                    {achievement.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between text-sm">
                      <span>Progress</span>
                      <span className="font-medium">
                        {achievement.criteria.current}/{achievement.criteria.target}
                      </span>
                    </div>
                    <Progress 
                      value={(achievement.criteria.current / achievement.criteria.target) * 100} 
                      className="h-2"
                    />
                    {achievement.isUnlocked && achievement.unlockedAt && (
                      <p className="text-xs text-green-600">
                        Unlocked on {achievement.unlockedAt.toLocaleDateString()}
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="badges">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {userBadges.map((userBadge) => (
              <Card key={userBadge.id} className="text-center">
                <CardContent className="pt-6">
                  <div className="flex flex-col items-center space-y-3">
                    <div className="w-16 h-16 bg-gradient-to-br from-blue-400 to-purple-600 rounded-full flex items-center justify-center text-white">
                      <Award className="w-8 h-8" />
                    </div>
                    <div>
                      <h3 className="font-semibold">{userBadge.badge.name}</h3>
                      <p className="text-sm text-gray-600">{userBadge.badge.description}</p>
                    </div>
                    <Badge variant="outline" className="text-xs">
                      {userBadge.awardedAt.toLocaleDateString()}
                    </Badge>
                    {userBadge.reason && (
                      <p className="text-xs text-gray-500 italic">{userBadge.reason}</p>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Placeholder for locked badges */}
            <Card className="text-center opacity-50">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center space-y-3">
                  <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center">
                    <Award className="w-8 h-8 text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-500">Locked Badge</h3>
                    <p className="text-sm text-gray-400">Keep achieving to unlock!</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="leaderboard">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5" />
                Global Leaderboard
              </CardTitle>
              <CardDescription>Top performers across all departments</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {leaderboard.map((entry) => (
                  <div key={entry.userId} className="flex items-center justify-between p-4 rounded-lg border">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${getRankColor(entry.rank)}`}>
                        {entry.rank <= 3 ? getRankIcon(entry.rank) : entry.rank}
                      </div>
                      <div>
                        <h3 className="font-semibold">{entry.userName}</h3>
                        <p className="text-sm text-gray-600">{getDepartmentDisplayName(entry.department)}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-lg">{entry.score.toLocaleString()}</p>
                      <div className="flex gap-4 text-sm text-gray-600">
                        <span>{entry.achievements} 🏆</span>
                        <span>{entry.projectsCompleted} 📊</span>
                        <span>{entry.coursesCompleted} 📚</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="departments">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5" />
                  Department Competition
                </CardTitle>
                <CardDescription>See how your department ranks against others</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {departmentStats.map((dept) => (
                    <div key={dept.department} className="flex items-center justify-between p-4 rounded-lg border">
                      <div className="flex items-center gap-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm ${getRankColor(dept.rank)}`}>
                          {dept.rank}
                        </div>
                        <div>
                          <h3 className="font-semibold">{getDepartmentDisplayName(dept.department)}</h3>
                          <p className="text-sm text-gray-600">{dept.members} members</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold">{dept.totalScore.toLocaleString()} pts</p>
                        <p className="text-sm text-gray-600">Avg: {dept.avgScore}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">This Month's Challenge</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h3 className="font-semibold">Innovation Sprint</h3>
                    <p className="text-sm text-gray-600">Complete 3 new AI projects</p>
                    <Progress value={67} className="h-2" />
                    <p className="text-xs text-gray-500">2/3 completed</p>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Department Bonus</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h3 className="font-semibold text-green-600">+25% XP</h3>
                    <p className="text-sm text-gray-600">Active until month end</p>
                    <Button size="sm" variant="outline" className="w-full">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm">Upcoming Rewards</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <h3 className="font-semibold">Quarterly Winner</h3>
                    <p className="text-sm text-gray-600">Special recognition + bonus</p>
                    <Button size="sm" className="w-full">
                      Learn More
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}