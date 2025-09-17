import { useState, useRef, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Send, Bot, User, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import LoadingSpinner from "@/components/LoadingSpinner";
import { toast } from "@/hooks/use-toast";
import { geminiService } from "@/services/geminiService";

interface Message {
  id: string;
  type: "user" | "bot";
  content: string;
  evidence?: Array<{ chunk_id: number; snippet: string }>;
  timestamp: Date;
}

const Chat = () => {
  const { docId } = useParams();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestedQuestions = [
    "Can the non-compete clause be enforced in Indian courts?",
    "What happens to my personal projects under the IP clause?", 
    "Are there any exceptions to the intellectual property assignment?",
    "Can I negotiate the non-compete period?"
  ];

  useEffect(() => {
    // Add welcome message
    setMessages([{
      id: "welcome",
      type: "bot",
      content: "Hi! I'm LegalEase AI. I've analyzed your document and I'm ready to answer any questions you have about its contents, legal implications, or Indian law context. What would you like to know?",
      timestamp: new Date()
    }]);
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSendMessage = async (question?: string) => {
    const messageText = question || inputValue.trim();
    if (!messageText) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      type: "user",
      content: messageText,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      // Use Gemini service for chat
      const response = await geminiService.chatWithDocument({
        docId: docId || 'unknown',
        question: messageText,
        context: 'Legal document analysis context'
      });

      const botMessage: Message = {
        id: (Date.now() + 1).toString(),
        type: "bot", 
        content: response.answer,
        evidence: response.evidence,
        timestamp: new Date()
      };

      setMessages(prev => [...prev, botMessage]);
    } catch (error) {
      console.error('Chat error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to get response. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">
            Ask the Document
          </h1>
          <p className="text-muted-foreground">
            Get instant answers about your legal document from our AI assistant
          </p>
        </div>

        {/* Suggested Questions */}
        {messages.length <= 1 && (
          <Card className="card-glass mb-6">
            <CardContent className="p-6">
              <h3 className="font-semibold text-foreground mb-4">
                Suggested Questions
              </h3>
              <div className="grid md:grid-cols-2 gap-3">
                {suggestedQuestions.map((question, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="text-left justify-start h-auto p-3 hover:bg-saffron/10 hover:border-saffron/50"
                    onClick={() => handleSendMessage(question)}
                  >
                    <div className="text-sm leading-relaxed">
                      {question}
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Chat Messages */}
        <Card className="card-glass mb-6">
          <CardContent className="p-0">
            <div className="h-96 overflow-y-auto p-6 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex items-start gap-3 ${
                    message.type === "user" ? "flex-row-reverse" : ""
                  }`}
                >
                  {/* Avatar */}
                  <div className={`
                    flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center
                    ${message.type === "user" 
                      ? "bg-saffron text-saffron-foreground" 
                      : "bg-primary text-primary-foreground"
                    }
                  `}>
                    {message.type === "user" ? (
                      <User className="h-4 w-4" />
                    ) : (
                      <Bot className="h-4 w-4" />
                    )}
                  </div>

                  {/* Message Content */}
                  <div className={`
                    flex-1 max-w-[80%] space-y-2
                    ${message.type === "user" ? "text-right" : ""}
                  `}>
                    <div className={`
                      inline-block px-4 py-3 rounded-2xl
                      ${message.type === "user"
                        ? "chat-user"
                        : "chat-bot border"
                      }
                    `}>
                      <p className="text-sm leading-relaxed">
                        {message.content}
                      </p>
                    </div>

                    {/* Evidence Snippets */}
                    {message.evidence && message.evidence.length > 0 && (
                      <div className="space-y-2 text-left">
                        <p className="text-xs text-muted-foreground font-medium">
                          Related excerpts from your document:
                        </p>
                        {message.evidence.map((evidence, index) => (
                          <div
                            key={index}
                            className="bg-muted/30 rounded-lg p-3 border-l-4 border-saffron/30"
                          >
                            <div className="flex items-center gap-2 mb-1">
                              <FileText className="h-3 w-3 text-muted-foreground" />
                              <Badge variant="outline" className="text-xs">
                                Excerpt {evidence.chunk_id}
                              </Badge>
                            </div>
                            <p className="text-xs text-muted-foreground italic">
                              "{evidence.snippet}"
                            </p>
                          </div>
                        ))}
                      </div>
                    )}

                    <p className="text-xs text-muted-foreground">
                      {message.timestamp.toLocaleTimeString()}
                    </p>
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex items-start gap-3">
                  <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                    <Bot className="h-4 w-4" />
                  </div>
                  <div className="chat-bot border inline-block px-4 py-3 rounded-2xl">
                    <LoadingSpinner size="sm" />
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          </CardContent>
        </Card>

        {/* Input Area */}
        <Card className="card-glass">
          <CardContent className="p-4">
            <div className="flex gap-3">
              <Input
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask a question about your document..."
                className="flex-1"
                disabled={isLoading}
              />
              <Button
                onClick={() => handleSendMessage()}
                disabled={!inputValue.trim() || isLoading}
                className="btn-saffron"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Chat;