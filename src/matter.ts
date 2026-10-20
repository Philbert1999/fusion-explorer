export type MatterKind = "solid" | "liquid" | "gas" | "plasma";
export const matterColors: Record<MatterKind, string> = {
  solid: "#bd99fa",
  liquid: "#65d6ac",
  gas: "#78a9f2",
  plasma: "#61e1ec",
};
export const matterExamples = [
  {
    id: "metal",
    temperatureShort: "约293 K",
    densityShort: "ρ ≈ 7,900 kg/m³",
    name: "金属块",
    kind: "solid" as MatterKind,
    icon: "block",
    temperature: 293,
    density: 7900,
    temperatureText: "约 293 K",
    densityText: "约 7,900 kg/m³",
    label: [200, -40],
    description:
      "以铁为例。固体里的粒子紧密排列；和水相比，同样体积的铁约重八倍。",
    source: "https://physics.nist.gov/cgi-bin/Star/compos.pl?matno=026",
  },
  {
    id: "water",
    temperatureShort: "约293 K",
    densityShort: "ρ ≈ 1,000 kg/m³",
    name: "液态水",
    kind: "liquid" as MatterKind,
    icon: "water",
    temperature: 293,
    density: 998,
    temperatureText: "约 293 K",
    densityText: "约 1,000 kg/m³",
    label: [470, -40],
    description:
      "一立方米的水约重一吨。水和铁的温度可以相同，物态却不同：物质成分也决定它的状态。",
    source:
      "https://www.nist.gov/system/files/documents/2017/05/09/NISTIR_7383_20120529.pdf",
  },
  {
    id: "air",
    temperatureShort: "约293 K",
    densityShort: "ρ ≈ 1.2 kg/m³",
    name: "常温空气",
    kind: "gas" as MatterKind,
    icon: "air",
    temperature: 293.15,
    density: 1.204,
    temperatureText: "约 293 K",
    densityText: "约 1.2 kg/m³",
    label: [185, 230],
    description:
      "293 K、一个大气压下的空气。它远比液体和固体稀薄，但仍比磁约束聚变燃料密得多。",
    source: "https://www.grc.nasa.gov/www/k-12/airplane/eqstat.html",
  },
  {
    id: "wind",
    temperatureShort: "约10万 K",
    densityShort: "ρ ≈ 8×10⁻²¹ kg/m³",
    name: "稀薄空间等离子体",
    kind: "plasma" as MatterKind,
    icon: "wind",
    temperature: 1e5,
    density: 8.4e-21,
    temperatureText: "约 100,000 K",
    densityText: "约 8 × 10⁻²¹ kg/m³",
    label: [750, 470],
    description:
      "以地球轨道附近的太阳风为例，每立方厘米只有几个质子。温度很高，粒子却非常少。",
    source: "https://cosmicopia.gsfc.nasa.gov/qa_cr.html",
  },
  {
    id: "fusion",
    temperatureShort: "约1.5亿 K",
    densityShort: "",
    name: "磁约束聚变燃料",
    kind: "plasma" as MatterKind,
    icon: "torus",
    temperature: 1.5e8,
    density: 4.15e-7,
    temperatureText: "约 1.5 亿 K",
    densityText: "随下方燃料密度滑块变化",
    label: [980, 380],
    description:
      "托卡马克、仿星器中的高温燃料：磁场把很热、很稀薄的等离子体留在环形区域里。",
    source: "https://www.iter.org/fusion-energy/making-it-work",
  },
  {
    id: "laser",
    temperatureShort: "约4,000万 K",
    densityShort: "ρ ≈ 75,000 kg/m³",
    name: "激光聚变热点",
    kind: "plasma" as MatterKind,
    icon: "laser",
    temperature: 4e7,
    density: 7.5e4,
    temperatureText: "约 4,000 万 K",
    densityText: "约 75,000 kg/m³",
    label: [1050, 150],
    description:
      "取 NIF 公开热点条件中的一个代表值：约4,000万 K、每立方厘米50–100克。激光短暂压缩燃料，走的是高密度路线。",
    source: "https://str.llnl.gov/past-issues/march-2013/path-ignition",
  },
  {
    id: "flame",
    temperatureShort: "约1,500 K",
    densityShort: "ρ ≈ 0.23 kg/m³",
    name: "日常火焰",
    kind: "gas" as MatterKind,
    icon: "flame",
    temperature: 1500,
    density: 0.23,
    temperatureText: "约 1,500 K",
    densityText: "约 0.23 kg/m³ · 热气体估算",
    label: [430, 300],
    description:
      "普通烛焰主要是炽热气体，里面也有少量离子和电子，能响应外加电场。图中密度按一个大气压下的热气体估算。",
    source: "https://journals.aps.org/pre/abstract/10.1103/PhysRevE.86.036314",
  },
  {
    id: "neon",
    temperatureShort: "电子约3万 K",
    densityShort: "ρ ≈ 0.005 kg/m³",
    name: "霓虹灯",
    kind: "plasma" as MatterKind,
    icon: "neon",
    temperature: 3e4,
    density: 0.005,
    temperatureText: "电子约 30,000 K；气体约 300 K",
    densityText: "约 0.005 kg/m³ · 示例填充条件",
    label: [690, 320],
    description:
      "电场驱动稀薄气体放电。电子可以很热，而气体仍接近室温；图中温度取电子温度，密度取约600 Pa的氖气示例。",
    source: "https://gss.pppl.gov/talks2019/Lopez.pdf",
  },
  {
    id: "lightning",
    temperatureShort: "约3万 K",
    densityShort: "ρ ≈ 0.01 kg/m³",
    name: "闪电热通道",
    kind: "plasma" as MatterKind,
    icon: "lightning",
    temperature: 3e4,
    density: 0.012,
    temperatureText: "约 30,000 K",
    densityText: "约 0.01 kg/m³ · 热通道估算",
    label: [750, 130],
    description:
      "强电流把空气迅速加热、电离，形成闪电通道，并引发急剧膨胀和雷声。密度用一个大气压下热空气的估算量级作图示。",
    source:
      "https://www.weather.gov/source/zhu/ZHU_Training_Page/lightning_stuff/lightning2/thunder.html",
  },
  {
    id: "sun",
    temperatureShort: "约1,500万 K",
    densityShort: "ρ ≈ 150,000 kg/m³",
    name: "太阳核心",
    kind: "plasma" as MatterKind,
    icon: "sun",
    temperature: 1.5e7,
    density: 1.5e5,
    temperatureText: "约 1,500 万 K",
    densityText: "约 150,000 kg/m³",
    label: [850, -40],
    description:
      "太阳核心依靠巨大引力把燃料压得很密，在约1,500万 K下发生核聚变。它比磁约束聚变燃料冷一些，却密得多。",
    source: "https://solarscience.msfc.nasa.gov/interior.shtml",
  },
];

export function matterPosition(
  temperature: number,
  density: number,
): [number, number] {
  if (
    ![temperature, density].every(Number.isFinite) ||
    temperature < 10 ||
    temperature > 1e9 ||
    density < 1e-21 ||
    density > 1e6
  )
    throw Error("Matter point outside chart range");
  return [
    100 + ((Math.log10(temperature) - 1) / 8) * 1040,
    510 - ((Math.log10(density) + 21) / 27) * 450,
  ];
}

export function equalParticleVolumes(numberRatio: number) {
  if (!Number.isFinite(numberRatio) || numberRatio <= 0)
    throw Error("Invalid density ratio");
  const airEdge = 128 / Math.cbrt(250000);
  return {
    airEdge,
    plasmaEdge: airEdge * Math.cbrt(numberRatio),
    plasmaLitres: numberRatio / 1000,
  };
}
