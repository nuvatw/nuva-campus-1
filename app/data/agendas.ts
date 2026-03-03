import type { AgendaItem, UniversityAgenda } from '@/app/components/campus-tour/AgendaSection';

const agendas: UniversityAgenda[] = [
  {
    universityId: 'ntu',
    date: '2026-04-15',
    morning: [
      { time: '09:00', title: 'AI 基礎概論', description: '從零開始認識人工智慧的核心概念與應用場景' },
      { time: '10:30', title: '機器學習工作坊', description: '動手實作你的第一個機器學習模型' },
    ],
    afternoon: [
      { time: '13:30', title: 'AI 創業分享', description: '成功創業家分享如何用 AI 打造產品' },
      { time: '15:00', title: 'Prompt Engineering 實戰', description: '學會與 AI 有效溝通的技巧' },
    ],
    evening: [
      { time: '18:30', title: 'AI 社群交流', description: '與志同道合的夥伴交流 AI 學習心得' },
    ],
    exclusive: [
      { time: '20:00', title: 'AI 露營車限定體驗', description: '親身體驗車上的 AI 互動展示設備' },
    ],
  },
  {
    universityId: 'ntnu',
    date: '2026-04-16',
    morning: [
      { time: '09:30', title: 'AI 在教育的應用', description: '探索 AI 如何改變未來教學模式' },
      { time: '11:00', title: 'ChatGPT 教學工作坊', description: '教師如何善用 AI 工具輔助教學設計' },
    ],
    afternoon: [
      { time: '14:00', title: '數位素養講座', description: '培養學生在 AI 時代的關鍵能力' },
      { time: '15:30', title: 'AI 藝術創作', description: '用 AI 工具創作你的第一幅數位藝術作品' },
    ],
    evening: [
      { time: '18:00', title: '教育科技論壇', description: '教育界專家探討 AI 帶來的機遇與挑戰' },
    ],
    exclusive: [],
  },
  {
    universityId: 'ncku',
    date: '2026-04-22',
    morning: [
      { time: '09:00', title: 'AI 與工程應用', description: '探索 AI 在工程領域的最新突破' },
      { time: '10:30', title: '深度學習實作', description: '用 Python 建構神經網路模型' },
    ],
    afternoon: [
      { time: '13:30', title: 'AI 產業趨勢', description: '南部科技產業的 AI 轉型之路' },
      { time: '15:00', title: 'AI 專案工作坊', description: '團隊合作完成一個 AI 迷你專案' },
    ],
    evening: [
      { time: '18:30', title: 'AI 之夜', description: '展示今日工作坊成果與頒獎' },
    ],
    exclusive: [
      { time: '20:00', title: '限定 Demo Day', description: '入選團隊向業界導師展示 AI 專案' },
    ],
  },
  {
    universityId: 'nthu',
    date: '2026-04-18',
    morning: [
      { time: '09:00', title: 'AI 研究前沿', description: '清大 AI 研究團隊分享最新研究成果' },
      { time: '10:30', title: '強化學習入門', description: '了解 AlphaGo 背後的核心技術' },
    ],
    afternoon: [
      { time: '14:00', title: 'AI 倫理座談', description: '討論 AI 發展中的道德與社會議題' },
    ],
    evening: [],
    exclusive: [
      { time: '19:00', title: 'AI 黑客松', description: '24 小時限時 AI 應用開發挑戰賽' },
    ],
  },
  {
    universityId: 'nsysu',
    date: '2026-04-25',
    morning: [
      { time: '09:30', title: 'AI 與海洋科學', description: '探索 AI 在海洋研究中的創新應用' },
    ],
    afternoon: [
      { time: '13:30', title: '自然語言處理工作坊', description: '實作中文 NLP 文本分析工具' },
      { time: '15:00', title: 'AI 創意競賽', description: '用 AI 解決在地社會問題的創意提案' },
    ],
    evening: [
      { time: '18:00', title: '海灣 AI 派對', description: '在西子灣邊享受科技與自然的交融' },
    ],
    exclusive: [],
  },
];

/** Get agenda for a specific university by ID */
export function getAgendaByUniversityId(universityId: string): UniversityAgenda | undefined {
  return agendas.find(a => a.universityId === universityId);
}

/** Search agenda items by keyword across title and description */
export function searchAgendas(query: string): Array<{
  agenda: UniversityAgenda;
  tab: string;
  item: AgendaItem;
}> {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  const results: Array<{ agenda: UniversityAgenda; tab: string; item: AgendaItem }> = [];

  for (const agenda of agendas) {
    for (const tab of ['morning', 'afternoon', 'evening', 'exclusive'] as const) {
      for (const item of agenda[tab]) {
        if (item.title.toLowerCase().includes(q) || item.description.toLowerCase().includes(q)) {
          results.push({ agenda, tab, item });
        }
      }
    }
  }

  return results;
}

export { agendas };
