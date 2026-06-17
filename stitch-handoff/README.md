# SurveyMoney STITCH Handoff

这是给 STITCH 重新优化 SurveyMoney H5 全部 UI 的交接包。

## 先看这个

1. `STITCH_BRIEF.md`
   - 完整设计需求
   - 页面范围
   - 业务规则
   - 已发现的旧 UI 问题
   - 交付物要求

2. `RESOURCE_MANIFEST.md`
   - 资源文件说明
   - 每张旧 UI 图对应哪个页面

3. `resources`
   - 原始需求文档
   - 旧 UI 参考图

## 当前项目位置

当前 H5 实现位置：

`F:\CODEX\SurveyMoney`

关键文件：

- `index.html`
- `styles.css`
- `app.js`
- `monetization-config.json`
- `docs\i18n-copy.md`

## 设计重点

这次不是简单复刻旧图，而是重新优化整套移动端 UI。请重点解决：

- 去掉截图中的浏览器和手机系统 UI
- 小屏手机上答题页按钮不可见
- 首页顶部和提现进度区域过高
- 顶部返回、标题、奖励 badge 对齐不统一
- 卡片右侧进度环和按钮拥挤
- 奖励 badge、Start 按钮、插屏标题区域不够精致

业务金额、任务数量、提现门槛、转盘奖项和流程请保持不变。
