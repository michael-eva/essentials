// "use client"

// import { useState } from "react"
// import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
// import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
// import { Badge } from "@/components/ui/badge"
// import { Calendar } from "@/components/ui/calendar"
// import { Activity, BarChart3, CalendarDays, Clock, Flame } from "lucide-react"

// export default function WorkoutHistory() {
//   const [date, setDate] = useState<Date | undefined>(new Date())

//   return (
//     <div className="space-y-4">
//       <Card>
//         <CardHeader>
//           <CardTitle>Workout History</CardTitle>
//           <CardDescription>View and filter your past activities</CardDescription>
//         </CardHeader>
//         <CardContent>
//           <Tabs defaultValue="list" className="w-full">
//             <TabsList className="grid grid-cols-2 mb-4">
//               <TabsTrigger value="list">
//                 <BarChart3 className="h-4 w-4 mr-2" />
//                 List View
//               </TabsTrigger>
//               <TabsTrigger value="calendar">
//                 <CalendarDays className="h-4 w-4 mr-2" />
//                 Calendar
//               </TabsTrigger>
//             </TabsList>

//             <TabsContent value="list" className="space-y-4">
//               {workoutHistory.map((workout, index) => (
//                 <Card key={index} className="overflow-hidden">
//                   <div className="flex items-center p-4">
//                     <div className="flex-1">
//                       <div className="flex items-center">
//                         <h3 className="font-medium">{workout.name}</h3>
//                         <Badge variant="outline" className="ml-2">
//                           {workout.type}
//                         </Badge>
//                       </div>
//                       <p className="text-sm text-muted-foreground">{workout.date}</p>

//                       <div className="flex items-center mt-2 text-sm">
//                         <div className="flex items-center mr-4">
//                           <Clock className="h-3.5 w-3.5 mr-1 text-muted-foreground" />
//                           {workout.duration} min
//                         </div>
//                         <div className="flex items-center">
//                           <Flame className="h-3.5 w-3.5 mr-1 text-orange-500" />
//                           {workout.calories} cal
//                         </div>
//                       </div>
//                     </div>

//                     <div className="flex items-center justify-center w-12 h-12 rounded-full bg-primary/10">
//                       <Activity className="h-6 w-6 text-primary" />
//                     </div>
//                   </div>
//                 </Card>
//               ))}
//             </TabsContent>

//             <TabsContent value="calendar">
//               <div className="flex flex-col items-center">
//                 <Calendar mode="single" selected={date} onSelect={setDate} className="rounded-md border" />

//                 <div className="w-full mt-4">
//                   <h3 className="font-medium mb-2">
//                     {date
//                       ? date.toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric" })
//                       : "Select a date"}
//                   </h3>

//                   {date && (
//                     <div className="space-y-2">
//                       <Card>
//                         <CardContent className="p-3">
//                           <div className="flex justify-between items-center">
//                             <div>
//                               <p className="font-medium">Morning Run</p>
//                               <p className="text-xs text-muted-foreground">7:30 AM • 32 min</p>
//                             </div>
//                             <Badge>Running</Badge>
//                           </div>
//                         </CardContent>
//                       </Card>

//                       <Card>
//                         <CardContent className="p-3">
//                           <div className="flex justify-between items-center">
//                             <div>
//                               <p className="font-medium">Yoga Session</p>
//                               <p className="text-xs text-muted-foreground">6:00 PM • 45 min</p>
//                             </div>
//                             <Badge>Yoga</Badge>
//                           </div>
//                         </CardContent>
//                       </Card>
//                     </div>
//                   )}
//                 </div>
//               </div>
//             </TabsContent>
//           </Tabs>
//         </CardContent>
//       </Card>
//     </div>
//   )
// }

// const workoutHistory = [
//   {
//     name: "Morning Run",
//     type: "Running",
//     date: "Today, 7:30 AM",
//     duration: 32,
//     calories: 320,
//   },
//   {
//     name: "Yoga Session",
//     type: "Yoga",
//     date: "Today, 6:00 PM",
//     duration: 45,
//     calories: 180,
//   },
//   {
//     name: "Weight Training",
//     type: "Strength",
//     date: "Yesterday, 5:30 PM",
//     duration: 60,
//     calories: 450,
//   },
//   {
//     name: "Evening Walk",
//     type: "Walking",
//     date: "May 7, 2025, 7:00 PM",
//     duration: 45,
//     calories: 220,
//   },
//   {
//     name: "Swimming",
//     type: "Swimming",
//     date: "May 6, 2025, 4:00 PM",
//     duration: 40,
//     calories: 380,
//   },
// ]
