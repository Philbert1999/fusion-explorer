export type DevicePower = {
  label: string;
  mw: number;
  detail: string;
  source: string;
};
export type DeviceFacts = {
  construction?: string;
  operation: string;
  historySource: string;
  power: DevicePower[];
};
export const deviceFactsChecked = "2026-10-20";
const survey = "https://www-pub.iaea.org/MTCD/Publications/PDF/CRCP-FUS-001webRev.pdf";
export const deviceFacts: Record<string, DeviceFacts> = {
  EAST: {
    construction: "2000开建；2005完成组装",
    operation: "2006–至今 · 实验运行",
    historySource: "https://english.ipp.cas.cn/rh/east/",
    power: [{ label: "低杂波加热 / 电流驱动", mw: 10, detail: "2022配置：4 + 6 MW射频源；为低杂波子系统功率，不是全装置总加热。", source: "https://conferences.iaea.org/event/258/contributions/24777/" }],
  },
  ITER: {
    construction: "2007场地准备；2010建筑开工",
    operation: "建设中 · 尚未投运",
    historySource: "https://www.iter.org/about/history",
    power: [
      { label: "注入加热 · 设计目标", mw: 50, detail: "Q≥10目标工况的输入加热功率。", source: "https://www.iter.org/facts-figures" },
      { label: "聚变输出 · 设计目标", mw: 500, detail: "目标400–600秒；不是已实现输出或发电功率。", source: "https://www.iter.org/facts-figures" },
    ],
  },
  SPARC: {
    construction: "2021进入建设阶段",
    operation: "建设 / 调试阶段 · 运行时间待公布",
    historySource: "https://www.cfs.energy/technology/sparc/",
    power: [{ label: "聚变输出 · V2设计预测", mw: 140, detail: "2020物理设计的标称预测；不是已实现输出。", source: "https://htsmagnet.cfs.energy/tfmc-to-sparc/" }],
  },
  JET: {
    operation: "1983–2023 · 已结束等离子体运行",
    historySource: "https://www.gov.uk/government/news/pioneering-jet-delivers-final-plasma",
    power: [{ label: "聚变输出 · 历史峰值", mw: 16, detail: "1997年D–T实验峰值；并非2023年最终工况。", source: "https://www.iter.org/facts-figures" }],
  },
  "ASDEX Upgrade": {
    operation: "1991起 · 实验运行",
    historySource: "https://www.ipp.mpg.de/asdex",
    power: [{ label: "等离子体加热 · 装置能力", mw: 27, detail: "公开装置参数的最大加热能力，不是所有放电都使用此功率。", source: "https://pure.mpg.de/rest/items/item_3641849_3/component/file_3641850/content" }],
  },
  KSTAR: {
    construction: "2007完成组装",
    operation: "2008起 · 实验运行",
    historySource: survey + "#page=81",
    power: [{ label: "加热 / 电流驱动 · 2025配置", mw: 20, detail: "NBI 12 + ECH 6 + Helicon 2 MW，按FEC概览列出的系统能力相加。", source: "https://conferences.iaea.org/event/392/contributions/35589/attachments/19687/36418/1%202025FEC_KSTAROV%28YUNAM%29_v5.pdf" }],
  },
  "JT-60SA": {
    operation: "2023首等离子体 · 后续增力阶段",
    historySource: "https://www.qst.go.jp/uploaded/attachment/51135.pdf",
    power: [{ label: "等离子体加热 · 设计能力", mw: 41, detail: "增强阶段的100秒加热设计；不代表首次等离子体已达到此功率。", source: "https://www.jt60sa.org/wp/cooling/" }],
  },
  "DIII-D": {
    operation: "1986起 · 实验运行",
    historySource: "https://d3dfusion.org/d3d-history/",
    power: [
      { label: "中性束加热 · 官网配置", mw: 20, detail: "官网列20 MW，25 MW列为计划升级。", source: "https://d3dfusion.org/capabilities-tools/" },
      { label: "电子回旋加热 · 官网配置", mw: 3, detail: "官网列3 MW，7 MW列为计划升级；并非总加热功率。", source: "https://d3dfusion.org/capabilities-tools/" },
    ],
  },
  TCV: {
    operation: "1992起 · 实验运行",
    historySource: "https://crppwww.epfl.ch/~weisen/TCV_PRESENTATION.HTML",
    power: [{ label: "电子回旋加热 · 历史配置", mw: 4.5, detail: "EPFL所引概览中的ECH配置；后续升级另有不同功率。", source: "https://crppwww.epfl.ch/~weisen/TCV_PRESENTATION.HTML" }],
  },
  NSTX: {
    operation: "1999–2010 · 历史NSTX；后续为NSTX-U",
    historySource: "https://www.pppl.gov/posts/2026/national-spherical-torus-experiment-nstx-1999-2010",
    power: [{ label: "高次谐波快波 · 射频源能力", mw: 6, detail: "2010论文：六台30 MHz源最多向天线提供6 MW；非吸收功率。", source: "https://nstx.pppl.gov/DragNDrop/Five_Year_Plans/2009_2013/midterm_review/Publications/2010/Taylor_PoP.pdf" }],
  },
  "MAST Upgrade": {
    construction: "2013–2020升级建设",
    operation: "2020起 · 实验运行",
    historySource: "https://www.ukaea.org/news/all-systems-go-for-uks-55m-fusion-energy-experiment/",
    power: [{ label: "中性束加热 · 升级设计", mw: 7.5, detail: "第一阶段NBI设计值，区别于原MAST及后续更高功率方案。", source: "https://scientific-publications.ukaea.uk/wp-content/uploads/Published/AIPConfProcVOL1612p129.pdf" }],
  },
  WEST: {
    operation: "2016起 · WEST；前身Tore Supra始于1988",
    historySource: survey + "#page=54",
    power: [{ label: "射频加热 / 电流驱动 · 官网配置", mw: 19, detail: "ICRH 9 + LHCD 7 + ECRH 3 MW；官网把ECRH标为2025起。", source: "https://irfm.cea.fr/presentation-de-west/principaux-parametres-du-plasma-west/" }],
  },
  "Alcator C-Mod": {
    operation: "1993–2016 · 已结束运行",
    historySource: "https://news.mit.edu/2016/high-intensity-fusion-1014",
    power: [{ label: "射频加热 · 示例工况", mw: 4, detail: "2016-07-14运行日志中的约4 MW放电；不是装置额定上限。", source: "https://www1.psfc.mit.edu/research/alcator/program/cmod_runs.php?run=1160714" }],
  },
  COMPASS: {
    operation: "2008首等离子体；2009–2021布拉格实验",
    historySource: "https://www.ipp.cas.cz/vedecka_struktura_ufp/tokamak/COMPASS/historie/",
    power: [{ label: "中性束加热 · 历史配置", mw: 0.6, detail: "原COMPASS两套0.3 MW中性束；不是COMPASS-U加热功率。", source: "https://www.ipp.cas.cz/Compass_U/overview/" }],
  },
  DTT: {
    construction: "2019签订首批建设合同",
    operation: "建设中 · 尚未投运",
    historySource: "https://iris.cnr.it/handle/20.500.14243/405623",
    power: [{ label: "耦合辅助加热 · 设计目标", mw: 45, detail: "最高性能阶段的等离子体耦合功率，分为三种加热系统。", source: "https://dtt-project.it/index.php/about/what.html" }],
  },
  TFTR: {
    operation: "1982–1997 · 已结束运行",
    historySource: "https://www.pppl.gov/tokamak-fusion-test-reactor",
    power: [{ label: "聚变输出 · 历史峰值", mw: 10.7, detail: "1994年D–T实验峰值。", source: "https://www.pppl.gov/news/2020/groundbreaking-tokamak-fusion-test-reactor-designated-nuclear-historic-landmark" }],
  },
  "J-TEXT": {
    operation: "2007起 · 华中科技大学运行阶段",
    historySource: survey + "#page=46",
    power: [{ label: "脉冲发电机 · 额定电功率", mw: 100, detail: "飞轮发电机供磁体与加热场电源；不是送入等离子体的100 MW加热。", source: "https://ifpr.hust.edu.cn/kxyj/gcjs.htm" }],
  },
  "HL-2A": {
    construction: "2002建成",
    operation: "2002起 · 实验装置阶段",
    historySource: survey + "#page=44",
    power: [{ label: "低杂波电流驱动 · 子系统", mw: 2, detail: "IAEA 2022综述所列LHCD系统；不是全装置加热总和。", source: survey + "#page=44" }],
  },
  "T-15MD": {
    operation: "2021进入物理启动阶段",
    historySource: "https://conferences.iaea.org/event/214/contributions/17260/",
    power: [{ label: "辅助加热 · 设计目标", mw: 20, detail: "物理启动概览中的加热设计值；不把电网300 MVA当成加热功率。", source: "https://conferences.iaea.org/event/214/contributions/17260/" }],
  },
  GOLEM: {
    construction: "源自1960年代TM-1，后迁移改造",
    operation: "2009起 · CTU教学运行阶段",
    historySource: "https://golem.fjfi.cvut.cz/wiki/",
    power: [{ label: "欧姆加热 · 示例放电", mw: 0.0466, detail: "公开放电#2819：46.6 kW；随放电电流、电阻变化。", source: "https://golem.fjfi.cvut.cz/shots/2819/" }],
  },
  ST40: {
    operation: "2017起 · 实验运行",
    historySource: "https://tokamakenergy.com/our-fusion-energy-and-hts-technology/fusion-energy-technology/",
    power: [{ label: "中性束加热 · 文献配置", mw: 1.8, detail: "工程演进报告中的NBI配置；后续另有微波加热升级。", source: "https://www.mit.edu/~wallaceg/SOFE_abstracts_final.pdf" }],
  },
  SMART: {
    operation: "2025首等离子体 · 初期实验",
    historySource: "https://www.us.es/actualidad-de-la-us/el-tokamak-smart-de-la-us-aspira-ser-el-proyecto-mas-transformador-para",
    power: [{ label: "启动预电离微波 · 设计", mw: 0.006, detail: "2021磁平衡设计中的6 kW启动系统，不是总加热或聚变输出。", source: "https://idus.us.es/server/api/core/bitstreams/423a8213-d91a-4719-9990-d68519099d55/content" }],
  },
  "Wendelstein 7-X": {
    construction: "2005–2014主要组装阶段",
    operation: "2015首等离子体；2016起科学实验",
    historySource: "https://www.ipp.mpg.de/w7x",
    power: [{ label: "电子回旋加热 · 设计能力", mw: 10, detail: "微波加热系统的10 MW能力；不是聚变输出。", source: "https://www.ipp.mpg.de/w7x" }],
  },
  LHD: {
    construction: "1998完成建设并进入实验",
    operation: "1998–2025 · 2025-12-25结束实验",
    historySource: "https://www-lhd.nifs.ac.jp/pub/index_e.html",
    power: [{ label: "总加热能力 · 2025资料", mw: 36, detail: "NIFS 2025–2026机构手册所列总加热能力，非某一长脉冲的实际功率。", source: "https://www.nifs.ac.jp/en/about/pub/pamphlet/nifs2025-2026e.pdf" }],
  },
  HSX: {
    operation: "1999起 · 实验装置阶段",
    historySource: "https://news.wisc.edu/one-of-a-kind-fusion-experiment-comes-online/",
    power: [{ label: "电子回旋加热 · 文献配置", mw: 0.2, detail: "IAEA 2022资料中的28 GHz、200 kW回旋管系统。", source: survey + "#page=114" }],
  },
  "TJ-II": {
    construction: "1991–1997建设",
    operation: "1997起 · 实验运行",
    historySource: "https://www.fusion.ciemat.es/inicio/tj-ii/construccion-de-tj-ii/",
    power: [{ label: "电子回旋加热 · 官网概览", mw: 0.6, detail: "CIEMAT概览的600 kW注入功率；另有NBI，未将它作为加热总和。", source: "https://www.fusion.ciemat.es/inicio/tj-ii/" }],
  },
  "Wendelstein 7-AS": {
    operation: "1988–2002 · 已结束运行",
    historySource: "https://www.ipp.mpg.de/2502364/w7as",
    power: [{ label: "等离子体加热 · 官方历史概览", mw: 5.6, detail: "采用IPP历史装置参数页口径。", source: "https://www.ipp.mpg.de/2502364/w7as" }],
  },
  "Heliotron J": {
    construction: "2000完成设计制造",
    operation: "2000起 · 实验装置阶段",
    historySource: survey + "#page=107",
    power: [{ label: "电子回旋加热 · 官网配置", mw: 0.4, detail: "官网70 GHz ECH功率；另列两套NBI与ICRF，不把单个系统写成总功率。", source: "https://heliotronj.iae.kyoto-u.ac.jp/en/equipment.html" }],
  },
};

export function formatDevicePower(mw: number) {
  return `${(mw >= 1 ? mw : mw * 1000).toLocaleString("zh-CN", { maximumFractionDigits: 3 })} ${mw >= 1 ? "MW" : "kW"}`;
}
