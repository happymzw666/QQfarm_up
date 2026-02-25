import React, { useState, useMemo } from 'react';
import seedsData from './data/seeds.json';
import plantData from './data/Plant.json';
import seedMapping from './data/seed_mapping.json';

const NO_FERT_PLANTS_PER_2_SEC = 18;
const NORMAL_FERT_PLANTS_PER_2_SEC = 12;
const NO_FERT_PLANT_SPEED = NO_FERT_PLANTS_PER_2_SEC / 2;
const NORMAL_FERT_PLANT_SPEED = NORMAL_FERT_PLANTS_PER_2_SEC / 2;

function parseGrowPhases(growPhases: string) {
  if (!growPhases) return [];
  return growPhases
    .split(';')
    .map(x => x.trim())
    .filter(Boolean)
    .map(seg => {
      const parts = seg.split(':');
      return parts.length >= 2 ? (Number(parts[1]) || 0) : 0;
    })
    .filter(sec => sec > 0);
}

const plantPhaseMap: Record<number, number> = {};
const plantLastPhaseMap: Record<number, number> = {};
for (const p of plantData) {
  const seedId = Number(p.seed_id);
  if (seedId > 0 && !plantPhaseMap[seedId]) {
    const phases = parseGrowPhases(p.grow_phases);
    if (phases.length > 0) {
      plantPhaseMap[seedId] = phases[0];
      plantLastPhaseMap[seedId] = phases[phases.length - 1];
    }
  }
}

function formatSec(sec: number) {
  const s = Math.max(0, Math.round(sec));
  if (s < 60) return `${s}秒`;
  const m = Math.floor(s / 60);
  const r = s % 60;
  if (m < 60) return r > 0 ? `${m}分${r}秒` : `${m}分钟`;
  const h = Math.floor(m / 60);
  const mm = m % 60;
  return mm > 0 ? `${h}小时${mm}分` : `${h}小时`;
}

const LAND_BUFFS = {
  normal: { time: 1.0, exp: 1.0 },
  red: { time: 1.0, exp: 1.0 },
  black: { time: 0.9, exp: 1.0 },
  gold: { time: 0.8, exp: 1.2 },
};

const cropEmojis: Record<string, string> = {
    '白萝卜': '🥕', '胡萝卜': '🥕', '大白菜': '🥬', '大蒜': '🧄', '大葱': '🧅',
    '水稻': '🌾', '小麦': '🌾', '玉米': '🌽', '鲜姜': '🫚', '土豆': '🥔',
    '小白菜': '🥬', '生菜': '🥬', '油菜': '🌿', '茄子': '🍆', '红枣': '🫘',
    '蒲公英': '🌼', '银莲花': '🌸', '番茄': '🍅', '花菜': '🥦', '韭菜': '🌿',
    '小雏菊': '🌼', '豌豆': '🫛', '莲藕': '🪷', '红玫瑰': '🌹', '秋菊（黄色）': '🌻',
    '满天星': '💫', '含羞草': '🌿', '牵牛花': '🌺', '秋菊（红色）': '🌺', '辣椒': '🌶️',
    '黄瓜': '🥒', '芹菜': '🌿', '天香百合': '🌷', '南瓜': '🎃', '核桃': '🌰',
    '山楂': '🍒', '菠菜': '🥬', '草莓': '🍓', '苹果': '🍎', '四叶草': '🍀',
    '非洲菊': '🌼', '火绒草': '🌿', '花香根鸢尾': '💐', '虞美人': '🌺', '向日葵': '🌻',
    '西瓜': '🍉', '黄豆': '🫘', '香蕉': '🍌', '竹笋': '🎋', '桃子': '🍑',
    '甘蔗': '🎋', '橙子': '🍊', '茉莉花': '🌸', '葡萄': '🍇', '丝瓜': '🥒',
    '榛子': '🌰', '迎春花': '🌼', '石榴': '🍎', '栗子': '🌰', '柚子': '🍊',
    '蘑菇': '🍄', '菠萝': '🍍', '箬竹': '🎋', '无花果': '🫒', '椰子': '🥥',
    '花生': '🥜', '金针菇': '🍄', '葫芦': '🫑', '猕猴桃': '🥝', '梨': '🍐',
    '睡莲': '🪷', '火龙果': '🐉', '枇杷': '🍑', '樱桃': '🍒', '李子': '🫐',
    '荔枝': '🍒', '香瓜': '🍈', '木瓜': '🥭', '桂圆': '🫐', '月柿': '🍊',
    '杨桃': '⭐', '哈密瓜': '🍈', '桑葚': '🫐', '柠檬': '🍋', '芒果': '🥭',
    '杨梅': '🫐', '榴莲': '🥭', '番石榴': '🍈', '瓶子树': '🌳', '蓝莓': '🫐',
    '猪笼草': '🌿', '山竹': '🍑', '曼陀罗华': '🌸', '曼珠沙华': '🌺', '苦瓜': '🥒',
    '天堂鸟': '🦜', '冬瓜': '🥒', '豹皮花': '🌺', '杏子': '🍑', '金桔': '🍊',
};

const getCropEmoji = (name: string) => cropEmojis[name] || '🌱';

const CropImage = ({ seedId, name, className }: { seedId: number, name: string, className?: string }) => {
  const [error, setError] = useState(false);
  
  if (error) {
    return <span className={`flex items-center justify-center ${className}`} style={{ fontSize: '1.5em' }}>{getCropEmoji(name)}</span>;
  }

  const mapping = seedMapping.find(m => m.seedId === seedId) || seedMapping.find(m => m.name === name);
  const fileName = mapping ? mapping.fileName : `${seedId}_${name}_Crop_3_Seed.png`;
  
  return (
    <img 
      src={`/${fileName}`} 
      alt={name} 
      className={className}
      onError={() => setError(true)}
    />
  );
};

export default function App() {
  const [level, setLevel] = useState<number | ''>(70);
  const [lands, setLands] = useState<number | ''>(24);
  const [useFert, setUseFert] = useState(true);

  const calculatedRows = useMemo(() => {
    const currentLevel = typeof level === 'number' ? level : 1;
    const currentLands = typeof lands === 'number' ? lands : 1;
    
    if (currentLands === 0) return [];

    const plantSecNoFert = currentLands / NO_FERT_PLANT_SPEED;
    const plantSecFert = currentLands / NORMAL_FERT_PLANT_SPEED;
    const rows = [];

    const seedsList = Array.isArray(seedsData) ? seedsData : (seedsData.rows || []);
    for (const s of seedsList) {
      if (s.requiredLevel > currentLevel) continue;

      const seedId = s.seedId;
      const growTimeSec = s.growTimeSec;
      const reduceSec = plantPhaseMap[seedId] || 0;
      const seasons = s.seasons || 1;
      const lastPhaseSec = plantLastPhaseMap[seedId] || 0;

      const totalGrowTimeSec = growTimeSec + (seasons - 1) * lastPhaseSec;
      const totalGrowTimeFert = Math.max(1, growTimeSec - reduceSec) + (seasons - 1) * lastPhaseSec;

      const cycleNoFert = totalGrowTimeSec + plantSecNoFert;
      const cycleFert = totalGrowTimeFert + plantSecFert;

      const totalExp = s.exp * seasons;

      const expPerHourNoFert = (currentLands * totalExp / cycleNoFert) * 3600;
      const expPerHourFert = (currentLands * totalExp / cycleFert) * 3600;
      
      const gainPercent = expPerHourNoFert > 0
        ? ((expPerHourFert - expPerHourNoFert) / expPerHourNoFert) * 100
        : 0;

      const totalGrowTimeStr = seasons > 1 ? `${formatSec(totalGrowTimeSec)} (共${seasons}季)` : s.growTimeStr;
      const totalGrowTimeFertStr = seasons > 1 ? `${formatSec(totalGrowTimeFert)} (共${seasons}季)` : formatSec(totalGrowTimeFert);

      rows.push({
        ...s,
        growTimeFert: totalGrowTimeFert,
        growTimeFertStr: totalGrowTimeFertStr,
        growTimeStr: totalGrowTimeStr,
        expPerHourNoFert,
        expPerHourFert,
        expPerDayNoFert: expPerHourNoFert * 24,
        expPerDayFert: expPerHourFert * 24,
        gainPercent
      });
    }

    return rows;
  }, [level, lands, useFert]);

  const sortedNoFert = [...calculatedRows].sort((a, b) => b.expPerHourNoFert - a.expPerHourNoFert);
  const sortedFert = [...calculatedRows].sort((a, b) => b.expPerHourFert - a.expPerHourFert);

  const bestNo = sortedNoFert[0];
  const bestFert = sortedFert[0];

  return (
    <div className="min-h-screen bg-[#f0e6d3] text-[#4a3728] p-4 md:p-8 font-sans">
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="text-center space-y-4">
          <h1 className="text-4xl font-black bg-gradient-to-r from-green-500 via-orange-500 to-purple-500 bg-clip-text text-transparent">
            QQ农场经验计算器
          </h1>
          <p className="text-[#7a6555] text-base md:text-lg max-w-[280px] md:max-w-md mx-auto leading-relaxed">
            输入等级和土地数量<br className="md:hidden" />
            智能计算经验最大化的种植方案
          </p>
        </div>

        <div className="bg-[#f7f0e4] rounded-3xl p-6 shadow-[6px_6px_14px_rgba(163,141,109,0.4),-4px_-4px_10px_rgba(250,243,230,0.65)]">
          <h2 className="text-xl font-bold flex items-center gap-2 mb-6"><span>📝</span> 输入参数</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            <div>
              <label className="block font-bold mb-2 text-[#5a4535]">🎯 账号等级</label>
              <input 
                type="number" 
                value={level} 
                onChange={e => setLevel(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full p-3 rounded-xl bg-[#f0e6d3] shadow-[inset_3px_3px_7px_rgba(163,141,109,0.25),inset_-3px_-3px_7px_rgba(250,243,230,0.5)] outline-none focus:ring-2 focus:ring-green-400 transition-all"
                min="1" max="100"
              />
            </div>
            <div>
              <label className="block font-bold mb-2 text-[#5a4535]">🏡 土地数量</label>
              <input 
                type="number" 
                value={lands} 
                onChange={e => setLands(e.target.value === '' ? '' : Number(e.target.value))}
                className="w-full p-3 rounded-xl bg-[#f0e6d3] shadow-[inset_3px_3px_7px_rgba(163,141,109,0.25),inset_-3px_-3px_7px_rgba(250,243,230,0.5)] outline-none focus:ring-2 focus:ring-green-400 transition-all"
                min="1" max="200"
              />
            </div>
            <div>
              <label className="block font-bold mb-2 text-[#5a4535]">🧪 使用技能</label>
              <label className="flex items-center space-x-3 cursor-pointer mt-2 p-3 rounded-xl bg-[#f0e6d3] shadow-[3px_3px_7px_rgba(163,141,109,0.2),-3px_-3px_7px_rgba(250,243,230,0.5)] hover:shadow-[inset_2px_2px_5px_rgba(163,141,109,0.2),inset_-2px_-2px_5px_rgba(250,243,230,0.5)] transition-all">
                <input 
                  type="checkbox" 
                  checked={useFert} 
                  onChange={e => setUseFert(e.target.checked)}
                  className="w-5 h-5 text-green-500 rounded focus:ring-green-400"
                />
                <span className="font-semibold text-[#7a6555]">普通肥料 (播种时)</span>
              </label>
            </div>
          </div>

          <div className="pt-4 border-t border-[#e0d5c1]">
            <div className="text-sm font-bold text-[#7a6555] mb-3 flex items-center gap-1"><span>🟫</span> 土地加成参考</div>
            <div className="flex flex-wrap gap-2 md:gap-4">
              <div className="flex items-center gap-1.5 bg-[#f0e6d3] px-2.5 py-1.5 rounded-lg text-xs text-gray-600 shadow-[inset_1px_1px_3px_rgba(163,141,109,0.2),inset_-1px_-1px_3px_rgba(250,243,230,0.5)]">
                <div className="w-2 h-2 rounded-full bg-[#8b5a2b]"></div>
                <span className="font-bold text-[#7a6555]">普通</span> 无加成
              </div>
              <div className="flex items-center gap-1.5 bg-[#f0e6d3] px-2.5 py-1.5 rounded-lg text-xs text-gray-600 shadow-[inset_1px_1px_3px_rgba(163,141,109,0.2),inset_-1px_-1px_3px_rgba(250,243,230,0.5)]">
                <div className="w-2 h-2 rounded-full bg-[#d32f2f]"></div>
                <span className="font-bold text-[#d32f2f]">红土地</span> 产量+100%
              </div>
              <div className="flex items-center gap-1.5 bg-[#f0e6d3] px-2.5 py-1.5 rounded-lg text-xs text-gray-600 shadow-[inset_1px_1px_3px_rgba(163,141,109,0.2),inset_-1px_-1px_3px_rgba(250,243,230,0.5)]">
                <div className="w-2 h-2 rounded-full bg-[#212121]"></div>
                <span className="font-bold text-[#212121]">黑土地</span> 产量+200% / 提速10%
              </div>
              <div className="flex items-center gap-1.5 bg-[#f0e6d3] px-2.5 py-1.5 rounded-lg text-xs text-gray-600 shadow-[inset_1px_1px_3px_rgba(163,141,109,0.2),inset_-1px_-1px_3px_rgba(250,243,230,0.5)]">
                <div className="w-2 h-2 rounded-full bg-[#fbc02d]"></div>
                <span className="font-bold text-[#fbc02d]">金土地</span> 产量+300% / 提速20% / 经验+20%
              </div>
            </div>
          </div>
        </div>

        {calculatedRows.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-[#e8f5e9] to-[#f1f8e9] rounded-3xl p-6 shadow-lg text-center">
              <h3 className="text-lg font-bold mb-4">不施肥推荐</h3>
              <div className="flex items-center justify-center gap-3 mb-6">
                {bestNo?.name && (
                  <CropImage 
                    seedId={bestNo.seedId}
                    name={bestNo.name}
                    className="w-12 h-12 object-contain drop-shadow-md"
                  />
                )}
                <div className="text-2xl font-black">{bestNo?.name}</div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/50 p-3 rounded-xl shadow-sm">
                  <div className="text-xs text-gray-500 mb-1">每小时经验</div>
                  <div className="font-bold text-lg">{bestNo?.expPerHourNoFert.toFixed(2)}</div>
                </div>
                <div className="bg-white/50 p-3 rounded-xl shadow-sm">
                  <div className="text-xs text-gray-500 mb-1">每日经验</div>
                  <div className="font-bold text-lg">{Math.round(bestNo?.expPerDayNoFert || 0).toLocaleString()}</div>
                </div>
                <div className="bg-white/50 p-3 rounded-xl shadow-sm flex flex-col justify-center overflow-hidden">
                  <div className="text-xs text-gray-500 mb-1">生长时间</div>
                  <div className="font-bold text-[13px] sm:text-sm md:text-base whitespace-nowrap tracking-tight">{bestNo?.growTimeStr}</div>
                </div>
                <div className="bg-white/50 p-3 rounded-xl shadow-sm flex flex-col justify-center">
                  <div className="text-xs text-gray-500 mb-1">需要等级</div>
                  <div className="font-bold text-lg">Lv {bestNo?.requiredLevel}</div>
                </div>
              </div>
            </div>

            {useFert && (
              <div className="bg-gradient-to-br from-[#fff3e0] to-[#fce4ec] rounded-3xl p-6 shadow-lg text-center">
                <h3 className="text-lg font-bold mb-4">施肥推荐</h3>
                <div className="flex items-center justify-center gap-3 mb-6">
                  {bestFert?.name && (
                    <CropImage 
                      seedId={bestFert.seedId}
                      name={bestFert.name}
                      className="w-12 h-12 object-contain drop-shadow-md"
                    />
                  )}
                  <div className="text-2xl font-black">{bestFert?.name}</div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/50 p-3 rounded-xl shadow-sm">
                    <div className="text-xs text-gray-500 mb-1">每小时经验</div>
                    <div className="font-bold text-lg">{bestFert?.expPerHourFert.toFixed(2)}</div>
                  </div>
                  <div className="bg-white/50 p-3 rounded-xl shadow-sm">
                    <div className="text-xs text-gray-500 mb-1">每日经验</div>
                    <div className="font-bold text-lg">{Math.round(bestFert?.expPerDayFert || 0).toLocaleString()}</div>
                  </div>
                  <div className="bg-white/50 p-3 rounded-xl shadow-sm flex flex-col justify-center overflow-hidden">
                    <div className="text-xs text-gray-500 mb-1">肥后生长</div>
                    <div className="font-bold text-[13px] sm:text-sm md:text-base whitespace-nowrap tracking-tight">{bestFert?.growTimeFertStr}</div>
                  </div>
                  <div className="bg-white/50 p-3 rounded-xl shadow-sm flex flex-col justify-center">
                    <div className="text-xs text-gray-500 mb-1">提升比例</div>
                    <div className="font-bold text-lg text-green-600">+{bestFert?.gainPercent.toFixed(2)}%</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-[#f7f0e4] rounded-3xl p-4 md:p-6 shadow-[6px_6px_14px_rgba(163,141,109,0.4),-4px_-4px_10px_rgba(250,243,230,0.65)]">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-2">
            <h2 className="text-xl font-bold">🏆 经验排行榜 (Top 20)</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[400px]">
              <thead>
                <tr className="bg-orange-500 text-white text-sm md:text-base">
                  <th className="p-2 md:p-3 rounded-tl-xl whitespace-nowrap">排名</th>
                  <th className="p-2 md:p-3 whitespace-nowrap">作物</th>
                  <th className="p-2 md:p-3 whitespace-nowrap">等级</th>
                  <th className="p-2 md:p-3 whitespace-nowrap">生长时间</th>
                  <th className="p-2 md:p-3 rounded-tr-xl whitespace-nowrap">每小时经验</th>
                </tr>
              </thead>
              <tbody className="text-sm md:text-base">
                {(useFert ? sortedFert : sortedNoFert).slice(0, 20).map((row, i) => (
                  <tr key={row.seedId} className="border-b border-orange-200/50 hover:bg-green-500/10 transition-colors">
                    <td className="p-2 md:p-3 font-bold whitespace-nowrap">
                      {i === 0 ? '🥇' : i === 1 ? '🥈' : i === 2 ? '🥉' : i + 1}
                    </td>
                    <td className="p-2 md:p-3 font-bold whitespace-nowrap">
                      <div className="flex items-center gap-2">
                        <CropImage 
                          seedId={row.seedId}
                          name={row.name}
                          className="w-6 h-6 object-contain"
                        />
                        <span>{row.name}</span>
                      </div>
                    </td>
                    <td className="p-2 md:p-3 text-gray-600 whitespace-nowrap">Lv {row.requiredLevel}</td>
                    <td className="p-2 md:p-3 text-gray-600 text-sm md:text-base whitespace-nowrap">{useFert ? row.growTimeFertStr : row.growTimeStr}</td>
                    <td className="p-2 md:p-3 font-bold text-green-700 whitespace-nowrap">
                      {(useFert ? row.expPerHourFert : row.expPerHourNoFert).toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
