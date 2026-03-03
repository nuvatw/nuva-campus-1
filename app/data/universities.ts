// 台灣大專院校完整資料
// 資料來源：教育部 113 學年度大專校院一覽表
// 城市編號按逆時鐘順序（共 18 個城市）

export interface University {
  id: string;
  name: string;
  shortName: string;
  type: 'public' | 'private';
  category: 'university' | 'technology' | 'college';
  city: string;
  region: 'north' | 'central' | 'south' | 'east';
  coordinates: { x: number; y: number };
  cityCode: string;
  schoolCode: number;
  displayCode: string;
}

export interface CityInfo {
  code: string;
  name: string;
  region: 'north' | 'central' | 'south' | 'east';
}

// 城市逆時鐘順序定義
export const cityOrder: CityInfo[] = [
  { code: '01', name: '基隆市', region: 'north' },
  { code: '02', name: '新北市', region: 'north' },
  { code: '03', name: '台北市', region: 'north' },
  { code: '04', name: '桃園市', region: 'north' },
  { code: '05', name: '新竹市', region: 'north' },
  { code: '06', name: '新竹縣', region: 'north' },
  { code: '07', name: '苗栗縣', region: 'central' },
  { code: '08', name: '台中市', region: 'central' },
  { code: '09', name: '彰化縣', region: 'central' },
  { code: '10', name: '雲林縣', region: 'central' },
  { code: '11', name: '嘉義市', region: 'south' },
  { code: '12', name: '嘉義縣', region: 'south' },
  { code: '13', name: '台南市', region: 'south' },
  { code: '14', name: '高雄市', region: 'south' },
  { code: '15', name: '屏東縣', region: 'south' },
  { code: '16', name: '台東縣', region: 'east' },
  { code: '17', name: '花蓮縣', region: 'east' },
  { code: '18', name: '宜蘭縣', region: 'east' },
];

// 原始資料按城市順序排列
// 南投暨大→歸入台中(08)、金門大學→歸入高雄(14)、澎科大→歸入嘉義市(11)
type RawUniversity = Omit<University, 'cityCode' | 'schoolCode' | 'displayCode'>;

const rawUniversities: RawUniversity[] = [
  // 01 基隆市
  { id: 'ntou', name: '國立臺灣海洋大學', shortName: '海大', type: 'public', category: 'university', city: '基隆市', region: 'north', coordinates: { x: 64, y: 10 } },
  // 02 新北市
  { id: 'utn', name: '國立臺北大學', shortName: '北大', type: 'public', category: 'university', city: '新北市', region: 'north', coordinates: { x: 54, y: 17 } },
  { id: 'tku', name: '淡江大學', shortName: '淡江', type: 'private', category: 'university', city: '新北市', region: 'north', coordinates: { x: 52, y: 9 } },
  { id: 'fju', name: '輔仁大學', shortName: '輔大', type: 'private', category: 'university', city: '新北市', region: 'north', coordinates: { x: 53, y: 13 } },
  { id: 'ntpc', name: '國立臺灣藝術大學', shortName: '台藝大', type: 'public', category: 'university', city: '新北市', region: 'north', coordinates: { x: 55, y: 16 } },
  { id: 'shu', name: '世新大學', shortName: '世新', type: 'private', category: 'university', city: '新北市', region: 'north', coordinates: { x: 56, y: 17 } },
  { id: 'hfu', name: '華梵大學', shortName: '華梵', type: 'private', category: 'university', city: '新北市', region: 'north', coordinates: { x: 61, y: 19 } },
  { id: 'mcut', name: '明志科技大學', shortName: '明志', type: 'private', category: 'technology', city: '新北市', region: 'north', coordinates: { x: 52, y: 15 } },
  { id: 'cute', name: '中國科技大學', shortName: '中國科大', type: 'private', category: 'technology', city: '新北市', region: 'north', coordinates: { x: 53, y: 18 } },
  // 03 台北市
  { id: 'ntu', name: '國立臺灣大學', shortName: '台大', type: 'public', category: 'university', city: '台北市', region: 'north', coordinates: { x: 58, y: 15 } },
  { id: 'ntnu', name: '國立臺灣師範大學', shortName: '師大', type: 'public', category: 'university', city: '台北市', region: 'north', coordinates: { x: 57, y: 14 } },
  { id: 'nccu', name: '國立政治大學', shortName: '政大', type: 'public', category: 'university', city: '台北市', region: 'north', coordinates: { x: 60, y: 16 } },
  { id: 'ntust', name: '國立臺灣科技大學', shortName: '台科大', type: 'public', category: 'technology', city: '台北市', region: 'north', coordinates: { x: 58, y: 16 } },
  { id: 'ntut', name: '國立臺北科技大學', shortName: '北科大', type: 'public', category: 'technology', city: '台北市', region: 'north', coordinates: { x: 57, y: 13 } },
  { id: 'tmu', name: '臺北醫學大學', shortName: '北醫', type: 'private', category: 'university', city: '台北市', region: 'north', coordinates: { x: 59, y: 15 } },
  { id: 'scu', name: '東吳大學', shortName: '東吳', type: 'private', category: 'university', city: '台北市', region: 'north', coordinates: { x: 56, y: 12 } },
  { id: 'pccu', name: '中國文化大學', shortName: '文化', type: 'private', category: 'university', city: '台北市', region: 'north', coordinates: { x: 59, y: 11 } },
  { id: 'sju', name: '實踐大學', shortName: '實踐', type: 'private', category: 'university', city: '台北市', region: 'north', coordinates: { x: 56, y: 13 } },
  { id: 'mcu', name: '銘傳大學', shortName: '銘傳', type: 'private', category: 'university', city: '台北市', region: 'north', coordinates: { x: 55, y: 11 } },
  { id: 'ntua', name: '國立臺北藝術大學', shortName: '北藝大', type: 'public', category: 'university', city: '台北市', region: 'north', coordinates: { x: 55, y: 10 } },
  { id: 'utaipei', name: '臺北市立大學', shortName: '北市大', type: 'public', category: 'university', city: '台北市', region: 'north', coordinates: { x: 57, y: 14 } },
  { id: 'nutc', name: '國立臺北商業大學', shortName: '北商大', type: 'public', category: 'technology', city: '台北市', region: 'north', coordinates: { x: 56, y: 14 } },
  // 04 桃園市
  { id: 'ncu', name: '國立中央大學', shortName: '中央', type: 'public', category: 'university', city: '桃園市', region: 'north', coordinates: { x: 48, y: 20 } },
  { id: 'cycu', name: '中原大學', shortName: '中原', type: 'private', category: 'university', city: '桃園市', region: 'north', coordinates: { x: 47, y: 21 } },
  { id: 'yzu', name: '元智大學', shortName: '元智', type: 'private', category: 'university', city: '桃園市', region: 'north', coordinates: { x: 46, y: 22 } },
  { id: 'cgu', name: '長庚大學', shortName: '長庚', type: 'private', category: 'university', city: '桃園市', region: 'north', coordinates: { x: 50, y: 19 } },
  { id: 'knu', name: '開南大學', shortName: '開南', type: 'private', category: 'university', city: '桃園市', region: 'north', coordinates: { x: 45, y: 23 } },
  { id: 'hcu', name: '健行科技大學', shortName: '健行', type: 'private', category: 'technology', city: '桃園市', region: 'north', coordinates: { x: 46, y: 21 } },
  { id: 'ltu', name: '龍華科技大學', shortName: '龍華', type: 'private', category: 'technology', city: '桃園市', region: 'north', coordinates: { x: 49, y: 18 } },
  // 05 新竹市
  { id: 'nthu', name: '國立清華大學', shortName: '清大', type: 'public', category: 'university', city: '新竹市', region: 'north', coordinates: { x: 44, y: 26 } },
  { id: 'nycu', name: '國立陽明交通大學', shortName: '陽明交大', type: 'public', category: 'university', city: '新竹市', region: 'north', coordinates: { x: 43, y: 25 } },
  { id: 'chu', name: '中華大學', shortName: '中華', type: 'private', category: 'university', city: '新竹市', region: 'north', coordinates: { x: 42, y: 27 } },
  { id: 'hust', name: '玄奘大學', shortName: '玄奘', type: 'private', category: 'university', city: '新竹市', region: 'north', coordinates: { x: 43, y: 28 } },
  // 06 新竹縣
  { id: 'must', name: '明新科技大學', shortName: '明新', type: 'private', category: 'technology', city: '新竹縣', region: 'north', coordinates: { x: 41, y: 26 } },
  // 07 苗栗縣
  { id: 'nuu', name: '國立聯合大學', shortName: '聯合', type: 'public', category: 'university', city: '苗栗縣', region: 'central', coordinates: { x: 40, y: 32 } },
  { id: 'ydu', name: '育達科技大學', shortName: '育達', type: 'private', category: 'technology', city: '苗栗縣', region: 'central', coordinates: { x: 39, y: 33 } },
  // 08 台中市（含南投暨大）
  { id: 'nchu', name: '國立中興大學', shortName: '中興', type: 'public', category: 'university', city: '台中市', region: 'central', coordinates: { x: 36, y: 40 } },
  { id: 'thu', name: '東海大學', shortName: '東海', type: 'private', category: 'university', city: '台中市', region: 'central', coordinates: { x: 34, y: 39 } },
  { id: 'fcu', name: '逢甲大學', shortName: '逢甲', type: 'private', category: 'university', city: '台中市', region: 'central', coordinates: { x: 35, y: 40 } },
  { id: 'pu', name: '靜宜大學', shortName: '靜宜', type: 'private', category: 'university', city: '台中市', region: 'central', coordinates: { x: 33, y: 38 } },
  { id: 'cmu', name: '中國醫藥大學', shortName: '中國醫', type: 'private', category: 'university', city: '台中市', region: 'central', coordinates: { x: 36, y: 39 } },
  { id: 'asia', name: '亞洲大學', shortName: '亞洲', type: 'private', category: 'university', city: '台中市', region: 'central', coordinates: { x: 38, y: 42 } },
  { id: 'nkust_tc', name: '國立臺中科技大學', shortName: '台中科大', type: 'public', category: 'technology', city: '台中市', region: 'central', coordinates: { x: 35, y: 39 } },
  { id: 'nutc_tc', name: '國立勤益科技大學', shortName: '勤益', type: 'public', category: 'technology', city: '台中市', region: 'central', coordinates: { x: 37, y: 41 } },
  { id: 'cyut', name: '朝陽科技大學', shortName: '朝陽', type: 'private', category: 'technology', city: '台中市', region: 'central', coordinates: { x: 38, y: 43 } },
  { id: 'hust_tc', name: '弘光科技大學', shortName: '弘光', type: 'private', category: 'technology', city: '台中市', region: 'central', coordinates: { x: 33, y: 37 } },
  { id: 'nfu', name: '國立臺灣體育運動大學', shortName: '台體大', type: 'public', category: 'university', city: '台中市', region: 'central', coordinates: { x: 34, y: 40 } },
  { id: 'ntcu', name: '國立臺中教育大學', shortName: '中教大', type: 'public', category: 'university', city: '台中市', region: 'central', coordinates: { x: 35, y: 38 } },
  { id: 'ncnu', name: '國立暨南國際大學', shortName: '暨大', type: 'public', category: 'university', city: '台中市', region: 'central', coordinates: { x: 40, y: 50 } },
  // 09 彰化縣
  { id: 'ncue', name: '國立彰化師範大學', shortName: '彰師大', type: 'public', category: 'university', city: '彰化縣', region: 'central', coordinates: { x: 32, y: 46 } },
  { id: 'dyu', name: '大葉大學', shortName: '大葉', type: 'private', category: 'university', city: '彰化縣', region: 'central', coordinates: { x: 31, y: 47 } },
  { id: 'mhu', name: '明道大學', shortName: '明道', type: 'private', category: 'university', city: '彰化縣', region: 'central', coordinates: { x: 30, y: 48 } },
  // 10 雲林縣
  { id: 'yuntech', name: '國立雲林科技大學', shortName: '雲科大', type: 'public', category: 'technology', city: '雲林縣', region: 'central', coordinates: { x: 28, y: 54 } },
  { id: 'nfu_yl', name: '國立虎尾科技大學', shortName: '虎尾科大', type: 'public', category: 'technology', city: '雲林縣', region: 'central', coordinates: { x: 27, y: 53 } },
  { id: 'hk', name: '環球科技大學', shortName: '環球', type: 'private', category: 'technology', city: '雲林縣', region: 'central', coordinates: { x: 26, y: 55 } },
  // 11 嘉義市（含澎科大）
  { id: 'ncyu', name: '國立嘉義大學', shortName: '嘉大', type: 'public', category: 'university', city: '嘉義市', region: 'south', coordinates: { x: 27, y: 59 } },
  { id: 'npu', name: '國立澎湖科技大學', shortName: '澎科大', type: 'public', category: 'technology', city: '嘉義市', region: 'south', coordinates: { x: 16, y: 55 } },
  // 12 嘉義縣
  { id: 'ccu', name: '國立中正大學', shortName: '中正', type: 'public', category: 'university', city: '嘉義縣', region: 'south', coordinates: { x: 28, y: 58 } },
  { id: 'wfu', name: '吳鳳科技大學', shortName: '吳鳳', type: 'private', category: 'technology', city: '嘉義縣', region: 'south', coordinates: { x: 29, y: 57 } },
  { id: 'nkust_cy', name: '南華大學', shortName: '南華', type: 'private', category: 'university', city: '嘉義縣', region: 'south', coordinates: { x: 30, y: 59 } },
  // 13 台南市
  { id: 'ncku', name: '國立成功大學', shortName: '成大', type: 'public', category: 'university', city: '台南市', region: 'south', coordinates: { x: 28, y: 66 } },
  { id: 'ncnu_tn', name: '國立臺南大學', shortName: '南大', type: 'public', category: 'university', city: '台南市', region: 'south', coordinates: { x: 27, y: 67 } },
  { id: 'cjcu', name: '長榮大學', shortName: '長榮', type: 'private', category: 'university', city: '台南市', region: 'south', coordinates: { x: 29, y: 68 } },
  { id: 'stust', name: '南臺科技大學', shortName: '南臺', type: 'private', category: 'technology', city: '台南市', region: 'south', coordinates: { x: 28, y: 68 } },
  { id: 'ksu', name: '崑山科技大學', shortName: '崑山', type: 'private', category: 'technology', city: '台南市', region: 'south', coordinates: { x: 27, y: 69 } },
  { id: 'cku', name: '嘉南藥理大學', shortName: '嘉藥', type: 'private', category: 'technology', city: '台南市', region: 'south', coordinates: { x: 26, y: 65 } },
  { id: 'twu', name: '台灣首府大學', shortName: '首府', type: 'private', category: 'university', city: '台南市', region: 'south', coordinates: { x: 25, y: 64 } },
  { id: 'tut', name: '遠東科技大學', shortName: '遠東', type: 'private', category: 'technology', city: '台南市', region: 'south', coordinates: { x: 26, y: 63 } },
  // 14 高雄市（含金門大學）
  { id: 'nsysu', name: '國立中山大學', shortName: '中山', type: 'public', category: 'university', city: '高雄市', region: 'south', coordinates: { x: 26, y: 78 } },
  { id: 'nkust', name: '國立高雄科技大學', shortName: '高科大', type: 'public', category: 'technology', city: '高雄市', region: 'south', coordinates: { x: 27, y: 76 } },
  { id: 'nknu', name: '國立高雄師範大學', shortName: '高師大', type: 'public', category: 'university', city: '高雄市', region: 'south', coordinates: { x: 28, y: 77 } },
  { id: 'nuk', name: '國立高雄大學', shortName: '高大', type: 'public', category: 'university', city: '高雄市', region: 'south', coordinates: { x: 29, y: 75 } },
  { id: 'kmu', name: '高雄醫學大學', shortName: '高醫', type: 'private', category: 'university', city: '高雄市', region: 'south', coordinates: { x: 27, y: 77 } },
  { id: 'wzu', name: '文藻外語大學', shortName: '文藻', type: 'private', category: 'university', city: '高雄市', region: 'south', coordinates: { x: 26, y: 76 } },
  { id: 'isu', name: '義守大學', shortName: '義守', type: 'private', category: 'university', city: '高雄市', region: 'south', coordinates: { x: 28, y: 78 } },
  { id: 'fy', name: '輔英科技大學', shortName: '輔英', type: 'private', category: 'technology', city: '高雄市', region: 'south', coordinates: { x: 29, y: 79 } },
  { id: 'stu', name: '樹德科技大學', shortName: '樹德', type: 'private', category: 'technology', city: '高雄市', region: 'south', coordinates: { x: 30, y: 77 } },
  { id: 'nkuht', name: '國立高雄餐旅大學', shortName: '高餐大', type: 'public', category: 'technology', city: '高雄市', region: 'south', coordinates: { x: 25, y: 76 } },
  { id: 'nqu', name: '國立金門大學', shortName: '金大', type: 'public', category: 'university', city: '高雄市', region: 'south', coordinates: { x: 8, y: 32 } },
  // 15 屏東縣
  { id: 'nptu', name: '國立屏東大學', shortName: '屏大', type: 'public', category: 'university', city: '屏東縣', region: 'south', coordinates: { x: 32, y: 84 } },
  { id: 'npust', name: '國立屏東科技大學', shortName: '屏科大', type: 'public', category: 'technology', city: '屏東縣', region: 'south', coordinates: { x: 34, y: 85 } },
  { id: 'meiho', name: '美和科技大學', shortName: '美和', type: 'private', category: 'technology', city: '屏東縣', region: 'south', coordinates: { x: 33, y: 86 } },
  { id: 'tajen', name: '大仁科技大學', shortName: '大仁', type: 'private', category: 'technology', city: '屏東縣', region: 'south', coordinates: { x: 35, y: 87 } },
  // 16 台東縣
  { id: 'nttu', name: '國立臺東大學', shortName: '台東大', type: 'public', category: 'university', city: '台東縣', region: 'east', coordinates: { x: 60, y: 68 } },
  // 17 花蓮縣
  { id: 'ndhu', name: '國立東華大學', shortName: '東華', type: 'public', category: 'university', city: '花蓮縣', region: 'east', coordinates: { x: 72, y: 40 } },
  { id: 'nhlue', name: '國立花蓮教育大學', shortName: '花教大', type: 'public', category: 'university', city: '花蓮縣', region: 'east', coordinates: { x: 70, y: 42 } },
  { id: 'tcu', name: '慈濟大學', shortName: '慈濟', type: 'private', category: 'university', city: '花蓮縣', region: 'east', coordinates: { x: 71, y: 38 } },
  { id: 'tcust', name: '慈濟科技大學', shortName: '慈科大', type: 'private', category: 'technology', city: '花蓮縣', region: 'east', coordinates: { x: 70, y: 39 } },
  // 18 宜蘭縣
  { id: 'niu', name: '國立宜蘭大學', shortName: '宜大', type: 'public', category: 'university', city: '宜蘭縣', region: 'east', coordinates: { x: 68, y: 20 } },
  { id: 'fgu', name: '佛光大學', shortName: '佛光', type: 'private', category: 'university', city: '宜蘭縣', region: 'east', coordinates: { x: 66, y: 22 } },
];

// 城市名稱→城市代碼映射
const cityToCode = new Map(cityOrder.map(c => [c.name, c.code]));

// 自動產生連續編號
let schoolCounter = 1;
export const universities: University[] = rawUniversities.map(u => {
  const cityCode = cityToCode.get(u.city) || '00';
  const schoolCode = schoolCounter++;
  const displayCode = `UNI-${String(schoolCode).padStart(3, '0')}`;
  return { ...u, cityCode, schoolCode, displayCode };
});

// === Helper functions ===

export function getUniversitiesByCity(cityName: string): University[] {
  return universities.filter(u => u.city === cityName);
}

export function getCityByCode(code: string): CityInfo | undefined {
  return cityOrder.find(c => c.code === code);
}

export function getUniversityByCode(displayCode: string): University | undefined {
  return universities.find(u => u.displayCode === displayCode);
}

// 依地區分類
export const universitiesByRegion = {
  north: universities.filter(u => u.region === 'north'),
  central: universities.filter(u => u.region === 'central'),
  south: universities.filter(u => u.region === 'south'),
  east: universities.filter(u => u.region === 'east'),
};

// 依城市分類
export const universitiesByCity = universities.reduce((acc, u) => {
  if (!acc[u.city]) acc[u.city] = [];
  acc[u.city].push(u);
  return acc;
}, {} as Record<string, University[]>);

// 地區名稱
export const regionNames: Record<string, string> = {
  north: '北部',
  central: '中部',
  south: '南部',
  east: '東部',
};

// 城市列表（按逆時鐘順序）
export const cities = cityOrder.map(c => c.name);

// 按區域分組的城市列表
export const citiesByRegion = {
  north: cityOrder.filter(c => c.region === 'north'),
  central: cityOrder.filter(c => c.region === 'central'),
  south: cityOrder.filter(c => c.region === 'south'),
  east: cityOrder.filter(c => c.region === 'east'),
};

// 總數統計
export const stats = {
  total: universities.length,
  public: universities.filter(u => u.type === 'public').length,
  private: universities.filter(u => u.type === 'private').length,
};

/** Search universities by name, shortName, displayCode, schoolCode, or city */
export function searchUniversities(query: string): University[] {
  if (!query.trim()) return [];
  const q = query.toLowerCase();
  return universities.filter(u =>
    u.name.toLowerCase().includes(q) ||
    u.shortName.toLowerCase().includes(q) ||
    u.displayCode.toLowerCase().includes(q) ||
    String(u.schoolCode).includes(q) ||
    u.city.includes(q)
  ).slice(0, 10);
}
