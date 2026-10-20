export const microLessons = {
  itg: {
    name: "离子温度梯度模 · ITG",
    watch: "看放大的局部磁通管中冷暖条纹增长并传播；沿场方向较长，横向更细。",
    principle:
      "离子温度梯度提供自由能，磁曲率与粒子响应可使漂移波失稳。非线性饱和后可产生湍流与离子热输运。",
    formula: "示意 δTi/Ti = A(t) cos(k⊥y−ωt)；典型 k⊥ρi ~ O(1)",
    limit:
      "颜色为有符号的离子温度扰动。条纹、增长与尺度均为放大示意，不是回旋动理学解。",
    url: "https://www.ipp.mpg.de/4975338/research_report_349215?c=4831589",
    source: "IPP · ITG 不稳定性与湍流",
  },
  tem: {
    name: "俘获电子模 · TEM",
    watch:
      "看电子密度扰动条纹传播；它与香蕉轨道粒子的俘获有关，但不是单粒子轨道。",
    principle:
      "被磁镜俘获的电子对波的非绝热响应，可使密度梯度或电子温度梯度驱动的模失稳。碰撞、磁几何与参数都会影响稳定性。",
    formula: "示意 δne/ne = A(t) cos(k⊥y−ωt)；常见离子尺度",
    limit:
      "颜色为电子密度扰动。与 ITG 共用示意纹理，传播方向不能单独诊断模类型。",
    url: "https://www.ipp.mpg.de/2816936/pic",
    source: "IPP · ITG / TEM 与回旋动理学",
  },
  etg: {
    name: "电子温度梯度模 · ETG",
    watch: "看更细的电子温度条纹；相同展示窗口中仅作尺度层级提示。",
    principle:
      "电子温度梯度可驱动电子尺度微不稳定性，非线性湍流可贡献电子热输运。真实电子回旋尺度通常远小于离子尺度。",
    formula: "示意 δTe/Te = A(t) cos(k⊥y−ωt)；典型 k⊥ρe ~ O(1)",
    limit:
      "颜色为电子温度扰动。画面没有解析真实 ρe/ρi 比，不能从条纹数反推实验波长。",
    url: "https://pure.mpg.de/view/item_2143192",
    source: "Dimits 等 · ETG / ITG 回旋动理学模拟",
  },
};
export type MicroKind = keyof typeof microLessons;
export function isMicro(kind: string): kind is MicroKind {
  return kind === "itg" || kind === "tem" || kind === "etg";
}
// shortcut: prescribed scalar waves, replace with gyrokinetic eigenmodes for quantitative stability.
export function microSignal(
  kind: MicroKind,
  phi: number,
  theta: number,
  t: number,
) {
  const k = kind === "etg" ? 22 : 10;
  return Math.min(t, 1) * Math.cos(k * (theta - phi / 2) - 2 * Math.PI * t);
}
