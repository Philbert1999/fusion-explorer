import { presets, type Preset } from "./presets";
export type Device = Preset & {
  family: "tokamak" | "stellarator";
  periods?: number;
  periodSource?: string;
};
type Entry = {
  name: string;
  region: string;
  R0: number;
  a: number;
  source: string;
  version: string;
  note: string;
  kappa?: number;
};
const additional: Entry[] = [
  {
    name: "DIII-D",
    region: "美国",
    R0: 1.7,
    a: 0.6,
    source: "https://d3dfusion.org/capabilities-tools/",
    version: "DIII-D Capabilities & Tools",
    note: "采用官网取整尺寸，未与其他论文的 1.67/0.67 m 混用。",
  },
  {
    name: "TCV",
    region: "瑞士",
    R0: 0.88,
    a: 0.25,
    source: "https://crppwww.epfl.ch/~weisen/TCV_PRESENTATION.HTML",
    version: "EPFL TCV Parameters",
    note: "可变形装置；未把最大拉长比当成统一运行形状。",
  },
  {
    name: "NSTX",
    region: "美国",
    R0: 0.85,
    a: 0.65,
    kappa: 2,
    source:
      "https://nstx.pppl.gov/DragNDrop/Publications_Presentations/Publications/2009%20Papers/2009_locked/MBell_PPCF.pdf",
    version: "Bell et al., PPCF 51 (2009) 124054",
    note: "历史 NSTX，a 取文献上限；不是 NSTX-U。",
  },
  {
    name: "MAST Upgrade",
    region: "英国",
    R0: 0.85,
    a: 0.65,
    kappa: 2,
    source:
      "https://scientific-publications.ukaea.uk/papers/developing-understanding-of-spherical-tokamaks-with-mast-upgrade/",
    version: "UKAEA-CCFE-CP(23)43",
    note: "采用该文 R/a 标称尺寸。",
  },
  {
    name: "WEST",
    region: "法国",
    R0: 2.5,
    a: 0.5,
    source:
      "https://irfm.cea.fr/presentation-de-west/principaux-parametres-du-plasma-west/",
    version: "CEA IRFM · WEST plasma parameters",
    note: "等离子体尺寸，不是真空室外径。",
  },
  {
    name: "Alcator C-Mod",
    region: "美国",
    R0: 0.68,
    a: 0.22,
    source: "https://cmodwiki.psfc.mit.edu/index.php/Alcator_Parameters",
    version: "MIT PSFC · Alcator Parameters",
    note: "官网 68/22 cm 换算；κ、δ 的能力范围不作为特定放电。",
  },
  {
    name: "COMPASS",
    region: "捷克",
    R0: 0.56,
    a: 0.23,
    source:
      "https://www.ipp.cas.cz/vedecka_struktura_ufp/tokamak/COMPASS/parametry/",
    version: "IPP CAS · COMPASS Parameters",
    note: "历史 COMPASS；不是 COMPASS-U，κ 采用教学值。",
  },
  {
    name: "DTT",
    region: "意大利",
    R0: 2.19,
    a: 0.7,
    source:
      "https://iris.polito.it/retrieve/handle/11583/2981963/bdb86fe6-da4f-4b9f-8a96-3ec2f27f2041/RFTC_ceccuzzi_2022.pdf",
    version: "Ceccuzzi et al., 2022 ICRF design",
    note: "建设设计参考，不代表当前已实现工况。",
  },
  {
    name: "TFTR",
    region: "美国",
    R0: 2.62,
    a: 0.96,
    kappa: 1,
    source: "https://bp-pub.pppl.gov/pub_report/1996/PPPL-3173.pdf",
    version: "PPPL-3173, 1996, discharge #73741",
    note: "选定历史放电的圆截面参考。",
  },
  {
    name: "J-TEXT",
    region: "中国",
    R0: 1.05,
    a: 0.25,
    kappa: 1,
    source:
      "https://www-pub.iaea.org/MTCD/Publications/PDF/CRCP-FUS-001webRev.pdf",
    version: "IAEA World Survey 2022 · Table 15",
    note: "a 的公开范围为 0.25–0.29 m，此处取 0.25 m。",
  },
  {
    name: "HL-2A",
    region: "中国",
    R0: 1.65,
    a: 0.4,
    source:
      "https://conferences.iaea.org/event/214/contributions/17317/attachments/10019/14102/EX-P3-3_WuN_manuscript.pdf",
    version: "IAEA FEC EX/P3-3 · Experimental setup",
    note: "该文等离子体尺寸，未重建 X 点。",
  },
  {
    name: "T-15MD",
    region: "俄罗斯",
    R0: 1.48,
    a: 0.67,
    source: "https://doi.org/10.1016/j.fusengdes.2020.112211",
    version: "Current status of tokamak T-15MD (2021)",
    note: "论文中的启动设计尺寸，不作实时运行状态断言。",
  },
  {
    name: "GOLEM",
    region: "捷克",
    R0: 0.4,
    a: 0.085,
    kappa: 1,
    source: "https://golem.fjfi.cvut.cz/wiki/",
    version: "CTU GOLEM official wiki",
    note: "a 为限制器半径；不与 0.1 m 衬壁半径混用。",
  },
  {
    name: "ST40",
    region: "英国",
    R0: 0.4,
    a: 0.25,
    kappa: 2,
    source: "https://doi.org/10.1016/j.nme.2024.101772",
    version: "ST40 near-SOL measurements (2024)",
    note: "文献范围 R=0.4–0.5 m、a=0.2–0.25 m，此处选 0.4/0.25 的尺寸参考组合，非特定平衡。",
  },
  {
    name: "SMART",
    region: "西班牙",
    R0: 0.4,
    a: 0.25,
    kappa: 2,
    source: "https://idus.us.es/items/2f87c4d1-f44c-47ba-8575-022e9b5a853b",
    version: "Coils and power supplies design (2021)",
    note: "采用早期设计尺寸，不代表当前全部放电，未重现负三角形变。",
  },
];
const stellarators: (Entry & { periods: number; periodSource?: string })[] = [
  {
    name: "Wendelstein 7-X",
    region: "德国",
    R0: 5.5,
    a: 0.53,
    periods: 5,
    source: "https://www.ipp.mpg.de/16931/einfuehrung",
    periodSource: "https://publikationen.bibliothek.kit.edu/270048149/3813991",
    version: "IPP W7-X technical data; KIT technical table",
    note: "采用官网 a=0.53 m 的版本；不是其他手册的 0.52 m。平均尺寸，未导入 VMEC。",
  },
  {
    name: "LHD",
    region: "日本",
    R0: 3.9,
    a: 0.6,
    periods: 10,
    source: "https://www-lhd.nifs.ac.jp/pub/LHD_Project_en.html",
    periodSource:
      "https://www.nifs.ac.jp/report/annrep18/pdf/Annual_Report_2017-2018.pdf",
    version: "NIFS LHD device parameters; 2017–2018 report",
    note: "Heliotron；采用官网标称 R=3.9 m，a 为平均小半径，实际磁轴位置可调。",
  },
  {
    name: "HSX",
    region: "美国",
    R0: 1.2,
    a: 0.12,
    periods: 4,
    source: "https://doi.org/10.1088/1361-6587/adbc1f",
    version: "HSX reflectometry measurements (2025)",
    note: "准螺旋对称实验；平均尺寸，不是实际三维边界系数。",
  },
  {
    name: "TJ-II",
    region: "西班牙",
    R0: 1.5,
    a: 0.22,
    periods: 4,
    source:
      "https://sites.fusion.ciemat.es/jlvelasco/research-areas/exploitation-of-tj-ii/",
    version: "CIEMAT · TJ-II research overview",
    note: "Heliac；平均 a<0.22 m，此处取 0.22 m 尺寸上限参考，非某个线圈电流配置。",
  },
  {
    name: "Wendelstein 7-AS",
    region: "德国",
    R0: 2,
    a: 0.2,
    periods: 5,
    source: "https://www.ipp.mpg.de/2665443/w7as",
    periodSource:
      "https://www.sciencedirect.com/science/article/abs/pii/S0022311502015064",
    version: "IPP W7-AS historical technical data",
    note: "1988–2002 历史装置；采用官网 a=0.2 m 取整概览。",
  },
  {
    name: "Heliotron J",
    region: "日本",
    R0: 1.2,
    a: 0.15,
    periods: 4,
    source: "https://heliotronj.iae.kyoto-u.ac.jp/en/equipment.html",
    periodSource: "https://www.jspf.or.jp/JPFRS/PDF/Vol6/jpfr2004_06-496.pdf",
    version: "Kyoto University device parameters",
    note: "公开 a=0.1–0.2 m，此处选中间值 0.15 m 作参考，不是唯一运行工况。",
  },
];
export const devices: Device[] = [
  ...presets.slice(1).map((p) => ({ ...p, family: "tokamak" as const })),
  ...additional.map((p) => ({
    name: p.name,
    region: p.region,
    family: "tokamak" as const,
    status: "文献/设计参考，非实时状态",
    version: p.version,
    source: p.source,
    definition: "文献 R₀、a；截面形状为教学近似",
    geometry: { R0: p.R0, a: p.a, rho: 1, kappa: p.kappa ?? 1.7, delta: 0 },
    note: p.note + ` κ=${p.kappa ?? 1.7}、δ=0 为此视图的教学选择。`,
  })),
  ...stellarators.map((p) => ({
    name: p.name,
    region: p.region,
    family: "stellarator" as const,
    periods: p.periods,
    periodSource: p.periodSource,
    status: "仿星器/螺旋装置；资料版本见来源",
    version: p.version,
    source: p.source,
    definition: "平均/参考 R₀、a；三维形状为通用示意",
    geometry: { R0: p.R0, a: p.a, rho: 1, kappa: 1, delta: 0 },
    note:
      p.note + " κ、δ 不适用于统一描述其三维边界；通用扭转幅度不是实测参数。",
  })),
];
export function deviceBounds(device: Device, illustrative: boolean) {
  const reach =
    device.family === "stellarator" && illustrative ? Math.sqrt(1.7) + 0.12 : 1;
  return {
    radius: device.geometry.R0 + device.geometry.a * reach,
    height:
      device.geometry.a *
      (device.family === "stellarator" ? reach : device.geometry.kappa),
  };
}
