"use client";
import React, { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import { TimeInput } from "@/components/ui/time-input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Edit,
  Trash2,
  ExternalLink,
  Play,
  Search,
  Image as ImageIcon
} from "lucide-react";
import Image from "next/image";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";

const PAGE_SIZE = 12;

// Form schema for video editing
const editVideoSchema = z.object({
  title: z.string().min(1, "Title is required"),
  summary: z.string().min(1, "Summary is required"),
  description: z.string().min(1, "Description is required"),
  difficulty: z.string().min(1, "Difficulty is required"),
  duration: z.number().int().positive("Duration must be a positive number"),
  equipment: z.string().min(1, "Equipment is required"),
  pilatesStyle: z.string().min(1, "Pilates style is required"),
  classType: z.string().min(1, "Class type is required"),
  focusArea: z.string().min(1, "Focus area is required"),
  targetedMuscles: z.string().min(1, "Targeted muscles is required"),
  intensity: z.number().int().min(1).max(10, "Intensity must be between 1-10"),
  modifications: z.boolean(),
  beginnerFriendly: z.boolean(),
  tags: z.string().min(1, "Tags are required"),
  exerciseSequence: z.string().min(1, "Exercise sequence is required"),
  instructor: z.string().min(1, "Instructor is required"),
  thumbnailTimestamp: z.number().int().min(0, "Timestamp must be 0 or greater"),
});

type EditVideoForm = z.infer<typeof editVideoSchema>;


export default function AdminVideosPage() {
  const router = useRouter();
  const [page, setPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("all");
  const [selectedInstructor, setSelectedInstructor] = useState("all");
  const [deleteVideoId, setDeleteVideoId] = useState<string | null>(null);
  const [editVideoId, setEditVideoId] = useState<string | null>(null);
  const [editVideoData, setEditVideoData] = useState<any>(null);

  // API calls
  const {
    data: videosData,
    isLoading,
    refetch
  } = api.admin.getVideos.useQuery({
    page,
    limit: PAGE_SIZE,
    difficulty: selectedDifficulty === "all" ? undefined : selectedDifficulty,
    instructor: selectedInstructor === "all" ? undefined : selectedInstructor,
  });

  const deleteVideoMutation = api.admin.deleteVideo.useMutation({
    onSuccess: () => {
      refetch();
      setDeleteVideoId(null);
    },
  });

  const updateVideoMutation = api.admin.updateVideo.useMutation({
    onSuccess: () => {
      refetch();
      setEditVideoId(null);
      setEditVideoData(null);
      form.reset();
    },
  });

  // Form setup
  const form = useForm<EditVideoForm>({
    resolver: zodResolver(editVideoSchema),
    defaultValues: {
      title: "",
      summary: "",
      description: "",
      difficulty: "",
      duration: 0,
      equipment: "",
      pilatesStyle: "",
      classType: "",
      focusArea: "",
      targetedMuscles: "",
      intensity: 1,
      modifications: true,
      beginnerFriendly: true,
      tags: "",
      exerciseSequence: "",
      instructor: "",
      thumbnailTimestamp: 35,
    },
  });

  // Filter videos by search term
  const filteredVideos = videosData?.items?.filter(video =>
    video.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.instructor?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    video.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
  ) || [];

  const handleDeleteVideo = (videoId: string) => {
    setDeleteVideoId(videoId);
  };

  const confirmDelete = () => {
    if (deleteVideoId) {
      deleteVideoMutation.mutate({ id: deleteVideoId });
    }
  };

  const handleEditVideo = (videoId: string) => {
    const video = filteredVideos.find(v => v.id === videoId);
    if (video) {
      setEditVideoId(videoId);
      setEditVideoData(video);

      // Reset form with video data
      form.reset({
        title: video.title,
        summary: video.summary,
        description: video.description,
        difficulty: video.difficulty,
        duration: video.duration,
        equipment: video.equipment,
        pilatesStyle: video.pilatesStyle,
        classType: video.classType,
        focusArea: video.focusArea,
        targetedMuscles: video.targetedMuscles,
        intensity: video.intensity,
        modifications: video.modifications,
        beginnerFriendly: video.beginnerFriendly,
        tags: video.tags.join(", "),
        exerciseSequence: video.exerciseSequence.join(", "),
        instructor: video.instructor || "",
        thumbnailTimestamp: video.thumbnailTimestamp ?? 35,
      });
    }
  };

  const onSubmitEdit = (data: EditVideoForm) => {
    if (!editVideoId) return;

    updateVideoMutation.mutate({
      id: editVideoId,
      title: data.title,
      summary: data.summary,
      description: data.description,
      difficulty: data.difficulty,
      duration: data.duration,
      equipment: data.equipment,
      pilatesStyle: data.pilatesStyle,
      classType: data.classType,
      focusArea: data.focusArea,
      targetedMuscles: data.targetedMuscles,
      intensity: data.intensity,
      modifications: data.modifications,
      beginnerFriendly: data.beginnerFriendly,
      tags: data.tags.split(",").map(tag => tag.trim()).filter(tag => tag.length > 0),
      exerciseSequence: data.exerciseSequence.split(",").map(ex => ex.trim()).filter(ex => ex.length > 0),
      instructor: data.instructor,
      thumbnailTimestamp: data.thumbnailTimestamp,
    });
  };

  const handleCloseEditDialog = () => {
    setEditVideoId(null);
    setEditVideoData(null);
    form.reset();
  };

  const handleViewVideo = (videoId: string) => {
    // Navigate to the user-facing video page
    router.push(`/dashboard/pilates-video/${videoId}`);
  };

  const formatDuration = (minutes: number) => {
    if (minutes < 60) {
      return `${minutes}m`;
    }
    const hours = Math.floor(minutes / 60);
    const remainingMinutes = minutes % 60;
    return `${hours}h ${remainingMinutes}m`;
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date));
  };

  // Helper function to capitalize first letter of each tag
  const capitalizeTag = (tag: string): string => {
    if (!tag || tag.length === 0) return tag;
    return tag.charAt(0).toUpperCase() + tag.slice(1).toLowerCase();
  };

  // Get unique values for filters
  const uniqueDifficulties = [...new Set(videosData?.items?.map(v => v.difficulty) || [])];
  const uniqueInstructors = [...new Set(videosData?.items?.map(v => v.instructor).filter(Boolean) || [])];

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-6">Live Videos</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {[...Array(8)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <div className="h-48 bg-gray-200 rounded-t-lg"></div>
                <CardHeader>
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                </CardHeader>
                <CardContent>
                  <div className="h-20 bg-gray-200 rounded"></div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="bg-white shadow rounded-lg p-6">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-medium text-gray-900">Live Videos</h2>
            <p className="text-sm text-gray-500 mt-1">
              {videosData?.total || 0} published videos
            </p>
          </div>
          <Button
            variant="outline"
            onClick={() => router.push("/admin")}
          >
            Back to Admin Dashboard
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Search videos, instructors, or tags..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by difficulty" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Difficulties</SelectItem>
              {uniqueDifficulties.map((difficulty) => (
                <SelectItem key={difficulty} value={difficulty}>
                  {difficulty}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={selectedInstructor} onValueChange={setSelectedInstructor}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filter by instructor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Instructors</SelectItem>
              {uniqueInstructors.map((instructor) => (
                <SelectItem key={instructor} value={instructor!}>
                  {instructor}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Videos Grid */}
        {filteredVideos.length === 0 ? (
          <div className="text-center py-12">
            <Play className="mx-auto h-12 w-12 text-gray-400" />
            <h3 className="mt-2 text-sm font-medium text-gray-900">No videos found</h3>
            <p className="mt-1 text-sm text-gray-500">
              {searchTerm || selectedDifficulty !== "all" || selectedInstructor !== "all"
                ? "Try adjusting your search or filters."
                : "Upload your first video to get started."
              }
            </p>
            {(!searchTerm && selectedDifficulty === "all" && selectedInstructor === "all") && (
              <div className="mt-6">
                <Button onClick={() => router.push("/admin/class/new")}>
                  Upload New Video
                </Button>
              </div>
            )}
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {filteredVideos.map((video) => (
                <Card key={video.id} className="transition-all hover:shadow-lg overflow-hidden">
                  {/* Video Thumbnail */}
                  <div className="relative h-48 bg-gray-100">
                    {video.mux_playback_id ? (
                      <Image
                        src={`https://image.mux.com/${video.mux_playback_id}/thumbnail.png?width=400&height=300&fit_mode=smartcrop&time=${video.thumbnailTimestamp || 35}`}
                        alt={video.title}
                        fill
                        className="object-cover"
                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                      />
                    ) : (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <ImageIcon className="mx-auto h-12 w-12 text-gray-400 mb-2" />
                          <p className="text-xs text-gray-500">No thumbnail</p>
                        </div>
                      </div>
                    )}
                    {/* Play button overlay */}
                    <div className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity bg-black bg-opacity-20">
                      <div className="bg-white bg-opacity-90 rounded-full p-3">
                        <Play className="h-6 w-6 text-gray-800" />
                      </div>
                    </div>
                  </div>

                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1 min-w-0">
                        <CardTitle className="text-sm font-medium truncate">
                          {video.title}
                        </CardTitle>
                        <CardDescription className="text-xs mt-1">
                          {video.instructor} • {formatDuration(video.duration)}
                        </CardDescription>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => handleViewVideo(video.id)}
                          title="View on site"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0"
                          onClick={() => handleEditVideo(video.id)}
                          title="Edit video"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 w-7 p-0 text-red-600 hover:text-red-700"
                          onClick={() => handleDeleteVideo(video.id)}
                          title="Delete video"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      <div className="flex flex-wrap gap-1">
                        <Badge variant="outline" className="text-xs">
                          {video.difficulty}
                        </Badge>
                        <Badge variant="outline" className="text-xs">
                          {video.classType}
                        </Badge>
                      </div>
                      <p className="text-xs text-gray-600 line-clamp-2">
                        {video.summary}
                      </p>
                      <div className="flex justify-between items-center text-xs text-gray-500">
                        <span>Created {formatDate(video.createdAt)}</span>
                        <span>Intensity {video.intensity}/10</span>
                      </div>
                      {video.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {video.tags.slice(0, 3).map((tag, index) => (
                            <span key={index} className="text-xs bg-gray-100 px-2 py-1 rounded">
                              {capitalizeTag(tag)}
                            </span>
                          ))}
                          {video.tags.length > 3 && (
                            <span className="text-xs text-gray-500">
                              +{video.tags.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {videosData && videosData.total > PAGE_SIZE && (
              <div className="flex justify-center items-center gap-2 mt-8">
                <Button
                  variant="outline"
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                >
                  Previous
                </Button>
                <span className="text-sm text-gray-600">
                  Page {page} of {Math.ceil(videosData.total / PAGE_SIZE)}
                </span>
                <Button
                  variant="outline"
                  onClick={() => setPage(p => p + 1)}
                  disabled={page >= Math.ceil(videosData.total / PAGE_SIZE)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={!!deleteVideoId} onOpenChange={() => setDeleteVideoId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Video</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this video? This will permanently remove the video
              from your library and delete the associated Mux assets. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeleteVideoId(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={deleteVideoMutation.isPending}
            >
              {deleteVideoMutation.isPending ? "Deleting..." : "Delete Video"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Video Dialog */}
      <Dialog open={!!editVideoId} onOpenChange={handleCloseEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Video</DialogTitle>
            <DialogDescription>
              Update the video information below. All fields are required.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(onSubmitEdit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  {...form.register("title")}
                  placeholder="Enter video title"
                />
                {form.formState.errors.title && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.title.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="instructor">Instructor *</Label>
                <Input
                  id="instructor"
                  {...form.register("instructor")}
                  placeholder="Enter instructor name"
                />
                {form.formState.errors.instructor && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.instructor.message}</p>
                )}
              </div>
            </div>

            {/* Summary */}
            <div>
              <Label htmlFor="summary">Summary *</Label>
              <Textarea
                id="summary"
                {...form.register("summary")}
                placeholder="Brief summary of the video"
                rows={2}
              />
              {form.formState.errors.summary && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.summary.message}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                {...form.register("description")}
                placeholder="Detailed description of the video"
                rows={4}
              />
              {form.formState.errors.description && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.description.message}</p>
              )}
            </div>

            {/* Class Details */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="difficulty">Difficulty *</Label>
                <Select value={form.watch("difficulty")} onValueChange={(value) => form.setValue("difficulty", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select difficulty" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Beginner">Beginner</SelectItem>
                    <SelectItem value="Intermediate">Intermediate</SelectItem>
                    <SelectItem value="Advanced">Advanced</SelectItem>
                  </SelectContent>
                </Select>
                {form.formState.errors.difficulty && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.difficulty.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="duration">Duration (minutes) *</Label>
                <Input
                  id="duration"
                  type="number"
                  {...form.register("duration", { valueAsNumber: true })}
                  placeholder="e.g., 45"
                />
                {form.formState.errors.duration && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.duration.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="intensity">Intensity (1-10) *</Label>
                <Input
                  id="intensity"
                  type="number"
                  min="1"
                  max="10"
                  {...form.register("intensity", { valueAsNumber: true })}
                  placeholder="e.g., 7"
                />
                {form.formState.errors.intensity && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.intensity.message}</p>
                )}
              </div>
            </div>

            {/* Thumbnail Timestamp */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <Label htmlFor="thumbnailTimestamp">Thumbnail Timestamp (mm:ss) *</Label>
                <TimeInput
                  id="thumbnailTimestamp"
                  value={form.watch("thumbnailTimestamp")}
                  onChange={(seconds) => form.setValue("thumbnailTimestamp", seconds)}
                  error={!!form.formState.errors.thumbnailTimestamp}
                />
                {form.formState.errors.thumbnailTimestamp && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.thumbnailTimestamp.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Time in video for thumbnail image (e.g., 01:25)
                </p>
              </div>
            </div>

            {/* Categories */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="pilatesStyle">Pilates Style *</Label>
                <Input
                  id="pilatesStyle"
                  {...form.register("pilatesStyle")}
                  placeholder="e.g., Classical, Contemporary"
                />
                {form.formState.errors.pilatesStyle && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.pilatesStyle.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="classType">Class Type *</Label>
                <Input
                  id="classType"
                  {...form.register("classType")}
                  placeholder="e.g., Core Focus, Full Body"
                />
                {form.formState.errors.classType && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.classType.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="focusArea">Focus Area *</Label>
                <Input
                  id="focusArea"
                  {...form.register("focusArea")}
                  placeholder="e.g., Core, Full Body, Lower Body"
                />
                {form.formState.errors.focusArea && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.focusArea.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="targetedMuscles">Targeted Muscles *</Label>
                <Input
                  id="targetedMuscles"
                  {...form.register("targetedMuscles")}
                  placeholder="e.g., Core, Glutes, Back"
                />
                {form.formState.errors.targetedMuscles && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.targetedMuscles.message}</p>
                )}
              </div>
            </div>

            {/* Equipment */}
            <div>
              <Label htmlFor="equipment">Equipment *</Label>
              <Input
                id="equipment"
                {...form.register("equipment")}
                placeholder="e.g., Mat, Mat and small ball, No equipment"
              />
              {form.formState.errors.equipment && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.equipment.message}</p>
              )}
            </div>

            {/* Tags and Exercise Sequence */}
            <div className="grid grid-cols-1 gap-4">
              <div>
                <Label htmlFor="tags">Tags * (comma-separated)</Label>
                <Input
                  id="tags"
                  {...form.register("tags")}
                  placeholder="e.g., beginner, core, flexibility"
                />
                {form.formState.errors.tags && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.tags.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="exerciseSequence">Exercise Sequence * (comma-separated)</Label>
                <Textarea
                  id="exerciseSequence"
                  {...form.register("exerciseSequence")}
                  placeholder="e.g., Warm-up, Plank series, Cool down"
                  rows={3}
                />
                {form.formState.errors.exerciseSequence && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.exerciseSequence.message}</p>
                )}
              </div>
            </div>

            {/* Checkboxes */}
            <div className="flex flex-col gap-4">
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="modifications"
                  checked={form.watch("modifications")}
                  onCheckedChange={(checked) => form.setValue("modifications", checked === true)}
                />
                <Label htmlFor="modifications">Includes modifications</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="beginnerFriendly"
                  checked={form.watch("beginnerFriendly")}
                  onCheckedChange={(checked) => form.setValue("beginnerFriendly", checked === true)}
                />
                <Label htmlFor="beginnerFriendly">Beginner friendly</Label>
              </div>
            </div>
          </form>

          <DialogFooter>
            <Button variant="outline" onClick={handleCloseEditDialog}>
              Cancel
            </Button>
            <Button
              onClick={form.handleSubmit(onSubmitEdit)}
              disabled={updateVideoMutation.isPending || !form.formState.isDirty}
            >
              {updateVideoMutation.isPending ? "Saving..." : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}