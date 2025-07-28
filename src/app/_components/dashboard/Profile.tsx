"use client";

import { useState, useEffect } from "react"
import { Card } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { LogOut, User, Mail, Edit, Save, X, Trash2, AlertTriangle } from "lucide-react"
import { toast } from "sonner"
import { api } from "@/trpc/react"
import { useSession } from "@/contexts/SessionContext"
import EditFormDialog from "@/app/_components/onboarding/profile/EditFormDialog"
import { useProfileCompletion, type FormData, type FormType } from "@/hooks/useProfileCompletion"
import { ProfileSkeleton } from "./DashboardSkeleton"
import DefaultBox from "../global/DefaultBox"
import { motion } from "framer-motion"
import { supabase } from "@/lib/supabase/client"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

export default function ProfilePage() {
  const [selectedForm, setSelectedForm] = useState<FormType | null>(null)
  const [isEditingProfile, setIsEditingProfile] = useState(false)
  const [profileData, setProfileData] = useState({ name: "", email: "" })
  const [isSaving, setIsSaving] = useState(false)
  const [showClearDataDialog, setShowClearDataDialog] = useState(false)
  const [confirmationText, setConfirmationText] = useState("")
  const [isClearing, setIsClearing] = useState(false)
  const { isLoading, formData, formSections } = useProfileCompletion()
  const { signOut } = useSession()
  const utils = api.useUtils()
  const { mutate: postHealthConsiderations } =
    api.onboarding.postHealthConsiderations.useMutation({
      onSuccess: () => {
        toast.success("Your profile has been updated successfully.");
        setSelectedForm(null);
        utils.onboarding.getOnboardingData.invalidate();
      },
      onError: (error) => {
        console.error("Error updating form data:", error);
        toast.error("Failed to update your profile. Please try again.");
      },
    });

  // Fetch user profile data
  const { data: userProfile, isLoading: isLoadingProfile } = api.auth.getUserProfile.useQuery()

  // Updates are now handled client-side through Supabase auth

  // Initialize form data when user profile loads
  useEffect(() => {
    if (userProfile && !isEditingProfile) {
      setProfileData({
        name: userProfile.name || "",
        email: userProfile.email || ""
      })
    }
  }, [userProfile, isEditingProfile])

  const handleEditProfile = () => {
    if (userProfile) {
      setProfileData({
        name: userProfile.name || "",
        email: userProfile.email || ""
      })
      setIsEditingProfile(true)
    }
  }

  const handleSaveProfile = async () => {
    // Check what needs to be updated
    const nameChanged = profileData.name && profileData.name !== userProfile?.name
    const emailChanged = profileData.email && profileData.email !== userProfile?.email

    if (!nameChanged && !emailChanged) {
      toast.info("No changes to save")
      setIsEditingProfile(false)
      return
    }

    setIsSaving(true)

    try {
      let hasUpdates = false

      // Handle both name and email updates client-side through Supabase auth
      const authUpdates: { email?: string; data?: { name?: string } } = {}

      if (emailChanged) {
        authUpdates.email = profileData.email
        hasUpdates = true
      }

      if (nameChanged) {
        authUpdates.data = { name: profileData.name }
        hasUpdates = true
      }

      if (hasUpdates) {
        const { error } = await supabase.auth.updateUser(authUpdates)

        if (error) {
          throw new Error(error.message)
        }

        // Show appropriate success message
        if (nameChanged && emailChanged) {
          toast.success("Name updated successfully! Please also check both your current and new email addresses to confirm the email change.")
        } else if (emailChanged) {
          toast.success("Please check both your current and new email addresses to confirm the email change.")
        } else if (nameChanged) {
          toast.success("Name updated successfully!")
        }

        setIsEditingProfile(false)
        utils.auth.getUserProfile.invalidate()
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error(error instanceof Error ? error.message : "Failed to update profile")
    } finally {
      setIsSaving(false)
    }
  }

  const handleCancelEdit = () => {
    setIsEditingProfile(false)
    if (userProfile) {
      setProfileData({
        name: userProfile.name || "",
        email: userProfile.email || ""
      })
    }
  }


  const { mutate: postPilatesExperience } =
    api.onboarding.postPilatesExperience.useMutation({
      onSuccess: () => {
        toast.success("Your profile has been updated successfully.");
        setSelectedForm(null);
        utils.onboarding.getOnboardingData.invalidate();
      },
      onError: (error) => {
        console.error("Error updating form data:", error);
        toast.error("Failed to update your profile. Please try again.");
      },
    });

  const { mutate: postMotivation } = api.onboarding.postMotivation.useMutation({
    onSuccess: () => {
      toast.success("Your profile has been updated successfully.");
      setSelectedForm(null);
      utils.onboarding.getOnboardingData.invalidate();
    },
    onError: (error) => {
      console.error("Error updating form data:", error);
      toast.error("Failed to update your profile. Please try again.");
    },
  });

  const handleFormSubmit = async (
    formType: FormType,
    data: FormData[FormType],
  ) => {
    try {
      switch (formType) {
        case "healthCons": {
          const healthData = data as FormData["healthCons"];

          postHealthConsiderations({
            injuries: healthData.injuries ?? false,
            injuriesDetails: healthData.injuries
              ? (healthData.injuriesDetails ?? null)
              : null,
            recentSurgery: healthData.recentSurgery ?? false,
            surgeryDetails: healthData.recentSurgery
              ? (healthData.surgeryDetails ?? null)
              : null,
            chronicConditions: healthData.chronicConditions,
            otherHealthConditions: healthData.chronicConditions.includes(
              "Other",
            )
              ? (healthData.otherHealthConditions ?? null)
              : null,
            pregnancy: healthData.pregnancy ?? "Not applicable",
            pregnancyConsultedDoctor:
              healthData.pregnancyConsultedDoctor ?? false,
            pregnancyConsultedDoctorDetails:
              healthData.pregnancyConsultedDoctorDetails ?? null,
          });
          break;
        }

        case "pilates": {
          const pilatesData = data as FormData["pilates"];
          postPilatesExperience({
            fitnessLevel: pilatesData.fitnessLevel,
            pilatesExperience: pilatesData.pilatesExperience,
            pilatesDuration: pilatesData.pilatesExperience ? pilatesData.pilatesDuration ?? null : null,
            pilatesStyles: pilatesData.pilatesStyles,
            homeEquipment: pilatesData.homeEquipment,
            fitnessGoals: pilatesData.fitnessGoals,
            otherFitnessGoals: pilatesData.otherFitnessGoals,
            specificGoals: pilatesData.specificGoals ?? undefined
          })
          break
        }
        case "motivation": {
          const motivationData = data as FormData["motivation"];
          postMotivation({
            motivation: motivationData.motivation,
            progressTracking: motivationData.progressTracking,
            otherMotivation: motivationData.otherMotivation,
            otherProgressTracking: motivationData.otherProgressTracking,
          });
          break;
        }
      }
    } catch (error) {
      console.error("Error updating form data:", error);
      toast.error("Failed to update your profile. Please try again.");
    }
  };

  const handleLogout = async () => {
    try {
      await signOut()
      toast.success("Logged out successfully")
    } catch (error) {
      console.error("Error logging out:", error)
      toast.error("Failed to log out. Please try again.")
    }
  }

  // Clear all data mutation
  const { mutate: clearAllData } = api.auth.clearAllUserData.useMutation({
    onSuccess: (result) => {
      toast.success(result.message)
      setShowClearDataDialog(false)
      setConfirmationText("")
      // Invalidate all queries to refresh the UI
      utils.invalidate()
    },
    onError: (error) => {
      console.error("Error clearing data:", error)
      toast.error(error.message || "Failed to clear data. Please try again.")
    },
    onSettled: () => {
      setIsClearing(false)
    }
  })

  const handleClearAllData = () => {
    if (confirmationText !== "DELETE ALL MY DATA") {
      toast.error("Please type the confirmation text exactly as shown")
      return
    }

    setIsClearing(true)
    clearAllData({ confirmText: confirmationText })
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <ProfileSkeleton />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Profile</h2>
          <p className="text-gray-600">Manage your personal information and preferences</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleLogout}
          className="flex items-center gap-2 text-gray-600 hover:text-red-600 hover:border-red-200"
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>

      {/* User Profile Management Section */}
      <DefaultBox
        title="Account Information"
        description="Update your personal details"
        showViewAll={false}
      >
        {isLoadingProfile ? (
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded w-1/4"></div>
            <div className="h-10 bg-gray-200 rounded"></div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name" className="flex items-center gap-2">
                  <User className="h-4 w-4" />
                  Name
                </Label>
                {isEditingProfile ? (
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Enter your name"
                  />
                ) : (
                  <div className="p-2 border border-gray-200 rounded-md bg-gray-50">
                    {userProfile?.name || "Not set"}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="email" className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  Email
                </Label>
                {isEditingProfile ? (
                  <>
                    <Input
                      id="email"
                      type="email"
                      value={profileData.email}
                      onChange={(e) => setProfileData(prev => ({ ...prev, email: e.target.value }))}
                      placeholder="Enter your email"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      💡 Changing your email will send confirmation links to both your current and new email addresses
                    </p>
                  </>
                ) : (
                  <div className="p-2 border border-gray-200 rounded-md bg-gray-50">
                    {userProfile?.email || "Not set"}
                  </div>
                )}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              {isEditingProfile ? (
                <>
                  <Button
                    onClick={handleSaveProfile}
                    disabled={isSaving}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? "Saving..." : "Save Changes"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={handleCancelEdit}
                    disabled={isSaving}
                    className="flex items-center gap-2"
                  >
                    <X className="h-4 w-4" />
                    Cancel
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  onClick={handleEditProfile}
                  className="flex items-center gap-2"
                >
                  <Edit className="h-4 w-4" />
                  Edit Profile
                </Button>
              )}
            </div>
          </div>
        )}
      </DefaultBox>

      {/* Clear All Data Section */}
      <DefaultBox
        title="Danger Zone"
        description="Permanently delete all your data"
        showViewAll={false}
      >
        <div className="border border-red-200 rounded-lg p-6 bg-red-50">
          <div className="flex items-start gap-3">
            <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-red-900 mb-2">Clear All Data</h3>
              <p className="text-red-700 text-sm mb-4">
                This will permanently delete all of your data including:
              </p>
              <ul className="text-red-700 text-sm mb-4 list-disc list-inside space-y-1">
                <li>All onboarding information and preferences</li>
                <li>Workout plans and schedules</li>
                <li>Exercise tracking and progress data</li>
                <li>AI chat history and conversations</li>
                <li>Personal trainer interactions</li>
              </ul>
              <div className="bg-red-100 border border-red-200 rounded p-3 mb-4">
                <p className="text-red-800 text-sm font-medium">
                  ⚠️ This action cannot be undone. Your account will remain active, but all your data will be lost forever.
                </p>
              </div>
              <Button
                variant="destructive"
                onClick={() => setShowClearDataDialog(true)}
                className="flex items-center gap-2"
              >
                <Trash2 className="h-4 w-4" />
                Clear All My Data
              </Button>
            </div>
          </div>
        </div>
      </DefaultBox>

      {/* Clear Data Confirmation Dialog */}
      <Dialog open={showClearDataDialog} onOpenChange={setShowClearDataDialog}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-red-600">
              <AlertTriangle className="h-5 w-5" />
              Confirm Data Deletion
            </DialogTitle>
            <DialogDescription className="text-gray-600">
              This action will permanently delete ALL of your data and cannot be undone.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4">
            <div className="bg-red-50 border border-red-200 rounded p-3">
              <p className="text-red-800 text-sm font-medium mb-2">
                To confirm, type: <span className="font-mono bg-red-100 px-1 rounded">DELETE ALL MY DATA</span>
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmation">Confirmation</Label>
              <Input
                id="confirmation"
                value={confirmationText}
                onChange={(e) => setConfirmationText(e.target.value)}
                placeholder="Type the confirmation text..."
                className="font-mono"
              />
            </div>

            <div className="flex gap-2 pt-2">
              <Button
                variant="destructive"
                onClick={handleClearAllData}
                disabled={isClearing || confirmationText !== "DELETE ALL MY DATA"}
                className="flex-1"
              >
                {isClearing ? "Deleting..." : "Delete All Data"}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setShowClearDataDialog(false)
                  setConfirmationText("")
                }}
                disabled={isClearing}
                className="flex-1"
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      <DefaultBox
        title="Profile Settings"
        description="Complete your profile sections below"
        showViewAll={false}
      >
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
          {formSections.map((section, index) => (
            <motion.div
              key={section.type}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: index * 0.1 }}
            >
              <Card
                className="hover:border-brand-brown cursor-pointer rounded-xl border border-gray-200 bg-white p-4 transition-all hover:shadow-md"
                onClick={() => setSelectedForm(section.type)}
              >
                <div className="flex items-start space-x-4">
                  <div
                    className="rounded-lg p-2"
                    style={{ backgroundColor: `${section.color}20` }}
                  >
                    <div style={{ color: section.color }}>{section.icon}</div>
                  </div>
                  <div className="min-w-0 flex-1">
                    <h3 className="font-semibold text-gray-900">
                      {section.title}
                    </h3>
                    <p className="text-sm text-gray-500">
                      {section.description}
                    </p>
                    <div className="mt-2">
                      <Progress value={section.completion} className="h-2" />
                      <p className="mt-1 text-xs text-gray-500">
                        {section.completion}% Complete
                      </p>
                    </div>
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </DefaultBox>

      {selectedForm && formData && (
        <EditFormDialog
          open={!!selectedForm}
          onOpenChangeAction={(open: boolean) => !open && setSelectedForm(null)}
          formType={selectedForm}
          formData={formData[selectedForm]}
          onSubmitAction={(data) => handleFormSubmit(selectedForm, data)}
          formSections={formSections}
        />
      )}

      <DefaultBox
        title="App Settings"
        description="Configure your app preferences and notifications"
        showViewAll={false}
      >
        <div className="space-y-6">
          <PushNotificationManager />
        </div>
      </DefaultBox>
    </div>
  );
}
