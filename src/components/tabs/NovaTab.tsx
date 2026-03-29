import { useState } from 'react';
import { Send, Cpu } from 'lucide-react';
import { useStealth } from '../../contexts/StealthContext';

interface Message {
  id: string;
  role: 'user' | 'nova';
  content: string;
  timestamp: Date;
}

const novaResponses: Record<string, string> = {
  greeting:
    "I'm Nova, your Performance Engineer. I analyze system interference patterns and optimize neuro-resilience. How can I calibrate your baseline today?",
  slip: "I've detected a calibration error. Let's collect pre-event metadata: Who were you with? Where were you? What time? This data improves your resistance map.",
  craving:
    'System lag detected. Run immediate diagnostics: 1) Rate craving intensity 1-10. 2) Identify trigger category. 3) Execute somatic reset protocol.',
  milestone:
    'Excellent system stability metrics. Your dopamine regulation shows 28% improvement. Continue current optimization protocols.',
  boredom:
    "Pattern detected: System idle state. Boredom is not a feeling - it's unallocated processing power. Deploy a high-value activity within 90 seconds.",
  default:
    "I'm analyzing your query. Please provide more system context: trigger type, time of day, or specific interference pattern you're experiencing.",
};

export function NovaTab() {
  const { getTerminology } = useStealth();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'nova',
      content: novaResponses.greeting,
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState('');

  const detectIntent = (text: string): string => {
    const lower = text.toLowerCase();
    if (lower.includes('slip') || lower.includes('relapse') || lower.includes('gave in')) return 'slip';
    if (lower.includes('crav') || lower.includes('urge') || lower.includes('want')) return 'craving';
    if (
      lower.includes('milestone') ||
      lower.includes('progress') ||
      lower.includes('achievement') ||
      lower.includes('days')
    )
      return 'milestone';
    if (lower.includes('bored') || lower.includes('nothing to do')) return 'boredom';
    return 'default';
  };

  const sendMessage = () => {
    if (!input.trim()) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date(),
    };

    const intent = detectIntent(input);
    const novaMessage: Message = {
      id: (Date.now() + 1).toString(),
      role: 'nova',
      content: novaResponses[intent],
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage, novaMessage]);
    setInput('');
  };

  const quickActions = [
    { label: `Log ${getTerminology('Trigger')}`, query: 'I experienced a trigger' },
    { label: 'System Status', query: 'How am I doing?' },
    { label: 'Need Support', query: 'I need help staying strong' },
  ];

  return (
    <div className="flex-1 flex flex-col bg-gradient-to-b from-[#001F3F] to-[#003366]">
      <div className="bg-[#001F3F] border-b border-white/10 px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center gap-3">
          <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
            <Cpu className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-medium text-lg">Nova</h1>
            <p className="text-white/60 text-sm">Performance Engineer</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6 pb-32">
        <div className="max-w-2xl mx-auto space-y-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-5 py-3 ${
                  message.role === 'user'
                    ? 'bg-blue-500 text-white'
                    : 'bg-white/10 backdrop-blur-lg text-white border border-white/20'
                }`}
              >
                {message.role === 'nova' && (
                  <div className="flex items-center gap-2 mb-2">
                    <Cpu className="w-4 h-4 text-cyan-400" />
                    <span className="text-cyan-400 text-xs font-medium uppercase tracking-wider">Nova</span>
                  </div>
                )}
                <p className="text-sm leading-relaxed">{message.content}</p>
                <div className="text-xs opacity-60 mt-2">
                  {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="fixed bottom-20 left-0 right-0 bg-[#001F3F]/95 backdrop-blur-lg border-t border-white/10 px-4 py-4">
        <div className="max-w-2xl mx-auto">
          <div className="flex gap-2 mb-3 overflow-x-auto">
            {quickActions.map((action) => (
              <button
                key={action.label}
                onClick={() => {
                  setInput(action.query);
                  setTimeout(() => sendMessage(), 100);
                }}
                className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white text-sm rounded-xl whitespace-nowrap transition-all border border-white/20"
              >
                {action.label}
              </button>
            ))}
          </div>

          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
              placeholder="Describe system status or interference..."
              className="flex-1 px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/40 focus:outline-none focus:border-blue-500"
            />
            <button
              onClick={sendMessage}
              disabled={!input.trim()}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 disabled:bg-white/10 disabled:text-white/40 text-white rounded-xl transition-all"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
