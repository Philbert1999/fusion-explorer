import { DEFAULT_GEOMETRY, type Geometry } from "./model";
export type Preset = {
  name: string;
  region: string;
  status: string;
  version: string;
  definition: string;
  geometry: Geometry;
  source: string;
  note: string;
};
export const presets: Preset[] = [
  {
    name: "教学模型",
    region: "—",
    status: "自选教学参数",
    version: "Stage 02",
    definition: "同心嵌套教学磁面",
    geometry: DEFAULT_GEOMETRY,
    source: "",
    note: "所有参数为教学自选值。",
  },
  {
    name: "EAST",
    region: "中国",
    status: "全超导实验托卡马克；2025 文献记录运行",
    version: "2025 IAEA overview，1066 s 工况尺寸",
    definition: "文献等离子体 R、a；形状为教学近似",
    geometry: { R0: 1.85, a: 0.45, rho: 0.8, kappa: 1.7, delta: 0.3 },
    source:
      "https://conferences.iaea.org/event/392/papers/35587/files/13985-EAST%20Oveview_2025IAEAManus_XG_v3.pdf",
    note: "R₀、a 来自文献；κ=1.7、δ=0.3 是教学默认值，不是该放电的测量形状。",
  },
  {
    name: "ITER",
    region: "法国 / 国际合作",
    status: "实验堆；所引工程手册中的设计装置",
    version: "ITER Engineering Basis Handbook，Vol.1 Ch.7.1",
    definition: "手册等离子体几何尺寸；未导入分离面",
    geometry: { R0: 6.2, a: 2, rho: 0.8, kappa: 1.7, delta: 0.33 },
    source:
      "https://www.iter.org/sites/default/files/media/2026-04/vol.1_ch.07.1_design_evolution_and_techn_dv55d4_v2_0.pdf",
    note: "R₀=6.2 m、a=2 m、κ=1.7 取手册；δ=0.33 是教学默认值。",
  },
  {
    name: "SPARC",
    region: "美国",
    status: "高场托卡马克；2024 文献描述为建设中",
    version: "SPARC V2，2020 nominal DT H-mode，Table 1",
    definition: "κ、δ 对应分离面；内层形状按比例教学延拓",
    geometry: { R0: 1.85, a: 0.57, rho: 0.8, kappa: 1.97, delta: 0.54 },
    source:
      "https://library.psfc.mit.edu/catalog/reports/2020/20ja/20ja016/20ja016_full.pdf",
    note: "引用 V2 设计参数，不代表当前工程最终版本或真实 EFIT 平衡。",
  },
  {
    name: "JET",
    region: "英国 / 欧洲合作",
    status: "常规磁体托卡马克；历史设计参数",
    version:
      "The JET Experiment: Evolution, Present Status, and Prospects，1987",
    definition: "设计等离子体水平半径 a=1.25 m、垂直半径 b=2.10 m；κ=b/a",
    geometry: { R0: 2.96, a: 1.25, rho: 0.8, kappa: 1.68, delta: 0.3 },
    source: "https://doi.org/10.13182/FST87-A24999",
    note: "R₀、a、b 取原始设计论文；κ=2.10/1.25=1.68 为尺寸比。δ=0.3 是教学默认值，不代表特定放电；不是最终 D-T 工况。",
  },
  {
    name: "ASDEX Upgrade",
    region: "德国",
    status: "偏滤器实验托卡马克；IPP 官方装置概览",
    version: "IPP Introduction: The ASDEX Upgrade tokamak；2026-10-19 核查",
    definition: "官网近似尺寸 R₀=1.6 m，水平/垂直小半径 0.5/0.8 m；κ=b/a",
    geometry: { R0: 1.6, a: 0.5, rho: 0.8, kappa: 1.6, delta: 0.3 },
    source: "https://www.ipp.mpg.de/16208/einfuehrung",
    note: "κ=0.8/0.5=1.6；δ=0.3 是教学默认值。采用官网取整的概览尺寸，不与论文常用的 R₀=1.65 m 混用，也不表示某次放电的形状。",
  },
  {
    name: "KSTAR",
    region: "韩国",
    status: "超导实验托卡马克；KFE 官方规格概览",
    version: "KFE KSTAR–ITER 规格对照表；2026-10-19 核查",
    definition: "官网等离子体大/小半径；形状为教学近似",
    geometry: { R0: 1.8, a: 0.5, rho: 0.8, kappa: 1.8, delta: 0.3 },
    source: "https://jobs.iterkorea.org/menu.es?mid=a10201040000",
    note: "R₀=1.8 m、a=0.5 m 来自 KFE 表格；κ=1.8、δ=0.3 是教学默认值，不把最大整形能力当成标准运行形状。",
  },
  {
    name: "JT-60SA",
    region: "日本 / 欧洲合作",
    status: "超导托卡马克；QST 资料中的标称设计配置",
    version: "QST 装置介绍：JT-60SAはITER／原型炉へスムーズにつなぐ役割を担う",
    definition: "标称配置 R₀/a=2.96/1.18 m、κ/δ=1.93/0.5；光滑截面近似",
    geometry: { R0: 2.96, a: 1.18, rho: 0.8, kappa: 1.93, delta: 0.5 },
    source: "https://www.qst.go.jp/uploaded/attachment/50261.pdf",
    note: "四个形状/尺寸参数取同一 QST 表格；是标称配置而非已实现的放电结果。映射为对称光滑曲面，不重现分离面 X 点或上下不对称。",
  },
];
