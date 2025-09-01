"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
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
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, MessageSquare, Send, Edit3, CheckCircle, AlertCircle, Save, Clock, Edit } from "lucide-react";

// Form schema for class data editing
const editClassDataSchema = z.object({
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
  thumbnailTimestamp: z.number().int().min(0, "Timestamp must be 0 or greater").default(35),
});

type EditClassDataForm = z.infer<typeof editClassDataSchema>;

interface ClassData {
  title: string;
  summary: string;
  description: string;
  difficulty: string;
  duration: number;
  equipment: string;
  pilatesStyle: string;
  classType: string;
  focusArea: string;
  targetedMuscles: string;
  intensity: number;
  modifications: boolean;
  beginnerFriendly: boolean;
  tags: string[];
  exerciseSequence: string[];
  instructor: string;
  muxPlaybackId?: string;
  muxAssetId?: string;
  thumbnailTimestamp?: number;
}

interface ClassDataExtractorProps {
  onDataExtracted: (data: ClassData) => void;
  onSubmit: () => void;
  isSubmitting: boolean;
  extractedData: ClassData | null;
  onChatUpdate?: (chatHistory: ChatMessage[]) => void;
  initialChatHistory?: Array<{
    role: "user" | "assistant";
    content: string;
    timestamp: string;
  }>;
  onSaveDraft?: () => void;
  isSavingDraft?: boolean;
  videoData?: any;
  lastSaveTime?: Date | null;
  videoUploadStatus?: "idle" | "uploading" | "processing" | "complete" | "error";
}

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

export function ClassDataExtractor({
  onDataExtracted,
  onSubmit,
  isSubmitting,
  extractedData,
  onChatUpdate,
  initialChatHistory = [],
  onSaveDraft,
  isSavingDraft = false,
  videoData,
  lastSaveTime,
  videoUploadStatus = "idle"
}: ClassDataExtractorProps) {
  const [userInput, setUserInput] = useState("");
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() =>
    initialChatHistory.map(msg => ({
      ...msg,
      timestamp: new Date(msg.timestamp)
    }))
  );
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractionComplete, setExtractionComplete] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);

  // Form setup for editing
  const form = useForm<EditClassDataForm>({
    resolver: zodResolver(editClassDataSchema),
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
    },
  });

  // Update extractionComplete when extractedData changes
  useEffect(() => {
    setExtractionComplete(!!extractedData);
  }, [extractedData]);

  // Reset chat messages when initialChatHistory changes (e.g., when form is reset)
  useEffect(() => {
    setChatMessages(
      initialChatHistory.map(msg => ({
        ...msg,
        timestamp: new Date(msg.timestamp)
      }))
    );
  }, [initialChatHistory]);

  const extractDataMutation = api.admin.extractClassData.useMutation({
    onSuccess: (response) => {
      setIsExtracting(false);

      // Add AI response to chat
      const newMessage = {
        role: "assistant" as const,
        content: response.message,
        timestamp: new Date(),
      };

      const updated = [...chatMessages, newMessage];
      setChatMessages(updated);
      onChatUpdate?.(updated);

      // If data extraction is complete, update parent
      if (response.extractedData) {
        onDataExtracted(response.extractedData);
        setExtractionComplete(true);
      }
    },
    onError: (error) => {
      setIsExtracting(false);
      const errorMessage = {
        role: "assistant" as const,
        content: `Sorry, I encountered an error: ${error.message}. Please try again.`,
        timestamp: new Date(),
      };

      const updated = [...chatMessages, errorMessage];
      setChatMessages(updated);
      onChatUpdate?.(updated);
    },
  });

  const handleSendMessage = () => {
    if (!userInput.trim()) return;

    // Add user message to chat
    const newUserMessage: ChatMessage = {
      role: "user",
      content: userInput.trim(),
      timestamp: new Date(),
    };

    const updated = [...chatMessages, newUserMessage];
    setChatMessages(updated);
    onChatUpdate?.(updated);
    setIsExtracting(true);

    // Send to AI for processing
    extractDataMutation.mutate({
      userInput: userInput.trim(),
      chatHistory: chatMessages,
      existingData: extractedData || undefined,
    });

    setUserInput("");
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const handleEditData = () => {
    if (!extractedData) return;

    // Populate form with existing data
    form.reset({
      title: extractedData.title,
      summary: extractedData.summary,
      description: extractedData.description,
      difficulty: extractedData.difficulty,
      duration: extractedData.duration,
      equipment: extractedData.equipment,
      pilatesStyle: extractedData.pilatesStyle,
      classType: extractedData.classType,
      focusArea: extractedData.focusArea,
      targetedMuscles: extractedData.targetedMuscles,
      intensity: extractedData.intensity,
      modifications: extractedData.modifications,
      beginnerFriendly: extractedData.beginnerFriendly,
      tags: extractedData.tags.join(", "),
      exerciseSequence: extractedData.exerciseSequence.join(", "),
      instructor: extractedData.instructor,
      thumbnailTimestamp: extractedData.thumbnailTimestamp ?? 35,
    });

    setShowEditDialog(true);
  };

  const handleSaveEdit = (data: EditClassDataForm) => {
    // Convert form data back to ClassData format
    const updatedData: ClassData = {
      ...extractedData!,
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
    };

    // Update the parent component with new data
    onDataExtracted(updatedData);
    setShowEditDialog(false);
  };

  const handleCloseEditDialog = () => {
    setShowEditDialog(false);
    form.reset();
  };

  const renderDataPreview = () => {
    if (!extractedData) return null;

    return (
      <Card className="mt-6">
        <CardHeader>
          <div className="flex justify-between items-start">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span>Extracted Class Data</span>
              </CardTitle>
              <CardDescription>
                Review the extracted information before creating the class.
              </CardDescription>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleEditData}
              className="flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700">Title</label>
              <p className="text-sm text-gray-900 border-b border-gray-200 pb-1">
                {extractedData.title}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Instructor</label>
              <p className="text-sm text-gray-900 border-b border-gray-200 pb-1">
                {extractedData.instructor}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Duration</label>
              <p className="text-sm text-gray-900 border-b border-gray-200 pb-1">
                {extractedData.duration} minutes
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Difficulty</label>
              <p className="text-sm text-gray-900 border-b border-gray-200 pb-1">
                {extractedData.difficulty}
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Intensity</label>
              <p className="text-sm text-gray-900 border-b border-gray-200 pb-1">
                {extractedData.intensity}/10
              </p>
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700">Equipment</label>
              <p className="text-sm text-gray-900 border-b border-gray-200 pb-1">
                {extractedData.equipment}
              </p>
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Summary</label>
            <p className="text-sm text-gray-900 border-b border-gray-200 pb-1">
              {extractedData.summary}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Description</label>
            <p className="text-sm text-gray-900 border-b border-gray-200 pb-1">
              {extractedData.description}
            </p>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Tags</label>
            <div className="flex flex-wrap gap-2 mt-1">
              {extractedData.tags.map((tag, index) => (
                <Badge key={index} variant="outline" className="text-xs">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-gray-700">Exercise Sequence</label>
            <div className="border border-gray-200 rounded p-2 mt-1">
              {extractedData.exerciseSequence.map((exercise, index) => (
                <div key={index} className="text-sm text-gray-900 mb-1">
                  {index + 1}. {exercise}
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center space-x-4 text-sm">
            <span className={`flex items-center space-x-1 ${extractedData.beginnerFriendly ? "text-green-600" : "text-gray-600"
              }`}>
              <CheckCircle className="w-4 h-4" />
              <span>Beginner Friendly</span>
            </span>
            <span className={`flex items-center space-x-1 ${extractedData.modifications ? "text-green-600" : "text-gray-600"
              }`}>
              <CheckCircle className="w-4 h-4" />
              <span>Includes Modifications</span>
            </span>
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      {/* Chat Interface */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <MessageSquare className="w-5 h-5" />
            <span>AI Class Data Assistant</span>
          </CardTitle>
          <CardDescription>
            Paste information about your pilates class below. I&apos;ll extract and organize it into the required format.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Chat Messages */}
          {chatMessages.length > 0 && (
            <div className="mb-4 max-h-96 overflow-y-auto border rounded-lg p-4 bg-gray-50 space-y-3">
              {chatMessages.map((message, index) => (
                <div key={index} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                  <div className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${message.role === "user"
                    ? "bg-blue-600 text-white"
                    : "bg-white text-gray-900 shadow-sm border"
                    }`}>
                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                    <p className={`text-xs mt-1 ${message.role === "user" ? "text-blue-100" : "text-gray-500"
                      }`}>
                      {formatTime(message.timestamp)}
                    </p>
                  </div>
                </div>
              ))}
              {isExtracting && (
                <div className="flex justify-start">
                  <div className="bg-white text-gray-900 shadow-sm border max-w-xs lg:max-w-md px-4 py-2 rounded-lg">
                    <div className="flex items-center space-x-2">
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span className="text-sm">Thinking...</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Input Area */}
          <div className="space-y-4">
            <Textarea
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyPress={handleKeyPress}
              placeholder={
                chatMessages.length === 0
                  ? "Paste your class description, outline, or any information about the pilates class here. For example:\n\n'This is a 45-minute intermediate pilates class focusing on core strength with Emma. Uses mat and small ball. Targets abs, glutes, and back muscles...'"
                  : "Ask questions or provide additional information..."
              }
              className="min-h-[120px] resize-none"
              disabled={isExtracting}
            />
            <div className="flex justify-between items-center">
              <p className="text-xs text-gray-500">
                Press Shift+Enter for new line, Enter to send
              </p>
              <Button
                onClick={handleSendMessage}
                disabled={!userInput.trim() || isExtracting}
                size="sm"
                className="flex items-center space-x-2"
              >
                {isExtracting ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>{isExtracting ? "Processing..." : "Send"}</span>
              </Button>
            </div>
          </div>

          {/* Initial Instructions */}
          {chatMessages.length === 0 && (
            <Alert className="mt-4">
              <MessageSquare className="h-4 w-4" />
              <AlertDescription>
                <strong>How it works:</strong> Paste any information you have about your pilates class.
                I&apos;ll ask questions to gather missing details and organize everything into the proper format
                for your class database.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Data Preview */}
      {renderDataPreview()}

      {/* Submit Button */}
      {extractedData && (
        <div className="flex justify-between items-center">
          {/* Save Draft Button */}
          <div className="flex gap-2 items-start">
            <Button
              onClick={onSaveDraft}
              variant="outline"
              disabled={isSavingDraft || (!videoData && !extractedData && chatMessages.length === 0)}
              className="flex items-center space-x-2"
            >
              {isSavingDraft ? (
                <>
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  <span>Saving...</span>
                </>
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  <span>Save to Drafts</span>
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleEditData}
              className="flex items-center space-x-2"
            >
              <Edit className="w-4 h-4" />
              <span>Edit</span>
            </Button>
            {lastSaveTime && !isSavingDraft && (
              <div className="flex items-center space-x-1 text-xs text-gray-500 mt-1">
                <Clock className="w-3 h-3" />
                <span>
                  Last synced {lastSaveTime.toLocaleTimeString([], {
                    hour: '2-digit',
                    minute: '2-digit'
                  })} (database)
                </span>
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex space-x-4">
            {/* {extractionComplete && (
              <Button variant="outline" onClick={() => setExtractionComplete(false)}>
                <Edit3 className="w-4 h-4 mr-2" />
                Make Changes
              </Button>
            )} */}
            <Button 
              onClick={onSubmit} 
              disabled={isSubmitting || videoUploadStatus !== "complete"}
            >
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : videoUploadStatus === "uploading" || videoUploadStatus === "processing" ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              {isSubmitting ? "Creating..." : 
               videoUploadStatus === "uploading" ? "Video Uploading..." :
               videoUploadStatus === "processing" ? "Processing Video..." :
               videoUploadStatus === "error" ? "Video Upload Failed" :
               videoUploadStatus === "idle" ? "Upload Video First" :
               "Create Pilates Class"}
            </Button>
          </div>
        </div>
      )}

      {/* Edit Class Data Dialog */}
      <Dialog open={showEditDialog} onOpenChange={handleCloseEditDialog}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Edit Class Data</DialogTitle>
            <DialogDescription>
              Update the class information below. All fields are required.
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={form.handleSubmit(handleSaveEdit)} className="space-y-6">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  {...form.register("title")}
                  placeholder="Enter class title"
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
                placeholder="Brief summary of the class"
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
                placeholder="Detailed description of the class"
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
                <Label htmlFor="thumbnailTimestamp">Thumbnail Timestamp (seconds) *</Label>
                <Input
                  id="thumbnailTimestamp"
                  type="number"
                  min="0"
                  {...form.register("thumbnailTimestamp", { valueAsNumber: true })}
                  placeholder="e.g., 35"
                />
                {form.formState.errors.thumbnailTimestamp && (
                  <p className="text-sm text-red-600 mt-1">{form.formState.errors.thumbnailTimestamp.message}</p>
                )}
                <p className="text-xs text-gray-500 mt-1">
                  Timestamp in seconds for the video thumbnail
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
              onClick={form.handleSubmit(handleSaveEdit)}
              disabled={!form.formState.isDirty}
            >
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}