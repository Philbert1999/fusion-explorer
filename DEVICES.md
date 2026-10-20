# 扩展装置目录与仿星器教学约定

核查日期：2026-10-19。目录共 28 台：22 台托卡马克、6 台仿星器/螺旋装置。不是全球完整目录；不把网页中的运行状态或早期设计承诺当作当前已实现性能。

原七台 EAST、ITER、SPARC、JET、ASDEX Upgrade、KSTAR、JT-60SA 沿用 [SOURCES.md](SOURCES.md)。新增 DIII-D、TCV、NSTX、MAST Upgrade、WEST、Alcator C-Mod、COMPASS、DTT、TFTR、J-TEXT、HL-2A、T-15MD、GOLEM、ST40、SMART。每条的公开原始链接、资料版本、地区、参考尺寸和选取理由在 [src/devices.ts](src/devices.ts) 与页面展开表格中维护。

## 仿星器/螺旋装置

| 装置 | R₀ / m | 参考 a / m | 场周期 | 尺寸来源 |
|---|---:|---:|---:|---|
| Wendelstein 7-X | 5.5 | 0.53 | 5 | [IPP 概览](https://www.ipp.mpg.de/16931/einfuehrung) |
| LHD | 3.9 | 0.6 | 10 | [NIFS 概览](https://www-lhd.nifs.ac.jp/pub/LHD_Project_en.html) |
| HSX | 1.2 | 0.12 | 4 | [HSX 实验论文](https://doi.org/10.1088/1361-6587/adbc1f) |
| TJ-II | 1.5 | 0.22 上限参考 | 4 | [CIEMAT 概览](https://sites.fusion.ciemat.es/jlvelasco/research-areas/exploitation-of-tj-ii/) |
| Wendelstein 7-AS | 2 | 0.2 | 5 | [IPP 历史装置](https://www.ipp.mpg.de/2665443/w7as) |
| Heliotron J | 1.2 | 0.15 选取值 | 4 | [京都大学规格](https://heliotronj.iae.kyoto-u.ac.jp/en/equipment.html) |

场周期的附加来源在数据的 `periodSource` 字段中。Heliotron J 的公开 a 范围为 0.1–0.2 m，TJ-II 的 a 是上限参考，LHD 的 R 可随磁轴位置调整。W7-X 此处采用 0.53 m 的官网版本，未混用另一手册的 0.52 m。仿星器的 a 常是平均或有效半径，不能当成每个环向位置的水平半径。

## 几何与尺寸

仿星器在装置对比中始终显示通用三维扭转示意，不再提供圆环模式开关。2(R₀+a) 是参考尺寸指标，不能当作真实三维最大外径或工程尺寸。

三维形状示意使用通用参数化：r=aρ，N=Nfp，u=√1.7 r cosθ，v=r sinθ/√1.7，β=Nφ；截面旋转并叠加振幅 0.12a 的中心线起伏。所有这些幅度都是教学选择，与真实装置边界无关。截面椭圆面积为 πr²；场周期数只控制几何重复，并不决定 ι，也不是 MHD 模数。

在圆柱半径保持正值时，各 φ 截面无自交。网格接缝与取景包络有自动化测试。所有模型只平移排布，不单独归一化缩放；比较页不修改原磁力线的 q。

新增托卡马克未获得同一工况的 κ、δ 时，明确采用教学截面，不把最大整形能力当作实测形状。球形托卡马克的 κ=2 等数值也是教学选择，详见每行备注。资料给范围时注明选取值；GOLEM 使用限制器半径，TFTR 使用引用的历史放电，DTT/SMART 保留设计版本身份。

## 仿星器原理页

不能说仿星器将所有竖直漂移消除。托卡马克与仿星器都需要旋转变换；后者能主要由外部三维线圈提供，从而减少对大环向等离子体电流的依赖，具有稳态优势。托卡马克也能通过非感应电流驱动追求稳态。三维场还提供约束优化自由度，同时增加线圈、维护和偏滤器的复杂性。

第一层示意取圆截面 θ=π/2+2πt/T，固定向上的单位漂移在外法向上的投影为 cos(2πt/T)。有旋转变换时归一化位移为 sin(2πt/T)/(2π)；关闭绕转时取固定方位，位移为 t/T。该匀速绕转与漂移投影仅解释通行/平均的直觉，不是导引中心轨道解。

被俘获粒子的实际优化目标涉及反弹平均的径向漂移 ⟨v_d·∇ψ⟩。准对称性和准等动力学是不同优化路线，不能由扭曲表面直接推导性能。W7-X 面向准等动力学，HSX 研究准螺旋对称。

第二层图线人为添加 b·t/T，演示零平均与有残余平均的区别。b 是示意控制量，未从上方三维形状、线圈或磁场求得。不同按钮不对应任何真实装置的损失率。没有碰撞、镜反射轨道、VMEC 或 EFIT 的计算，不能宣称性能更优或精确抵消。

科学来源：[IPP 仿星器原理](https://www.ipp.mpg.de/14779/stellarator)、[IPP W7-X 优化路线与设计要求](https://www.ipp.mpg.de/1528710/READYTOPRINTFacilities080507screen_colour_1.pdf)、[PPPL 粒子漂移与仿星器优化](https://www.pppl.gov/news/2023/scientists-discover-shortcut-aids-design-twisty-fusion-facilities)、[HSX 准螺旋对称几何的原始研究](https://hsx.wisc.edu/wp-content/uploads/sites/747/2016/04/Simulations-of-edge-configurations-in-quasi-helically-symmetric-geometry-using-EMC3%E2%80%93EIRENE.pdf)。

几何入口为 `stellaratorPoint`，设备数据入口为 `devices`，从 `src/api.ts` 导出。接真实平衡时需使用公开 Fourier 边界及 B 场数据，并验证轨道与守恒；当前通用曲面不能替代该步骤。
