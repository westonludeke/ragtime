'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Bot, User, Upload, FileText, Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
  sources?: Array<{
    id: number;
    content: string;
    metadata: any;
  }>;
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/query', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ query: input.trim() }),
      });

      const data = await response.json();

      if (data.success) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: data.data.answer,
          timestamp: new Date().toISOString(),
          sources: data.data.sources,
        };
        setMessages(prev => [...prev, assistantMessage]);
      } else {
        throw new Error(data.error || 'Failed to get response');
      }
    } catch (error) {
      console.error('Error:', error);
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: 'Sorry, I encountered an error while processing your question. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        const uploadMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `✅ Successfully uploaded and processed "${file.name}" (${data.data.chunksCount} chunks created)`,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, uploadMessage]);
      } else {
        throw new Error(data.error || 'Upload failed');
      }
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '❌ Failed to upload file. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  const ingestLangChainDocs = async () => {
    setIsUploading(true);
    try {
      const response = await fetch('/api/ingest/langchain-docs', {
        method: 'POST',
      });

      const data = await response.json();

      if (data.success) {
        const ingestMessage: Message = {
          id: Date.now().toString(),
          role: 'assistant',
          content: `🚀 Successfully ingested ${data.data.filesProcessed} LangChain documentation files (${data.data.totalChunks} total chunks)`,
          timestamp: new Date().toISOString(),
        };
        setMessages(prev => [...prev, ingestMessage]);
      } else {
        throw new Error(data.error || 'Ingestion failed');
      }
    } catch (error) {
      console.error('Ingestion error:', error);
      const errorMessage: Message = {
        id: Date.now().toString(),
        role: 'assistant',
        content: '❌ Failed to ingest LangChain documentation. Please try again.',
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, errorMessage]);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border bg-card">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-primary-foreground" />
              </div>
              <h1 className="text-xl font-semibold">Ragtime</h1>
              <span className="text-sm text-muted-foreground">Documentation RAG Chatbot</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={ingestLangChainDocs}
                disabled={isUploading}
                className="px-3 py-1.5 text-sm bg-secondary hover:bg-secondary/80 rounded-md transition-colors disabled:opacity-50"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  '📚 Load LangChain Docs'
                )}
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-3 py-1.5 text-sm bg-primary text-primary-foreground hover:bg-primary/90 rounded-md transition-colors disabled:opacity-50"
              >
                <Upload className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Chat Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center">
              <Bot className="w-8 h-8 text-muted-foreground" />
            </div>
            <div>
              <h2 className="text-xl font-semibold">Welcome to Ragtime</h2>
              <p className="text-muted-foreground mt-2">
                Ask questions about your documentation using natural language.
              </p>
            </div>
            <div className="flex space-x-2">
              <button
                onClick={ingestLangChainDocs}
                disabled={isUploading}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50"
              >
                {isUploading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  'Load LangChain Docs'
                )}
              </button>
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={isUploading}
                className="px-4 py-2 bg-secondary hover:bg-secondary/80 rounded-md transition-colors disabled:opacity-50"
              >
                Upload Document
              </button>
            </div>
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={cn(
                'flex space-x-3 message-enter',
                message.role === 'user' ? 'justify-end' : 'justify-start'
              )}
            >
              {message.role === 'assistant' && (
                <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
                  <Bot className="w-4 h-4 text-primary-foreground" />
                </div>
              )}
              <div
                className={cn(
                  'max-w-3xl rounded-lg px-4 py-3',
                  message.role === 'user'
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-card border border-border'
                )}
              >
                <div className="prose prose-sm max-w-none">
                  <div
                    className={cn(
                      message.role === 'user' ? 'text-primary-foreground' : 'text-foreground'
                    )}
                    dangerouslySetInnerHTML={{
                      __html: message.content.replace(/\n/g, '<br />'),
                    }}
                  />
                </div>
                {message.sources && message.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-border">
                    <p className="text-xs text-muted-foreground mb-2">Sources:</p>
                    <div className="space-y-1">
                      {message.sources.map((source) => (
                        <div
                          key={source.id}
                          className="text-xs bg-muted p-2 rounded border"
                        >
                          <div className="font-medium">
                            {source.metadata?.fileName || 'Document'}
                          </div>
                          <div className="text-muted-foreground truncate">
                            {source.content}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
              {message.role === 'user' && (
                <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center flex-shrink-0">
                  <User className="w-4 h-4 text-muted-foreground" />
                </div>
              )}
            </div>
          ))
        )}
        {isLoading && (
          <div className="flex space-x-3 justify-start">
            <div className="w-8 h-8 bg-primary rounded-full flex items-center justify-center flex-shrink-0">
              <Bot className="w-4 h-4 text-primary-foreground" />
            </div>
            <div className="bg-card border border-border rounded-lg px-4 py-3">
              <div className="flex space-x-1">
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }}></div>
                <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Form */}
      <div className="border-t border-border bg-card p-4">
        <form onSubmit={handleSubmit} className="max-w-4xl mx-auto">
          <div className="flex space-x-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about your documentation..."
              className="flex-1 px-4 py-2 border border-input rounded-md bg-background focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
              disabled={isLoading}
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".md,.txt,.mdx"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
}
