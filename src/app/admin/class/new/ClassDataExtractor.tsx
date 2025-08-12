"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Button } from "~/components/ui/button";
import { Textarea } from "~/components/ui/textarea";
import { Badge } from "~/components/ui/badge";
import { MessageCircle, Send, Bot, User, CheckCircle, Loader2 } from "lucide-react";
import { api } from "~/trpc/react";

interface ClassDataExtractorProps {
  uploadData: {
    uploadId: string;
    assetId: string;
    playbackId: string;
  };
  onDataExtracted: (data: ExtractedData) => void;
}

interface ExtractedData {
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
  tags: string;
  exerciseSequence: string;
  instructor: string;
}

interface Message {
  role: "user" | "assistant";
  content: string;
}

export default function ClassDataExtractor({ uploadData, onDataExtracted }: ClassDataExtractorProps) {
  const [messages, setMessages] = useState<Message[]>([
    {
      role: "assistant",
      content: "Hi! I'm here to help extract information about your pilates class. Please paste any text you have about the class - description, notes, or just tell me about it in your own words. I'll organize it into the required format for the database."
    }
  ]);
  const [currentInput, setCurrentInput] = useState("");
  const [isExtracting, setIsExtracting] = useState(false);
  const [extractedData, setExtractedData] = useState<Partial<ExtractedData>>({});
  const [isComplete, setIsComplete] = useState(false);

  // Extract class data mutation
  const extractClassData = api.admin.extractClassData.useMutation({
    onSuccess: (response) => {
      setIsExtracting(false);
      
      // Add AI response to messages
      const aiResponse = response.followUpQuestion || "Great! I've extracted the information.";
      setMessages(prev => [...prev, { role: "assistant", content: aiResponse }]);
      
      // Update extracted data
      setExtractedData(prev => ({ ...prev, ...response.extractedData }));
      
      // Check if extraction is complete
      if (response.isComplete) {
        setIsComplete(true);
      }
    },
    onError: (error) => {
      setIsExtracting(false);
      setMessages(prev => [...prev, { 
        role: "assistant", 
        content: `Sorry, I encountered an error: ${error.message}. Please try again.` 
      }]);
    }
  });

  const handleSendMessage = async () => {
    if (!currentInput.trim() || isExtracting) return;

    const userMessage = currentInput.trim();
    setCurrentInput("");
    setIsExtracting(true);

    // Add user message to conversation
    const newMessages = [...messages, { role: "user" as const, content: userMessage }];
    setMessages(newMessages);

    // Extract conversation history for API call
    const conversationHistory = newMessages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Call AI extraction
    extractClassData.mutate({
      userInput: userMessage,
      conversationHistory
    });
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const handleProceed = () => {
    // Fill in any missing data with defaults and proceed
    const completeData: ExtractedData = {
      title: extractedData.title || "Untitled Class",
      summary: extractedData.summary || "Pilates class",
      description: extractedData.description || "A pilates class",
      difficulty: extractedData.difficulty || "intermediate",
      duration: extractedData.duration || 45,
      equipment: extractedData.equipment || "mat",
      pilatesStyle: extractedData.pilatesStyle || "mat pilates",
      classType: extractedData.classType || "strength",
      focusArea: extractedData.focusArea || "core",
      targetedMuscles: extractedData.targetedMuscles || "core",
      intensity: extractedData.intensity || 6,
      modifications: extractedData.modifications ?? true,
      beginnerFriendly: extractedData.beginnerFriendly ?? true,
      tags: extractedData.tags || "pilates",
      exerciseSequence: extractedData.exerciseSequence || "Various pilates exercises",
      instructor: extractedData.instructor || "Unknown",
    };

    onDataExtracted(completeData);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <MessageCircle className="h-5 w-5" />
          <span>AI Data Extraction</span>
        </CardTitle>
        <CardDescription>
          Chat with AI to extract and organize your class information
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Chat Messages */}
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex items-start space-x-3 ${
                message.role === "user" ? "justify-end" : "justify-start"
              }`}
            >
              {message.role === "assistant" && (
                <div className="flex-shrink-0">
                  <Bot className="h-6 w-6 text-blue-500" />
                </div>
              )}
              <div
                className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                  message.role === "user"
                    ? "bg-blue-500 text-white"
                    : "bg-gray-100 text-gray-900"
                }`}
              >
                <p className="text-sm">{message.content}</p>
              </div>
              {message.role === "user" && (
                <div className="flex-shrink-0">
                  <User className="h-6 w-6 text-gray-500" />
                </div>
              )}
            </div>
          ))}
          {isExtracting && (
            <div className="flex items-start space-x-3 justify-start">
              <div className="flex-shrink-0">
                <Bot className="h-6 w-6 text-blue-500" />
              </div>
              <div className="bg-gray-100 px-4 py-2 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span className="text-sm">Analyzing your input...</span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="space-y-3">
          <Textarea
            value={currentInput}
            onChange={(e) => setCurrentInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Paste your class description here or tell me about the class..."
            className="min-h-[100px]"
            disabled={isExtracting}
          />
          <div className="flex justify-between items-center">
            <p className="text-xs text-gray-500">
              Press Enter to send, Shift+Enter for new line
            </p>
            <Button
              onClick={handleSendMessage}
              disabled={!currentInput.trim() || isExtracting}
              size="sm"
            >
              <Send className="h-4 w-4 mr-2" />
              Send
            </Button>
          </div>
        </div>

        {/* Extracted Data Preview */}
        {Object.keys(extractedData).length > 0 && (
          <Card className="bg-gray-50">
            <CardHeader>
              <CardTitle className="text-lg">Extracted Information</CardTitle>
              <CardDescription>
                Information I've gathered so far from our conversation
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {extractedData.title && (
                  <div>
                    <Badge variant="secondary" className="mb-1">Title</Badge>
                    <p className="text-gray-700">{extractedData.title}</p>
                  </div>
                )}
                {extractedData.instructor && (
                  <div>
                    <Badge variant="secondary" className="mb-1">Instructor</Badge>
                    <p className="text-gray-700">{extractedData.instructor}</p>
                  </div>
                )}
                {extractedData.duration && (
                  <div>
                    <Badge variant="secondary" className="mb-1">Duration</Badge>
                    <p className="text-gray-700">{extractedData.duration} minutes</p>
                  </div>
                )}
                {extractedData.difficulty && (
                  <div>
                    <Badge variant="secondary" className="mb-1">Difficulty</Badge>
                    <p className="text-gray-700">{extractedData.difficulty}</p>
                  </div>
                )}
                {extractedData.focusArea && (
                  <div>
                    <Badge variant="secondary" className="mb-1">Focus Area</Badge>
                    <p className="text-gray-700">{extractedData.focusArea}</p>
                  </div>
                )}
                {extractedData.equipment && (
                  <div>
                    <Badge variant="secondary" className="mb-1">Equipment</Badge>
                    <p className="text-gray-700">{extractedData.equipment}</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end space-x-2">
          {isComplete ? (
            <Button onClick={handleProceed}>
              <CheckCircle className="h-4 w-4 mr-2" />
              Proceed to Review
            </Button>
          ) : (
            <Button
              variant="outline"
              onClick={handleProceed}
              disabled={Object.keys(extractedData).length === 0}
            >
              Skip & Use Current Data
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}