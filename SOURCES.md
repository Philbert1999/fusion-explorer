# 参数来源与定义

核查日期：2026-10-19。配置文件：`src/presets.ts`。所有预设的 ρ=0.8 为教学选择；对内层截面使用同一 κ、δ 的等比例延拓，不暗示真实磁面剖面。

| 预设 | R₀ / m | a / m | κ | δ | 来源与定义 |
|---|---:|---:|---:|---:|---|
| 教学模型 | 3 | 1 | 1 | 0 | 自选同心圆截面 |
| EAST | 1.85 | 0.45 | 1.7（教学） | 0.3（教学） | [2025 IAEA EAST overview](https://conferences.iaea.org/event/392/papers/35587/files/13985-EAST%20Oveview_2025IAEAManus_XG_v3.pdf)，1066 s 工况中给出的 R、a；κ、δ 不声称为该工况测量值 |
| ITER | 6.2 | 2 | 1.7 | 0.33（教学） | [Engineering Basis Handbook, Vol.1 Ch.7.1](https://www.iter.org/sites/default/files/media/2026-04/vol.1_ch.07.1_design_evolution_and_techn_dv55d4_v2_0.pdf) 的等离子体尺寸与高度宽度比；未导入真实分离面 |
| SPARC | 1.85 | 0.57 | 1.97 | 0.54 | [2020 SPARC V2 nominal DT H-mode, Table 1](https://library.psfc.mit.edu/catalog/reports/2020/20ja/20ja016/20ja016_full.pdf)，κ、δ 在分离面处定义 |

装置类别与地域：EAST，中国全超导实验托卡马克；ITER，法国的国际合作实验堆；SPARC，美国高场托卡马克设计。状态说明按引文年代理解，不将设计参数与当前运行结果混用。

三角形变在本模型中的约定为 α=asin(δ)，使顶部 R=R₀−δr。不同文献的上/下三角形变、磁面选择和拉长比定义可能不同，预设并非等价的工程 CAD 对比。SPARC 的分离面形状参数映射成光滑 Miller-like 曲面，不保留 X 点。EAST、ITER 中明确注明的教学值不能当作装置测量参数引用。

切换预设只改变几何，不推断 q；真实 q 剖面需要平衡或电流分布数据。参数调整后仍显示原预设来源供参考，实际滑块值可能已偏离预设；点击恢复按钮可回到该预设。

## 新增代表性装置（2026-10-19）

| 装置 | R₀ / m | a / m | κ | δ | 来源与采用范围 |
|---|---:|---:|---:|---:|---|
| JET | 2.96 | 1.25 | 1.68（由 b/a 算出） | 0.3（教学） | [1987 原始设计论文](https://doi.org/10.13182/FST87-A24999)，b=2.10 m；历史设计，不代表最终 D-T 放电 |
| ASDEX Upgrade | 1.6 | 0.5 | 1.6（由 b/a 算出） | 0.3（教学） | [IPP 官方概览](https://www.ipp.mpg.de/16208/einfuehrung)，水平/垂直小半径为 0.5/0.8 m；保留官网取整精度，不混用论文常见 R₀=1.65 m |
| KSTAR | 1.8 | 0.5 | 1.8（教学） | 0.3（教学） | [KFE 官方 KSTAR–ITER 规格表](https://jobs.iterkorea.org/menu.es?mid=a10201040000)；该表未给出可对应同一工况的 κ、δ，因此使用明确标注的教学值 |
| JT-60SA | 2.96 | 1.18 | 1.93 | 0.5 | [QST 官方装置介绍](https://www.qst.go.jp/uploaded/attachment/50261.pdf)，同一标称配置表；不是某次已经实现的放电结果 |

JET 已于 2023 年结束等离子体实验，参见 [UKAEA 的结束实验公告](https://www.gov.uk/government/news/pioneering-jet-delivers-final-plasma)。预设仍以历史设计版本命名，不把其称作当前运行装置。

以上仍统一使用 ρ=0.8 的教学内层磁面与对称光滑曲面映射。上下三角形变不相等、X 点和真实磁轴位移不在此近似内。引用参数不等于复现真实磁平衡；选择任何新预设仍保留当前 q。

## 扩展比较目录与仿星器

新增 21 台比较装置的来源、选取值、范围和教学截面口径，在 `src/devices.ts` 逐条维护并直接显示于比较页来源表。六台仿星器的尺寸、场周期附加来源及原理参考见 [DEVICES.md](DEVICES.md)。原七台预设继续使用本文件前文的口径，不因扩展目录改变。
