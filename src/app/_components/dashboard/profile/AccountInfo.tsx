// "use client";

// import { useState, useEffect } from "react"
// import { Button } from "@/components/ui/button"
// import { Input } from "@/components/ui/input"
// import { Label } from "@/components/ui/label"
// import { User, Mail, Edit, Save, X, ArrowLeft } from "lucide-react"
// import { toast } from "sonner"
// import { api } from "@/trpc/react"
// import DefaultBox from "../../global/DefaultBox"
// import { supabase } from "@/lib/supabase/client"
// import Link from "next/link"

// export default function AccountInfo() {
//   const [isEditingProfile, setIsEditingProfile] = useState(false)
//   const [profileData, setProfileData] = useState({ name: "", email: "" })
//   const [isSaving, setIsSaving] = useState(false)
//   const utils = api.useUtils()

//   const { data: userProfile, isLoading: isLoadingProfile } = api.auth.getUserProfile.useQuery()

//   useEffect(() => {
//     if (userProfile && !isEditingProfile) {
//       setProfileData({
//         name: userProfile.name || "",
//         email: userProfile.email || ""
//       })
//     }
//   }, [userProfile, isEditingProfile])

//   const handleEditProfile = () => {
//     if (userProfile) {
//       setProfileData({
//         name: userProfile.name || "",
//         email: userProfile.email || ""
//       })
//       setIsEditingProfile(true)
//     }
//   }

//   const handleSaveProfile = async () => {
//     const nameChanged = profileData.name && profileData.name !== userProfile?.name
//     const emailChanged = profileData.email && profileData.email !== userProfile?.email

//     if (!nameChanged && !emailChanged) {
//       toast.info("No changes to save")
//       setIsEditingProfile(false)
//       return
//     }

//     setIsSaving(true)

//     try {
//       let hasUpdates = false
//       const authUpdates: { email?: string; data?: { name?: string } } = {}

//       if (emailChanged) {
//         authUpdates.email = profileData.email
//         hasUpdates = true
//       }

//       if (nameChanged) {
//         authUpdates.data = { name: profileData.name }
//         hasUpdates = true
//       }

//       if (hasUpdates) {
//         const { error } = await supabase.auth.updateUser(authUpdates)

//         if (error) {
//           throw new Error(error.message)
//         }

//         if (nameChanged && emailChanged) {
//           toast.success("Name updated successfully! Please also check both your current and new email addresses to confirm the email change.")
//         } else if (emailChanged) {
//           toast.success("Please check both your current and new email addresses to confirm the email change.")
//         } else if (nameChanged) {
//           toast.success("Name updated successfully!")
//         }

//         setIsEditingProfile(false)
//         utils.auth.getUserProfile.invalidate()
//       }
//     } catch (error) {
//       console.error("Error updating profile:", error)
//       toast.error(error instanceof Error ? error.message : "Failed to update profile")
//     } finally {
//       setIsSaving(false)
//     }
//   }

//   const handleCancelEdit = () => {
//     setIsEditingProfile(false)
//     if (userProfile) {
//       setProfileData({
//         name: userProfile.name || "",
//         email: userProfile.email || ""
//       })
//     }
//   }

//   return (
//     <div className="space-y-6">
//       <div className="flex items-center gap-4">
//         <Link href="/dashboard/profile">
//           <Button variant="outline" size="sm" className="flex items-center gap-2">
//             <ArrowLeft className="h-4 w-4" />
//             Back to Profile
//           </Button>
//         </Link>
//         <div>
//           <h2 className="text-2xl font-bold text-gray-900">Account Information</h2>
//           <p className="text-gray-600">Update your personal details</p>
//         </div>
//       </div>

//       <DefaultBox
//         title="Personal Information"
//         description="Manage your account details and contact information"
//         showViewAll={false}
//       >
//         {isLoadingProfile ? (
//           <div className="animate-pulse space-y-4">
//             <div className="h-4 bg-gray-200 rounded w-1/4"></div>
//             <div className="h-10 bg-gray-200 rounded"></div>
//             <div className="h-4 bg-gray-200 rounded w-1/4"></div>
//             <div className="h-10 bg-gray-200 rounded"></div>
//           </div>
//         ) : (
//           <div className="space-y-4">
//             <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
//               <div className="space-y-2">
//                 <Label htmlFor="name" className="flex items-center gap-2">
//                   <User className="h-4 w-4" />
//                   Name
//                 </Label>
//                 {isEditingProfile ? (
//                   <Input
//                     id="name"
//                     value={profileData.name}
//                     onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
//                     placeholder="Enter your name"
//                   />
//                 ) : (
//                   <div className="p-2 border border-gray-200 rounded-md bg-gray-50">
//                     {userProfile?.name || "Not set"}
//                   </div>
//                 )}
//               </div>

//               <div className="space-y-2">
//                 <Label htmlFor="email" className="flex items-center gap-2">
//                   <Mail className="h-4 w-4" />
//                   Email
//                 </Label>
//                 {isEditingProfile ? (
//                   <>
//                     <Input
//                       id="email"
//                       type="email"
//                       value={profileData.email}
//                       onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
//                       placeholder="Enter your email"
//                     />
//                     <p className="text-xs text-gray-500 mt-1">
//                       💡 Changing your email will send confirmation links to both your current and new email addresses
//                     </p>
//                   </>
//                 ) : (
//                   <div className="p-2 border border-gray-200 rounded-md bg-gray-50">
//                     {userProfile?.email || "Not set"}
//                   </div>
//                 )}
//               </div>
//             </div>

//             <div className="flex gap-2 pt-4">
//               {isEditingProfile ? (
//                 <>
//                   <Button
//                     onClick={handleSaveProfile}
//                     disabled={isSaving}
//                     className="flex items-center gap-2"
//                   >
//                     <Save className="h-4 w-4" />
//                     {isSaving ? "Saving..." : "Save Changes"}
//                   </Button>
//                   <Button
//                     variant="outline"
//                     onClick={handleCancelEdit}
//                     disabled={isSaving}
//                     className="flex items-center gap-2"
//                   >
//                     <X className="h-4 w-4" />
//                     Cancel
//                   </Button>
//                 </>
//               ) : (
//                 <Button
//                   variant="outline"
//                   onClick={handleEditProfile}
//                   className="flex items-center gap-2"
//                 >
//                   <Edit className="h-4 w-4" />
//                   Edit Profile
//                 </Button>
//               )}
//             </div>
//           </div>
//         )}
//       </DefaultBox>
//     </div>
//   )
// }