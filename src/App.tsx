import React, { useState, useEffect } from 'react';
import {
  Shield,
  FileText,
  Ticket,
  Gavel,
  Music2,
  Building2,
  Users,
  Radio,
  Search,
  ExternalLink,
  Code2,
  CheckCircle2,
  XCircle,
  Copy,
  ChevronDown,
  Play,
  Pause,
  SkipForward,
  SkipBack,
  Square,
  Repeat,
  Shuffle,
  Terminal,
  Sparkles,
  Server,
  Bot,
  AlertTriangle,
  Send,
  Zap,
  Image as ImageIcon,
  RefreshCw
} from 'lucide-react';
import {
  ALL_100_STATUSES,
  ALL_50_BIOS,
  ALL_100_COMMANDS,
  CommandItem
} from './data/botData';

export default function App() {
  const [activeTab, setActiveTab] = useState<'discord' | 'statuses' | 'commands' | 'codebase'>('discord');
  const [activeChannel, setActiveChannel] = useState<string>('applications');
  const [statusIndex, setStatusIndex] = useState<number>(0);
  const [bioIndex, setBioIndex] = useState<number>(0);
  const [statusTimer, setStatusTimer] = useState<number>(30);
  const [commandSearch, setCommandSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedCommand, setSelectedCommand] = useState<CommandItem>(ALL_100_COMMANDS[0]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Groq AI Support Assistant State & Knowledge Base
  const [aiBotName, setAiBotName] = useState<string>('Assistant AI');
  const [aiFooterText, setAiFooterText] = useState<string>('Powered by Los Angeles Roleplay · Assistant AI · A staff member can take over at any time');
  const [aiStaffStatus, setAiStaffStatus] = useState<string>('Support Team Paged 🔔');
  const [ticketStatusNotice, setTicketStatusNotice] = useState<string | null>(null);
  const [showConfigStudio, setShowConfigStudio] = useState<boolean>(true);
  const [selectedKbIndex, setSelectedKbIndex] = useState<number>(0);

  const [knowledgeBase, setKnowledgeBase] = useState([
    {
      topic: 'Staff Application Guide',
      keywords: 'apply, staff application, join staff, become staff, mod application, moderator, how to apply',
      content: 'To apply for staff in Los Angeles Roleplay, go to the #applications channel, click the dropdown, and select "Staff Application". A private channel will open where you answer 15 questions within 30 minutes. Requirements: You must be 13+, have your Roblox username ready, and write all answers yourself (Sapling AI screens for AI writing).'
    },
    {
      topic: 'Staff Reinstatement Policy',
      keywords: 'reinstate, reinstatement, 30 days, reapply, resign, resignation, leave',
      content: 'Yes, that is correct! The Los Angeles Roleplay staff reinstatement cooldown is strictly 30 days from your voluntary resignation or inactivity leave. If 30 days have elapsed and you left in good standing, open an Assistance ticket to submit your reinstatement request to the Directive Team.'
    },
    {
      topic: 'Robux Marketplace & Store',
      keywords: 'market, marketplace, robux, donate, donation, paid ad, advertisement, sponsored giveaway, purchase',
      content: 'We only accept Robux payments; real-world currency is not accepted. Sponsored Giveaways cost R$ 500 (prize must be >R$ 500 or $5 value). Paid Advertisements cost R$ 350. Donations are accepted in R$ 500, R$ 1000, R$ 1500, and R$ 2000 tiers and grant the Donator role. All sales are final.'
    },
    {
      topic: 'Banned Items & Server Regulations',
      keywords: 'banned items, banned guns, banned vehicles, rules, prohibited, rdm, vdm, nlr, fear rp, regulations',
      content: 'Banned items include military explosive weapons, rocket launchers, and unrealistic troll avatar packages. Strictly prohibited roleplays: Terrorism, suicide RP, ERP/NSFW scenes, and unauthorized police corruption. Standard ER:LC rules enforce NLR (New Life Rule), No RDM/VDM, and FearRP.'
    },
    {
      topic: 'Departments & Law Enforcement',
      keywords: 'lapd, lasd, chp, lafd, fbi, departments, join police, sheriff, fire, tryouts',
      content: 'Los Angeles Roleplay features LAPD (Los Angeles Police Dept), LASD (Los Angeles County Sheriff Dept), CHP (California Highway Patrol), LAFD (Los Angeles Fire Dept), and FBI. Tryouts and application phases are posted regularly in server announcements.'
    }
  ]);

  const [ticketInquiry, setTicketInquiry] = useState<string>('How to apply for staff');
  const [groqAnswer, setGroqAnswer] = useState<string>(
    'Hello @carlos473! To apply for staff in Los Angeles Roleplay, go to the #applications channel, click the dropdown, and select "Staff Application". A private channel will open where you answer 15 questions within 30 minutes. Requirements: You must be 13+, have your Roblox username ready, and write all answers yourself (Sapling AI screens for AI writing).'
  );
  const [isGeneratingGroq, setIsGeneratingGroq] = useState<boolean>(false);

  // Conversational Autopilot state for Tickets / Contact Us
  const [ticketChatInput, setTicketChatInput] = useState<string>('');
  const [isBotTyping, setIsBotTyping] = useState<boolean>(false);
  const [isAutopilotActive, setIsAutopilotActive] = useState<boolean>(true);
  const [humanRequested, setHumanRequested] = useState<boolean>(false);
  const [staffClaimedBy, setStaffClaimedBy] = useState<string | null>(null);

  interface TicketMessageItem {
    id: string;
    sender: 'user' | 'bot' | 'system' | 'staff';
    authorName: string;
    authorBadge?: string;
    avatarBg: string;
    avatarText: string;
    timestamp: string;
    content?: string;
    embed?: {
      title: string;
      body: string;
      color?: string;
      fields?: { label: string; value: string }[];
      footer?: string;
    };
  }

  const initialTicketMessages: TicketMessageItem[] = [
    {
      id: 'msg-1',
      sender: 'user',
      authorName: 'carlos473',
      avatarBg: 'bg-emerald-600',
      avatarText: 'CR',
      timestamp: 'Today at 9:36 AM',
      content: 'Is true that reinstate is 30 days?'
    },
    {
      id: 'msg-2',
      sender: 'bot',
      authorName: 'Assistant AI',
      authorBadge: 'Assistant AI',
      avatarBg: 'bg-gradient-to-tr from-blue-600 to-indigo-600',
      avatarText: 'LA',
      timestamp: 'Today at 9:37 AM',
      embed: {
        title: '🤖 Staff Reinstatement Policy',
        body: 'Hello @carlos473! In regard to your question about **Staff Reinstatement Policy**:\n\nYes, that is correct! The Los Angeles Roleplay staff reinstatement cooldown is strictly 30 days from your voluntary resignation or inactivity leave. If 30 days have elapsed and you left in good standing, open an Assistance ticket to submit your reinstatement request to the Directive Team.\n\nOur Support Team has been paged and a staff member can take over at any time if you need additional help! If you need a human right now, simply type **"I need a real staff member"**.',
        color: 'border-[#37373E]',
        fields: [
          { label: 'Autopilot Mode', value: 'Active (Staff Zero-Touch)' },
          { label: 'Staff Status', value: 'Support Team Paged 🔔' }
        ],
        footer: 'Powered by Los Angeles Roleplay · Assistant AI · A staff member can take over at any time'
      }
    }
  ];

  const [ticketChatMessages, setTicketChatMessages] = useState<TicketMessageItem[]>(initialTicketMessages);

  // Sapling Interactive Demo in Applications
  const [saplingScore, setSaplingScore] = useState<number>(3.8); // 3.8% AI score = Human
  const [saplingInputText, setSaplingInputText] = useState<string>(
    'I want to join the staff team because I have over 2 years of ER:LC moderation experience. I understand NLR and FearRP, and I am available 25 hours a week to keep the community safe and enforce realistic roleplay.'
  );

  // Music Player interactive state
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [playbackSeconds, setPlaybackSeconds] = useState<number>(84);
  const totalDuration = 285; // 4:45

  // Marketplace Interactive State (Matching Screenshots 093552, 093617, 093625)
  const [marketDropdownOpen, setMarketDropdownOpen] = useState<boolean>(false);
  const [selectedMarketOption, setSelectedMarketOption] = useState<'donations' | 'sponsored_giveaway' | 'paid_ad' | null>('donations');
  const [showMarketConfig, setShowMarketConfig] = useState<boolean>(false);
  const [purchaseModalItem, setPurchaseModalItem] = useState<{ title: string; price: string; url: string } | null>(null);

  const [giveawayLink, setGiveawayLink] = useState<string>('https://www.roblox.com/game-pass/1029384/LARP-Sponsored-Giveaway');
  const [paidAdLink, setPaidAdLink] = useState<string>('https://www.roblox.com/game-pass/1029385/LARP-Paid-Advertisement');
  const [donation500Link, setDonation500Link] = useState<string>('https://www.roblox.com/game-pass/1029386/LARP-500-Robux-Donation');
  const [donation1000Link, setDonation1000Link] = useState<string>('https://www.roblox.com/game-pass/1029387/LARP-1000-Robux-Donation');
  const [donation1500Link, setDonation1500Link] = useState<string>('https://www.roblox.com/game-pass/1029388/LARP-1500-Robux-Donation');
  const [donation2000Link, setDonation2000Link] = useState<string>('https://www.roblox.com/game-pass/1029389/LARP-2000-Robux-Donation');

  // Application Interactive States (Matching Screenshots 093827, 093949)
  const [appDropdownOpen, setAppDropdownOpen] = useState<boolean>(false);
  const [hasActiveApp, setHasActiveApp] = useState<boolean>(true);
  const [isAppCancelled, setIsAppCancelled] = useState<boolean>(false);

  // Ticket Category Dropdown (Matching Screenshot 093659)
  const [ticketCategoryDropdownOpen, setTicketCategoryDropdownOpen] = useState<boolean>(false);
  const [selectedTicketCategory, setSelectedTicketCategory] = useState<'General' | 'High Rank' | 'Department'>('General');

  // Cycle status every 30s
  useEffect(() => {
    const timer = setInterval(() => {
      setStatusTimer((prev) => {
        if (prev <= 1) {
          setStatusIndex((curr) => (curr + 1) % ALL_100_STATUSES.length);
          return 30;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Music progress timer
  useEffect(() => {
    if (!isPlaying) return;
    const interval = setInterval(() => {
      setPlaybackSeconds((prev) => (prev >= totalDuration ? 0 : prev + 1));
    }, 1000);
    return () => clearInterval(interval);
  }, [isPlaying]);

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const renderProgressBar = (curr: number, total: number) => {
    const size = 15;
    const progress = Math.min(Math.max(curr / (total || 1), 0), 1);
    const index = Math.round(size * progress);
    return '━'.repeat(index) + '●' + '━'.repeat(size - index);
  };

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const runSaplingScan = (text: string) => {
    // Heuristic scan preview for testing Sapling AI detector
    const lower = text.toLowerCase();
    if (lower.includes('furthermore') || lower.includes('in conclusion') || lower.includes('delve') || lower.includes('paramount') || lower.includes('crucial aspect')) {
      setSaplingScore(89.4);
    } else {
      setSaplingScore(4.2);
    }
  };

  const triggerGroqSimulation = (inquiry: string) => {
    setIsGeneratingGroq(true);
    setTicketStatusNotice(null);
    setTimeout(() => {
      const lower = inquiry.toLowerCase();
      const matched = knowledgeBase.find((kb) => {
        const kws = kb.keywords.split(',').map((k) => k.trim().toLowerCase());
        return kws.some((kw) => lower.includes(kw));
      });

      if (matched) {
        setGroqAnswer(`Hello @carlos473! In regard to your question about **${matched.topic}**:\n\n${matched.content}\n\nOur Support Team has been paged and a staff member can take over at any time if you need additional help!`);
      } else {
        setGroqAnswer(`Hello @carlos473! Thank you for reaching out regarding: "${inquiry}". Our Support Team has been paged and a staff member will review your inquiry shortly. Feel free to add any extra information in this channel!`);
      }
      setIsGeneratingGroq(false);
    }, 350);
  };

  const handleSendTicketMessage = (overrideText?: string) => {
    const text = (overrideText !== undefined ? overrideText : ticketChatInput).trim();
    if (!text) return;

    const userMsg: TicketMessageItem = {
      id: `user-${Date.now()}`,
      sender: 'user',
      authorName: 'carlos473',
      avatarBg: 'bg-emerald-600',
      avatarText: 'CR',
      timestamp: 'Just now',
      content: text
    };

    setTicketChatMessages(prev => [...prev, userMsg]);
    setTicketChatInput('');

    const lower = text.toLowerCase();
    const wantsHuman = lower.includes('real staff') || lower.includes('real person') || lower.includes('human') || lower.includes('talk to someone') || lower.includes('agent') || lower.includes('need staff') || lower.includes('need a real');

    if (wantsHuman) {
      setIsBotTyping(true);
      setTimeout(() => {
        setIsBotTyping(false);
        setIsAutopilotActive(false);
        setHumanRequested(true);
        setTicketStatusNotice('🚨 Human Staff Requested: AI Autopilot has been paused. High-priority staff ping dispatched.');

        const handoffMsg: TicketMessageItem = {
          id: `handoff-${Date.now()}`,
          sender: 'system',
          authorName: aiBotName,
          authorBadge: 'Assistant AI',
          avatarBg: 'bg-indigo-600',
          avatarText: 'LA',
          timestamp: 'Just now',
          embed: {
            title: '🚨 Human Staff Member Requested',
            body: `**Paging @Staff Team!** carlos473 (<@1025813762684502168>) has requested to speak directly with a live human staff member.\n\n• **AI Autopilot:** PAUSED ⏸️ (The AI will not reply until resumed or taken over)\n• **Ticket Category:** General Support (#ticket-4602)\n• **Action:** On-duty staff, please click **[Take Over Ticket]** below to assist the member.\n\nThank you for waiting, carlos473! A staff member has been alerted and will be with you shortly.`,
            color: 'border-red-500',
            fields: [
              { label: 'Status', value: 'Human Staff Paged 🔔' },
              { label: 'Autopilot', value: 'Paused ⏸️' }
            ],
            footer: aiFooterText
          }
        };
        setTicketChatMessages(prev => [...prev, handoffMsg]);
      }, 1000);
      return;
    }

    // If human staff has already claimed or autopilot is paused
    if (!isAutopilotActive || staffClaimedBy) {
      setTicketStatusNotice('⏸️ AI Autopilot is currently paused for this ticket. Click "Resume AI Autopilot" or wait for human staff.');
      return;
    }

    // AI Autopilot generates response
    setIsBotTyping(true);
    setTimeout(() => {
      setIsBotTyping(false);

      const matched = knowledgeBase.find((kb) => {
        const kws = kb.keywords.split(',').map((k) => k.trim().toLowerCase());
        return kws.some((kw) => lower.includes(kw));
      });

      let topicTitle = '';
      let replyBody = '';

      if (matched) {
        topicTitle = matched.topic;
        replyBody = `Hello @carlos473! In regard to **${matched.topic}**:\n\n${matched.content}\n\nOur Staff Team has been notified. A staff member can take over at any time if you need personal assistance. If you prefer a human right now, simply type **"I need a real staff member"**!`;
      } else {
        topicTitle = 'Assistant AI Autopilot Response';
        replyBody = `Hello @carlos473! Thank you for your inquiry: "${text}".\n\nOur Support Team has logged your question. I am programmed with server policies, staff applications, reinstatement cooldowns, Robux marketplace gamepasses, and rules. If your issue requires manual review, simply reply **"I need a real staff member"** and I will immediately pause autopilot and page an on-duty administrator!`;
      }

      const botMsg: TicketMessageItem = {
        id: `bot-${Date.now()}`,
        sender: 'bot',
        authorName: aiBotName,
        authorBadge: 'Assistant AI',
        avatarBg: 'bg-gradient-to-tr from-blue-600 to-indigo-600',
        avatarText: 'LA',
        timestamp: 'Just now',
        embed: {
          title: `🤖 ${topicTitle}`,
          body: replyBody,
          color: 'border-[#37373E]',
          fields: [
            { label: 'Autopilot Mode', value: 'Active (Staff Zero-Touch)' },
            { label: 'Staff Status', value: aiStaffStatus }
          ],
          footer: aiFooterText
        }
      };

      setTicketChatMessages(prev => [...prev, botMsg]);
    }, 1200);
  };

  const handleTakeOverTicket = () => {
    setStaffClaimedBy('@joey_him19');
    setIsAutopilotActive(false);
    setTicketStatusNotice('🛡️ Ticket Taken Over: @joey_him19 has taken over this ticket from the AI Assistant. Human staff is now active.');

    const staffMsg: TicketMessageItem = {
      id: `staff-${Date.now()}`,
      sender: 'staff',
      authorName: 'joey_him19',
      authorBadge: 'Staff Moderator',
      avatarBg: 'bg-amber-600',
      avatarText: 'JH',
      timestamp: 'Just now',
      content: 'Hello carlos473, I am Joey from the Los Angeles Roleplay Staff Team. I have taken over this ticket and reviewed the conversation. How can I assist you further today?'
    };
    setTicketChatMessages(prev => [...prev, staffMsg]);
  };

  const handlePageStaff = () => {
    setIsAutopilotActive(false);
    setHumanRequested(true);
    setTicketStatusNotice('🔔 Staff Paged: @Staff Team has been paged by carlos473! Autopilot paused.');

    const handoffMsg: TicketMessageItem = {
      id: `handoff-${Date.now()}`,
      sender: 'system',
      authorName: aiBotName,
      authorBadge: 'Assistant AI',
      avatarBg: 'bg-indigo-600',
      avatarText: 'LA',
      timestamp: 'Just now',
      embed: {
        title: '🚨 Human Staff Member Requested',
        body: `**Paging @Staff Team!** carlos473 has clicked **[Page Staff Member]** to request live human assistance.\n\n• **AI Autopilot:** PAUSED ⏸️\n• A staff member will be with you shortly!`,
        color: 'border-red-500',
        fields: [
          { label: 'Status', value: 'Human Staff Paged 🔔' },
          { label: 'Autopilot', value: 'Paused ⏸️' }
        ],
        footer: aiFooterText
      }
    };
    setTicketChatMessages(prev => [...prev, handoffMsg]);
  };

  const handleResumeAutopilot = () => {
    setIsAutopilotActive(true);
    setHumanRequested(false);
    setStaffClaimedBy(null);
    setTicketStatusNotice('🔄 AI Autopilot Resumed: The AI Assistant is now actively handling responses for this ticket.');

    const resumeMsg: TicketMessageItem = {
      id: `resume-${Date.now()}`,
      sender: 'system',
      authorName: aiBotName,
      authorBadge: 'Assistant AI',
      avatarBg: 'bg-blue-600',
      avatarText: 'LA',
      timestamp: 'Just now',
      content: '🔄 **AI Autopilot Resumed**: The AI Assistant is once again handling all incoming inquiries automatically without requiring staff intervention.'
    };
    setTicketChatMessages(prev => [...prev, resumeMsg]);
  };

  const handleResetTicketChat = () => {
    setTicketChatMessages(initialTicketMessages);
    setIsAutopilotActive(true);
    setHumanRequested(false);
    setStaffClaimedBy(null);
    setTicketStatusNotice(null);
  };

  const filteredCommands = ALL_100_COMMANDS.filter((cmd) => {
    const matchesSearch = cmd.name.toLowerCase().includes(commandSearch.toLowerCase()) || cmd.description.toLowerCase().includes(commandSearch.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || cmd.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Staff Management', 'Applications', 'Tickets & Assistance', 'Moderation', 'Music System', 'Departments', 'Training', 'Community & Utility'];

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#1e1f22] text-[#dbdee1]">
      {/* LEFT NAVIGATION / SERVER ICON STRIP */}
      <div className="w-[72px] shrink-0 bg-[#1e1f22] flex flex-col items-center py-3 gap-2 border-r border-[#2b2d31]">
        <div className="w-12 h-12 rounded-2xl bg-[#5865f2] flex items-center justify-center text-white font-bold text-lg shadow-md cursor-pointer hover:rounded-xl transition-all">
          LA
        </div>
        <div className="w-8 h-[2px] bg-[#35363c] my-1" />

        <button
          onClick={() => setActiveTab('discord')}
          title="Discord Live Embeds"
          className={`w-12 h-12 rounded-3xl hover:rounded-xl transition-all flex items-center justify-center ${activeTab === 'discord' ? 'bg-[#5865f2] text-white rounded-xl' : 'bg-[#313338] text-[#949ba4] hover:bg-[#5865f2] hover:text-white'}`}
        >
          <Server className="w-6 h-6" />
        </button>

        <button
          onClick={() => setActiveTab('statuses')}
          title="100 Statuses & 50 Bios"
          className={`w-12 h-12 rounded-3xl hover:rounded-xl transition-all flex items-center justify-center ${activeTab === 'statuses' ? 'bg-[#5865f2] text-white rounded-xl' : 'bg-[#313338] text-[#949ba4] hover:bg-[#5865f2] hover:text-white'}`}
        >
          <Radio className="w-6 h-6" />
        </button>

        <button
          onClick={() => setActiveTab('commands')}
          title="All 100 Slash Commands"
          className={`w-12 h-12 rounded-3xl hover:rounded-xl transition-all flex items-center justify-center ${activeTab === 'commands' ? 'bg-[#5865f2] text-white rounded-xl' : 'bg-[#313338] text-[#949ba4] hover:bg-[#5865f2] hover:text-white'}`}
        >
          <Terminal className="w-6 h-6" />
        </button>

        <button
          onClick={() => setActiveTab('codebase')}
          title="Codebase & Config"
          className={`w-12 h-12 rounded-3xl hover:rounded-xl transition-all flex items-center justify-center ${activeTab === 'codebase' ? 'bg-[#5865f2] text-white rounded-xl' : 'bg-[#313338] text-[#949ba4] hover:bg-[#5865f2] hover:text-white'}`}
        >
          <Code2 className="w-6 h-6" />
        </button>

        <div className="mt-auto flex flex-col items-center gap-2">
          <div className="w-3 h-3 rounded-full bg-[#23a55a]" title="Bot Engine: Online" />
        </div>
      </div>

      {/* DISCORD CHANNEL SIDEBAR (When in Discord view) */}
      {activeTab === 'discord' && (
        <div className="w-60 shrink-0 bg-[#2b2d31] flex flex-col border-r border-[#1f2023]">
          <div className="h-12 px-4 border-b border-[#1f2023] flex items-center justify-between font-bold text-white shadow-sm">
            <span className="truncate">Los Angeles Roleplay</span>
            <ChevronDown className="w-4 h-4 text-[#949ba4]" />
          </div>

          <div className="flex-1 overflow-y-auto px-2 py-3 space-y-4">
            <div>
              <div className="px-2 mb-1 text-[11px] font-bold text-[#949ba4] uppercase tracking-wider">Information</div>
              <button
                onClick={() => setActiveChannel('dashboard')}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${activeChannel === 'dashboard' ? 'bg-[#404249] text-white font-medium' : 'text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]'}`}
              >
                <Server className="w-4 h-4 shrink-0" />
                <span className="truncate">dashboard</span>
              </button>
              <button
                onClick={() => setActiveChannel('tripwire')}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${activeChannel === 'tripwire' ? 'bg-[#404249] text-white font-medium' : 'text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]'}`}
              >
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400" />
                <span className="truncate">tripwire</span>
              </button>
              <button
                onClick={() => setActiveChannel('regulations')}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${activeChannel === 'regulations' ? 'bg-[#404249] text-white font-medium' : 'text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]'}`}
              >
                <Gavel className="w-4 h-4 shrink-0" />
                <span className="truncate">guidelines</span>
              </button>
              <button
                onClick={() => setActiveChannel('banned-items')}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${activeChannel === 'banned-items' ? 'bg-[#404249] text-white font-medium' : 'text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]'}`}
              >
                <Shield className="w-4 h-4 shrink-0" />
                <span className="truncate">banned-items</span>
              </button>
            </div>

            <div>
              <div className="px-2 mb-1 text-[11px] font-bold text-[#949ba4] uppercase tracking-wider">Applications & Tickets</div>
              <button
                onClick={() => setActiveChannel('applications')}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm transition-colors ${activeChannel === 'applications' ? 'bg-[#404249] text-white font-medium' : 'text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]'}`}
              >
                <div className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 shrink-0" />
                  <span className="truncate">applications</span>
                </div>
                <span className="text-[10px] bg-purple-500/20 text-purple-300 px-1.5 py-0.2 rounded font-mono">Sapling AI</span>
              </button>
              <button
                onClick={() => setActiveChannel('tickets')}
                className={`w-full flex items-center justify-between px-2 py-1.5 rounded text-sm transition-colors ${activeChannel === 'tickets' ? 'bg-[#404249] text-white font-medium' : 'text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]'}`}
              >
                <div className="flex items-center gap-2 truncate">
                  <Ticket className="w-4 h-4 shrink-0" />
                  <span className="truncate">contact-us</span>
                </div>
                <span className="text-[10px] bg-amber-500/20 text-amber-300 px-1.5 py-0.2 rounded font-mono">Groq AI</span>
              </button>
              <button
                onClick={() => setActiveChannel('verify')}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${activeChannel === 'verify' ? 'bg-[#404249] text-white font-medium' : 'text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]'}`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0" />
                <span className="truncate">verification</span>
              </button>
              <button
                onClick={() => setActiveChannel('marketplace')}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${activeChannel === 'marketplace' ? 'bg-[#404249] text-white font-medium' : 'text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]'}`}
              >
                <Sparkles className="w-4 h-4 shrink-0" />
                <span className="truncate">marketplace</span>
              </button>
            </div>

            <div>
              <div className="px-2 mb-1 text-[11px] font-bold text-[#949ba4] uppercase tracking-wider">Audio & Roster</div>
              <button
                onClick={() => setActiveChannel('music')}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${activeChannel === 'music' ? 'bg-[#404249] text-white font-medium' : 'text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]'}`}
              >
                <Music2 className="w-4 h-4 shrink-0" />
                <span className="truncate">music-lounge</span>
              </button>
              <button
                onClick={() => setActiveChannel('departments')}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${activeChannel === 'departments' ? 'bg-[#404249] text-white font-medium' : 'text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]'}`}
              >
                <Building2 className="w-4 h-4 shrink-0" />
                <span className="truncate">departments</span>
              </button>
            </div>

            <div>
              <div className="px-2 mb-1 text-[11px] font-bold text-[#949ba4] uppercase tracking-wider">Staff Administration</div>
              <button
                onClick={() => setActiveChannel('feedback')}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${activeChannel === 'feedback' ? 'bg-[#404249] text-white font-medium' : 'text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]'}`}
              >
                <Users className="w-4 h-4 shrink-0" />
                <span className="truncate">staff-feedback</span>
              </button>
              <button
                onClick={() => setActiveChannel('serverstats')}
                className={`w-full flex items-center gap-2 px-2 py-1.5 rounded text-sm transition-colors ${activeChannel === 'serverstats' ? 'bg-[#404249] text-white font-medium' : 'text-[#949ba4] hover:bg-[#35373c] hover:text-[#dbdee1]'}`}
              >
                <Server className="w-4 h-4 shrink-0" />
                <span className="truncate">server-stats</span>
              </button>
            </div>
          </div>

          {/* Bot Profile Badge in Sidebar Bottom */}
          <div className="p-3 bg-[#232428] flex items-center gap-3 border-t border-[#1f2023]">
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center font-bold text-white text-xs shadow">
                LA
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full bg-[#23a55a] border-2 border-[#232428]" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-xs font-semibold text-white truncate flex items-center gap-1.5">
                Los Angeles Assistant AI
                <span className="px-1 py-0.2 bg-[#5865f2] text-white rounded text-[9px] font-bold uppercase">APP</span>
              </div>
              <div className="text-[10px] text-emerald-400 font-medium truncate flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                Assistant AI · Online
              </div>
            </div>
          </div>
        </div>
      )}

      {/* MAIN VIEWPORT */}
      <div className="flex-1 flex flex-col min-w-0 bg-[#313338]">
        {/* TOP BAR */}
        <header className="h-12 px-6 border-b border-[#2b2d31] flex items-center justify-between gap-8 bg-[#313338]">
          <div className="flex items-center gap-3">
            <span className="text-base font-bold text-white tracking-tight whitespace-nowrap flex items-center gap-2">
              Los Angeles Roleplay
              <span className="px-2 py-0.5 bg-[#5865f2]/20 text-[#5865f2] border border-[#5865f2]/40 text-[11px] font-bold rounded-md">
                Assistant AI
              </span>
            </span>
            <span className="text-xs text-[#949ba4] hidden md:inline">
              · Official Community Assistant AI, Staff Management & Audio Engine
            </span>
          </div>

          <div className="flex items-center gap-4 text-xs">
            <div className="flex items-center gap-2 text-[#949ba4] font-mono">
              <span className="w-2 h-2 rounded-full bg-[#23a55a]" />
              <span>Status [{statusIndex + 1}/100] · Next in {statusTimer}s</span>
            </div>
            <button
              onClick={() => {
                setStatusIndex((prev) => (prev + 1) % ALL_100_STATUSES.length);
                setStatusTimer(30);
              }}
              className="px-2.5 py-1 bg-[#383a40] hover:bg-[#404249] text-white rounded text-xs transition-colors"
            >
              Cycle Status
            </button>
          </div>
        </header>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* TAB 1: DISCORD LIVE EMBEDS VISUALIZER */}
          {activeTab === 'discord' && (
            <div className="max-w-4xl mx-auto space-y-6">
              {/* CHANNEL HEADER */}
              <div className="border-b border-[#3f4147] pb-3 mb-6 flex items-center justify-between">
                <div>
                  <h1 className="text-xl font-bold text-white flex items-center gap-2">
                    <span className="text-[#949ba4]">#</span>
                    {activeChannel}
                  </h1>
                  <p className="text-xs text-[#949ba4] mt-1">
                    Matching reference screenshots with Groq AI Support & Sapling AI Writing Detection.
                  </p>
                </div>

                {activeChannel === 'tickets' && (
                  <span className="text-xs bg-amber-500/20 text-amber-300 px-2 py-1 rounded flex items-center gap-1 font-mono">
                    <Zap className="w-3.5 h-3.5" /> Groq AI Support Active
                  </span>
                )}
                {activeChannel === 'applications' && (
                  <span className="text-xs bg-purple-500/20 text-purple-300 px-2 py-1 rounded flex items-center gap-1 font-mono">
                    <Bot className="w-3.5 h-3.5" /> Sapling AI Detection Active
                  </span>
                )}
              </div>

              {/* 1. DASHBOARD VIEW (From reference screenshot 094110) */}
              {activeChannel === 'dashboard' && (
                <div className="space-y-6">
                  <div className="rounded-lg overflow-hidden border border-[#202225] bg-[#2b2d31]">
                    <div className="p-5 border-l-4 border-[#37373E] space-y-4">
                      <div>
                        <h2 className="text-lg font-bold text-white">Dashboard</h2>
                        <p className="text-xs text-[#dbdee1] mt-2 leading-relaxed">
                          Los Angeles Roleplay is a dynamic Roblox experience based in Emergency Response: Liberty County. Take on the role of a firefighter, EMS, police officer, state trooper, federal agent, or civilian as you navigate a realistic and immersive open-world environment. Engage in detailed roleplay scenarios that bring the city to life with Realism and excitement!.
                        </p>
                      </div>

                      <div className="pt-2 border-t border-[#35373c]">
                        <strong className="text-white text-xs block mb-2 flex items-center gap-1.5">
                          <Users className="w-3.5 h-3.5 text-yellow-400" /> Chain of Command
                        </strong>
                        <div className="space-y-1 text-xs">
                          <div><span className="text-yellow-400 font-semibold">&gt; @Founder</span></div>
                          <div><span className="text-yellow-400 font-semibold">&gt; @Co Founder</span></div>
                          <div><span className="text-cyan-400 font-semibold">&gt; @Directive Team</span></div>
                          <div><span className="text-amber-500 font-semibold">&gt; @Management Team</span></div>
                          <div><span className="text-red-400 font-semibold">&gt; @Internal Affairs Team</span></div>
                          <div><span className="text-amber-600 font-semibold">&gt; @Administration Team</span></div>
                          <div><span className="text-blue-400 font-semibold">&gt; @Moderation Team</span></div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-[#35373c]">
                        <strong className="text-white text-xs block mb-2">🔗 Links</strong>
                        <div className="space-y-1 text-xs text-[#5865f2]">
                          <div className="hover:underline cursor-pointer">&gt; Roblox Group</div>
                          <div className="hover:underline cursor-pointer">&gt; Regulations</div>
                          <div className="hover:underline cursor-pointer">&gt; Assistance</div>
                          <div className="hover:underline cursor-pointer">&gt; Sessions</div>
                          <div className="hover:underline cursor-pointer">&gt; Staff Application</div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 2. TRIPWIRE VIEW (From reference screenshot 094653) */}
              {activeChannel === 'tripwire' && (
                <div className="space-y-6">
                  <div className="rounded-lg overflow-hidden border border-[#202225] bg-[#2b2d31]">
                    <div className="w-full bg-[#1e1f22] p-4 text-center border-b border-[#202225]">
                      <div className="text-xs font-bold text-red-500 tracking-widest uppercase">LOS ANGELES ROLEPLAY</div>
                      <div className="text-2xl font-black text-red-600 tracking-wider italic">TRIPWIRE</div>
                      <div className="text-[10px] text-[#949ba4] tracking-widest uppercase">THE PREMIER LOS ANGELES EXPERIENCE</div>
                    </div>

                    <div className="p-5 border-l-4 border-amber-500 space-y-3">
                      <div className="text-base font-bold text-white flex items-center gap-2">
                        <AlertTriangle className="w-5 h-5 text-amber-500" />
                        Tripwire
                      </div>
                      <p className="text-xs text-[#dbdee1] leading-relaxed">
                        Welcome to <strong className="text-white">Los Angeles Roleplay</strong> tripwire. Here is where we catch malicious bots to keep our community safe. We ask that you <strong className="text-white">do not chat in this channel if you are a real user</strong>. If you do chat, you will be <strong className="text-white">softbanned</strong>.
                      </p>

                      <div className="flex gap-2 pt-2">
                        <span className="px-3 py-1.5 bg-[#1e1f22] text-[#949ba4] rounded text-xs font-medium flex items-center gap-1.5 border border-[#35373c]">
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500" /> 19 Softbans
                        </span>
                        <span className="px-3 py-1.5 bg-[#1e1f22] text-[#949ba4] rounded text-xs font-medium flex items-center gap-1.5 border border-[#35373c]">
                          <Shield className="w-3.5 h-3.5 text-[#23a55a]" /> Protecting 19,840 members.
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 3. BANNED ITEMS VIEW (From reference screenshot 094724) */}
              {activeChannel === 'banned-items' && (
                <div className="space-y-6">
                  <div className="text-xs text-[#949ba4] font-mono">Banned Items Selector Panel</div>
                  <div className="rounded-lg overflow-hidden border border-[#202225] bg-[#2b2d31] p-4 space-y-3">
                    <h3 className="text-base font-bold text-white">Server Disallowed Items & Actions</h3>
                    <p className="text-xs text-[#dbdee1]">
                      Click below to view the official prohibited weapons, vehicles, and roleplay topics within Los Angeles Roleplay.
                    </p>

                    <div className="bg-[#1e1f22] p-3 rounded-lg border border-[#202225] space-y-2">
                      <div className="flex items-center justify-between text-xs text-[#949ba4] font-bold uppercase tracking-wider">
                        <span>Banned Items</span>
                        <ChevronDown className="w-4 h-4" />
                      </div>
                      <div className="pt-2 border-t border-[#2b2d31] space-y-2 text-xs">
                        <div className="p-2 bg-[#2b2d31] rounded hover:bg-[#35373c] cursor-pointer">
                          <strong className="text-white block">🔫 Banned Guns</strong>
                          <span className="text-[#949ba4] text-[11px]">View all the banned guns and restricted military gear...</span>
                        </div>
                        <div className="p-2 bg-[#2b2d31] rounded hover:bg-[#35373c] cursor-pointer">
                          <strong className="text-white block">🚫 Banned Roleplays</strong>
                          <span className="text-[#949ba4] text-[11px]">View all the banned roleplays (Terrorism, NSFW, Corruption, Suicide)...</span>
                        </div>
                        <div className="p-2 bg-[#2b2d31] rounded hover:bg-[#35373c] cursor-pointer">
                          <strong className="text-white block">🚗 Banned Vehicles</strong>
                          <span className="text-[#949ba4] text-[11px]">View all the banned vehicles and non-civilian modifications...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4. APPLICATIONS WITH SAPLING AI DETECTION */}
              {activeChannel === 'applications' && (
                <div className="space-y-8">
                  {/* Multi-App Hub (From screenshot 094540) */}
                  <div className="rounded-lg overflow-hidden border border-[#202225] bg-[#2b2d31] p-4 space-y-3">
                    <p className="text-xs text-[#dbdee1] leading-relaxed">
                      Los Angeles Roleplay provides a variety of opportunities for members to get involved in our community, from <strong className="text-white">Staff Applications</strong> to <strong className="text-white">Media Applications</strong> and beyond. We continuously strive to expand our opportunities, allowing dedicated members to contribute, develop their skills, and play a greater role in shaping our community.
                    </p>
                    <div className="text-xs text-[#949ba4]">
                      🪪 <strong>Response Time:</strong> 1-24 Hours.
                    </div>
                    <div className="flex flex-wrap gap-2 pt-2">
                      <button className="px-3 py-1.5 bg-[#4e5058] hover:bg-[#6d6f78] text-white rounded text-xs font-medium">Staff Application ↗</button>
                      <button className="px-3 py-1.5 bg-[#4e5058] hover:bg-[#6d6f78] text-white rounded text-xs font-medium">Ban Appeal ↗</button>
                      <button className="px-3 py-1.5 bg-[#4e5058] hover:bg-[#6d6f78] text-white rounded text-xs font-medium">Media Team ↗</button>
                    </div>
                  </div>

                  {/* Panel Embed with dual banners (Matching screenshot 093821) */}
                  <div className="rounded-lg overflow-hidden border border-[#202225] bg-[#2b2d31] shadow-lg">
                    <img
                      src="/assets/aistudio/Screenshot_2026-11-01_093821_83f90503.png"
                      alt="Application Banner Reference"
                      className="w-full h-32 object-cover object-top"
                    />
                    <div className="p-4 border-l-4 border-[#37373E]">
                      <h2 className="text-lg font-bold text-white">Applications</h2>
                      <p className="text-sm text-[#dbdee1] mt-2 leading-relaxed">
                        Interested in joining the staff team? You can get started by completing the application below. Please ensure all information you provide is accurate and detailed, as applications are carefully reviewed to select individuals who will contribute positively to the community and uphold standards. To begin, choose the <strong>Staff Application</strong> option from the dropdown. After making your selection, you will be added to a private channel with the next steps.
                      </p>
                      <div className="mt-4 text-sm text-[#dbdee1]">
                        <strong className="text-white">Staff Applications:</strong><br />
                        Applicants must be 13 years or older. You should have your Roblox username, user ID, timezone, and any other relevant details ready before applying.
                      </div>
                      <div className="mt-3 text-xs text-[#949ba4]">
                        All applications are reviewed by the high-ranking team. You will be notified of the outcome via DM — please be patient. Trolling or submitting false information will result in a permanent blacklist.
                      </div>
                    </div>
                  </div>

                  {/* Dropdown Select Menu (Matching Screenshot 093827) */}
                  <div className="relative">
                    <button
                      onClick={() => setAppDropdownOpen(!appDropdownOpen)}
                      className="w-full bg-[#1e1f22] hover:bg-[#232428] border border-[#202225] p-3 rounded-lg flex items-center justify-between text-left transition-all"
                    >
                      <span className="text-xs text-white font-medium">Choose an application type...</span>
                      <ChevronDown className={`w-4 h-4 text-[#949ba4] transition-transform ${appDropdownOpen ? 'rotate-180 text-white' : ''}`} />
                    </button>

                    {appDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#111214] border border-[#202225] rounded-lg shadow-2xl overflow-hidden z-20 animate-in fade-in slide-in-from-top-1">
                        <button
                          onClick={() => {
                            setHasActiveApp(true);
                            setIsAppCancelled(false);
                            setAppDropdownOpen(false);
                          }}
                          className="w-full p-3 flex items-start gap-3 text-left transition-colors hover:bg-[#232428]"
                        >
                          <Shield className="w-4 h-4 text-white shrink-0 mt-0.5" />
                          <div>
                            <div className="text-xs font-bold text-white">Staff Application</div>
                            <div className="text-[11px] text-[#949ba4]">Apply for staff</div>
                          </div>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Cancelled Notice (Matching Screenshot 093949) */}
                  {isAppCancelled && (
                    <div className="p-3 bg-[#1e1f22] border-l-4 border-[#da373c] rounded text-xs text-[#dbdee1] flex items-center justify-between shadow animate-in fade-in">
                      <span className="font-medium text-white">Your application has been cancelled.</span>
                      <button
                        onClick={() => {
                          setIsAppCancelled(false);
                          setHasActiveApp(true);
                        }}
                        className="px-2.5 py-1 bg-[#2b2d31] hover:bg-[#35373c] text-white rounded text-[11px] font-medium"
                      >
                        Reopen Application
                      </button>
                    </div>
                  )}

                  {/* Private Application Channel (Matching screenshot 093842 & 093857) */}
                  {hasActiveApp && (
                    <div className="rounded-lg overflow-hidden border border-[#202225] bg-[#2b2d31] p-4 space-y-3 shadow-lg">
                      <div className="text-xs text-[#5865f2] font-mono">Channel: #app-carlos473 · Applicant: 1025813762684502168</div>
                      <div className="text-sm text-white font-semibold">
                        @Ronaldoiscat
                      </div>
                      <p className="text-xs text-[#dbdee1]">
                        You will have exactly <span className="bg-[#1e1f22] px-1 py-0.5 rounded text-white font-mono">30 minutes</span> from now to finish this application, or your application will be cancelled and this channel will be deleted! Make sure to review your answers, use grammar at all times, and don&apos;t delete any of your answers once sent.
                      </p>
                      <div className="text-xs font-semibold text-white">
                        Good Luck!<br />
                        Application Closes: in 30 minutes
                      </div>
                      <button
                        onClick={() => {
                          setHasActiveApp(false);
                          setIsAppCancelled(true);
                        }}
                        className="px-3 py-1.5 bg-[#da373c] hover:bg-[#a1282c] text-white rounded text-xs font-semibold transition-colors shadow"
                      >
                        Cancel Application
                      </button>

                      {/* Question Card */}
                      <div className="mt-3 p-3 bg-[#1e1f22] rounded border-l-2 border-[#00b0f4]">
                        <div className="text-xs font-semibold text-white">What is your ROBLOX username?</div>
                        <div className="text-[11px] text-[#949ba4] mt-1">Write your ROBLOX name and only your ROBLOX name, nothing else with it.</div>
                        <div className="text-[10px] text-[#00b0f4] mt-1 font-mono">Q1</div>
                      </div>
                    </div>
                  )}

                  {/* SAPLING AI WRITING DETECTION SCREENER */}
                  <div className="p-4 bg-[#232428] rounded-xl border border-purple-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bot className="w-5 h-5 text-purple-400" />
                        <span className="text-sm font-bold text-white">Sapling AI Writing Detector (Live High Rank Inspection)</span>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${saplingScore >= 50 ? 'bg-red-500/20 text-red-400 border border-red-500/40' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'}`}>
                        {saplingScore >= 50 ? '⚠️ AI FLAGGED' : '✅ HUMAN WRITTEN'} ({saplingScore}% AI)
                      </span>
                    </div>

                    <p className="text-xs text-[#949ba4]">
                      Sapling scans candidate application answers for generative AI syntax (ChatGPT/Claude). If a candidate pastes AI answers, it alerts the High Rank reviewing team.
                    </p>

                    <div className="space-y-2">
                      <textarea
                        rows={2}
                        value={saplingInputText}
                        onChange={(e) => {
                          setSaplingInputText(e.target.value);
                          runSaplingScan(e.target.value);
                        }}
                        className="w-full p-2.5 bg-[#1e1f22] rounded border border-[#2b2d31] text-xs text-white placeholder-[#949ba4] focus:outline-none focus:border-purple-500 font-mono"
                      />
                      <div className="flex gap-2">
                        <button
                          onClick={() => {
                            const sampleAi = 'Furthermore, it is a crucial aspect of paramount importance to delve into community safety and foster a welcoming environment.';
                            setSaplingInputText(sampleAi);
                            runSaplingScan(sampleAi);
                          }}
                          className="px-2.5 py-1 bg-[#2b2d31] hover:bg-[#35373c] text-white rounded text-[11px]"
                        >
                          Test AI Paste (ChatGPT)
                        </button>
                        <button
                          onClick={() => {
                            const sampleHuman = 'I am active everyday on ER:LC, know the server rules well, and want to help deal with RDMs.';
                            setSaplingInputText(sampleHuman);
                            runSaplingScan(sampleHuman);
                          }}
                          className="px-2.5 py-1 bg-[#2b2d31] hover:bg-[#35373c] text-white rounded text-[11px]"
                        >
                          Test Human Writing
                        </button>
                      </div>
                    </div>

                    {/* Reviewer Embed Preview */}
                    <div className="p-3 bg-[#1e1f22] rounded-lg border border-[#2b2d31] text-xs space-y-1">
                      <div className="font-bold text-white">High Rank Review Embed Output:</div>
                      <div className="text-[#dbdee1]">
                        🔍 <strong>Sapling AI Score:</strong> <code className="bg-[#2b2d31] px-1 py-0.5 rounded text-purple-300 font-mono">{saplingScore}% AI likelihood</code>
                      </div>
                      <div className={saplingScore >= 50 ? 'text-red-400 font-semibold' : 'text-emerald-400 font-semibold'}>
                        {saplingScore >= 50 ? '⚠️ Candidate answers flagged for artificial intelligence generation. Reject recommended.' : '✅ Candidate answers confirmed authentic human writing.'}
                      </div>
                    </div>
                  </div>

                  {/* Results Acceptance (Matching screenshot 094352) */}
                  <div className="rounded-lg overflow-hidden border border-[#202225] bg-[#2b2d31]">
                    <div className="p-4 border-l-4 border-[#23a55a]">
                      <h3 className="text-base font-bold text-white">Results</h3>
                      <p className="text-sm text-[#dbdee1] mt-2 leading-relaxed">
                        We would like to congratulate you on passing your application and becoming a <strong>Trainee</strong> within our server. Your dedication throughout your application has stood out to us, and has earned you a place in our community!
                      </p>
                      <p className="text-sm text-[#dbdee1] mt-3 leading-relaxed">
                        Please be on the lookout in our training category for updates and training sessions from our training team, and feel free to ask any questions you may have.
                      </p>
                      <p className="text-sm font-semibold text-white mt-3">
                        Once again, congratulations, and welcome to the team <span className="bg-[#5865f2]/30 text-white px-1.5 py-0.5 rounded font-mono">@Rajdeep_singh292</span>
                      </p>
                    </div>
                  </div>

                  {/* Results Denial (Matching screenshot 094405) */}
                  <div className="rounded-lg overflow-hidden border border-[#202225] bg-[#2b2d31]">
                    <div className="p-4 border-l-4 border-[#da373c]">
                      <h3 className="text-base font-bold text-white">Results</h3>
                      <p className="text-sm text-[#dbdee1] mt-2 leading-relaxed">
                        On behalf of the high rank team, we are sad to have had to decline your application. We appreciate all that you have put forward into applying for this position, but unfortunately it did not meet our set standards.
                      </p>
                      <p className="text-sm text-[#dbdee1] mt-3 leading-relaxed">
                        We apologize for this, and we wish you luck if you do want to try again in the future!
                      </p>
                      <p className="text-xs text-[#949ba4] mt-3">
                        Thank you again <span className="bg-[#5865f2]/30 text-white px-1.5 py-0.5 rounded font-mono">@Killerman7204</span> for applying and finding interest in joining our team, and apologies.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              {/* 5. TICKETS WITH GROQ AI SUPPORT ASSISTANT (CONVERSATIONAL AUTOPILOT) */}
              {activeChannel === 'tickets' && (
                <div className="space-y-6">
                  {/* Top Autopilot Banner & Controls */}
                  <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-[#2b2d31] border border-[#202225] rounded-xl shadow-md">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-lg bg-[#5865f2]/20 border border-[#5865f2]/30 flex items-center justify-center text-[#5865f2]">
                        <Ticket className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white">#ticket-4602-carlos473</span>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider flex items-center gap-1 ${isAutopilotActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${isAutopilotActive ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
                            {isAutopilotActive ? 'AI Autopilot Active' : humanRequested ? 'Human Requested · Paused' : 'Autopilot Paused'}
                          </span>
                          {staffClaimedBy && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#5865f2]/20 text-[#5865f2] border border-[#5865f2]/30">
                              Claimed by {staffClaimedBy}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#949ba4]">
                          {isAutopilotActive ? 'Assistant AI texts on full autopilot. Staff zero-touch until user says "I need a real staff member".' : 'Human intervention mode active.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleTakeOverTicket}
                        className="px-3 py-1.5 bg-[#23a55a] hover:bg-[#1f8b4d] text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-all shadow"
                        title="Staff takes over ticket and pauses AI"
                      >
                        <Shield className="w-3.5 h-3.5" /> Take Over
                      </button>
                      <button
                        onClick={handlePageStaff}
                        className="px-3 py-1.5 bg-[#da373c] hover:bg-[#b02a2f] text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-all shadow"
                        title="Simulate user paging human staff"
                      >
                        <Radio className="w-3.5 h-3.5" /> Page Staff
                      </button>
                      {!isAutopilotActive && (
                        <button
                          onClick={handleResumeAutopilot}
                          className="px-3 py-1.5 bg-[#5865f2] hover:bg-[#4752c4] text-white text-xs font-semibold rounded flex items-center gap-1.5 transition-all shadow"
                        >
                          <RefreshCw className="w-3.5 h-3.5" /> Resume Autopilot
                        </button>
                      )}
                      <button
                        onClick={handleResetTicketChat}
                        className="px-2.5 py-1.5 bg-[#1e1f22] hover:bg-[#35373c] text-[#949ba4] hover:text-white text-xs font-medium rounded border border-[#35373c]"
                        title="Reset conversation"
                      >
                        Reset
                      </button>
                    </div>
                  </div>

                  {/* Status Notice if button clicked */}
                  {ticketStatusNotice && (
                    <div className="p-3 bg-[#1e1f22] border-l-4 border-[#5865f2] rounded-lg text-xs text-white flex items-center justify-between shadow animate-in fade-in">
                      <span className="flex items-center gap-2">
                        <span>ℹ️</span> {ticketStatusNotice}
                      </span>
                      <button onClick={() => setTicketStatusNotice(null)} className="text-[#949ba4] hover:text-white text-xs ml-3">✕</button>
                    </div>
                  )}

                  {/* Ticket Category Selector (Matching Screenshot 093659) */}
                  <div className="relative">
                    <button
                      onClick={() => setTicketCategoryDropdownOpen(!ticketCategoryDropdownOpen)}
                      className="w-full bg-[#1e1f22] hover:bg-[#232428] border border-[#202225] p-3 rounded-lg flex items-center justify-between text-left transition-all"
                    >
                      <span className="text-xs text-white font-medium flex items-center gap-2">
                        {selectedTicketCategory === 'General' && <span>⚙️</span>}
                        {selectedTicketCategory === 'High Rank' && <span>🛡️</span>}
                        {selectedTicketCategory === 'Department' && <span>👮</span>}
                        <span>{selectedTicketCategory ? selectedTicketCategory : 'Choose your category'}</span>
                      </span>
                      <ChevronDown className={`w-4 h-4 text-[#949ba4] transition-transform ${ticketCategoryDropdownOpen ? 'rotate-180 text-white' : ''}`} />
                    </button>

                    {ticketCategoryDropdownOpen && (
                      <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#111214] border border-[#202225] rounded-lg shadow-2xl overflow-hidden z-20 animate-in fade-in slide-in-from-top-1">
                        <button
                          onClick={() => {
                            setSelectedTicketCategory('General');
                            setTicketCategoryDropdownOpen(false);
                          }}
                          className={`w-full p-3 flex items-center gap-3 text-left transition-colors hover:bg-[#232428] border-b border-[#202225] ${selectedTicketCategory === 'General' ? 'bg-[#2b2d31]' : ''}`}
                        >
                          <span className="text-sm">⚙️</span>
                          <span className="text-xs font-bold text-white">General</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTicketCategory('High Rank');
                            setTicketCategoryDropdownOpen(false);
                          }}
                          className={`w-full p-3 flex items-center gap-3 text-left transition-colors hover:bg-[#232428] border-b border-[#202225] ${selectedTicketCategory === 'High Rank' ? 'bg-[#2b2d31]' : ''}`}
                        >
                          <span className="text-sm">🛡️</span>
                          <span className="text-xs font-bold text-white">High Rank</span>
                        </button>
                        <button
                          onClick={() => {
                            setSelectedTicketCategory('Department');
                            setTicketCategoryDropdownOpen(false);
                          }}
                          className={`w-full p-3 flex items-center gap-3 text-left transition-colors hover:bg-[#232428] ${selectedTicketCategory === 'Department' ? 'bg-[#2b2d31]' : ''}`}
                        >
                          <span className="text-sm">👮</span>
                          <span className="text-xs font-bold text-white">Department</span>
                        </button>
                      </div>
                    )}
                  </div>

                  {/* Ticket Welcome Card with Top Banner (Matching screenshot 093732) */}
                  <div className="rounded-lg overflow-hidden border border-[#202225] bg-[#2b2d31] shadow-xl">
                    <img
                      src="/assets/aistudio/Screenshot_2026-11-01_093732_25baf59a.png"
                      alt="Ticket Header Banner"
                      className="w-full h-24 object-cover object-top border-b border-[#202225]"
                    />
                    <div className="p-4 border-l-4 border-[#37373E] space-y-3">
                      <div className="text-base font-bold text-white">
                        Hey there carlos473 — Welcome to {selectedTicketCategory}.
                      </div>
                      <p className="text-xs text-[#dbdee1] leading-relaxed">
                        Please ensure you have thoroughly reviewed our Frequently Asked Questions and that your inquiry is unique so our Support Team can provide quality support as soon as possible. If you have any extra information in regards to your inquiry, you&apos;re recommended to add it here.
                      </p>

                      <div className="pt-2 border-t border-[#35373c] space-y-1 text-xs text-[#dbdee1]">
                        <div><strong>Username:</strong> carlos473 (<span className="bg-[#1e1f22] px-1 py-0.5 rounded text-[#949ba4] font-mono">1025813762684502168</span>)</div>
                        <div><strong>Display Name:</strong> Ronaldoiscat</div>
                        <div><strong>Created:</strong> October 1, 2022 · 4 years ago</div>
                      </div>

                      {/* Ticket Inquiry box */}
                      <div className="pt-2 border-t border-[#35373c]">
                        <div className="text-xs font-bold text-white flex items-center gap-1.5 mb-1.5">
                          <FileText className="w-4 h-4 text-[#949ba4]" /> Ticket Inquiry
                        </div>
                        <div className="p-2.5 bg-[#1e1f22] rounded border border-[#2b2d31] font-mono text-xs text-white">
                          Is true that reinstate is 30 days?
                        </div>
                      </div>

                      {/* Buttons: Claim (green), Close (red), Escalate (red) */}
                      <div className="flex gap-2 pt-2 border-t border-[#35373c]">
                        <button
                          onClick={handleTakeOverTicket}
                          className="px-3.5 py-1.5 bg-[#23a55a] hover:bg-[#1f8b4d] text-white rounded text-xs font-semibold flex items-center gap-1 shadow"
                        >
                          ✓ Claim
                        </button>
                        <button
                          onClick={() => setTicketStatusNotice('Ticket #4602 close requested. Generating transcript...')}
                          className="px-3.5 py-1.5 bg-[#da373c] hover:bg-[#a1282c] text-white rounded text-xs font-semibold flex items-center gap-1 shadow"
                        >
                          ✕ Close
                        </button>
                        <button
                          onClick={() => setTicketStatusNotice('Ticket #4602 escalated to Directive Team.')}
                          className="px-3.5 py-1.5 bg-[#da373c] hover:bg-[#a1282c] text-white rounded text-xs font-semibold flex items-center gap-1 shadow"
                        >
                          📎 Escalate
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* LIVE MULTI-TURN CONVERSATION STREAM */}
                  <div className="space-y-4 pt-2">
                    {ticketChatMessages.map((msg) => (
                      <div key={msg.id} className="flex items-start gap-3 pl-1 animate-in fade-in">
                        <div className={`w-10 h-10 rounded-full ${msg.avatarBg} flex items-center justify-center text-white font-bold text-xs shadow shrink-0`}>
                          {msg.avatarText}
                        </div>
                        <div className="space-y-1.5 w-full max-w-2xl">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">{msg.authorName}</span>
                            {msg.authorBadge && (
                              <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${msg.sender === 'staff' ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40' : 'bg-[#5865f2] text-white'}`}>
                                {msg.authorBadge}
                              </span>
                            )}
                            <span className="text-[11px] text-[#949ba4]">{msg.timestamp}</span>
                          </div>

                          {/* Plain text message */}
                          {msg.content && (
                            <div className="text-xs text-[#dbdee1] leading-relaxed bg-[#1e1f22]/60 p-2.5 rounded-lg border border-[#2b2d31]">
                              {msg.content}
                            </div>
                          )}

                          {/* Discord Embed */}
                          {msg.embed && (
                            <div className="rounded-lg overflow-hidden border border-[#202225] bg-[#2b2d31] shadow-md">
                              <div className={`p-4 border-l-4 ${msg.embed.color || 'border-[#37373E]'} space-y-3`}>
                                <div className="text-sm font-bold text-white flex items-center gap-2">
                                  {msg.embed.title}
                                </div>

                                <p className="text-xs text-[#dbdee1] leading-relaxed whitespace-pre-line">
                                  {msg.embed.body}
                                </p>

                                {/* Embed Fields */}
                                {msg.embed.fields && msg.embed.fields.length > 0 && (
                                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#35373c] text-xs">
                                    {msg.embed.fields.map((f, i) => (
                                      <div key={i} className="bg-[#1e1f22] p-2 rounded border border-[#202225]">
                                        <div className="text-[10px] font-bold text-[#949ba4] uppercase tracking-wider">{f.label}</div>
                                        <div className="text-white font-mono text-[11px] mt-0.5">{f.value}</div>
                                      </div>
                                    ))}
                                  </div>
                                )}

                                {/* Embed Footer */}
                                {msg.embed.footer && (
                                  <div className="pt-2 border-t border-[#35373c]/50 flex items-center justify-between text-[11px] text-[#949ba4]">
                                    <span className="font-medium text-[#b5bac1]">
                                      {msg.embed.footer}
                                    </span>
                                    <span className="text-[10px] text-[#80848e]">Today</span>
                                  </div>
                                )}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    ))}

                    {/* LIVE DISCORD TYPING ANIMATOR */}
                    {isBotTyping && (
                      <div className="flex items-center gap-3 pl-1 text-xs text-[#949ba4] animate-in fade-in py-1">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow shrink-0">
                          LA
                        </div>
                        <div className="flex items-center gap-2 bg-[#2b2d31] px-3 py-2 rounded-lg border border-[#35373c]">
                          <span className="font-semibold text-white">{aiBotName}</span>
                          <span>is typing</span>
                          <span className="flex gap-1 ml-1">
                            <span className="w-1.5 h-1.5 bg-[#5865f2] rounded-full animate-bounce [animation-delay:-0.3s]" />
                            <span className="w-1.5 h-1.5 bg-[#5865f2] rounded-full animate-bounce [animation-delay:-0.15s]" />
                            <span className="w-1.5 h-1.5 bg-[#5865f2] rounded-full animate-bounce" />
                          </span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* 1-CLICK QUICK TEST INQUIRIES & HANDOFF TRIGGER */}
                  <div className="p-3.5 bg-[#232428] rounded-xl border border-[#35373c] space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-[#949ba4] uppercase tracking-wider">
                        1-Click Test Responses & Autopilot Controls:
                      </span>
                      <span className="text-[11px] text-[#5865f2] font-medium">Click to simulate member typing</span>
                    </div>

                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleSendTicketMessage('How to apply for staff')}
                        className="px-3 py-1.5 bg-[#2b2d31] hover:bg-[#35373c] border border-[#35373c] text-white rounded text-xs font-medium transition-all hover:border-[#5865f2]"
                      >
                        &quot;How to apply for staff&quot;
                      </button>
                      <button
                        onClick={() => handleSendTicketMessage('Is true that reinstate is 30 days?')}
                        className="px-3 py-1.5 bg-[#2b2d31] hover:bg-[#35373c] border border-[#35373c] text-white rounded text-xs font-medium transition-all hover:border-[#5865f2]"
                      >
                        &quot;Is reinstate 30 days?&quot;
                      </button>
                      <button
                        onClick={() => handleSendTicketMessage('What are the banned items and rules?')}
                        className="px-3 py-1.5 bg-[#2b2d31] hover:bg-[#35373c] border border-[#35373c] text-white rounded text-xs font-medium transition-all hover:border-[#5865f2]"
                      >
                        &quot;What are banned items?&quot;
                      </button>
                      <button
                        onClick={() => handleSendTicketMessage('Can I donate with PayPal or USD?')}
                        className="px-3 py-1.5 bg-[#2b2d31] hover:bg-[#35373c] border border-[#35373c] text-white rounded text-xs font-medium transition-all hover:border-[#5865f2]"
                      >
                        &quot;Can I donate with USD?&quot;
                      </button>
                      {/* HUMAN HANDOFF TEST BUTTON */}
                      <button
                        onClick={() => handleSendTicketMessage('I need a real staff member')}
                        className="px-3 py-1.5 bg-red-600/20 hover:bg-red-600/30 border border-red-500/50 text-red-300 font-bold rounded text-xs transition-all flex items-center gap-1 shadow"
                      >
                        <span>🚨</span> &quot;I need a real staff member&quot; (Test Handoff)
                      </button>
                    </div>
                  </div>

                  {/* INTERACTIVE DISCORD TICKET CHAT INPUT BAR */}
                  <div className="bg-[#2b2d31] p-3 rounded-xl border border-[#35373c] space-y-2">
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        handleSendTicketMessage();
                      }}
                      className="flex items-center gap-2"
                    >
                      <input
                        type="text"
                        value={ticketChatInput}
                        onChange={(e) => setTicketChatInput(e.target.value)}
                        placeholder='Message #ticket-4602 (Type question or "I need a real staff member")...'
                        className="flex-1 px-3.5 py-2.5 bg-[#1e1f22] rounded-lg border border-[#35373c] text-xs text-white placeholder-[#949ba4] focus:outline-none focus:border-[#5865f2]"
                      />
                      <button
                        type="submit"
                        disabled={!ticketChatInput.trim()}
                        className="px-4 py-2.5 bg-[#5865f2] hover:bg-[#4752c4] disabled:opacity-50 text-white rounded-lg text-xs font-bold flex items-center gap-1.5 shadow transition-all"
                      >
                        <Send className="w-3.5 h-3.5" /> Send
                      </button>
                    </form>
                    <div className="flex items-center justify-between text-[11px] text-[#949ba4] px-1">
                      <span>💡 The Assistant AI texts & answers automatically. If member requests human staff, autopilot pauses immediately.</span>
                      <span>Staff Role: <strong>@Staff Team</strong></span>
                    </div>
                  </div>

                    {/* LIVE AI KNOWLEDGE BASE & CONFIGURATION STUDIO */}
                    <div className="rounded-xl overflow-hidden border border-[#5865f2]/40 bg-[#2b2d31] p-4 space-y-4 shadow-xl">
                      <div className="flex items-center justify-between border-b border-[#35373c] pb-3">
                        <div className="flex items-center gap-2">
                          <Sparkles className="w-5 h-5 text-[#5865f2]" />
                          <div>
                            <span className="text-sm font-bold text-white block">AI Assistant Knowledge Base & Settings Studio</span>
                            <span className="text-[11px] text-[#949ba4]">Customize the AI name, footer disclaimer, FAQs, and server answers in real time</span>
                          </div>
                        </div>
                        <button
                          onClick={() => setShowConfigStudio(!showConfigStudio)}
                          className="px-2.5 py-1 bg-[#1e1f22] hover:bg-[#35373c] text-white rounded text-xs font-medium border border-[#35373c]"
                        >
                          {showConfigStudio ? 'Hide Studio' : 'Edit Studio'}
                        </button>
                      </div>

                      {/* Studio Controls */}
                      {showConfigStudio && (
                        <div className="space-y-4 text-xs">
                          {/* 1. Global AI Branding Fields */}
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 bg-[#1e1f22] p-3 rounded-lg border border-[#35373c]">
                            <div>
                              <label className="text-[11px] font-bold text-[#949ba4] uppercase block mb-1">
                                AI Assistant Name:
                              </label>
                              <input
                                type="text"
                                value={aiBotName}
                                onChange={(e) => setAiBotName(e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-[#2b2d31] border border-[#35373c] rounded text-white text-xs focus:outline-none focus:border-[#5865f2]"
                              />
                            </div>
                            <div>
                              <label className="text-[11px] font-bold text-[#949ba4] uppercase block mb-1">
                                Staff Status Indicator:
                              </label>
                              <input
                                type="text"
                                value={aiStaffStatus}
                                onChange={(e) => setAiStaffStatus(e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-[#2b2d31] border border-[#35373c] rounded text-white text-xs focus:outline-none focus:border-[#5865f2]"
                              />
                            </div>
                            <div className="md:col-span-2">
                              <label className="text-[11px] font-bold text-[#949ba4] uppercase block mb-1">
                                Embed Footer / Disclaimer:
                              </label>
                              <input
                                type="text"
                                value={aiFooterText}
                                onChange={(e) => setAiFooterText(e.target.value)}
                                className="w-full px-2.5 py-1.5 bg-[#2b2d31] border border-[#35373c] rounded text-white text-xs focus:outline-none focus:border-[#5865f2]"
                              />
                            </div>
                          </div>

                          {/* 2. Knowledge Base Topics & Answers Editor */}
                          <div className="bg-[#1e1f22] p-3 rounded-lg border border-[#35373c] space-y-3">
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-white text-xs">Server Knowledge Base (How the AI knows everything):</span>
                              <span className="text-[11px] text-[#949ba4]">5 Topics Configured</span>
                            </div>

                            {/* Topic Tabs */}
                            <div className="flex flex-wrap gap-1.5 border-b border-[#2b2d31] pb-2">
                              {knowledgeBase.map((kb, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => setSelectedKbIndex(idx)}
                                  className={`px-2.5 py-1 rounded text-[11px] font-medium transition-all ${selectedKbIndex === idx ? 'bg-[#5865f2] text-white' : 'bg-[#2b2d31] text-[#949ba4] hover:text-white'}`}
                                >
                                  {kb.topic}
                                </button>
                              ))}
                            </div>

                            {/* Active Topic Editor */}
                            {knowledgeBase[selectedKbIndex] && (
                              <div className="space-y-2 pt-1">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                                  <div>
                                    <label className="text-[10px] text-[#949ba4] uppercase font-bold block mb-0.5">Topic Title:</label>
                                    <input
                                      type="text"
                                      value={knowledgeBase[selectedKbIndex].topic}
                                      onChange={(e) => {
                                        const updated = [...knowledgeBase];
                                        updated[selectedKbIndex].topic = e.target.value;
                                        setKnowledgeBase(updated);
                                      }}
                                      className="w-full px-2 py-1 bg-[#2b2d31] border border-[#35373c] rounded text-white text-xs"
                                    />
                                  </div>
                                  <div>
                                    <label className="text-[10px] text-[#949ba4] uppercase font-bold block mb-0.5">Trigger Keywords:</label>
                                    <input
                                      type="text"
                                      value={knowledgeBase[selectedKbIndex].keywords}
                                      onChange={(e) => {
                                        const updated = [...knowledgeBase];
                                        updated[selectedKbIndex].keywords = e.target.value;
                                        setKnowledgeBase(updated);
                                      }}
                                      className="w-full px-2 py-1 bg-[#2b2d31] border border-[#35373c] rounded text-white text-xs font-mono"
                                    />
                                  </div>
                                </div>

                                <div>
                                  <label className="text-[10px] text-[#949ba4] uppercase font-bold block mb-0.5">Official Knowledge / Answer:</label>
                                  <textarea
                                    rows={3}
                                    value={knowledgeBase[selectedKbIndex].content}
                                    onChange={(e) => {
                                      const updated = [...knowledgeBase];
                                      updated[selectedKbIndex].content = e.target.value;
                                      setKnowledgeBase(updated);
                                    }}
                                    className="w-full p-2 bg-[#2b2d31] border border-[#35373c] rounded text-white text-xs leading-relaxed focus:outline-none focus:border-[#5865f2]"
                                  />
                                </div>
                              </div>
                            )}
                          </div>

                          {/* 3. Preset Question Testers */}
                          <div className="space-y-1.5">
                            <span className="text-[11px] font-bold text-[#949ba4] uppercase">1-Click Test Inquiries:</span>
                            <div className="flex flex-wrap gap-1.5">
                              {[
                                'How to apply for staff',
                                'Is true that reinstate is 30 days?',
                                'What are the banned items?',
                                'How much is a sponsored giveaway?',
                                'What law enforcement departments exist?'
                              ].map((q, idx) => (
                                <button
                                  key={idx}
                                  onClick={() => {
                                    setTicketInquiry(q);
                                    triggerGroqSimulation(q);
                                  }}
                                  className="px-2.5 py-1 bg-[#1e1f22] hover:bg-[#35373c] border border-[#35373c] text-white rounded text-[11px] font-mono transition-all hover:border-[#5865f2]"
                                >
                                  &quot;{q}&quot;
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* 4. Custom Inquiry Bar */}
                          <div className="flex gap-2 pt-1">
                            <input
                              type="text"
                              value={ticketInquiry}
                              onChange={(e) => setTicketInquiry(e.target.value)}
                              placeholder="Type custom question (e.g. How to apply for staff)..."
                              className="flex-1 px-3 py-1.5 bg-[#1e1f22] rounded border border-[#35373c] text-xs text-white placeholder-[#949ba4] focus:outline-none focus:border-[#5865f2]"
                            />
                            <button
                              onClick={() => triggerGroqSimulation(ticketInquiry)}
                              className="px-3.5 py-1.5 bg-[#5865f2] hover:bg-[#4752c4] text-white font-semibold rounded text-xs flex items-center gap-1.5 shadow"
                            >
                              <Send className="w-3.5 h-3.5" /> Ask AI Assistant
                            </button>
                          </div>
                        </div>
                      )}
                    </div>

                  {/* Closed Ticket Receipt with Online Transcript (Matching screenshot 093924) */}
                  <div className="rounded-lg overflow-hidden border border-[#202225] bg-[#2b2d31]">
                    <div className="p-4 border-l-4 border-[#37373E] space-y-3">
                      <div>
                        <h3 className="text-base font-bold text-white">Ticket #4602 — General Support</h3>
                        <p className="text-xs text-[#dbdee1] mt-1">
                          Your <strong className="text-white">General Support</strong> ticket has been closed.<br />
                          ╰ <strong>Handled By:</strong> <span className="bg-[#5865f2]/30 text-white px-1 py-0.2 rounded font-mono">@joey_him19</span><br />
                          ╰ <strong>Closed By:</strong> <span className="bg-[#5865f2]/30 text-white px-1 py-0.2 rounded font-mono">@joey_him19</span>
                        </p>
                      </div>

                      <div className="space-y-1 text-xs text-[#dbdee1]">
                        <div>🕐 <strong>Opened:</strong> November 1, 2026 at 9:37 AM</div>
                        <div>🕐 <strong>Closed:</strong> 15 seconds ago</div>
                        <div>⏱️ <strong>Duration:</strong> 1m</div>
                        <div>✉️ <strong>Messages Sent:</strong> 2 messages</div>
                      </div>

                      <button className="px-3 py-1.5 bg-[#4e5058] hover:bg-[#6d6f78] text-white rounded text-xs font-medium flex items-center gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5" /> Online Transcript
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 6. PROFESSIONAL MARKETPLACE (Matching Screenshots 093552, 093603, 093617, 093625) */}
              {activeChannel === 'marketplace' && (
                <div className="space-y-6">
                  {/* MAIN MARKETPLACE CHANNEL POST */}
                  <div className="flex items-start gap-3 pl-1">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow shrink-0">
                      LA
                    </div>
                    <div className="space-y-3 w-full max-w-2xl">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-white">Los Angeles Assistant AI</span>
                        <span className="px-1.5 py-0.5 bg-[#5865f2] text-white text-[10px] font-bold rounded uppercase tracking-wider">
                          APP
                        </span>
                        <span className="px-1.5 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-semibold rounded">
                          Assistant AI
                        </span>
                        <span className="text-[11px] text-[#949ba4]">Today at 9:35 AM</span>
                      </div>

                      {/* Main Dual-Banner Marketplace Embed */}
                      <div className="rounded-lg overflow-hidden border border-[#202225] bg-[#2b2d31] shadow-xl">
                        <img
                          src="https://images.unsplash.com/photo-1518684079-3c830dcef090?auto=format&fit=crop&w=1200&q=80"
                          alt="Marketplace Banner"
                          className="w-full h-32 object-cover object-center"
                        />
                        <div className="p-4 border-l-4 border-[#37373E] space-y-3">
                          <h2 className="text-lg font-bold text-white">Marketplace</h2>
                          <p className="text-xs text-[#dbdee1] leading-relaxed">
                            We offer a large range of different products inside of our marketplace. All transactions are final, we do not offer refunds to users who decide they no longer want their purchase.
                          </p>
                          <p className="text-xs text-[#dbdee1] font-medium">
                            We only accept Robux payments, real world money is not accepted at this time.
                          </p>
                        </div>
                      </div>

                      {/* Dropdown Select Menu (Matching Screenshot 093552) */}
                      <div className="relative">
                        <div className="text-[11px] text-[#949ba4] mb-1 font-mono">
                          We only accept Robux payments, real world money is not accepted at this time.
                        </div>
                        <button
                          onClick={() => setMarketDropdownOpen(!marketDropdownOpen)}
                          className="w-full bg-[#1e1f22] hover:bg-[#232428] border border-[#202225] p-3 rounded-lg flex items-center justify-between text-left transition-all"
                        >
                          <span className="text-xs text-white font-medium">
                            {selectedMarketOption === 'sponsored_giveaway'
                              ? 'Sponsored Giveaway'
                              : selectedMarketOption === 'paid_ad'
                              ? 'Paid Advertisement'
                              : selectedMarketOption === 'donations'
                              ? 'Donations'
                              : 'Browse our market!'}
                          </span>
                          <ChevronDown className={`w-4 h-4 text-[#949ba4] transition-transform ${marketDropdownOpen ? 'rotate-180 text-white' : ''}`} />
                        </button>

                        {/* Dropdown Options Menu */}
                        {marketDropdownOpen && (
                          <div className="absolute top-full left-0 right-0 mt-1.5 bg-[#111214] border border-[#202225] rounded-lg shadow-2xl overflow-hidden z-20 animate-in fade-in slide-in-from-top-1">
                            <button
                              onClick={() => {
                                setSelectedMarketOption('sponsored_giveaway');
                                setMarketDropdownOpen(false);
                              }}
                              className={`w-full p-3 flex items-start gap-3 text-left transition-colors hover:bg-[#232428] ${selectedMarketOption === 'sponsored_giveaway' ? 'bg-[#2b2d31]' : ''}`}
                            >
                              <span className="text-white text-sm font-bold mt-0.5">›</span>
                              <div>
                                <div className="text-xs font-bold text-white">Sponsored Giveaway</div>
                                <div className="text-[11px] text-[#949ba4]">@ everyone ping is included with this purchase.</div>
                              </div>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedMarketOption('paid_ad');
                                setMarketDropdownOpen(false);
                              }}
                              className={`w-full p-3 flex items-start gap-3 text-left transition-colors hover:bg-[#232428] border-t border-[#202225] ${selectedMarketOption === 'paid_ad' ? 'bg-[#2b2d31]' : ''}`}
                            >
                              <span className="text-white text-sm font-bold mt-0.5">›</span>
                              <div>
                                <div className="text-xs font-bold text-white">Paid Advertisement</div>
                                <div className="text-[11px] text-[#949ba4]">@ everyone ping is included with this purchase.</div>
                              </div>
                            </button>

                            <button
                              onClick={() => {
                                setSelectedMarketOption('donations');
                                setMarketDropdownOpen(false);
                              }}
                              className={`w-full p-3 flex items-start gap-3 text-left transition-colors hover:bg-[#232428] border-t border-[#202225] ${selectedMarketOption === 'donations' ? 'bg-[#2b2d31]' : ''}`}
                            >
                              <span className="text-white text-sm font-bold mt-0.5">›</span>
                              <div>
                                <div className="text-xs font-bold text-white">Donations</div>
                                <div className="text-[11px] text-[#949ba4]">All donations go directly back to our community.</div>
                              </div>
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* EPHEMERAL INTERACTION RESPONSE EMBED (Matching Screenshots 093617 & 093625) */}
                  {selectedMarketOption && (
                    <div className="pt-2">
                      {/* Thread Interaction Indicator */}
                      <div className="flex items-center gap-2 pl-4 text-xs text-[#949ba4] mb-1 font-medium">
                        <div className="w-4 h-4 rounded-full bg-[#5865f2] flex items-center justify-center text-[8px] text-white font-bold">
                          LA
                        </div>
                        <span className="px-1 py-0.2 bg-[#5865f2] text-white text-[9px] font-bold rounded uppercase">
                          APP
                        </span>
                        <span className="text-[#dbdee1] font-semibold">Los Angeles Assistant AI</span>
                        <span className="italic text-[#949ba4]">Click to see message</span>
                      </div>

                      {/* Main Message Block */}
                      <div className="flex items-start gap-3 pl-1">
                        <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow shrink-0">
                          LA
                        </div>
                        <div className="space-y-2 w-full max-w-2xl">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white">Los Angeles Assistant AI</span>
                            <span className="px-1.5 py-0.5 bg-[#5865f2] text-white text-[10px] font-bold rounded uppercase tracking-wider">
                              APP
                            </span>
                            <span className="text-[11px] text-[#949ba4]">9:36 AM</span>
                          </div>

                          {/* OPTION 1: SPONSORED GIVEAWAY */}
                          {selectedMarketOption === 'sponsored_giveaway' && (
                            <div className="rounded-lg overflow-hidden border border-[#202225] bg-[#2b2d31] p-4 space-y-4 shadow-lg">
                              <h3 className="text-lg font-bold text-white">Promotional Option 1</h3>

                              {/* Quote block */}
                              <div className="border-l-4 border-[#4e5058] pl-3 py-0.5 text-xs text-[#dbdee1] leading-relaxed">
                                You can purchase the sponsored giveaway using the linked button provided attached to the embed. Please ensure you see promotional policy prior to purchase to ensure maximum efficiency.
                              </div>

                              {/* Item Row with Purchase Button */}
                              <div className="flex items-center justify-between pt-1">
                                <div>
                                  <div className="text-sm font-bold text-white">Sponsored Giveaway</div>
                                  <div className="text-xs text-[#00a8fc] font-semibold mt-0.5">R$ 500</div>
                                  <div className="text-[11px] text-[#949ba4] mt-0.5">Already bought it? Submit your giveaway by opening a support ticket.</div>
                                </div>
                                <button
                                  onClick={() => setPurchaseModalItem({ title: 'Sponsored Giveaway', price: 'R$ 500', url: giveawayLink })}
                                  className="px-3.5 py-1.5 bg-[#4e5058] hover:bg-[#6d6f78] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow"
                                >
                                  Purchase <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Information Section */}
                              <div className="pt-2 border-t border-[#35373c] space-y-1">
                                <h4 className="text-sm font-bold text-white">Sponsored Giveaway Information</h4>
                                <p className="text-xs text-[#dbdee1] leading-relaxed">
                                  Your prize must be greater than R$ 500 or $5 in value, we do not post giveaways with lower prizes than that, and will not argue on the matter. We do not offer refunds, so its your job to read the fine print prior to purchase.
                                </p>
                              </div>
                            </div>
                          )}

                          {/* OPTION 2: PAID ADVERTISEMENT (Screenshot 093617) */}
                          {selectedMarketOption === 'paid_ad' && (
                            <div className="rounded-lg overflow-hidden border border-[#202225] bg-[#2b2d31] p-4 space-y-4 shadow-lg">
                              <h3 className="text-lg font-bold text-white">Promotional Option 2</h3>

                              {/* Quote block */}
                              <div className="border-l-4 border-[#4e5058] pl-3 py-0.5 text-xs text-[#dbdee1] leading-relaxed">
                                You can purchase the paid advertisement using the linked button provided attached to the embed. Please ensure you see promotional policy prior to purchase to ensure maximum efficiency.
                              </div>

                              {/* Item Row with Purchase Button */}
                              <div className="flex items-center justify-between pt-1">
                                <div>
                                  <div className="text-sm font-bold text-white">Paid Advertisement</div>
                                  <div className="text-xs text-[#00a8fc] font-semibold mt-0.5">R$ 350</div>
                                  <div className="text-[11px] text-[#949ba4] mt-0.5">Already bought it? Submit your advertisement by opening a support ticket.</div>
                                </div>
                                <button
                                  onClick={() => setPurchaseModalItem({ title: 'Paid Advertisement', price: 'R$ 350', url: paidAdLink })}
                                  className="px-3.5 py-1.5 bg-[#4e5058] hover:bg-[#6d6f78] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow"
                                >
                                  Purchase <ExternalLink className="w-3.5 h-3.5" />
                                </button>
                              </div>

                              {/* Information Section */}
                              <div className="pt-2 border-t border-[#35373c] space-y-1">
                                <h4 className="text-sm font-bold text-white">Paid Ad Information</h4>
                                <p className="text-xs text-[#dbdee1] leading-relaxed">
                                  Your advertisement must be clean, organized, and target the direct point of advert. No crazy long advertisements or poorly communicated advertisements that lack organization.
                                </p>
                              </div>
                            </div>
                          )}

                          {/* OPTION 3: DONATIONS (Screenshot 093625) */}
                          {selectedMarketOption === 'donations' && (
                            <div className="rounded-lg overflow-hidden border border-[#202225] bg-[#2b2d31] p-4 space-y-4 shadow-lg">
                              <h3 className="text-lg font-bold text-white">Donations</h3>

                              {/* Quote block */}
                              <div className="border-l-4 border-[#4e5058] pl-3 py-0.5 text-xs text-[#dbdee1] leading-relaxed">
                                We are extremely thankful for the generous members that wish to donate and give back to our community. All funds donated go directly back into the server for upgraded customization and features.
                              </div>

                              {/* Donation Options Section */}
                              <div className="space-y-3 pt-1">
                                <h4 className="text-sm font-bold text-white">Donation Options</h4>

                                <div className="space-y-3 text-xs">
                                  <div>
                                    <div className="text-white font-medium">500 Robux Donation</div>
                                    <button
                                      onClick={() => setPurchaseModalItem({ title: '500 Robux Donation', price: 'R$ 500', url: donation500Link })}
                                      className="text-[#00a8fc] hover:underline font-semibold flex items-center gap-1 mt-0.5"
                                    >
                                      R$ 500 <ExternalLink className="w-3 h-3" />
                                    </button>
                                  </div>

                                  <div>
                                    <div className="text-white font-medium">1000 Robux Donation</div>
                                    <button
                                      onClick={() => setPurchaseModalItem({ title: '1000 Robux Donation', price: 'R$ 1000', url: donation1000Link })}
                                      className="text-[#00a8fc] hover:underline font-semibold flex items-center gap-1 mt-0.5"
                                    >
                                      R$ 1000 <ExternalLink className="w-3 h-3" />
                                    </button>
                                  </div>

                                  <div>
                                    <div className="text-white font-medium">1500 Robux Donation</div>
                                    <button
                                      onClick={() => setPurchaseModalItem({ title: '1500 Robux Donation', price: 'R$ 1500', url: donation1500Link })}
                                      className="text-[#00a8fc] hover:underline font-semibold flex items-center gap-1 mt-0.5"
                                    >
                                      R$ 1500 <ExternalLink className="w-3 h-3" />
                                    </button>
                                  </div>

                                  <div>
                                    <div className="text-white font-medium">2000 Robux Donation</div>
                                    <button
                                      onClick={() => setPurchaseModalItem({ title: '2000 Robux Donation', price: 'R$ 2000', url: donation2000Link })}
                                      className="text-[#00a8fc] hover:underline font-semibold flex items-center gap-1 mt-0.5"
                                    >
                                      R$ 2000 <ExternalLink className="w-3 h-3" />
                                    </button>
                                  </div>
                                </div>

                                <div className="text-xs text-[#dbdee1] pt-1">
                                  Donated already? Claim your <strong className="text-white">Donator</strong> role in a ticket.
                                </div>

                                {/* Attached Link Buttons */}
                                <div className="flex flex-wrap gap-2 pt-2 border-t border-[#35373c]">
                                  <button
                                    onClick={() => setPurchaseModalItem({ title: '500 Robux Donation', price: 'R$ 500', url: donation500Link })}
                                    className="px-3 py-1.5 bg-[#4e5058] hover:bg-[#6d6f78] text-white rounded text-xs font-semibold flex items-center gap-1 shadow"
                                  >
                                    R$ 500 <ExternalLink className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => setPurchaseModalItem({ title: '1000 Robux Donation', price: 'R$ 1000', url: donation1000Link })}
                                    className="px-3 py-1.5 bg-[#4e5058] hover:bg-[#6d6f78] text-white rounded text-xs font-semibold flex items-center gap-1 shadow"
                                  >
                                    R$ 1000 <ExternalLink className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => setPurchaseModalItem({ title: '1500 Robux Donation', price: 'R$ 1500', url: donation1500Link })}
                                    className="px-3 py-1.5 bg-[#4e5058] hover:bg-[#6d6f78] text-white rounded text-xs font-semibold flex items-center gap-1 shadow"
                                  >
                                    R$ 1500 <ExternalLink className="w-3 h-3" />
                                  </button>
                                  <button
                                    onClick={() => setPurchaseModalItem({ title: '2000 Robux Donation', price: 'R$ 2000', url: donation2000Link })}
                                    className="px-3 py-1.5 bg-[#4e5058] hover:bg-[#6d6f78] text-white rounded text-xs font-semibold flex items-center gap-1 shadow"
                                  >
                                    R$ 2000 <ExternalLink className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                          )}

                          {/* Ephemeral Notice & Dismiss Button (Matching Screenshot) */}
                          <div className="flex items-center justify-between text-xs text-[#949ba4] pt-1">
                            <span className="flex items-center gap-1.5">
                              <span>👁️</span> Only you can see this · <button onClick={() => setSelectedMarketOption(null)} className="text-[#00a8fc] hover:underline font-medium">Dismiss message</button>
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MARKETPLACE LINKS & GAMEPASS CONFIG STUDIO */}
                  <div className="rounded-xl overflow-hidden border border-[#202225] bg-[#2b2d31] p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Sparkles className="w-4 h-4 text-[#5865f2]" />
                        <span className="text-xs font-bold text-white">Roblox Marketplace Gamepass Links & Pricing</span>
                      </div>
                      <button
                        onClick={() => setShowMarketConfig(!showMarketConfig)}
                        className="px-2.5 py-1 bg-[#1e1f22] hover:bg-[#35373c] text-white rounded text-xs font-medium border border-[#35373c]"
                      >
                        {showMarketConfig ? 'Hide Config' : 'Configure Links'}
                      </button>
                    </div>

                    {showMarketConfig && (
                      <div className="space-y-3 pt-2 text-xs border-t border-[#35373c]">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <div>
                            <label className="text-[10px] uppercase font-bold text-[#949ba4] block mb-1">
                              Sponsored Giveaway (R$ 500) Roblox URL:
                            </label>
                            <input
                              type="text"
                              value={giveawayLink}
                              onChange={(e) => setGiveawayLink(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#1e1f22] border border-[#35373c] rounded text-white text-xs font-mono"
                            />
                          </div>

                          <div>
                            <label className="text-[10px] uppercase font-bold text-[#949ba4] block mb-1">
                              Paid Advertisement (R$ 350) Roblox URL:
                            </label>
                            <input
                              type="text"
                              value={paidAdLink}
                              onChange={(e) => setPaidAdLink(e.target.value)}
                              className="w-full px-2.5 py-1.5 bg-[#1e1f22] border border-[#35373c] rounded text-white text-xs font-mono"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-2">
                          <div>
                            <label className="text-[10px] text-[#949ba4] font-bold block mb-1">R$ 500 Gamepass Link:</label>
                            <input
                              type="text"
                              value={donation500Link}
                              onChange={(e) => setDonation500Link(e.target.value)}
                              className="w-full px-2 py-1 bg-[#1e1f22] border border-[#35373c] rounded text-white text-[11px] font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-[#949ba4] font-bold block mb-1">R$ 1000 Gamepass Link:</label>
                            <input
                              type="text"
                              value={donation1000Link}
                              onChange={(e) => setDonation1000Link(e.target.value)}
                              className="w-full px-2 py-1 bg-[#1e1f22] border border-[#35373c] rounded text-white text-[11px] font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-[#949ba4] font-bold block mb-1">R$ 1500 Gamepass Link:</label>
                            <input
                              type="text"
                              value={donation1500Link}
                              onChange={(e) => setDonation1500Link(e.target.value)}
                              className="w-full px-2 py-1 bg-[#1e1f22] border border-[#35373c] rounded text-white text-[11px] font-mono"
                            />
                          </div>
                          <div>
                            <label className="text-[10px] text-[#949ba4] font-bold block mb-1">R$ 2000 Gamepass Link:</label>
                            <input
                              type="text"
                              value={donation2000Link}
                              onChange={(e) => setDonation2000Link(e.target.value)}
                              className="w-full px-2 py-1 bg-[#1e1f22] border border-[#35373c] rounded text-white text-[11px] font-mono"
                            />
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* ROBLOX PURCHASE LINK MODAL (Interactive) */}
                  {purchaseModalItem && (
                    <div className="fixed inset-0 bg-black/70 flex items-center justify-center p-4 z-50 animate-in fade-in">
                      <div className="bg-[#2b2d31] border border-[#35373c] rounded-xl max-w-md w-full p-5 space-y-4 shadow-2xl">
                        <div className="flex items-center justify-between border-b border-[#35373c] pb-3">
                          <h3 className="text-base font-bold text-white flex items-center gap-2">
                            <span>🛍️</span> Roblox Purchase Link
                          </h3>
                          <button
                            onClick={() => setPurchaseModalItem(null)}
                            className="text-[#949ba4] hover:text-white"
                          >
                            ✕
                          </button>
                        </div>

                        <div className="space-y-2 text-xs">
                          <div className="flex justify-between items-center bg-[#1e1f22] p-3 rounded-lg border border-[#35373c]">
                            <div>
                              <span className="text-[#949ba4] block text-[10px] uppercase font-bold">Item:</span>
                              <strong className="text-white text-sm">{purchaseModalItem.title}</strong>
                            </div>
                            <span className="text-[#00a8fc] font-bold text-sm">{purchaseModalItem.price}</span>
                          </div>

                          <div>
                            <label className="text-[10px] uppercase font-bold text-[#949ba4] block mb-1">
                              Roblox Gamepass / Asset URL:
                            </label>
                            <div className="p-2.5 bg-[#1e1f22] rounded border border-[#35373c] font-mono text-[11px] text-[#00a8fc] break-all">
                              {purchaseModalItem.url}
                            </div>
                          </div>
                        </div>

                        <div className="flex justify-end gap-2 pt-2">
                          <button
                            onClick={() => {
                              copyToClipboard(purchaseModalItem.url, 'roblox_url');
                            }}
                            className="px-3 py-1.5 bg-[#383a40] hover:bg-[#404249] text-white rounded text-xs font-medium flex items-center gap-1.5"
                          >
                            <Copy className="w-3.5 h-3.5" />
                            {copiedKey === 'roblox_url' ? 'Copied Link!' : 'Copy Link'}
                          </button>
                          <a
                            href={purchaseModalItem.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-4 py-1.5 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded text-xs font-semibold flex items-center gap-1.5 shadow"
                          >
                            Open on Roblox <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 7. MUSIC SYSTEM */}
              {activeChannel === 'music' && (
                <div className="space-y-6">
                  <div className="rounded-lg overflow-hidden border border-[#202225] bg-[#2b2d31] shadow-xl">
                    <img
                      src="https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?auto=format&fit=crop&w=1200&q=80"
                      alt="Music Top"
                      className="w-full h-32 object-cover"
                    />
                    <div className="p-5 border-l-4 border-[#37373E] space-y-4">
                      <div>
                        <div className="text-xs font-bold text-[#5865f2] uppercase tracking-wider">LOS ANGELES ROLEPLAY — NOW PLAYING</div>
                        <a href="#" className="text-lg font-bold text-white hover:underline mt-1 block">
                          California Love - 2Pac ft. Dr. Dre
                        </a>
                      </div>

                      {/* Live Text Progress Bar */}
                      <div className="bg-[#1e1f22] p-3 rounded font-mono text-xs flex items-center justify-between text-white border border-[#202225]">
                        <span className="text-[#949ba4]">{formatTime(playbackSeconds)}</span>
                        <span className="text-[#5865f2] font-bold tracking-widest">
                          {renderProgressBar(playbackSeconds, totalDuration)}
                        </span>
                        <span className="text-[#949ba4]">{formatTime(totalDuration)}</span>
                      </div>

                      {/* Metadata Grid */}
                      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs bg-[#1e1f22] p-3 rounded">
                        <div><span className="text-[#949ba4]">👤 Artist:</span> <span className="text-white ml-1">2PacVEVO</span></div>
                        <div><span className="text-[#949ba4]">⏳ Duration:</span> <span className="text-white ml-1">04:45</span></div>
                        <div><span className="text-[#949ba4]">🎧 Requested By:</span> <span className="text-[#5865f2] ml-1">@Carlos473</span></div>
                        <div><span className="text-[#949ba4]">🔊 Volume:</span> <span className="text-white ml-1">70%</span></div>
                        <div><span className="text-[#949ba4]">🔁 Loop:</span> <span className="text-white ml-1">OFF</span></div>
                        <div><span className="text-[#949ba4]">📑 Queue Size:</span> <span className="text-white ml-1">4 Songs</span></div>
                      </div>

                      {/* Control Button Rows */}
                      <div className="space-y-2 pt-2">
                        <div className="flex gap-2">
                          <button className="flex-1 py-2 bg-[#4e5058] hover:bg-[#6d6f78] text-white rounded text-xs font-medium flex items-center justify-center gap-1.5">
                            <SkipBack className="w-4 h-4" /> Previous
                          </button>
                          <button
                            onClick={() => setIsPlaying(!isPlaying)}
                            className="flex-1 py-2 bg-[#5865f2] hover:bg-[#4752c4] text-white rounded text-xs font-semibold flex items-center justify-center gap-1.5"
                          >
                            {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                            {isPlaying ? 'Pause' : 'Resume'}
                          </button>
                          <button className="flex-1 py-2 bg-[#4e5058] hover:bg-[#6d6f78] text-white rounded text-xs font-medium flex items-center justify-center gap-1.5">
                            <SkipForward className="w-4 h-4" /> Skip
                          </button>
                        </div>
                        <div className="flex gap-2">
                          <button className="flex-1 py-2 bg-[#da373c] hover:bg-[#a1282c] text-white rounded text-xs font-medium flex items-center justify-center gap-1.5">
                            <Square className="w-4 h-4" /> Stop
                          </button>
                          <button className="flex-1 py-2 bg-[#4e5058] hover:bg-[#6d6f78] text-white rounded text-xs font-medium flex items-center justify-center gap-1.5">
                            <Repeat className="w-4 h-4" /> Loop
                          </button>
                          <button className="flex-1 py-2 bg-[#4e5058] hover:bg-[#6d6f78] text-white rounded text-xs font-medium flex items-center justify-center gap-1.5">
                            <Shuffle className="w-4 h-4" /> Shuffle
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 8. VERIFICATION */}
              {activeChannel === 'verify' && (
                <div className="space-y-6">
                  {/* Matching screenshot 094257 */}
                  <div className="p-4 bg-[#2b2d31] rounded-lg border border-[#202225] space-y-3">
                    <div className="text-xs text-[#949ba4] font-semibold">Bloxlink / Original LARP Verification</div>
                    <p className="text-xs text-[#dbdee1]">
                      Welcome to <strong className="text-white">Los Angeles Roleplay</strong>! Click the button below to Verify your account and gain access to the rest of the server.
                    </p>
                    <div className="flex gap-2 pt-1">
                      <button className="px-3.5 py-1.5 bg-[#23a55a] hover:bg-[#1f8b4d] text-white rounded text-xs font-semibold flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Verify Account
                      </button>
                      <button className="px-3 py-1.5 bg-[#4e5058] hover:bg-[#6d6f78] text-white rounded text-xs font-medium flex items-center gap-1.5">
                        <ExternalLink className="w-3.5 h-3.5" /> Need help?
                      </button>
                    </div>
                  </div>

                  {/* Welcome 19,832nd Member Notice (Matching screenshot 094238) */}
                  <div className="p-4 bg-[#2b2d31] rounded-lg border border-[#202225] space-y-2">
                    <p className="text-xs text-[#dbdee1]">
                      👋 Welcome <span className="bg-[#5865f2]/30 text-white px-1.5 py-0.5 rounded font-mono">@123ThatsEnoughFo1</span> to <strong className="text-white">Los Angeles Roleplay</strong>! You are our <strong className="text-white font-mono">19,832nd</strong> member, we hope you enjoy your stay!
                    </p>
                    <div className="text-[11px] text-[#949ba4]">Ensure to verify to stop in-game Private Messages.</div>
                    <div className="flex gap-2 pt-1">
                      <button className="px-2.5 py-1 bg-[#4e5058] hover:bg-[#6d6f78] text-white rounded text-xs font-medium">Verify ↗</button>
                      <span className="px-2.5 py-1 bg-[#1e1f22] text-[#949ba4] rounded text-xs font-mono">19,832</span>
                    </div>
                  </div>
                </div>
              )}

              {/* 9. SERVER STATS & BOOSTER (From screenshot 094216) */}
              {activeChannel === 'serverstats' && (
                <div className="space-y-6">
                  <div className="rounded-lg overflow-hidden border border-[#202225] bg-[#2b2d31] p-4 border-l-4 border-[#f47fff]">
                    <div className="text-sm font-bold text-white flex items-center gap-1.5">
                      💎 Thank You for Boosting!
                    </div>
                    <p className="text-xs text-[#dbdee1] mt-1.5">
                      Thank you <span className="bg-[#f47fff]/20 text-[#f47fff] px-1.5 py-0.5 rounded font-mono">@KeyArch1ve</span> for boosting <strong className="text-white">Los Angeles Roleplay</strong>! Your support helps keep the community going. As a thank you, you&apos;ve been given the <span className="bg-[#f47fff]/30 text-[#f47fff] px-1 rounded font-semibold">@Server Booster</span> role.
                    </p>
                    <div className="text-xs text-[#949ba4] mt-2">🎁 We&apos;re now at <strong className="text-white font-mono">35</strong> boosts.</div>
                  </div>
                </div>
              )}

              {/* 10. DEPARTMENTS (From screenshot 094413) */}
              {activeChannel === 'departments' && (
                <div className="space-y-6">
                  <div className="rounded-lg overflow-hidden border border-[#202225] bg-[#2b2d31] p-5 border-l-4 border-[#37373E] space-y-4">
                    <h3 className="text-lg font-bold text-white">Departments</h3>
                    <p className="text-xs text-[#dbdee1] leading-relaxed">
                      This channel contains a list of all available departments within our community. Browse through the departments below to learn more about each one and find the department that best suits your interests. Once you&apos;ve found one you like, you can apply and begin your journey with the department.
                    </p>

                    <div className="space-y-2 text-xs">
                      <div className="flex items-center justify-between p-3 bg-[#1e1f22] rounded">
                        <div>
                          <strong className="text-white text-sm">⭐ Los Angeles Police Department</strong>
                          <div className="text-[#949ba4]">Fully Whitelisted.</div>
                        </div>
                        <button className="px-3 py-1.5 bg-[#4e5058] hover:bg-[#6d6f78] text-white rounded text-xs font-medium">Join ↗</button>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-[#1e1f22] rounded">
                        <div>
                          <strong className="text-white text-sm">🚔 California Highway Patrol</strong>
                          <div className="text-[#949ba4]">Fully Whitelisted.</div>
                        </div>
                        <button className="px-3 py-1.5 bg-[#4e5058] hover:bg-[#6d6f78] text-white rounded text-xs font-medium">Join ↗</button>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-[#1e1f22] rounded">
                        <div>
                          <strong className="text-white text-sm">🛡️ Los Angeles County Sheriff&apos;s Dept</strong>
                          <div className="text-[#949ba4]">Fully Whitelisted.</div>
                        </div>
                        <button className="px-3 py-1.5 bg-[#4e5058] hover:bg-[#6d6f78] text-white rounded text-xs font-medium">Join ↗</button>
                      </div>

                      <div className="flex items-center justify-between p-3 bg-[#1e1f22] rounded">
                        <div>
                          <strong className="text-white text-sm">🕵️ Federal Bureau of Investigation</strong>
                          <div className="text-[#949ba4]">Fully Whitelisted.</div>
                        </div>
                        <button className="px-3 py-1.5 bg-[#4e5058] hover:bg-[#6d6f78] text-white rounded text-xs font-medium">Join ↗</button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: 100 STATUSES & 50 BIOS */}
          {activeTab === 'statuses' && (
            <div className="max-w-4xl mx-auto space-y-8">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Radio className="w-5 h-5 text-[#5865f2]" />
                  100 Rotating Statuses & 50 Rotating Bios by Carlos473
                </h2>
                <p className="text-xs text-[#949ba4] mt-1">
                  Automatic 30-second cycle across 100 Los Angeles activities, plus 50 rotating Application Bios cycling every 15 minutes.
                </p>
              </div>

              {/* Active Presence Banner Card */}
              <div className="p-5 bg-[#2b2d31] rounded-xl border border-[#202225] space-y-4">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-bold text-[#5865f2] uppercase tracking-wider">
                    Current Active Presence [{statusIndex + 1}/100]
                  </div>
                  <div className="text-xs text-[#949ba4] font-mono">
                    Timer: <span className="text-white font-bold">{statusTimer}s</span>
                  </div>
                </div>

                <div className="p-4 bg-[#1e1f22] rounded-lg border border-[#35373c] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="px-2 py-0.5 rounded text-xs font-bold bg-[#5865f2] text-white">
                      {ALL_100_STATUSES[statusIndex].type}
                    </span>
                    <span className="text-base font-semibold text-white">
                      {ALL_100_STATUSES[statusIndex].text}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setStatusIndex((prev) => (prev + 1) % ALL_100_STATUSES.length);
                      setStatusTimer(30);
                    }}
                    className="px-3 py-1 bg-[#383a40] hover:bg-[#404249] text-white rounded text-xs font-medium"
                  >
                    Next Status ➔
                  </button>
                </div>

                {/* Active Bio */}
                <div className="space-y-1.5 pt-2">
                  <div className="text-xs font-bold text-[#23a55a] uppercase tracking-wider">
                    Current Active Application &apos;About Me&apos; Bio [{bioIndex + 1}/50]
                  </div>
                  <div className="p-3 bg-[#1e1f22] rounded-lg border border-[#35373c] flex items-center justify-between">
                    <span className="text-xs text-[#dbdee1] italic">
                      &quot;{ALL_50_BIOS[bioIndex].text}&quot;
                    </span>
                    <button
                      onClick={() => setBioIndex((prev) => (prev + 1) % ALL_50_BIOS.length)}
                      className="px-2.5 py-1 bg-[#383a40] hover:bg-[#404249] text-white rounded text-xs shrink-0 ml-3"
                    >
                      Cycle Bio
                    </button>
                  </div>
                </div>
              </div>

              {/* 100 Statuses list */}
              <div className="space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                  Complete Inventory: All 100 Watching & Listening Statuses
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto p-1">
                  {ALL_100_STATUSES.map((st) => (
                    <div
                      key={st.id}
                      onClick={() => {
                        setStatusIndex(st.id - 1);
                        setStatusTimer(30);
                      }}
                      className={`p-2.5 rounded-lg border text-xs cursor-pointer transition-colors flex items-center justify-between ${statusIndex === st.id - 1 ? 'bg-[#404249] border-[#5865f2] text-white' : 'bg-[#2b2d31] border-[#202225] text-[#dbdee1] hover:bg-[#35373c]'}`}
                    >
                      <div className="flex items-center gap-2 truncate">
                        <span className="text-[#949ba4] font-mono text-[10px] w-6 shrink-0">#{st.id}</span>
                        <span className="px-1.5 py-0.5 rounded text-[10px] bg-[#1e1f22] text-[#949ba4] font-medium shrink-0">
                          {st.type}
                        </span>
                        <span className="truncate">{st.text}</span>
                      </div>
                      {statusIndex === st.id - 1 && (
                        <span className="w-2 h-2 rounded-full bg-[#23a55a] shrink-0" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: 100 SLASH COMMANDS EXPLORER */}
          {activeTab === 'commands' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-white flex items-center gap-2">
                    <Terminal className="w-5 h-5 text-[#5865f2]" />
                    Exact 100 Slash Commands Registry
                  </h2>
                  <p className="text-xs text-[#949ba4] mt-1">
                    Every command is registered in Discord and handled by SQLite & the custom embed builder.
                  </p>
                </div>
                <div className="relative">
                  <Search className="w-4 h-4 absolute left-3 top-2.5 text-[#949ba4]" />
                  <input
                    type="text"
                    placeholder="Search commands..."
                    value={commandSearch}
                    onChange={(e) => setCommandSearch(e.target.value)}
                    className="pl-9 pr-3 py-1.5 bg-[#1e1f22] border border-[#202225] rounded-md text-xs text-white placeholder-[#949ba4] focus:outline-none focus:border-[#5865f2]"
                  />
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap gap-1.5 pb-2">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${selectedCategory === cat ? 'bg-[#5865f2] text-white' : 'bg-[#2b2d31] text-[#949ba4] hover:bg-[#35373c] hover:text-white'}`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Command Detail Card */}
              <div className="p-4 bg-[#2b2d31] rounded-xl border border-[#202225] space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-base font-bold text-white font-mono">/{selectedCommand.name}</span>
                    <span className="px-2 py-0.5 rounded text-[10px] bg-[#1e1f22] text-[#5865f2] font-semibold">
                      {selectedCommand.category}
                    </span>
                  </div>
                  <span className="text-xs text-[#949ba4]">Perms: {selectedCommand.permissions || 'Everyone'}</span>
                </div>

                <p className="text-xs text-[#dbdee1]">{selectedCommand.description}</p>

                <div className="bg-[#1e1f22] p-2.5 rounded font-mono text-xs text-white flex items-center justify-between">
                  <code>{selectedCommand.syntax}</code>
                  <button
                    onClick={() => copyToClipboard(selectedCommand.syntax, 'cmd')}
                    className="text-[#949ba4] hover:text-white"
                  >
                    {copiedKey === 'cmd' ? <CheckCircle2 className="w-4 h-4 text-[#23a55a]" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                <div className="text-xs pt-1 border-t border-[#35373c]">
                  <span className="text-[#949ba4] font-semibold">Action / Output: </span>
                  <span className="text-[#dbdee1]">{selectedCommand.exampleOutput}</span>
                </div>
              </div>

              {/* List of matching commands */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 max-h-96 overflow-y-auto p-1">
                {filteredCommands.map((cmd) => (
                  <div
                    key={cmd.id}
                    onClick={() => setSelectedCommand(cmd)}
                    className={`p-3 rounded-lg border text-xs cursor-pointer transition-colors ${selectedCommand.id === cmd.id ? 'bg-[#35373c] border-[#5865f2] text-white' : 'bg-[#2b2d31] border-[#202225] text-[#dbdee1] hover:bg-[#35373c]'}`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-white font-mono">/{cmd.name}</span>
                      <span className="text-[10px] text-[#949ba4] font-mono">#{cmd.id}</span>
                    </div>
                    <p className="text-[11px] text-[#949ba4] line-clamp-1">{cmd.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 4: CODEBASE & DEPLOYMENT HUB */}
          {activeTab === 'codebase' && (
            <div className="max-w-4xl mx-auto space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Code2 className="w-5 h-5 text-[#5865f2]" />
                  Codebase & Deployment Hub
                </h2>
                <p className="text-xs text-[#949ba4] mt-1">
                  Complete files generated in the workspace. Run <code className="bg-[#1e1f22] px-1 py-0.5 rounded text-white font-mono">node deploy-commands.js</code> and <code className="bg-[#1e1f22] px-1 py-0.5 rounded text-white font-mono">node index.js</code>.
                </p>
              </div>

              {/* Quick Hosting Instructions */}
              <div className="p-4 bg-[#2b2d31] rounded-xl border border-[#202225] space-y-3">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">How to Host & Launch</h3>
                <ol className="list-decimal list-inside space-y-2 text-xs text-[#dbdee1] leading-relaxed">
                  <li>
                    Fill in <strong className="text-white">.env</strong> with your Discord Bot Token, Guild ID, <strong className="text-amber-400">GROQ_API_KEY</strong>, and <strong className="text-purple-400">SAPLING_API_KEY</strong>.
                  </li>
                  <li>
                    Deploy all 100 slash commands:
                    <div className="my-1.5 p-2 bg-[#1e1f22] rounded font-mono text-white flex items-center justify-between">
                      <code>node deploy-commands.js</code>
                      <button onClick={() => copyToClipboard('node deploy-commands.js', 'dep')} className="text-[#949ba4] hover:text-white">
                        {copiedKey === 'dep' ? <CheckCircle2 className="w-4 h-4 text-[#23a55a]" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </li>
                  <li>
                    Start the bot process:
                    <div className="my-1.5 p-2 bg-[#1e1f22] rounded font-mono text-white flex items-center justify-between">
                      <code>node index.js</code>
                      <button onClick={() => copyToClipboard('node index.js', 'run')} className="text-[#949ba4] hover:text-white">
                        {copiedKey === 'run' ? <CheckCircle2 className="w-4 h-4 text-[#23a55a]" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </li>
                </ol>
              </div>

              {/* File Tree Overview */}
              <div className="p-4 bg-[#2b2d31] rounded-xl border border-[#202225] space-y-2">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Workspace Structure</h3>
                <div className="p-3 bg-[#1e1f22] rounded font-mono text-xs text-[#949ba4] space-y-1">
                  <div>📁 los-angeles-roleplay-bot/</div>
                  <div>├── 📄 index.js <span className="text-[#23a55a]">(100 Statuses & 50 Bios by Carlos473)</span></div>
                  <div>├── 📄 deploy-commands.js <span className="text-[#5865f2]">(All 100 Slash Commands)</span></div>
                  <div>├── 📄 .env.example <span className="text-[#dbdee1]">(Groq & Sapling Keys + Full Banners)</span></div>
                  <div>├── 📁 database/</div>
                  <div>│   ├── 📄 schema.sql <span className="text-[#dbdee1]">(14 Relational SQLite tables)</span></div>
                  <div>│   └── 📄 db.js</div>
                  <div>└── 📁 src/</div>
                  <div>    ├── 📁 utils/</div>
                  <div>    │   ├── 📄 groqSupport.js <span className="text-amber-400">(Groq AI Ticket Assistant)</span></div>
                  <div>    │   ├── 📄 saplingDetector.js <span className="text-purple-400">(Sapling AI Writing Detector)</span></div>
                  <div>    │   ├── 📄 embedBuilder.js</div>
                  <div>    │   ├── 📄 roblox.js</div>
                  <div>    │   └── 📄 transcriptGenerator.js</div>
                  <div>    ├── 📁 music/</div>
                  <div>    │   └── 📄 musicManager.js</div>
                  <div>    └── 📁 handlers/</div>
                  <div>        ├── 📄 commandHandler.js</div>
                  <div>        └── 📄 interactionHandler.js</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
