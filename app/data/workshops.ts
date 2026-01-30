import { Workshop } from '../types/workshop';

export const workshops: Workshop[] = [
  {
    id: 'ws02',
    title: '故事，是溝通的致勝關鍵！',
    type: 'offline',
    date: '2026-01-31',
    time: '09:30 ~ 17:00',
    checkinTime: '09:00 ~ 09:15',
    location: '台北松山',
    locationUrl: 'https://maps.app.goo.gl/jyRl4ahqVVZdlg2iR',
    description: '學習說故事的技巧，成為溝通高手',
    tallyFormId: '9qBWK4',
    schedule: [
      { time: '09:30–10:00', title: '開場＆分組', description: '目標說明、分組、暖身規則' },
      { time: '10:00–10:50', title: '資訊缺口 Hooks', description: '設計缺口，製造「我在乎」' },
      { time: '11:00–12:00', title: 'Show, Don\'t Tell', description: '具體化、畫面感、細節不爆' },
      { time: '12:00–13:30', title: '午休', description: '有人吃便當、有人出去吃' },
      { time: '13:30–15:00', title: '故事優化實作', description: '套用上午的兩個技巧，改寫一個故事' },
      { time: '15:00–15:40', title: '故事迴廊', description: '走動聽故事；可以用手機記錄小東東' },
      { time: '15:50–16:30', title: '小組交流', description: '組內分享聽到的喜歡小角落' },
      { time: '16:30–17:00', title: '收尾', description: '讓好故事可以上台 & 上哲收尾' },
    ],
  },
];
