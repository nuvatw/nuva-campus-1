-- =============================================
-- 為現有報名者生成報到編號和便當編號
-- =============================================

-- 創建生成唯一編號的函數
CREATE OR REPLACE FUNCTION generate_unique_code(p_event_id TEXT, p_code_type TEXT)
RETURNS CHAR(4) AS $$
DECLARE
  new_code CHAR(4);
  code_exists BOOLEAN;
BEGIN
  LOOP
    -- 生成 4 位隨機數字（1000-9999）
    new_code := LPAD(FLOOR(1000 + RANDOM() * 9000)::TEXT, 4, '0');

    -- 檢查是否已存在
    IF p_code_type = 'checkin' THEN
      SELECT EXISTS(
        SELECT 1 FROM event_registrations
        WHERE event_id = p_event_id AND checkin_code = new_code
      ) INTO code_exists;
    ELSE
      SELECT EXISTS(
        SELECT 1 FROM event_registrations
        WHERE event_id = p_event_id AND lunch_code = new_code AND lunch_code != '0000'
      ) INTO code_exists;
    END IF;

    EXIT WHEN NOT code_exists;
  END LOOP;

  RETURN new_code;
END;
$$ LANGUAGE plpgsql;

-- 為所有缺少 checkin_code 的報名者生成編號
UPDATE event_registrations
SET checkin_code = generate_unique_code(event_id, 'checkin')
WHERE checkin_code IS NULL;

-- 為需要便當的報名者生成 lunch_code（lunch_box_required = true 的才生成）
UPDATE event_registrations
SET lunch_code = generate_unique_code(event_id, 'lunch')
WHERE lunch_box_required = true
  AND (lunch_code IS NULL OR lunch_code = '0000');

-- 確保不需要便當的人 lunch_code 是 0000
UPDATE event_registrations
SET lunch_code = '0000'
WHERE lunch_box_required = false OR lunch_box_required IS NULL;

-- 顯示更新結果
SELECT
  event_id,
  COUNT(*) as total,
  COUNT(checkin_code) as has_checkin_code,
  COUNT(CASE WHEN lunch_code != '0000' THEN 1 END) as has_lunch_code
FROM event_registrations
GROUP BY event_id;
