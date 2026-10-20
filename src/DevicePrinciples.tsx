export default function DevicePrinciples() {
  return (
    <section className="lab-card device-principles">
      <h2>托卡马克与仿星器：差别不只是甜甜圈的形状</h2>
      <p>
        <strong>共同目标：</strong>
        用有旋转变换的磁场形成约束磁面。纯环向场里的曲率和 ∇B
        漂移可能造成电荷分离；两种装置都利用螺旋磁场，使粒子经历磁面的不同方位，减少径向漂移的长期积累。托卡马克也能实现漂移平均，并非只有仿星器会“抵消”。
      </p>
      <div className="classification-scroll">
        <table className="device-table">
          <thead>
            <tr>
              <th>比较项</th>
              <th>托卡马克</th>
              <th>仿星器</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td>旋转变换来源</td>
              <td>
                外部线圈主要提供环向场；大环向等离子体电流主要提供极向场。
              </td>
              <td>
                外部三维线圈可直接产生旋转变换，不依赖大的净环向等离子体电流。
              </td>
            </tr>
            <tr>
              <td>为什么选择这种路线？</td>
              <td>
                轴对称有利于轨道约束，但需维持电流；变压器感应驱动有脉冲限制，可用非感应驱动追求稳态。
              </td>
              <td>
                减轻对感应电流驱动的依赖，具有稳态运行潜力，并减少与大电流相关的破裂风险；不代表没有电流或不稳定性。
              </td>
            </tr>
            <tr>
              <td>到底优化什么漂移？</td>
              <td>
                轴对称与旋转变换有助于约束轨道，仍有香蕉轨道宽度、新古典及湍流输运。
              </td>
              <td>
                三维场未经优化可能增加被俘获粒子的径向漂移；准对称、准等动力学等优化追求较小的轨道/反弹平均径向漂移与新古典损失。
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        <strong>“抵消”的准确含义：</strong>优化目标是 ⟨v漂移 · ∇ψ⟩轨道/反弹
        尽量接近零，而不是让局部上下漂移、∇B 漂移、曲率漂移或 E×B
        漂移全部消失。空间扭转本身不能保证这一点，也不能保证消除湍流。代价是三维线圈、装配与维护更复杂。
      </p>
      <p>
        下方若采用不同显示倍率，只是帮助看见偏移；同一参考漂移的并排动画不能证明哪种装置约束更好。
      </p>
      <a
        href="https://www.ipp.mpg.de/14779/stellarator"
        target="_blank"
        rel="noreferrer"
      >
        IPP · 仿星器原理 ↗
      </a>
      {" · "}
      <a
        href="https://www.ipp.mpg.de/1528710/READYTOPRINTFacilities080507screen_colour_1.pdf"
        target="_blank"
        rel="noreferrer"
      >
        IPP · 三维位形与漂移优化 ↗
      </a>
    </section>
  );
}
