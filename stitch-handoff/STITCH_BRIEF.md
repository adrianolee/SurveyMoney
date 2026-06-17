# SurveyMoney H5 UI 全量优化需求给 STITCH

## 目标

请基于资源目录里的需求文档、现有 UI 图和当前实现，重新优化 SurveyMoney H5 的完整移动端 UI。核心不是改业务逻辑，而是提升整体视觉品质、布局一致性、小屏适配、控件可读性和页面完成度。

SurveyMoney 是一个移动端 H5 奖励调查产品，用户通过答题、抽奖和提现获得现金奖励。整体风格可以保留热带海岛、现金奖励、绿色/青色/紫色/橙色的轻游戏感，但需要更精致、更统一、更像真实可上线的 H5 产品。

## 非常重要的设计约束

1. 不要把手机状态栏、浏览器地址栏、浏览器底部导航栏画进 UI。那些只是截图示例，不属于产品页面。
2. 所有页面按移动端 H5 设计，主目标宽度是 360px、375px、390px、414px、430px。
3. PC 打开时页面居中展示，最大内容宽度建议 430px 到 480px。
4. 答题页要优先保证底部 Next Question / Continue 按钮在小屏手机上可见或接近可见。不要让顶部 banner、卡片、题目区域过高。
5. 首页顶部和 Cashout Progress 区域不要太大，否则下面的任务卡片会被挤掉。
6. 所有返回按钮、页面标题、右侧奖励 badge 必须在同一水平视觉线上，不能上下错位。
7. 按钮、进度环、奖励 badge 内文字不能拥挤、换行或贴边。
8. 保持可点击区域足够大，但不要用过大的内边距堆高页面。
9. 可以优化插画、背景、卡片、按钮、进度条，但不要改变金额、任务数量、提现门槛、流程规则。
10. 英文 copy 先保留，后续会做多语言。当前多语言文案参考 `..\docs\i18n-copy.md`。

## 页面范围

请覆盖以下全部页面和弹窗：

1. 首页 Home
   - 品牌头部
   - 余额 pill
   - Cashout Progress
   - Quick Survey 卡片
   - Premium Survey 卡片
   - Lucky Spin 卡片

2. 新手礼包弹窗 Welcome Bonus
   - 金额 `$18.88`
   - Claim Now

3. Quick Survey 答题页
   - 5 题一轮
   - 单选题
   - 奖励 `+$0.20`
   - Continue 按钮

4. Quick Survey 完成奖励页
   - Quick Survey Completed
   - `+$1.00`
   - Continue

5. Premium Survey 单选题页
   - 10 题一组
   - 奖励 badge `+$6.00 per set`
   - Next Question

6. Premium Survey 多选题页
   - 多选选中态
   - Next Question

7. Premium Survey 排序题页
   - 拖拽排序列表
   - 排名数字
   - 拖拽把手
   - Next Question

8. Premium Survey 问答题页
   - 文本输入框
   - 至少 30 字
   - 字数统计
   - Next Question

9. Premium Survey 完成奖励页
   - Premium Survey Completed
   - `+$6.00`
   - Continue

10. Lucky Spin 页面
   - Available Spins
   - 转盘
   - Spin Now
   - 提示：Bonus rewards are not counted toward cashout progress.

11. Lucky Spin 现金中奖弹窗
   - You Won!
   - 现金金额，如 `$0.03 Bonus`
   - OK

12. Lucky Spin 额外次数弹窗
   - Extra Spin!
   - `+1`
   - You got an extra spin!
   - OK

13. Withdraw 页面
   - Available Balance
   - Minimum Withdrawal `$100.00`
   - Enter Amount
   - PayPal method
   - PayPal Email
   - Submit Withdrawal
   - Withdrawal Rules

14. Withdrawal Submitted 成功弹窗
   - Withdrawal Submitted!
   - Your withdrawal request has been submitted.
   - OK

15. 变现插屏 H5 容器
   - iframe 内容来自配置 URL
   - 当前 URL：`https://cart.minigame.vip/game/`
   - 顶部标题：`Earn more cash by playing games`
   - 右侧关闭按钮：`X`
   - 需要比当前更精致，标题区域不要像纯文本贴在白条上

## 当前业务规则

1. Welcome Bonus
   - 新用户礼包 `$18.88`
   - 点击 Claim Now 后加入余额

2. Cashout
   - 提现门槛 `$100.00`
   - 支付方式 PayPal only
   - 未达到门槛时仍展示提现入口，但页面需说明规则

3. Quick Survey
   - 总计 100 道简单题
   - 每轮 5 题
   - 每题 `$0.20`
   - 一轮完成奖励页显示 `+$1.00`
   - 每完成一轮后先出现变现插屏，再进入完成奖励页

4. Premium Survey
   - 总计 100 道复杂题
   - 每组 10 题
   - 每组 `$6.00`
   - 包含单选、多选、排序、问答
   - 每完成一组后先出现变现插屏，再进入完成奖励页

5. Lucky Spin
   - 转盘奖项：`$0.01`、`$0.02`、`$0.03`、`$0.05`、`$0.10`、`Bonus`、`Extra Spin`、`Try Again`
   - 抽中奖项必须和指针结果一致
   - Bonus rewards 不计入提现进度
   - Extra Spin 增加一次抽奖机会

## 已发现的旧 UI 问题

请重点避免这些问题：

1. 旧截图把浏览器地址栏、手机状态栏画进页面，需要彻底去掉。
2. 页面顶部返回按钮、标题、奖励 badge 没有对齐。
3. 答题页顶部区域太大，小手机上底部按钮看不到。
4. 首页 Cashout Progress 太高，任务入口被挤到下面。
5. 首页任务卡片右侧进度环和 Start 按钮太挤。
6. Premium Survey 右上角紫色奖励 badge 字和外框间距太小。
7. Start 按钮里的箭头曾经被挤到下一行，需要避免。
8. 变现插屏顶部标题区域太朴素，需要更像正式产品的 sponsored / rewarded games 入口。
9. 转盘结果弹窗要和实际奖项一致，不要出现视觉和逻辑不对应。

## 视觉方向建议

可以保留：

- 热带海岛背景
- 绿色/青色代表现金和 Quick Survey
- 紫色代表 Premium Survey
- 橙色代表 Lucky Spin
- 白色半透明卡片、柔和阴影、金币/钱包/钻石/转盘插画

需要优化：

- 页面层级更清晰，不要所有元素都很重
- 卡片和按钮尺寸更克制
- 标题字号按场景区分，不要在小卡片里用过大的 hero 字
- 背景装饰减少干扰，尤其答题页边缘植物不要挤压内容
- 文本和按钮必须在 360px 宽度下不溢出
- 组件状态统一：默认、选中、禁用、完成、弹窗

## 交付物要求

请输出：

1. 全部页面的移动端设计稿，不包含浏览器和手机系统 UI。
2. 360px、390px、430px 宽度下的关键页面适配说明，尤其首页、Quick 答题、Premium 答题、Withdraw。
3. 设计 tokens：
   - 主色、辅助色、警示/强调色
   - 字体层级
   - 间距规则
   - 圆角
   - 阴影
4. 组件规范：
   - 顶部导航
   - 余额 pill
   - 任务卡片
   - Cashout 进度卡
   - 答题选项
   - 多选框/单选框
   - 排序行
   - 文本输入框
   - 主按钮
   - 进度条
   - 进度环
   - 弹窗
   - 插屏 H5 容器
   - Lucky Spin 转盘和结果弹窗
5. 如果设计中使用了非 CSS 可实现的插画或图形，请单独导出图片资源。
6. 给开发的切图或标注中请明确尺寸、间距、字体大小和颜色。

## 可直接给 STITCH 的一句话任务

请基于 `resources` 目录里的 SurveyMoney 需求文档和旧 UI 图，重新设计一套更精致、紧凑、移动端适配更好的 SurveyMoney H5 全流程 UI。不要包含手机状态栏、浏览器地址栏或浏览器底部栏。保留现有业务流程、金额和页面结构，重点解决小屏按钮不可见、顶部对齐不一致、卡片拥挤、奖励 badge 过窄、插屏标题粗糙等问题，并输出完整页面稿、组件规范、设计 tokens 和必要图片资源。
