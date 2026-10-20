export const extraLessons = {
  elm: {
    name: "边缘局域模 · ELM",
    watch: "看边缘丝状结构周期性向外鼓出；延长演化时长可看到后续爆发。",
    principle:
      "ELM 是 H 模边缘输运垒的爆发性弛豫事件。常见 I 型 ELM 与边缘压力梯度和电流驱动的 peeling–ballooning 不稳定性有关；不同 ELM 类型不能一概而论。爆发可向偏滤器输送粒子与热。",
    formula: "规定周期：边缘积累 → 丝状爆发 → 回落恢复",
    limit: "丝状形变与周期均预设，未计算热负荷、剥离模阈值或完整 ELM 循环。",
    url: "https://www.iter.org/node/20687/progress-elm-physics-and-elm-control",
    source: "ITER · ELM 物理与控制",
  },
  sawtooth: {
    name: "锯齿振荡 · Sawtooth",
    watch: "看较内侧的芯部小磁面缓慢偏移、快速回落，再开始下一周期。",
    principle:
      "锯齿是芯部剖面缓慢建立与快速塌缩的弛豫现象，常与 q=1 附近的 m/n=1/1 内扭曲及磁重联有关。快速塌缩可重分布芯部热量与电流。",
    formula: "规定周期：缓慢建立 → 快速塌缩；常涉及 q≈1",
    limit: "仅示意芯部位移周期，不计算温度剖面、q 剖面、重联或真实塌缩时间。",
    url: "https://m3dc1.pppl.gov/m3dc1_overview.html",
    source: "PPPL · 锯齿、ELM 与 RWM 模拟说明",
  },
  rwm: {
    name: "电阻壁模 · RWM",
    watch: "看整体扭曲样形变逐渐增大；灰色外圈仅标出导电壁参考位置。",
    principle:
      "某些外扭曲模可被理想导电壁稳定，但壁的有限电阻让稳定作用随磁扰动穿透而减弱，形成更慢的电阻壁模。旋转、反馈与动理学阻尼可影响其稳定性。",
    formula: "典型关联时间尺度：壁磁场穿透时间 τw",
    limit: "增长幅度人为规定；未解壁电流，外圈不代表工程真空室或真实稳定边界。",
    url: "https://m3dc1.pppl.gov/m3dc1_overview.html",
    source: "PPPL · 有限电阻壁与外扭曲模",
  },
};
export function relaxation(t: number) {
  const phase = t - Math.floor(t);
  return phase < 0.8 ? phase / 0.8 : (1 - phase) / 0.2;
}
