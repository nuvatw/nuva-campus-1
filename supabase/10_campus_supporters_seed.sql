-- 校園巡迴應援測試資料
-- 120 筆「我想參加活動」+ 30 筆「我可以幫忙」
-- 70% 國立大學、30% 私立大學

-- 先清空測試資料（可選）
-- TRUNCATE campus_supporters;

INSERT INTO campus_supporters (university_id, university_name, city, supporter_name, supporter_email, support_type, organization, job_title, message, created_at) VALUES

-- ===== 國立大學 - 我想參加活動 (約 84 筆) =====

-- 國立臺灣大學
('ntu', '國立臺灣大學', '台北市', '林冠廷', 'lin.gt001@example.com', 'attend', NULL, NULL, '終於有人要來台大了嗚嗚 期待超久', NOW() - INTERVAL '30 days' + INTERVAL '1 hour'),
('ntu', '國立臺灣大學', '台北市', 'Kevin Chen', 'kevin.c@example.com', 'attend', NULL, NULL, '讚讚 想聽創業故事', NOW() - INTERVAL '29 days' + INTERVAL '2 hours'),
('ntu', '國立臺灣大學', '台北市', '張雅婷', 'yatyat@example.com', 'attend', NULL, NULL, '拜託一定要來！！已經跟室友說好要一起去', NOW() - INTERVAL '28 days' + INTERVAL '3 hours'),
('ntu', '國立臺灣大學', '台北市', 'Michelle Wu', 'michelle.w@example.com', 'attend', NULL, NULL, '好酷喔露營車巡迴 有夠chill', NOW() - INTERVAL '27 days' + INTERVAL '4 hours'),
('ntu', '國立臺灣大學', '台北市', '陳柏翰', 'bohan99@example.com', 'attend', NULL, NULL, NULL, NOW() - INTERVAL '26 days' + INTERVAL '5 hours'),
('ntu', '國立臺灣大學', '台北市', '王筱涵', 'hanhann@example.com', 'attend', NULL, NULL, '想問可以拍照打卡嗎哈哈', NOW() - INTERVAL '25 days' + INTERVAL '6 hours'),

-- 國立清華大學
('nthu', '國立清華大學', '新竹市', '李承恩', 'chengen.li@example.com', 'attend', NULL, NULL, '新竹終於有活動了 不是只有風', NOW() - INTERVAL '24 days' + INTERVAL '7 hours'),
('nthu', '國立清華大學', '新竹市', 'David Lin', 'david.lin@example.com', 'attend', NULL, NULL, '身為資工系的想聽聽看tech創業', NOW() - INTERVAL '23 days' + INTERVAL '8 hours'),
('nthu', '國立清華大學', '新竹市', '黃詩涵', 'shihan.h@example.com', 'attend', NULL, NULL, '可以帶朋友嗎～想揪讀書會的人', NOW() - INTERVAL '22 days' + INTERVAL '9 hours'),
('nthu', '國立清華大學', '新竹市', 'Emily Wang', 'emily.wang@example.com', 'attend', NULL, NULL, '期待期待！', NOW() - INTERVAL '21 days' + INTERVAL '10 hours'),
('nthu', '國立清華大學', '新竹市', '吳宗翰', 'zonghan@example.com', 'attend', NULL, NULL, NULL, NOW() - INTERVAL '20 days' + INTERVAL '11 hours'),

-- 國立陽明交通大學
('nycu', '國立陽明交通大學', '新竹市', '張家豪', 'jiahao.z@example.com', 'attend', NULL, NULL, '交大人報到！想聽startup經驗', NOW() - INTERVAL '19 days' + INTERVAL '12 hours'),
('nycu', '國立陽明交通大學', '新竹市', 'Jason Huang', 'jason.h@example.com', 'attend', NULL, NULL, '電機系來湊熱鬧', NOW() - INTERVAL '18 days' + INTERVAL '13 hours'),
('nycu', '國立陽明交通大學', '新竹市', '林欣怡', 'xinyi.lin@example.com', 'attend', NULL, NULL, '醫學院的可以參加嗎', NOW() - INTERVAL '17 days' + INTERVAL '14 hours'),
('nycu', '國立陽明交通大學', '新竹市', '蔡明哲', 'mingzhe@example.com', 'attend', NULL, NULL, '推推 同學快來', NOW() - INTERVAL '16 days' + INTERVAL '15 hours'),

-- 國立成功大學
('ncku', '國立成功大學', '台南市', '許文傑', 'wenjie.xu@example.com', 'attend', NULL, NULL, '台南的朋友在哪！一起去', NOW() - INTERVAL '15 days' + INTERVAL '16 hours'),
('ncku', '國立成功大學', '台南市', 'Amy Chen', 'amy.chen@example.com', 'attend', NULL, NULL, '想知道怎麼從0開始創業', NOW() - INTERVAL '14 days' + INTERVAL '17 hours'),
('ncku', '國立成功大學', '台南市', '劉俊宏', 'junhong@example.com', 'attend', NULL, NULL, '機械系的來了～', NOW() - INTERVAL '13 days' + INTERVAL '18 hours'),
('ncku', '國立成功大學', '台南市', '周雅琪', 'yaqi.zhou@example.com', 'attend', NULL, NULL, NULL, NOW() - INTERVAL '12 days' + INTERVAL '19 hours'),
('ncku', '國立成功大學', '台南市', 'Peter Liu', 'peter.l@example.com', 'attend', NULL, NULL, '終於不用北漂聽演講了', NOW() - INTERVAL '11 days' + INTERVAL '20 hours'),

-- 國立政治大學
('nccu', '國立政治大學', '台北市', '楊子萱', 'zixuan.y@example.com', 'attend', NULL, NULL, '政大商院必須到場支持', NOW() - INTERVAL '10 days' + INTERVAL '21 hours'),
('nccu', '國立政治大學', '台北市', 'Sophia Lee', 'sophia.lee@example.com', 'attend', NULL, NULL, '傳院的來探路了', NOW() - INTERVAL '9 days' + INTERVAL '22 hours'),
('nccu', '國立政治大學', '台北市', '趙志偉', 'zhiwei@example.com', 'attend', NULL, NULL, '想問會不會有QA時間', NOW() - INTERVAL '8 days' + INTERVAL '23 hours'),
('nccu', '國立政治大學', '台北市', '鄭雨萱', 'yuxuan.z@example.com', 'attend', NULL, NULL, '可以帶筆電去嗎想做筆記', NOW() - INTERVAL '7 days'),

-- 國立中央大學
('ncu', '國立中央大學', '桃園市', '謝宗穎', 'zongying@example.com', 'attend', NULL, NULL, '中壢人在這！', NOW() - INTERVAL '6 days' + INTERVAL '1 hour'),
('ncu', '國立中央大學', '桃園市', 'Tony Chang', 'tony.c@example.com', 'attend', NULL, NULL, '資管系的很需要這種活動', NOW() - INTERVAL '5 days' + INTERVAL '2 hours'),
('ncu', '國立中央大學', '桃園市', '何欣穎', 'xinying.h@example.com', 'attend', NULL, NULL, NULL, NOW() - INTERVAL '4 days' + INTERVAL '3 hours'),

-- 國立中山大學
('nsysu', '國立中山大學', '高雄市', '蕭雅涵', 'yahan.x@example.com', 'attend', NULL, NULL, '高雄終於有了！西子灣等你們', NOW() - INTERVAL '3 days' + INTERVAL '4 hours'),
('nsysu', '國立中山大學', '高雄市', 'Brian Wu', 'brian.wu@example.com', 'attend', NULL, NULL, '企管系來報到', NOW() - INTERVAL '2 days' + INTERVAL '5 hours'),
('nsysu', '國立中山大學', '高雄市', '葉書豪', 'shuhao.y@example.com', 'attend', NULL, NULL, '海景配演講 絕配', NOW() - INTERVAL '1 day' + INTERVAL '6 hours'),
('nsysu', '國立中山大學', '高雄市', '潘思妤', 'siyu.pan@example.com', 'attend', NULL, NULL, '想認識其他有創業想法的人', NOW() - INTERVAL '12 hours'),

-- 國立中興大學
('nchu', '國立中興大學', '台中市', '曾柏翔', 'boxiang.z@example.com', 'attend', NULL, NULL, '台中場+1', NOW() - INTERVAL '29 days' + INTERVAL '3 hours'),
('nchu', '國立中興大學', '台中市', 'Jenny Lin', 'jenny.lin@example.com', 'attend', NULL, NULL, '農學院的可以去嗎哈哈', NOW() - INTERVAL '28 days' + INTERVAL '5 hours'),
('nchu', '國立中興大學', '台中市', '呂冠霖', 'guanlin.l@example.com', 'attend', NULL, NULL, '朋友推薦來的 先卡位', NOW() - INTERVAL '27 days' + INTERVAL '7 hours'),

-- 國立臺灣師範大學
('ntnu', '國立臺灣師範大學', '台北市', '傅心怡', 'xinyi.fu@example.com', 'attend', NULL, NULL, '師大人來了～想聽不一樣的職涯分享', NOW() - INTERVAL '26 days' + INTERVAL '9 hours'),
('ntnu', '國立臺灣師範大學', '台北市', 'Chris Wang', 'chris.w@example.com', 'attend', NULL, NULL, '教育系的也想創業！', NOW() - INTERVAL '25 days' + INTERVAL '11 hours'),
('ntnu', '國立臺灣師範大學', '台北市', '孫雅雯', 'yawen.s@example.com', 'attend', NULL, NULL, NULL, NOW() - INTERVAL '24 days' + INTERVAL '13 hours'),

-- 國立臺北大學
('ntpu', '國立臺北大學', '新北市', '鍾佳蓉', 'jiarong.z@example.com', 'attend', NULL, NULL, '三峽校區等你們！', NOW() - INTERVAL '23 days' + INTERVAL '15 hours'),
('ntpu', '國立臺北大學', '新北市', 'Ryan Tsai', 'ryan.t@example.com', 'attend', NULL, NULL, '法律系想聽創業法規', NOW() - INTERVAL '22 days' + INTERVAL '17 hours'),

-- 國立中正大學
('ccu', '國立中正大學', '嘉義縣', '游承翰', 'chenghan.y@example.com', 'attend', NULL, NULL, '嘉義也要有存在感啦', NOW() - INTERVAL '21 days' + INTERVAL '19 hours'),
('ccu', '國立中正大學', '嘉義縣', 'Maggie Chen', 'maggie.c@example.com', 'attend', NULL, NULL, '傳播系來支持', NOW() - INTERVAL '20 days' + INTERVAL '21 hours'),
('ccu', '國立中正大學', '嘉義縣', '蔣志豪', 'zhihao.j@example.com', 'attend', NULL, NULL, NULL, NOW() - INTERVAL '19 days' + INTERVAL '23 hours'),

-- 國立高雄大學
('nuk', '國立高雄大學', '高雄市', '施佳妤', 'jiayu.s@example.com', 'attend', NULL, NULL, '南部人站出來！', NOW() - INTERVAL '18 days' + INTERVAL '2 hours'),
('nuk', '國立高雄大學', '高雄市', 'Alex Kuo', 'alex.kuo@example.com', 'attend', NULL, NULL, '資工系必聽', NOW() - INTERVAL '17 days' + INTERVAL '4 hours'),

-- 國立東華大學
('ndhu', '國立東華大學', '花蓮縣', '藍詩婷', 'shiting.l@example.com', 'attend', NULL, NULL, '花蓮好山好水好無聊 快來', NOW() - INTERVAL '16 days' + INTERVAL '6 hours'),
('ndhu', '國立東華大學', '花蓮縣', 'Howard Lai', 'howard.l@example.com', 'attend', NULL, NULL, '東華人表示歡迎', NOW() - INTERVAL '15 days' + INTERVAL '8 hours'),

-- 國立暨南國際大學
('ncnu', '國立暨南國際大學', '南投縣', '賴怡君', 'yijun.l@example.com', 'attend', NULL, NULL, '埔里的大學也要被看見', NOW() - INTERVAL '14 days' + INTERVAL '10 hours'),
('ncnu', '國立暨南國際大學', '南投縣', 'Frank Wu', 'frank.wu@example.com', 'attend', NULL, NULL, '好遠但我會去', NOW() - INTERVAL '13 days' + INTERVAL '12 hours'),

-- 國立彰化師範大學
('ncue', '國立彰化師範大學', '彰化縣', '廖家宏', 'jiahong.l@example.com', 'attend', NULL, NULL, '師範體系也有創業魂', NOW() - INTERVAL '12 days' + INTERVAL '14 hours'),

-- 國立高雄師範大學
('nknu', '國立高雄師範大學', '高雄市', '方思穎', 'siying.f@example.com', 'attend', NULL, NULL, '高師大來報到～', NOW() - INTERVAL '11 days' + INTERVAL '16 hours'),

-- 國立臺南大學
('nutn', '國立臺南大學', '台南市', '邱俊傑', 'junjie.q@example.com', 'attend', NULL, NULL, '台南另一所也要', NOW() - INTERVAL '10 days' + INTERVAL '18 hours'),

-- 國立臺東大學
('nttu', '國立臺東大學', '台東縣', '馬曉涵', 'xiaohan.m@example.com', 'attend', NULL, NULL, '台東超級期待！！', NOW() - INTERVAL '9 days' + INTERVAL '20 hours'),

-- 國立嘉義大學
('ncyu', '國立嘉義大學', '嘉義市', '江宏偉', 'hongwei.j@example.com', 'attend', NULL, NULL, '嘉大+1', NOW() - INTERVAL '8 days' + INTERVAL '22 hours'),

-- 國立屏東大學
('nptu', '國立屏東大學', '屏東縣', '羅文彥', 'wenyan.l@example.com', 'attend', NULL, NULL, '屏東也要參加啦', NOW() - INTERVAL '7 days' + INTERVAL '1 hour'),

-- 國立宜蘭大學
('niu', '國立宜蘭大學', '宜蘭縣', '連思婷', 'siting.l@example.com', 'attend', NULL, NULL, '宜蘭下雨也要去', NOW() - INTERVAL '6 days' + INTERVAL '3 hours'),

-- 國立聯合大學
('nuu', '國立聯合大學', '苗栗縣', '湯志遠', 'zhiyuan.t@example.com', 'attend', NULL, NULL, '苗栗代表', NOW() - INTERVAL '5 days' + INTERVAL '5 hours'),

-- 國立臺北科技大學
('ntut', '國立臺北科技大學', '台北市', '石佳玲', 'jialing.s@example.com', 'attend', NULL, NULL, '北科技職系統來聽', NOW() - INTERVAL '4 days' + INTERVAL '7 hours'),
('ntut', '國立臺北科技大學', '台北市', 'Eric Hsu', 'eric.hsu@example.com', 'attend', NULL, NULL, '工業設計系覺得露營車很酷', NOW() - INTERVAL '3 days' + INTERVAL '9 hours'),
('ntut', '國立臺北科技大學', '台北市', '彭思源', 'siyuan.p@example.com', 'attend', NULL, NULL, NULL, NOW() - INTERVAL '2 days' + INTERVAL '11 hours'),

-- 國立臺灣科技大學
('ntust', '國立臺灣科技大學', '台北市', '戴雅筑', 'yazhu.d@example.com', 'attend', NULL, NULL, '台科大資工系先佔位', NOW() - INTERVAL '1 day' + INTERVAL '13 hours'),
('ntust', '國立臺灣科技大學', '台北市', 'Jacky Lin', 'jacky.lin@example.com', 'attend', NULL, NULL, '設計系想聽UX創業', NOW() - INTERVAL '23 hours'),
('ntust', '國立臺灣科技大學', '台北市', '高文豪', 'wenhao.g@example.com', 'attend', NULL, NULL, '電機的來插旗', NOW() - INTERVAL '20 hours'),

-- 國立雲林科技大學
('nyust', '國立雲林科技大學', '雲林縣', '翁嘉琪', 'jiaqi.w@example.com', 'attend', NULL, NULL, '雲科設計學院來了', NOW() - INTERVAL '17 hours'),
('nyust', '國立雲林科技大學', '雲林縣', 'Lucas Chang', 'lucas.c@example.com', 'attend', NULL, NULL, '工管系參一咖', NOW() - INTERVAL '14 hours'),

-- 國立高雄科技大學
('nkust', '國立高雄科技大學', '高雄市', '康詩婷', 'shiting.k@example.com', 'attend', NULL, NULL, '高科大三校合一的力量', NOW() - INTERVAL '11 hours'),
('nkust', '國立高雄科技大學', '高雄市', 'Derek Wu', 'derek.wu@example.com', 'attend', NULL, NULL, '水產養殖也能創業吧', NOW() - INTERVAL '8 hours'),
('nkust', '國立高雄科技大學', '高雄市', '梁宇軒', 'yuxuan.l@example.com', 'attend', NULL, NULL, NULL, NOW() - INTERVAL '5 hours'),

-- 國立虎尾科技大學
('nfu', '國立虎尾科技大學', '雲林縣', '姚建宏', 'jianhong.y@example.com', 'attend', NULL, NULL, '虎科機械系來衝', NOW() - INTERVAL '2 hours'),

-- 國立臺中科技大學
('nutc', '國立臺中科技大學', '台中市', '董佳蓉', 'jiarong.d@example.com', 'attend', NULL, NULL, '台中科大商學院', NOW() - INTERVAL '28 days' + INTERVAL '6 hours'),
('nutc', '國立臺中科技大學', '台中市', 'Mandy Tseng', 'mandy.t@example.com', 'attend', NULL, NULL, '會計系也想創業', NOW() - INTERVAL '26 days' + INTERVAL '8 hours'),

-- 國立勤益科技大學
('ncut', '國立勤益科技大學', '台中市', '柳宏毅', 'hongyi.l@example.com', 'attend', NULL, NULL, '勤益工科系來了', NOW() - INTERVAL '24 days' + INTERVAL '10 hours'),

-- 國立屏東科技大學
('npust', '國立屏東科技大學', '屏東縣', '田佳欣', 'jiaxin.t@example.com', 'attend', NULL, NULL, '屏科獸醫系也想聽', NOW() - INTERVAL '22 days' + INTERVAL '12 hours'),

-- 國立臺北藝術大學
('tnua', '國立臺北藝術大學', '台北市', '孟思穎', 'siying.m@example.com', 'attend', NULL, NULL, '藝術創業可以嗎', NOW() - INTERVAL '20 days' + INTERVAL '14 hours'),

-- 國立臺南藝術大學
('tnnua', '國立臺南藝術大學', '台南市', '紀雅雯', 'yawen.j@example.com', 'attend', NULL, NULL, '南藝大代表', NOW() - INTERVAL '18 days' + INTERVAL '16 hours'),

-- 國立臺灣藝術大學
('ntua', '國立臺灣藝術大學', '新北市', '夏俊翔', 'junxiang.x@example.com', 'attend', NULL, NULL, '台藝大視傳系來支持', NOW() - INTERVAL '16 days' + INTERVAL '18 hours'),

-- 國立臺灣體育運動大學
('ntus', '國立臺灣體育運動大學', '台中市', '余冠霖', 'guanlin.y@example.com', 'attend', NULL, NULL, '體育人也能創業！', NOW() - INTERVAL '14 days' + INTERVAL '20 hours'),

-- 國立臺北教育大學
('ntue', '國立臺北教育大學', '台北市', '秦雅萱', 'yaxuan.q@example.com', 'attend', NULL, NULL, '國北教育系來了', NOW() - INTERVAL '12 days' + INTERVAL '22 hours'),

-- 更多國立大學學生
('ntu', '國立臺灣大學', '台北市', 'Alice Huang', 'alice.h@example.com', 'attend', NULL, NULL, '生科系想聽biotech創業', NOW() - INTERVAL '10 days' + INTERVAL '2 hours'),
('ntu', '國立臺灣大學', '台北市', '郭書瑜', 'shuyu.g@example.com', 'attend', NULL, NULL, '社會系的來了', NOW() - INTERVAL '8 days' + INTERVAL '4 hours'),
('nthu', '國立清華大學', '新竹市', '金志豪', 'zhihao.j@example.com', 'attend', NULL, NULL, '化工系也想聽', NOW() - INTERVAL '6 days' + INTERVAL '6 hours'),
('ncku', '國立成功大學', '台南市', 'Sandy Wu', 'sandy.wu@example.com', 'attend', NULL, NULL, '建築系想知道空間創業', NOW() - INTERVAL '4 days' + INTERVAL '8 hours'),

-- ===== 私立大學 - 我想參加活動 (約 36 筆) =====

-- 私立輔仁大學
('fju', '輔仁大學', '新北市', '白雅琪', 'yaqi.b@example.com', 'attend', NULL, NULL, '輔大來報到！新莊人', NOW() - INTERVAL '29 days' + INTERVAL '7 hours'),
('fju', '輔仁大學', '新北市', 'William Hsu', 'william.h@example.com', 'attend', NULL, NULL, '織品系想聽時尚創業', NOW() - INTERVAL '27 days' + INTERVAL '9 hours'),
('fju', '輔仁大學', '新北市', '殷書涵', 'shuhan.y@example.com', 'attend', NULL, NULL, NULL, NOW() - INTERVAL '25 days' + INTERVAL '11 hours'),

-- 私立東吳大學
('scu', '東吳大學', '台北市', '顧家豪', 'jiahao.g@example.com', 'attend', NULL, NULL, '東吳法律系來聽法遵', NOW() - INTERVAL '23 days' + INTERVAL '13 hours'),
('scu', '東吳大學', '台北市', 'Vivian Chen', 'vivian.c@example.com', 'attend', NULL, NULL, '商學院的來支持', NOW() - INTERVAL '21 days' + INTERVAL '15 hours'),

-- 私立淡江大學
('tku', '淡江大學', '新北市', '魏承軒', 'chengxuan.w@example.com', 'attend', NULL, NULL, '淡江人來了～淡水等你', NOW() - INTERVAL '19 days' + INTERVAL '17 hours'),
('tku', '淡江大學', '新北市', 'Irene Lin', 'irene.l@example.com', 'attend', NULL, NULL, '國企系想聽國際創業', NOW() - INTERVAL '17 days' + INTERVAL '19 hours'),
('tku', '淡江大學', '新北市', '尤雅婷', 'yating.y@example.com', 'attend', NULL, NULL, '資傳系想問新媒體創業', NOW() - INTERVAL '15 days' + INTERVAL '21 hours'),

-- 私立逢甲大學
('fcu', '逢甲大學', '台中市', '畢志宏', 'zhihong.b@example.com', 'attend', NULL, NULL, '逢甲商圈的力量', NOW() - INTERVAL '13 days' + INTERVAL '23 hours'),
('fcu', '逢甲大學', '台中市', 'Grace Wang', 'grace.wang@example.com', 'attend', NULL, NULL, '財金系來了', NOW() - INTERVAL '11 days' + INTERVAL '2 hours'),
('fcu', '逢甲大學', '台中市', '詹思源', 'siyuan.z@example.com', 'attend', NULL, NULL, '建築系想聽PropTech', NOW() - INTERVAL '9 days' + INTERVAL '4 hours'),

-- 私立中原大學
('cycu', '中原大學', '桃園市', '卓佳蓉', 'jiarong.z@example.com', 'attend', NULL, NULL, '中原企管系來支持', NOW() - INTERVAL '7 days' + INTERVAL '6 hours'),
('cycu', '中原大學', '桃園市', 'Henry Liu', 'henry.liu@example.com', 'attend', NULL, NULL, '電機系想聽硬體創業', NOW() - INTERVAL '5 days' + INTERVAL '8 hours'),

-- 私立東海大學
('thu', '東海大學', '台中市', '俞思涵', 'sihan.y@example.com', 'attend', NULL, NULL, '東海美景配創業', NOW() - INTERVAL '3 days' + INTERVAL '10 hours'),
('thu', '東海大學', '台中市', 'Cindy Chou', 'cindy.c@example.com', 'attend', NULL, NULL, '社工系也想創業', NOW() - INTERVAL '1 day' + INTERVAL '12 hours'),

-- 私立銘傳大學
('mcu', '銘傳大學', '台北市', '駱雅琪', 'yaqi.l@example.com', 'attend', NULL, NULL, '銘傳傳播系來了', NOW() - INTERVAL '28 days' + INTERVAL '14 hours'),
('mcu', '銘傳大學', '台北市', 'Leo Kang', 'leo.kang@example.com', 'attend', NULL, NULL, '觀光系也能創業', NOW() - INTERVAL '26 days' + INTERVAL '16 hours'),

-- 私立實踐大學
('usc', '實踐大學', '台北市', '童思穎', 'siying.t@example.com', 'attend', NULL, NULL, '實踐設計系必來', NOW() - INTERVAL '24 days' + INTERVAL '18 hours'),
('usc', '實踐大學', '台北市', 'Ruby Liao', 'ruby.l@example.com', 'attend', NULL, NULL, '服裝設計系想聽時尚創業', NOW() - INTERVAL '22 days' + INTERVAL '20 hours'),

-- 私立文化大學
('pccu', '中國文化大學', '台北市', '聶家豪', 'jiahao.n@example.com', 'attend', NULL, NULL, '陽明山最高學府來了', NOW() - INTERVAL '20 days' + INTERVAL '22 hours'),
('pccu', '中國文化大學', '台北市', 'Jessica Tsai', 'jessica.t@example.com', 'attend', NULL, NULL, '新聞系想問媒體創業', NOW() - INTERVAL '18 days' + INTERVAL '1 hour'),

-- 私立世新大學
('shu', '世新大學', '台北市', '尚雅萱', 'yaxuan.s@example.com', 'attend', NULL, NULL, '世新傳播先搶位', NOW() - INTERVAL '16 days' + INTERVAL '3 hours'),
('shu', '世新大學', '台北市', 'Oscar Lin', 'oscar.lin@example.com', 'attend', NULL, NULL, '廣電系想聽內容創業', NOW() - INTERVAL '14 days' + INTERVAL '5 hours'),

-- 私立元智大學
('yzu', '元智大學', '桃園市', '馮書豪', 'shuhao.f@example.com', 'attend', NULL, NULL, '元智資工系報到', NOW() - INTERVAL '12 days' + INTERVAL '7 hours'),

-- 私立長庚大學
('cgu', '長庚大學', '桃園市', '祝思涵', 'sihan.z@example.com', 'attend', NULL, NULL, '醫管系想聽醫療創業', NOW() - INTERVAL '10 days' + INTERVAL '9 hours'),

-- 私立義守大學
('isu', '義守大學', '高雄市', '薛志偉', 'zhiwei.x@example.com', 'attend', NULL, NULL, '義守也要參加', NOW() - INTERVAL '8 days' + INTERVAL '11 hours'),

-- 私立靜宜大學
('pu', '靜宜大學', '台中市', '華佳蓉', 'jiarong.h@example.com', 'attend', NULL, NULL, '沙鹿的靜宜人', NOW() - INTERVAL '6 days' + INTERVAL '13 hours'),

-- 私立大葉大學
('dyu', '大葉大學', '彰化縣', 'Peter Ku', 'peter.ku@example.com', 'attend', NULL, NULL, '大葉設計系來了', NOW() - INTERVAL '4 days' + INTERVAL '15 hours'),

-- 私立中華大學
('chu', '中華大學', '新竹市', '聞書涵', 'shuhan.w@example.com', 'attend', NULL, NULL, '中華建築來支持', NOW() - INTERVAL '2 days' + INTERVAL '17 hours'),

-- 私立亞洲大學
('au', '亞洲大學', '台中市', '席雅婷', 'yating.x@example.com', 'attend', NULL, NULL, '亞大霧峰校區', NOW() - INTERVAL '1 day' + INTERVAL '19 hours'),

-- 私立朝陽科技大學
('cyut', '朝陽科技大學', '台中市', '危承翰', 'chenghan.w@example.com', 'attend', NULL, NULL, '朝陽設計來了', NOW() - INTERVAL '27 days' + INTERVAL '4 hours'),

-- 私立南臺科技大學
('stust', '南臺科技大學', '台南市', 'Jasmine Lai', 'jasmine.l@example.com', 'attend', NULL, NULL, '南台的來支持', NOW() - INTERVAL '23 days' + INTERVAL '6 hours'),

-- 私立崑山科技大學
('ksu', '崑山科技大學', '台南市', '柯志豪', 'zhihao.k@example.com', 'attend', NULL, NULL, '崑山資工系', NOW() - INTERVAL '19 days' + INTERVAL '8 hours'),

-- 私立樹德科技大學
('stu', '樹德科技大學', '高雄市', '談雅琪', 'yaqi.t@example.com', 'attend', NULL, NULL, '樹科表藝系也來', NOW() - INTERVAL '15 days' + INTERVAL '10 hours'),

-- 私立嶺東科技大學
('ltu', '嶺東科技大學', '台中市', 'Andy Yeh', 'andy.yeh@example.com', 'attend', NULL, NULL, '嶺東流設系來聽', NOW() - INTERVAL '11 days' + INTERVAL '12 hours'),

-- ===== 我可以幫忙 (30 筆，正經專業) =====

-- 國立大學
('ntu', '國立臺灣大學', '台北市', '陳建志', 'jianzhic@example.com', 'help', '台大創創中心', '專案經理', '可以協助聯繫台大創創中心，安排場地和宣傳資源。', NOW() - INTERVAL '25 days'),
('ntu', '國立臺灣大學', '台北市', 'Dr. Michael Lee', 'michael.lee@example.com', 'help', '台大管理學院', '助理教授', '願意協助邀請商學院學生參與，也可以提供創業課程的合作機會。', NOW() - INTERVAL '20 days'),
('nthu', '國立清華大學', '新竹市', '王淑芬', 'shufenw@example.com', 'help', '清大育成中心', '主任', '清華育成中心可以提供場地和行政支援，歡迎聯繫。', NOW() - INTERVAL '18 days'),
('nycu', '國立陽明交通大學', '新竹市', '林志明', 'zhimingl@example.com', 'help', '交大產學運籌中心', '副主任', '可協助媒合業界資源，並協助活動宣傳至新竹科學園區。', NOW() - INTERVAL '16 days'),
('ncku', '國立成功大學', '台南市', '蔡美玲', 'meilingt@example.com', 'help', '成大創意產業設計研究所', '所長', '成大南區創業資源豐富，可協助串連南部產業界。', NOW() - INTERVAL '14 days'),
('nccu', '國立政治大學', '台北市', 'Prof. Sarah Chen', 'sarah.chen@example.com', 'help', '政大商學院', '教授', '可以在商學院推廣活動，並邀請EMBA校友參與分享。', NOW() - INTERVAL '12 days'),
('ncu', '國立中央大學', '桃園市', '黃志偉', 'zhiweihuang@example.com', 'help', '中央大學創新育成中心', '經理', '中央育成可提供場地，也有許多新創團隊可以交流。', NOW() - INTERVAL '10 days'),
('nsysu', '國立中山大學', '高雄市', '許雅慧', 'yahui.xu@example.com', 'help', '中山大學管理學院', '系主任秘書', '可以協助借用管院場地和設備，高雄場地沒問題。', NOW() - INTERVAL '8 days'),
('nchu', '國立中興大學', '台中市', '吳明德', 'mingde.wu@example.com', 'help', '興大農業創新育成中心', '顧問', '農業科技創業是我們的專長，可以協助連結相關資源。', NOW() - INTERVAL '6 days'),
('ntnu', '國立臺灣師範大學', '台北市', '張淑惠', 'shuhui.z@example.com', 'help', '師大公領系', '副教授', '可協助推廣至教育相關科系，也對社會企業創業有研究。', NOW() - INTERVAL '4 days'),
('ntut', '國立臺北科技大學', '台北市', '劉建國', 'jianguo.l@example.com', 'help', '北科大產學合作處', '組長', '北科大有很多技術創業團隊，可以協助對接。', NOW() - INTERVAL '2 days'),
('ntust', '國立臺灣科技大學', '台北市', 'Dr. Kevin Wu', 'kevin.wu.prof@example.com', 'help', '台科大設計學院', '副教授', '台科設計學院可以協助活動視覺和場地設計建議。', NOW() - INTERVAL '1 day'),

-- 私立大學
('fju', '輔仁大學', '新北市', '李秀芳', 'xiufang.li@example.com', 'help', '輔大創新創業中心', '專員', '輔大創創中心可以協助宣傳和場地借用。', NOW() - INTERVAL '24 days'),
('scu', '東吳大學', '台北市', '周明德', 'mingde.z@example.com', 'help', '東吳大學EMBA', '校友會幹部', '可以邀請東吳EMBA校友來聽分享，也願意贊助茶點。', NOW() - INTERVAL '22 days'),
('tku', '淡江大學', '新北市', 'Victoria Chang', 'victoria.c@example.com', 'help', '淡江大學產學合作處', '專案助理', '淡江蘭陽校區也可以考慮，願意協助協調兩校區資源。', NOW() - INTERVAL '20 days'),
('fcu', '逢甲大學', '台中市', '陳志強', 'zhiqiang.c@example.com', 'help', '逢甲大學創能學院', '執行長', '逢甲在台中創業生態圈很活躍，可以協助串連在地資源。', NOW() - INTERVAL '18 days'),
('cycu', '中原大學', '桃園市', '林淑真', 'shuzhen.l@example.com', 'help', '中原大學學務處', '課外活動組長', '可以協助社團串連和活動宣傳，也有場地資源可用。', NOW() - INTERVAL '16 days'),
('thu', '東海大學', '台中市', 'David Huang', 'david.huang.thu@example.com', 'help', '東海大學就業輔導中心', '主任', '東海有很棒的校園場地，可以安排在感恩堂或路思義教堂旁。', NOW() - INTERVAL '14 days'),

-- 業界人士
('ntu', '國立臺灣大學', '台北市', '張育誠', 'yucheng.z@example.com', 'help', 'AppWorks', '創業加速器經理', '可以協助邀請AppWorks校友創業家來分享實戰經驗。', NOW() - INTERVAL '23 days'),
('ncku', '國立成功大學', '台南市', 'Jennifer Wang', 'jennifer.w@example.com', 'help', '南部創業協會', '秘書長', '南部創業圈資源整合是我的專長，可以協助串連。', NOW() - INTERVAL '21 days'),
('nchu', '國立中興大學', '台中市', '陳文華', 'wenhua.c@example.com', 'help', '台中市青年事務局', '專員', '可以協助申請台中市青年創業相關補助資源。', NOW() - INTERVAL '19 days'),
('ntut', '國立臺北科技大學', '台北市', 'Eric Su', 'eric.su@example.com', 'help', '北科大校友總會', '理事', '可以協助動員北科大校友網絡支持活動。', NOW() - INTERVAL '17 days'),
('nycu', '國立陽明交通大學', '新竹市', '許志豪', 'zhihao.xu@example.com', 'help', '新竹科技育成基金會', '專案經理', '新竹科技產業資源豐富，可以協助邀請業界人士參與。', NOW() - INTERVAL '15 days'),
('nccu', '國立政治大學', '台北市', '林雅琪', 'yaqi.lin@example.com', 'help', '政大公企中心', '課程經理', '可以協助規劃創業工作坊課程內容。', NOW() - INTERVAL '13 days'),
('nsysu', '國立中山大學', '高雄市', 'Tony Kuo', 'tony.kuo@example.com', 'help', '高雄市政府青年局', '科員', '可以協助申請高雄市青年創業相關資源。', NOW() - INTERVAL '11 days'),
('nthu', '國立清華大學', '新竹市', '趙美玲', 'meiling.z@example.com', 'help', '工研院創業家俱樂部', '社群經理', '可以邀請工研院spin-off創業家來分享技術創業經驗。', NOW() - INTERVAL '9 days'),
('fcu', '逢甲大學', '台中市', 'Andy Chen', 'andy.chen.fc@example.com', 'help', '台中市好好青年創業協會', '理事長', '台中青年創業圈很活絡，可以協助串連在地青年創業社群。', NOW() - INTERVAL '7 days'),
('ntust', '國立臺灣科技大學', '台北市', '吳淑芬', 'shufen.wu@example.com', 'help', '台科大校友基金會', '執行秘書', '可以協助動員台科大校友網絡和業界資源。', NOW() - INTERVAL '5 days'),
('ntu', '國立臺灣大學', '台北市', 'Frank Liu', 'frank.liu.vc@example.com', 'help', '某創投基金', '投資經理', '如果活動有pitch環節，我們基金可以提供投資人視角的回饋。', NOW() - INTERVAL '3 days');
