export type Nucleus = { name: string; protons: number; neutrons: number };
const D = { name: "氘 ²H", protons: 1, neutrons: 1 };
const T = { name: "氚 ³H", protons: 1, neutrons: 2 };
const He3 = { name: "氦-3 ³He", protons: 2, neutrons: 1 };
const He4 = { name: "氦-4 ⁴He", protons: 2, neutrons: 2 };
const n = { name: "中子 n", protons: 0, neutrons: 1 };
const p = { name: "质子 p", protons: 1, neutrons: 0 };
const B11 = { name: "硼-11 ¹¹B", protons: 5, neutrons: 6 };
export const fusionReactions = [
  {
    label: "氘 + 氚",
    reactants: [D, T],
    products: [He4, n],
    energy: 17.6,
    equation: "²H + ³H → ⁴He + n + 17.6 MeV",
    shares: [3.5, 14.1],
    intro:
      "目前聚变能源研究最主要的燃料组合。氘和氚都是氢的亲戚：质子一样多，中子数量不同。",
  },
  {
    label: "氘 + 氘 · 氦支路",
    reactants: [D, D],
    products: [He3, n],
    energy: 3.27,
    equation: "²H + ²H → ³He + n + 3.27 MeV",
    shares: [0.82, 2.45],
    intro:
      "两个氘核相遇，可以生成氦-3 和一个中子。氘—氘反应还有另一条常见支路，点旁边看看。",
  },
  {
    label: "氘 + 氘 · 氚支路",
    reactants: [D, D],
    products: [T, p],
    energy: 4.03,
    equation: "²H + ²H → ³H + p + 4.03 MeV",
    shares: [1.01, 3.02],
    intro:
      "同样是两个氘核，也可以生成氚和一个质子。两条支路都释放能量，产物却不同。",
  },
  {
    label: "氘 + 氦-3",
    reactants: [D, He3],
    products: [He4, p],
    energy: 18.3,
    equation: "²H + ³He → ⁴He + p + 18.3 MeV",
    shares: [3.6, 14.7],
    intro:
      "这个反应的两个主要产物都带电，但实现它所需的温度更高，是另一条受研究的聚变路线。",
  },
  {
    label: "氢 + 硼-11",
    reactants: [p, B11],
    products: [He4, He4, He4],
    energy: 8.7,
    equation: "¹H + ¹¹B → 3 ⁴He + 8.7 MeV",
    shares: null,
    intro:
      "一个普通氢原子核（质子）撞上硼-11，最终生成三个氦-4 原子核，也叫 α 粒子。主要反应不产生中子，但比氘氚聚变更难实现，需要更高的粒子能量。",
  },
] as const;

// shortcut: four-second teaching sequence, upgrade for collision dynamics rather than physical reaction timing.
export function fusionFrame(seconds: number) {
  if (!Number.isFinite(seconds) || seconds < 0)
    throw Error("Invalid reaction time");
  const phase = seconds === 0 ? 0 : (seconds % 4 || 4) / 4;
  return {
    phase,
    event: Math.max(1, Math.ceil(seconds / 4)),
    fused: phase >= 0.48,
    approach: Math.min(1, phase / 0.48),
    release: Math.max(0, (phase - 0.48) / 0.52),
  };
}

export function plasmaDensity(ionDensity: number) {
  if (!Number.isFinite(ionDensity) || ionDensity <= 0)
    throw Error("Invalid ion density");
  const airNumber = 101325 / (1.380649e-23 * 293.15);
  const airMass = airNumber * 28.97 * 1.6605390666e-27;
  const plasmaMass = ionDensity * 2.5 * 1.6605390666e-27;
  return {
    airNumber,
    airMass,
    plasmaMass,
    numberRatio: airNumber / ionDensity,
    massRatio: airMass / plasmaMass,
  };
}
