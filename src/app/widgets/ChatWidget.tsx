import { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Link } from 'react-router';
import { Send, Leaf, Sparkles, Loader2, MessageCircle, X, RotateCcw, Maximize2, Minimize2 } from 'lucide-react';
import { GoogleGenerativeAI, type GenerationConfig, type Content, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import { toast } from 'sonner';
import { traditionalRemedies } from '../data';

type HeritageSuggestion = {
  id: string;
  name: string;
  href: string;
  reason: string;
};

type ChatMessage =
  | {
    from: 'user';
    text: string;
  }
  | {
    from: 'ai';
    text: string;
    relatedHeritage?: HeritageSuggestion[];
  };

const defaultInitialMessages: ChatMessage[] = [
  {
    from: 'ai',
    text:
      'Chào bạn, tôi là trợ lý tư vấn của EcoHeritage.\nBạn mô tả ngắn triệu chứng hoặc tên bài thuốc, tôi sẽ đọc nhanh và ghim di sản phù hợp bên dưới.',
  },
];

const suggestions = ['Ho khan, ngứa cổ', 'Nóng trong, nổi mụn', 'Đau nhức xương khớp'];

interface ChatWidgetProps {
  user?: { name: string; email: string } | null;
}

const geminiApiKeys = import.meta.env.VITE_GEMINI_KEY?.split(',').map((k: string) => k.trim()).filter(Boolean) || [];
const geminiClients = geminiApiKeys.map((key: string) => new GoogleGenerativeAI(key));
const geminiModelCandidates = ['gemini-3-flash', 'gemini-2.5-flash', 'gemini-2.0-flash'];
const medicalSystemInstruction = [
  'VAI TRÒ: Bạn là EcoHeritage AI - Người giữ lửa di sản y học Việt Nam. Bạn nói chuyện như một người bác sĩ gia đình ở miền quê: am hiểu sâu sắc nhưng mộc mạc, coi người bệnh như người thân.',
  'QUY TẮC CHUYÊN GIA: CHỈ hỗ trợ các chủ đề: Sức khỏe, cây thuốc nam, bài thuốc dân gian và môi trường sống. Từ chối khéo các chủ đề khác.',
  'NGÔN NGỮ BÌNH DÂN: Tuyệt đối không dùng từ robot hay cuốn từ điển. Thay "Hỗ trợ điều trị" bằng "Giúp cải thiện đáng kể"; Thay "Triệu chứng" bằng "Biểu hiện khó chịu".',
  'CÂU MỞ ĐẦU THẤU CẢM (BẮT BUỘC): Phải bắt đầu bằng một câu phân tích mang tính thấu hiểu (Ví dụ: "Tôi hiểu cảm giác của bạn, cái chứng đau lưng này thường hay hành mỗi khi trái gió trở trời...").',
  'ĐỊNH DẠNG TRÌNH BÀY (BẮT BUỘC):',
  '1. **[TIÊU ĐỀ: MỘT LỜI KHUYÊN MẠNH MẼ, VIẾT HOA]**',
  '2. *Lời mở đầu:* Viết 1-2 câu chia sẻ về tình trạng của người dùng bằng giọng văn ấm áp, thấu hiểu.',
  '3. --- (Dùng dấu gạch ngang phân cách)',
  '4. 🌿 **Mẹo hay từ thảo mộc:**',
  '- **[Tên bài thuốc]**: Nguyên liệu kèm định lượng dân dã (ví dụ: 1 nắm, 2 đốt ngón tay).',
  '- **[Cách làm]**: Mô tả ngắn gọn, dễ thực hiện nhất tại bếp nhà.',
  '5. 💡 **Dặn riêng cho bạn:** Đưa ra một lưu ý thực tế về lối sống hoặc thời gian sử dụng bài thuốc sao cho hiệu quả nhất.',
  '6. ⚠️ *Lưu ý: Các bài thuốc dân gian mang tính chất hỗ trợ. Hãy hỏi ý kiến bác sĩ nếu tình trạng kéo dài.*',
].join(' ');

const medicalGenerationConfig: GenerationConfig = {
  temperature: 0.4,
  topP: 0.95,
  maxOutputTokens: 4096,
};

const normalizeSearchText = (value: string) =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9\s]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();

const hasNormalizedTerm = (queryNormalized: string, queryTokens: Set<string>, term: string) => {
  const normalizedTerm = normalizeSearchText(term);
  if (!normalizedTerm) return false;

  const tokens = normalizedTerm.split(' ').filter(Boolean);
  if (!tokens.length) return false;

  if (tokens.length === 1) {
    return queryTokens.has(tokens[0]);
  }

  return tokens.every((token) => queryTokens.has(token)) || queryNormalized.includes(normalizedTerm);
};

const heritageBoostRules = [
  {
    label: 'hô hấp',
    terms: ['ho', 'ho khan', 'ho co dom', 'nghet mui', 'so mui', 'viem hong', 'cam cum', 'dau hong'],
    ids: ['siro-la-lot', 'toi-ngam-mat-ong', 'nuoc-tia-to', 'xong-hoi', 'chao-tia-to', 'nuoc-sa-chanh', 'tra-gung-mat-ong', 'chanh-dao-mat-ong'],
  },
  {
    label: 'thanh nhiệt',
    terms: ['nong trong nguoi', 'noi mun', 'nhiet mieng', 'mat gan', 'thanh nhiet', 'giai doc', 'khat nuoc'],
    ids: ['tra-la-sen', 'tra-atiso', 'che-vang', 'nha-dam', 'nuoc-rau-ma', 'nuoc-dau-van-rang', 'canh-bi-dao'],
  },
  {
    label: 'xương khớp',
    terms: ['xuong khop', 'dau nhuc', 'nhuc moi', 'lanh chan', 'met moi'],
    ids: ['ngam-chan-ngai-cuu'],
  },
  {
    label: 'tiêu hóa',
    terms: ['tieu hoa', 'an khong tieu', 'day bung', 'tao bon', 'tri'],
    ids: ['canh-kho-qua', 'nuoc-voi-tuoi', 'nuoc-ep-diep-ca', 'sua-gao-lut-rang'],
  },
  {
    label: 'an thần',
    terms: ['stress', 'mat ngu', 'khong ngu', 'cang thang', 'suy nhuoc'],
    ids: ['tra-hoa-cuc', 'tra-tam-sen', 'che-hat-sen-long-nhan'],
  },
];

const heritageIndex = traditionalRemedies.map((remedy) => ({
  id: remedy.id,
  name: remedy.name,
  category: remedy.category,
  benefits: remedy.benefits,
  ingredients: remedy.ingredients ?? [],
  keywords: remedy.keywords ?? [],
}));

const findRelatedHeritage = (promptText: string): HeritageSuggestion[] => {
  const queryNormalized = normalizeSearchText(promptText);
  const queryTokens = new Set(queryNormalized.split(' ').filter(Boolean));

  const scored = heritageIndex
    .map((remedy) => {
      let score = 0;
      const reasons: string[] = [];
      const matchingKeywords: string[] = [];

      for (const keyword of remedy.keywords) {
        if (hasNormalizedTerm(queryNormalized, queryTokens, keyword)) {
          score += 4;
          matchingKeywords.push(keyword);
        }
      }

      for (const ingredient of remedy.ingredients) {
        if (hasNormalizedTerm(queryNormalized, queryTokens, ingredient)) {
          score += 2;
          reasons.push(ingredient);
        }
      }

      if (hasNormalizedTerm(queryNormalized, queryTokens, remedy.name)) {
        score += 3;
        reasons.push(remedy.name);
      }

      if (hasNormalizedTerm(queryNormalized, queryTokens, remedy.category)) {
        score += 2;
        reasons.push(remedy.category);
      }

      for (const rule of heritageBoostRules) {
        if (rule.ids.includes(remedy.id) && rule.terms.some((term) => hasNormalizedTerm(queryNormalized, queryTokens, term))) {
          score += 5;
          reasons.push(rule.label);
        }
      }

      if (matchingKeywords.length) {
        reasons.unshift(matchingKeywords[0]);
      }

      const reasonText = reasons[0] ? `Khớp với ${reasons[0]}.` : `Thuộc nhóm ${remedy.category.toLowerCase()}.`;

      return {
        remedy,
        score,
        reasonText,
      };
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3);

  return scored.map(({ remedy, reasonText }) => ({
    id: remedy.id,
    name: remedy.name,
    href: `/heritage#${remedy.id}`,
    reason: reasonText,
  }));
};

const formatHeritageContext = (matches: HeritageSuggestion[]) => {
  if (!matches.length) {
    return 'Bài thuốc di sản liên quan: chưa có gợi ý khớp rõ từ kho hiện tại.';
  }

  return [
    'Bài thuốc di sản liên quan từ kho EcoHeritage:',
    ...matches.map((item, index) => `${index + 1}. ${item.name} — ${item.reason}`),
    'Nếu thật sự phù hợp với triệu chứng, hãy nhắc tên 1-2 bài thuốc này một cách tự nhiên trong phần nhận định hoặc xử lý. Không chèn URL.',
  ].join('\n');
};

// Removed rigid JSON parsing and replaced with natural chat flow.
const retryableErrorPattern =
  /(?:\b429\b|\b500\b|\b503\b|\b504\b|UNAVAILABLE|INTERNAL|RESOURCE_EXHAUSTED|DEADLINE_EXCEEDED|high demand|overloaded|temporarily)/i;
const missingModelPattern = /(?:\b404\b|NOT_FOUND|not found|unsupported for generateContent|not supported)/i;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

const getErrorMessage = (error: unknown) =>
  error instanceof Error ? error.message : String(error);

const isRetryableGeminiError = (error: unknown) => retryableErrorPattern.test(getErrorMessage(error));

const isMissingModelError = (error: unknown) => missingModelPattern.test(getErrorMessage(error));

const renderBoldText = (text: string) => {
  const parts = text.split(/(\*\*.*?\*\*)/g);
  return parts.map((part, i) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return <strong key={i} className="font-bold text-white">{part.slice(2, -2)}</strong>;
    }
    return <span key={i}>{part}</span>;
  });
};

export function ChatWidget({ user }: ChatWidgetProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>(defaultInitialMessages);
  const [inputMessage, setInputMessage] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    if (isOpen && !isMinimized) {
      scrollToBottom();
    }
  }, [messages, isOpen, isMinimized]);

  useEffect(() => {
    const handleOpenChat = () => {
      setIsOpen(true);
      setIsMinimized(false);
    };
    window.addEventListener('openChatWidget', handleOpenChat);
    return () => window.removeEventListener('openChatWidget', handleOpenChat);
  }, []);

  const buildPrompt = (promptText: string, heritageMatches: HeritageSuggestion[]) => {
    const userContext = user ? `Người dùng hiện tại: ${user.name} (${user.email}).` : 'Người dùng chưa đăng nhập.';
    const heritageContext = formatHeritageContext(heritageMatches);
    return [
      userContext,
      heritageContext,
      `Câu hỏi hiện tại: ${promptText}`,
    ].join('\n\n');
  };

  const generateWithRetry = async (modelName: string, contents: Content[]) => {
    if (geminiClients.length === 0) {
      throw new Error('Thiếu VITE_GEMINI_KEY trong .env.local');
    }

    let lastError: unknown = null;

    // Lặp qua từng API Key (Client)
    for (const client of geminiClients) {
      for (let attempt = 0; attempt < 3; attempt += 1) {
        try {
          const model = client.getGenerativeModel({
            model: modelName,
            systemInstruction: medicalSystemInstruction,
            generationConfig: medicalGenerationConfig,
            safetySettings: [
              { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_NONE },
              { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_NONE },
              { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_NONE },
              { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_NONE },
            ],
          });
          const result = await model.generateContent({ contents });
          return result.response.text();
        } catch (error) {
          lastError = error;

          // Nếu lỗi là do hết quota (429), break vòng lặp attempt để nhảy sang API Key tiếp theo
          const isQuotaError = getErrorMessage(error).includes('429') || getErrorMessage(error).includes('Quota');
          if (isQuotaError) {
            console.warn('API Key hiện tại hết hạn mức, đang chuyển sang API Key dự phòng...');
            break; // Thoát vòng lặp retry của client này, tiếp tục với client kế tiếp
          }

          if (isMissingModelError(error) || !isRetryableGeminiError(error) || attempt === 2) {
            throw error; // Lỗi không thể cứu vãn (hoặc không tìm thấy model), ném ra ngoài
          }

          await sleep(700 * 2 ** attempt);
        }
      }
    }

    throw lastError ?? new Error(`Không thể sinh phản hồi với model ${modelName}.`);
  };

  const handleSendMessage = async (text?: string) => {
    const promptText = (text ?? inputMessage).trim();
    if (!promptText || isTyping) return;

    setMessages((prev) => [...prev, { from: 'user', text: promptText }]);
    setInputMessage('');
    setIsTyping(true);

    try {
      if (geminiClients.length === 0) {
        throw new Error('Thiếu VITE_GEMINI_KEY trong .env.local');
      }

      const heritageMatches = findRelatedHeritage(promptText);
      const currentPrompt = buildPrompt(promptText, heritageMatches);

      // Siết chặt token: Chỉ ghi nhớ 2 tin nhắn gần nhất (1 lượt hỏi đáp) để tiết kiệm tối đa
      const MAX_HISTORY = 2;
      const historyContents: Content[] = messages
        .slice(1) // Bỏ tin nhắn chào mừng mặc định
        .slice(-MAX_HISTORY) // Chỉ lấy 2 tin gần nhất
        .map(msg => ({
          role: msg.from === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }));

      const contents: Content[] = [
        ...historyContents,
        { role: 'user', parts: [{ text: currentPrompt }] }
      ];

      let lastError: unknown = null;

      for (const modelName of geminiModelCandidates) {
        try {
          const aiText = await generateWithRetry(modelName, contents);

          setMessages((prev) => [
            ...prev,
            {
              from: 'ai',
              text: aiText,
              relatedHeritage: heritageMatches,
            },
          ]);
          return;
        } catch (error) {
          lastError = error;

          const shouldTryNextModel =
            isMissingModelError(error) || 
            (isRetryableGeminiError(error) && !getErrorMessage(error).includes('429') && !getErrorMessage(error).includes('Quota'));

          if (!shouldTryNextModel) {
            throw error;
          }
        }
      }

      throw lastError ?? new Error('Không tìm thấy model Gemini phù hợp.');
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Không xác định được lỗi';
      console.error('AI Error:', error);

      let fallbackText = 'Xin lỗi, hiện tại tôi đang quá tải kết nối. Bạn hãy thử gửi lại sau vài giây để tôi hỗ trợ chính xác hơn nhé.';
      let toastMessage = `Lỗi kết nối AI: ${message}`;

      if (message.includes('429') || message.includes('Quota') || message.includes('RESOURCE_EXHAUSTED')) {
        fallbackText = 'Thật xin lỗi, hiện tại phòng khám đang có quá nhiều người truy cập (vượt giới hạn API miễn phí). Bạn vui lòng chờ khoảng 1 phút rồi thử lại nhé!';
        toastMessage = 'Phòng khám đang quá tải (Hết lượt API miễn phí). Vui lòng thử lại sau 1 phút!';
      }

      toast.error(toastMessage);
      setMessages((prev) => [...prev, { from: 'ai', text: fallbackText }]);
    } finally {
      setIsTyping(false);
    }
  };

  const handleOpen = () => {
    setIsOpen(true);
    setIsMinimized(false);
  };

  return (
    <>
      <button
        onClick={handleOpen}
        className={`fixed bottom-4 right-4 md:bottom-6 md:right-6 z-[100] p-4 bg-gradient-to-r from-emerald-500 to-amber-500 rounded-full shadow-[0_0_20px_rgba(16,185,129,0.5)] hover:shadow-[0_0_30px_rgba(16,185,129,0.8)] hover:scale-110 transition-all duration-300 ${isOpen && !isMinimized ? 'scale-0 opacity-0 pointer-events-none' : 'scale-100 opacity-100'
          }`}
      >
        <MessageCircle className="w-6 h-6 md:w-7 md:h-7 text-[#051a11]" />
        <span className="absolute -top-1 -right-1 flex h-3 w-3">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
        </span>
      </button>

      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 25 }}
            className={`fixed z-[101] bg-[#0a1913]/98 border border-white/10 shadow-2xl overflow-hidden flex flex-col transition-all duration-300 origin-bottom-right ${isExpanded
                ? 'inset-0 md:bottom-6 md:right-6 md:left-auto md:top-auto md:w-[80vw] md:max-w-[1200px] md:h-[85vh] rounded-none md:rounded-3xl'
                : 'bottom-4 right-4 left-4 w-auto h-[600px] max-h-[80vh] md:bottom-6 md:right-6 md:left-auto md:w-[400px] md:max-h-[85vh] rounded-3xl'
              }`}
          >
            <div className="bg-[#051a11] px-5 py-4 border-b border-white/10 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="relative">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-br from-emerald-400 to-emerald-700 flex items-center justify-center shadow-lg">
                    <Leaf className="w-5 h-5 text-white" />
                  </div>
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-400 rounded-full border-2 border-[#051a11] shadow-[0_0_10px_rgba(52,211,153,0.8)]" />
                </div>
                <div>
                  <h3 className="text-white font-bold text-sm md:text-base">Trợ lý EcoHeritage</h3>
                  <p className="text-emerald-400/80 text-[10px] md:text-[11px] flex items-center gap-1">
                    <Sparkles className="w-3 h-3" /> Trực tuyến
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => setIsExpanded(!isExpanded)}
                  className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors"
                  title={isExpanded ? "Thu nhỏ khung chat" : "Phóng to khung chat"}
                >
                  {isExpanded ? <Minimize2 className="w-4 h-4 md:w-5 md:h-5" /> : <Maximize2 className="w-4 h-4 md:w-5 md:h-5" />}
                </button>
                <button
                  onClick={() => {
                    setMessages(defaultInitialMessages);
                    toast.success('Đã làm mới cuộc trò chuyện');
                  }}
                  className="p-2 text-white/50 hover:text-amber-400 hover:bg-white/10 rounded-full transition-colors"
                  title="Làm mới cuộc trò chuyện"
                >
                  <RotateCcw className="w-4 h-4 md:w-5 md:h-5" />
                </button>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-white/50 hover:text-rose-400 hover:bg-rose-500/10 rounded-full transition-colors"
                  title="Đóng"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-5 space-y-4 custom-scrollbar">
              {messages.map((msg, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, x: msg.from === 'user' ? 20 : -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[92%] rounded-2xl px-4 py-3 text-[14px] md:text-[15px] leading-[1.7] shadow-md ${msg.from === 'user'
                      ? 'bg-amber-400 text-[#051a11] font-medium rounded-br-sm'
                      : 'bg-white/10 text-[#F8FAFC] border border-white/5 rounded-bl-sm'
                      }`}
                  >
                    {msg.from === 'ai' ? (
                      <div className="space-y-4">
                        <div className="space-y-2">
                          {msg.text.split('\n').map((line, i) => (
                            <p
                              key={i}
                              className={`text-[15px] md:text-[16px] leading-[1.8] text-[#F8FAFC] ${line.startsWith('-') ? 'ml-4 flex gap-2' : ''
                                }`}
                            >
                              {line.startsWith('-') ? (
                                <>
                                  <span className="mt-2.5 h-1.5 w-1.5 rounded-full bg-emerald-400/50 shrink-0" />
                                  <span>{renderBoldText(line.substring(1).trim())}</span>
                                </>
                              ) : (
                                renderBoldText(line)
                              )}
                            </p>
                          ))}
                        </div>

                        {msg.relatedHeritage?.length ? (
                          <div className="pt-3 mt-4 border-t border-white/10">
                            <div className="mb-3 text-[10px] uppercase tracking-[0.35em] text-amber-300/70 font-bold flex items-center gap-2">
                              <Sparkles className="w-3 h-3 text-amber-300" />
                              Di sản liên quan
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {msg.relatedHeritage.map((heritage) => (
                                <Link
                                  key={heritage.id}
                                  to={heritage.href}
                                  title={heritage.reason}
                                  className="inline-flex items-center gap-2 rounded-full border border-emerald-400/30 bg-emerald-500/10 px-3 py-2 text-[12px] font-semibold text-emerald-100 hover:bg-emerald-500/30 transition-colors shadow-sm"
                                >
                                  <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                                  <span>{heritage.name}</span>
                                </Link>
                              ))}
                            </div>
                          </div>
                        ) : null}
                      </div>
                    ) : (
                      msg.text.split('\n').map((line, i) => (
                        <p key={i} className={i > 0 ? 'mt-2' : ''}>
                          {line}
                        </p>
                      ))
                    )}
                  </div>
                </motion.div>
              ))}

              {isTyping && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                  <div className="bg-white/10 border border-white/5 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </motion.div>
              )}
              <div ref={messagesEndRef} />
            </div>

            <div className="p-4 bg-[#051a11] border-t border-white/5">
              <div className="flex gap-2 overflow-x-auto pb-3 custom-scrollbar hide-scrollbar">
                {suggestions.map((s) => (
                  <button
                    key={s}
                    onClick={() => handleSendMessage(s)}
                    className="whitespace-nowrap px-3 py-1.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs rounded-full border border-emerald-500/20 transition-colors"
                  >
                    {s}
                  </button>
                ))}
              </div>

              <div className="relative flex items-center">
                <input
                  type="text"
                  value={inputMessage}
                  onChange={(e) => setInputMessage(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Hỏi AI về sức khỏe..."
                  className="w-full bg-[#0a2e1f] border border-white/10 rounded-full py-3 md:py-3.5 pl-4 pr-12 text-[14px] md:text-[15px] text-[#F8FAFC] placeholder-[#F8FAFC]/50 focus:outline-none focus:border-amber-400/50 transition-colors"
                />
                <button
                  onClick={() => handleSendMessage()}
                  disabled={!inputMessage.trim() || isTyping}
                  className="absolute right-1.5 p-2 bg-amber-400 text-[#051a11] rounded-full hover:bg-amber-300 disabled:opacity-50 disabled:hover:bg-amber-400 transition-colors"
                >
                  {isTyping ? <Loader2 className="w-4 h-4 md:w-5 md:h-5 animate-spin" /> : <Send className="w-4 h-4 md:w-5 md:h-5" />}
                </button>
              </div>
              <p className="mt-3 text-[10px] md:text-[11px] text-white/40 italic text-center leading-tight">
                ⚠️ Lưu ý: EcoHeritage AI là trợ lý cung cấp thông tin tham khảo từ di sản dân gian. Vui lòng tham vấn ý kiến chuyên gia y tế trước khi sử dụng bài thuốc.
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
