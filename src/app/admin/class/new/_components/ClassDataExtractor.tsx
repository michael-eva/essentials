"use client";

import React, { useState, useEffect } from "react";
import { api } from "@/trpc/react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Loader2, MessageSquare, Send, Edit3, CheckCircle, AlertCircle, Save, Clock } from "lucide-react";

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
  lastSaveTime
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

  const renderDataPreview = () => {
    if (!extractedData) return null;

    return (
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <span>Extracted Class Data</span>
          </CardTitle>
          <CardDescription>
            Review the extracted information before creating the class.
          </CardDescription>
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
          <div className="flex flex-col items-start">
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
            <Button onClick={onSubmit} disabled={isSubmitting}>
              {isSubmitting ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4 mr-2" />
              )}
              Create Pilates Class
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}