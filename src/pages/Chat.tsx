import React, { useState, useRef, useEffect } from 'react'
import { motion } from 'motion/react'
import { Send, User, Bot, AlertCircle, Mic, MicOff, Volume2, VolumeX, Globe } from 'lucide-react'
import { getGemini } from '@/src/lib/gemini'

export function Chat() {
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'model', text: string }>>([
    { role: 'model', text: "Hello! I'm your AI health assistant. I can help answer general health questions, explain vitals, or provide healthy lifestyle tips. How can I help you today?" }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [isRecording, setIsRecording] = useState(false)
  const [voiceMode, setVoiceMode] = useState(true) // Output voice toggle
  const [inputLang, setInputLang] = useState<'en-US' | 'bn-BD'>('en-US') // For STT Language
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const recognitionRef = useRef<any>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const speakText = (text: string) => {
    if (!voiceMode) return
    if (!window.speechSynthesis) return

    // Stop any ongoing speech
    window.speechSynthesis.cancel()

    const utterance = new SpeechSynthesisUtterance(text)
    // Detect if text contains Bengali characters
    const isBengali = /[\u0980-\u09FF]/.test(text)
    utterance.lang = isBengali ? 'bn-BD' : 'en-US'
    utterance.rate = 1.0
    
    window.speechSynthesis.speak(utterance)
  }

  const toggleRecording = () => {
    if (isRecording) {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      setIsRecording(false)
      return
    }

    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
    if (!SpeechRecognition) {
      alert("Your browser does not support Speech Recognition.")
      return
    }

    const recognition = new SpeechRecognition()
    recognitionRef.current = recognition
    recognition.lang = inputLang
    recognition.continuous = false
    recognition.interimResults = false

    recognition.onstart = () => {
      setIsRecording(true)
    }

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript
      setInput(transcript)
      setIsRecording(false)
      // Automatically send the message after a short delay
      setTimeout(() => {
        handleSendEvent(transcript)
      }, 500)
    }

    recognition.onerror = (event: any) => {
      if (event.error !== 'aborted') {
        console.error("Speech recognition error", event.error)
      }
      if (event.error === 'not-allowed') {
         alert("Microphone access was denied. Please ensure you have granted microphone permissions to the application.")
      }
      setIsRecording(false)
    }

    recognition.onend = () => {
      setIsRecording(false)
    }

    recognition.start()
  }

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault()
    handleSendEvent(input)
  }

  const handleSendEvent = async (messageText: string) => {
    if (!messageText.trim() || isLoading) return
    
    const userMessage = messageText.trim()
    setInput('')
    setMessages(prev => [...prev, { role: 'user', text: userMessage }])
    setIsLoading(true)

    try {
      const ai = getGemini()
      
      const systemInstruction = `You are a helpful AI health assistant built into the SmartHealth application. 
Your goal is to answer general health questions, provide wellness advice, and explain vital signs. 
Do NOT provide medical diagnosis.
Keep your responses concise and easy to read/listen to. 
If the user asks in Bengali, reply securely in Bengali. If in English, reply in English.`

      const history = messages.map(m => ({
        role: m.role,
        parts: [{ text: m.text }]
      }))

      const stream = await ai.models.generateContentStream({
        model: 'gemini-2.5-flash',
        contents: [
          ...history,
          { role: 'user', parts: [{ text: userMessage }]}
        ],
        config: {
          systemInstruction,
        }
      })

      let fullReply = ''
      let isFirstChunk = true

      for await (const chunk of stream) {
        if (chunk.text) {
          fullReply += chunk.text
          if (isFirstChunk) {
            setIsLoading(false) // Hide loading dots
            setMessages(prev => [...prev, { role: 'model', text: fullReply }])
            isFirstChunk = false
          } else {
            setMessages(prev => {
              const newMessages = [...prev]
              newMessages[newMessages.length - 1] = { role: 'model', text: fullReply }
              return newMessages
            })
          }
        }
      }

      if (!fullReply.trim()) {
         fullReply = "I'm having trouble processing that right now."
         setIsLoading(false)
         setMessages(prev => [...prev, { role: 'model', text: fullReply }])
      }

      if (voiceMode) {
        speakText(fullReply)
      }
    } catch (error: any) {
      console.error("AI Error:", error)
      let errorMsg = inputLang === 'bn-BD' 
        ? "দুঃখিত! আমি একটি সমস্যার সম্মুখীন হয়েছি। অনুগ্রহ করে একটু পরে আবার চেষ্টা করুন।"
        : "Oops! I encountered an error. Please try again later."
      if (error?.status === 429 || error?.message?.includes('429') || error?.message?.includes('RESOURCE_EXHAUSTED')) {
        errorMsg = inputLang === 'bn-BD'
          ? "API কোটা শেষ হয়ে গেছে। অনুগ্রহ করে ১৫ মিনিট পরে আবার চেষ্টা করুন।"
          : "Please try again after 15 minutes."
      }
      setMessages(prev => [...prev, { role: 'model', text: errorMsg }])
      if (voiceMode) speakText(errorMsg)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full bg-[#f8fbff]">
      <header className="p-4 bg-white shrink-0 border-b border-sky-100 flex items-center justify-between sticky top-0 z-10 shadow-sm">
        <div>
          <h1 className="text-xl font-bold text-[#0369A1] flex items-center gap-2">
            Health AI
          </h1>
          <p className="text-slate-500 text-xs font-medium">Your personal health assistant</p>
        </div>
        <div className="flex items-center gap-2">
          {/* Output Voice Toggle */}
          <button 
            onClick={() => {
               setVoiceMode(p => !p)
               if (voiceMode) window.speechSynthesis?.cancel() // stop if turning off
            }}
            className={`p-2 rounded-full transition-colors ${voiceMode ? 'bg-indigo-100 text-indigo-600' : 'bg-slate-100 text-slate-400'}`}
            title="Toggle Voice Output"
          >
            {voiceMode ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
          </button>
          
          {/* Input Language Toggle */}
          <button 
            onClick={() => setInputLang(p => p === 'en-US' ? 'bn-BD' : 'en-US')}
            className="flex items-center gap-1 p-2 rounded-full bg-slate-100 text-slate-600 font-semibold text-xs transition-colors hover:bg-slate-200"
            title="Toggle Input Language"
          >
            <Globe className="w-4 h-4" />
            {inputLang === 'en-US' ? 'EN' : 'BN'}
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Warning Banner */}
        <div className="bg-amber-50 text-amber-800 text-xs p-3 rounded-xl border border-amber-200 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
          <p>Results from AI are for informational purposes only. Do not use this as a substitute for professional medical advice.</p>
        </div>

        {messages.map((message, index) => (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            key={index}
            className={`flex w-full ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div className={`flex gap-2 max-w-[85%] ${message.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
              <div className={`w-8 h-8 rounded-full flex shrink-0 items-center justify-center ${message.role === 'user' ? 'bg-sky-500 text-white' : 'bg-white shadow border border-sky-100 text-sky-600'}`}>
                {message.role === 'user' ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
              </div>
              <div 
                className={`p-3 rounded-2xl text-sm leading-relaxed
                  ${message.role === 'user' 
                    ? 'bg-sky-500 text-white rounded-tr-sm' 
                    : 'bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-sm'
                  }`}
              >
                {message.text}
              </div>
            </div>
          </motion.div>
        ))}
        {isLoading && (
          <motion.div
             initial={{ opacity: 0 }} animate={{ opacity: 1 }}
             className="flex justify-start w-full"
          >
             <div className="flex gap-2 max-w-[85%] flex-row">
              <div className="w-8 h-8 rounded-full flex shrink-0 items-center justify-center bg-white shadow border border-sky-100 text-sky-600">
                 <Bot className="w-5 h-5" />
              </div>
              <div className="p-3 rounded-2xl bg-white text-slate-700 shadow-sm border border-slate-100 rounded-tl-sm flex items-center gap-1 h-[44px]">
                 <div className="w-2 h-2 bg-sky-300 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                 <div className="w-2 h-2 bg-sky-300 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                 <div className="w-2 h-2 bg-sky-300 rounded-full animate-bounce"></div>
              </div>
             </div>
          </motion.div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 bg-white shrink-0 shadow-[0_-4px_15px_-5px_rgba(0,0,0,0.05)] border-t border-slate-100">
        <form onSubmit={handleSend} className="relative flex items-center gap-2">
          <button 
            type="button"
            onClick={toggleRecording}
            className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center transition-colors shadow-sm ${isRecording ? 'bg-red-500 text-white animate-pulse' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}
          >
            {isRecording ? <MicOff className="w-5 h-5" /> : <Mic className="w-5 h-5" />}
          </button>
          
          <div className="relative flex-1">
            <input 
              type="text" 
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={isLoading || isRecording}
              placeholder={isRecording ? `Listening in ${inputLang === 'en-US' ? 'English' : 'Bengali'}...` : "Ask a health question..."}
              className="w-full bg-slate-50 border border-slate-200 text-slate-900 rounded-full pl-4 pr-12 py-3.5 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all placeholder:text-slate-400 disabled:opacity-50"
            />
            <button 
              type="submit"
              disabled={isLoading || !input.trim() || isRecording}
              className="absolute right-2 top-1/2 -translate-y-1/2 w-10 h-10 bg-sky-500 text-white rounded-full flex items-center justify-center hover:bg-sky-600 disabled:opacity-50 disabled:hover:bg-sky-500 transition-colors"
            >
              <Send className="w-4 h-4 ml-0.5" />
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
