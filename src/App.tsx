import React, { useState, useMemo } from 'react';
import seedsData from './data/seeds.json';
import plantData from './data/Plant.json';

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
for (const p of plantData) {
  const seedId = Number(p.seed_id);
  if (seedId > 0 && !plantPhaseMap[seedId]) {
    const phases = parseGrowPhases(p.grow_phases);
    if (phases.length > 0) {
      plantPhaseMap[seedId] = phases[0];
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

export default function App() {
  const [level, setLevel] = useState(27);
  const [lands, setLands] = useState(18);
  const [useFert, setUseFert] = useState(true);

  const calculatedRows = useMemo(() => {
    const plantSecNoFert = lands / NO_FERT_PLANT_SPEED;
    const plantSecFert = lands / NORMAL_FERT_PLANT_SPEED;
    const rows = [];

    for (const s of seedsData) {
      if (s.requiredLevel > level) continue;

      const seedId = s.seedId;
      const growTimeSec = s.growTimeSec;
      const reduceSec = plantPhaseMap[seedId] || 0;
      const growTimeFert = Math.max(1, growTimeSec - reduceSec);

      const cycleNoFert = growTimeSec + plantSecNoFert;
      const cycleFert = growTimeFert + plantSecFert;

      const expPerHourNoFert = (lands * s.exp / cycleNoFert) * 3600;
      const expPerHourFert = (lands * s.exp / cycleFert) * 3600;
      
      const gainPercent = expPerHourNoFert > 0
        ? ((expPerHourFert - expPerHourNoFert) / expPerHourNoFert) * 100
        : 0;

      rows.push({
        ...s,
        growTimeFert,
        growTimeFertStr: formatSec(growTimeFert),
        expPerHourNoFert,
        expPerHourFert,
        expPerDayNoFert: expPerHourNoFert * 24,
        expPerDayFert: expPerHourFert * 24,
        gainPercent
      });
    }

    return rows;
  }, [level, lands]);

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
          <p className="text-[#7a6555] text-lg">输入等级和土地数量，智能计算经验最大化的种植方案</p>
        </div>

        <div className="bg-[#f7f0e4] rounded-3xl p-6 shadow-[6px_6px_14px_rgba(163,141,109,0.4),-4px_-4px_10px_rgba(250,243,230,0.65)]">
          <h2 className="text-xl font-bold mb-6">📝 输入参数</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block font-bold mb-2">🎯 账号等级</label>
              <input 
                type="number" 
                value={level} 
                onChange={e => setLevel(Number(e.target.value))}
                className="w-full p-3 rounded-xl bg-[#f0e6d3] shadow-[inset_3px_3px_7px_rgba(163,141,109,0.25),inset_-3px_-3px_7px_rgba(250,243,230,0.5)] outline-none focus:ring-2 focus:ring-green-400"
                min="1" max="100"
              />
            </div>
            <div>
              <label className="block font-bold mb-2">🏡 土地数量</label>
              <input 
                type="number" 
                value={lands} 
                onChange={e => setLands(Number(e.target.value))}
                className="w-full p-3 rounded-xl bg-[#f0e6d3] shadow-[inset_3px_3px_7px_rgba(163,141,109,0.25),inset_-3px_-3px_7px_rgba(250,243,230,0.5)] outline-none focus:ring-2 focus:ring-green-400"
                min="1" max="200"
              />
            </div>
            <div>
              <label className="block font-bold mb-2">🧪 使用技能</label>
              <label className="flex items-center space-x-3 cursor-pointer mt-3">
                <input 
                  type="checkbox" 
                  checked={useFert} 
                  onChange={e => setUseFert(e.target.checked)}
                  className="w-5 h-5 text-green-500 rounded focus:ring-green-400"
                />
                <span className="font-semibold text-[#7a6555]">普通肥料</span>
              </label>
            </div>
          </div>
        </div>

        {calculatedRows.length > 0 && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-br from-[#e8f5e9] to-[#f1f8e9] rounded-3xl p-6 shadow-lg text-center">
              <div className="text-5xl mb-2">🌾</div>
              <h3 className="text-lg font-bold mb-4">不施肥推荐</h3>
              <div className="text-2xl font-black mb-6">{bestNo?.name}</div>
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/50 p-3 rounded-xl shadow-sm">
                  <div className="text-xs text-gray-500 mb-1">每小时经验</div>
                  <div className="font-bold text-lg">{bestNo?.expPerHourNoFert.toFixed(2)}</div>
                </div>
                <div className="bg-white/50 p-3 rounded-xl shadow-sm">
                  <div className="text-xs text-gray-500 mb-1">每日经验</div>
                  <div className="font-bold text-lg">{Math.round(bestNo?.expPerDayNoFert || 0).toLocaleString()}</div>
                </div>
                <div className="bg-white/50 p-3 rounded-xl shadow-sm">
                  <div className="text-xs text-gray-500 mb-1">生长时间</div>
                  <div className="font-bold text-lg">{bestNo?.growTimeStr}</div>
                </div>
                <div className="bg-white/50 p-3 rounded-xl shadow-sm">
                  <div className="text-xs text-gray-500 mb-1">需要等级</div>
                  <div className="font-bold text-lg">Lv {bestNo?.requiredLevel}</div>
                </div>
              </div>
            </div>

            {useFert && (
              <div className="bg-gradient-to-br from-[#fff3e0] to-[#fce4ec] rounded-3xl p-6 shadow-lg text-center">
                <div className="text-5xl mb-2">🧪</div>
                <h3 className="text-lg font-bold mb-4">施肥推荐</h3>
                <div className="text-2xl font-black mb-6">{bestFert?.name}</div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-white/50 p-3 rounded-xl shadow-sm">
                    <div className="text-xs text-gray-500 mb-1">每小时经验</div>
                    <div className="font-bold text-lg">{bestFert?.expPerHourFert.toFixed(2)}</div>
                  </div>
                  <div className="bg-white/50 p-3 rounded-xl shadow-sm">
                    <div className="text-xs text-gray-500 mb-1">每日经验</div>
                    <div className="font-bold text-lg">{Math.round(bestFert?.expPerDayFert || 0).toLocaleString()}</div>
                  </div>
                  <div className="bg-white/50 p-3 rounded-xl shadow-sm">
                    <div className="text-xs text-gray-500 mb-1">肥后生长</div>
                    <div className="font-bold text-lg">{bestFert?.growTimeFertStr}</div>
                  </div>
                  <div className="bg-white/50 p-3 rounded-xl shadow-sm">
                    <div className="text-xs text-gray-500 mb-1">提升比例</div>
                    <div className="font-bold text-lg text-green-600">+{bestFert?.gainPercent.toFixed(2)}%</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        <div className="bg-[#f7f0e4] rounded-3xl p-4 md:p-6 shadow-[6px_6px_14px_rgba(163,141,109,0.4),-4px_-4px_10px_rgba(250,243,230,0.65)]">
          <h2 className="text-xl font-bold mb-6">🏆 经验排行榜 (Top 20)</h2>
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
                    <td className="p-2 md:p-3 font-bold whitespace-nowrap">{row.name}</td>
                    <td className="p-2 md:p-3 text-gray-600 whitespace-nowrap">Lv {row.requiredLevel}</td>
                    <td className="p-2 md:p-3 text-gray-600 whitespace-nowrap">{useFert ? row.growTimeFertStr : row.growTimeStr}</td>
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
