// FAQ 数据 - 从 flipflop-ai-support 移植并扩展
// 支持中文、英文、繁体中文

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
}

export interface FAQCategory {
  id: number;
  label: string;
  questions: FAQItem[];
}

// 操作指南 - 中文
const zhOperationGuide: FAQItem[] = [
  {
    id: 'op1',
    question: '如何在 FlipFlop.plus 上发行代币？',
    answer: `在 FlipFlop.plus 上发行代币的步骤：

**1. 访问发行页面**
   前往 https://app.flipflop.plus/launch-token

**2. 填写代币信息**
   - 代币名称
   - 代币符号
   - 上传代币图片
   - 选择版本：标准版或迷因版

**3. 创建代币**
   点击"创建"按钮即可完成发行

💡 **平台使用铸造证明（PoM）机制**，确保公平分配并防止女巫攻击。`
  },
  {
    id: 'op2',
    question: '如何铸造代币？',
    answer: `铸造代币的完整步骤：

**1. 进入发现页面**
   访问 https://app.flipflop.plus/discover

**2. 选择代币**
   浏览并找到你想铸造的代币

**3. 准备 URC（重要）**
   ⚠️ 铸造代币需要 URC（唯一推荐码）
   - URC 必须由其他钱包生成
   - 切换到不同的钱包地址
   - 点击"生成 URC"创建推荐码

**4. 开始铸造**
   - 切换回你的铸造钱包
   - 输入想要铸造的数量
   - 点击铸造按钮

💡 **使用有折扣的 URC 可以享受优惠！**`
  },
  {
    id: 'op3',
    question: '如何生成 URC 推荐码？',
    answer: `生成唯一推荐码（URC）的步骤：

**1. 切换钱包**
   ⚠️ 确保你使用的是不同的钱包地址（不是你的铸造钱包）

**2. 进入 URC 页面**
   在平台中找到 URC 部分

**3. 生成推荐码**
   点击"生成 URC"按钮

**4. 分享推荐码**
   你的唯一推荐码已创建，可以分享给其他想要铸造的人

🎁 **推荐优势**：
- 推荐人在自己的铸造中获得折扣
- 使用你 URC 的用户也能获得折扣
- 帮助防止机器人攻击，确保真实用户

⚠️ **重要提醒**：你不能使用自己生成的 URC 代码进行铸造！`
  },
  {
    id: 'op4',
    question: '如何申请退款？',
    answer: `申请退款的流程：

**1. 进入我的铸造**
   找到"我的铸造"部分

**2. 选择铸造记录**
   找到你想退款的铸造记录

**3. 发起退款**
   点击"退款"按钮

**4. 确认操作**
   按照说明完成退款流程

⚠️ **重要限制**：
- 退款仅在目标里程碑完成前可用
- 一旦达到目标里程碑（总供应量的 25%），将不再可以退款
- 此保护机制确保早期用户的零风险参与`
  }
];

// 核心概念 - 中文
const zhCoreConcepts: FAQItem[] = [
  {
    id: 'cc1',
    question: '什么是铸造证明（PoM）？',
    answer: `**铸造证明** 是 FlipFlop.plus 平台的核心创新机制。

**工作原理**：
- 用户必须持有由其他人生成的唯一推荐码（URC）才能参与铸造
- 这确保每个参与者都有真实的社区关系

**主要优势**：
- 🛡️ 防止女巫攻击和机器人刷量
- 🤝 促进社区增长和真实用户参与
- ⚖️ 确保公平分配，早期参与者获得合理收益

**与传统机制的区别**：
- 不需要质押或锁仓
- 通过社会关系网络验证真实性
- 降低参与门槛，提高去中心化程度`
  },
  {
    id: 'cc2',
    question: '什么是 URC（唯一推荐码）？',
    answer: `**URC (Unique Referral Code)** 是 FlipFlop.plus 的推荐系统核心。

**特点**：
- 🔑 每个推荐码都是独一无二的
- 🔄 由用户生成，供其他用户使用
- 💰 提供铸造折扣激励机制

**使用规则**：
- ✅ 你可以使用他人的 URC 进行铸造（享受折扣）
- ❌ 你不能使用自己生成的 URC 进行铸造
- 🎁 你生成的 URC 被他人使用时，你也会获得奖励

**经济模型**：
- 推荐人和使用者都能获得折扣
- 创造双赢的社区经济生态
- 激励用户邀请真实用户加入`
  },
  {
    id: 'cc3',
    question: '什么是目标里程碑？',
    answer: `**目标里程碑** 是 FlipFlop.plus 代币经济模型中的重要概念。

**定义**：
- 目标里程碑 = 总供应量的 **25%**
- 当代币铸造达到总量的 25% 时，视为完成目标里程碑

**里程碑前**：
- ✅ 用户可以随时申请退款
- ✅ 早期参与零风险
- ✅ 保护机制生效

**里程碑后**：
- ❌ 不再支持退款功能
- 🚀 代币进入完全市场化阶段
- 📈 价格由市场供需决定

**设计目的**：
- 平衡早期用户保护和项目长期发展
- 给早期参与者明确的退出窗口
- 鼓励长期价值投资而非短期投机`
  },
  {
    id: 'cc4',
    question: '标准版和迷因版有什么区别？',
    answer: `**标准版**：
- 📊 包含完整的经济模型参数
- 🎯 适合有长期发展计划的项目
- ⚙️ 可自定义更多配置选项

**迷因版 (Meme)**：
- 🎨 简化的发行流程
- 🚀 快速启动，适合病毒式传播
- 📱 预设优化参数，开箱即用

**选择建议**：
- 如果你是认真做项目 → 选择**标准版**
- 如果是玩梗/测试/快速实验 → 选择**迷因版**

两者都使用相同的 PoM 机制和安全基础设施。`
  },
  {
    id: 'cc5',
    question: '什么是女巫攻击？',
    answer: `**女巫攻击（Sybil Attack）** 是一种通过创建大量虚假身份来操纵系统的攻击方式。

**攻击方式**：
- 攻击者创建成百上千个虚假账户/钱包
- 利用这些账户获取不当利益
- 破坏系统的公平性和去中心化

**在代币铸造中的影响**：
- 单人控制多个钱包进行大量铸造
- 排挤真实用户的参与机会
- 导致代币分配极度不公

**PoM 如何防御**：
- ✅ 要求使用他人生成的 URC 才能铸造
- ✅ 每个钱包只能生成一个 URC
- ✅ 创建虚假账户的成本远高于收益
- ✅ 通过社会关系网络验证身份真实性

这种机制让女巫攻击在经济上变得不可行。`
  },
  {
    id: 'cc6',
    question: '什么是推荐奖励机制？',
    answer: `**推荐奖励机制** 是 FlipFlop.plus 激励社区增长的核心设计。

**双重奖励**：
- 🎁 **推荐人奖励**：你生成的 URC 被他人使用时，你的铸造可享受折扣
- 🎁 **使用者奖励**：使用他人的 URC 铸造时，你也可以享受折扣

**折扣优势**：
- 铸造成本更低
- 推荐越多，累积的折扣机会越多
- 形成正向循环的推荐生态

**与传统推荐的区别**：
- ❌ 传统模式：只有推荐人获利，使用者无优惠
- ✅ FlipFlop.plus：双方都能获得折扣，真正双赢

**防刷机制**：
- 每个钱包只能生成一个 URC
- 不能使用自己生成的 URC
- 确保推荐关系在真实用户之间建立`
  },
  {
    id: 'cc7',
    question: '什么是零风险参与？',
    answer: `**零风险参与** 是 FlipFlop.plus 对早期参与者的创新保护机制。

**核心保障**：
- 🛡️ 在目标里程碑（25%总供应量）完成前
- 🛡️ 用户可以随时申请全额退款
- 🛡️ 无需任何理由，无手续费

**保护意义**：
- ✅ 降低早期参与风险
- ✅ 让用户能够放心尝试新代币
- ✅ 避免因项目发展不如预期而损失资金

**运作机制**：
1. 用户参与铸造代币
2. 代币价格波动或项目进展不如预期
3. 在里程碑前，用户可以点击"退款"按钮
4. 系统退还用户支付的金额

**市场成熟后**：
- 一旦达到目标里程碑
- 退款功能自动关闭
- 代币进入完全市场化阶段
- 价格由市场供需决定

这种设计平衡了早期用户保护和项目的长期发展需求。`
  },
  {
    id: 'cc8',
    question: '什么是公平分配？',
    answer: `**公平分配** 是 FlipFlop.plus 代币发行的核心原则。

**传统问题**：
- 🐋 巨鲸早期扫货，普通用户无机会
- 🤖 机器人脚本抢夺，真实用户被排挤
- 📉 大户控盘，价格被操纵

**FlipFlop.plus 的解决方案**：

**1. 铸造证明（PoM）**
- 限制单账户的参与能力
- 需要真实社交关系才能参与
- 防止机器人批量操作

**2. 推荐机制**
- 每个钱包只能生成一个 URC
- 防止单人创建多个账户
- 确保参与者是真实用户

**3. 里程碑保护**
- 早期用户可随时退出
- 降低参与风险
- 避免被套牢

**分配效果**：
- ✅ 更多真实用户参与
- ✅ 代币分散在更多人手中
- ✅ 去中心化程度更高
- ✅ 价格更健康稳定

公平分配不仅仅是口号，而是通过技术创新实现的目标。`
  },
  {
    id: 'cc9',
    question: '什么是社区共识？',
    answer: `**社区共识** 在 FlipFlop.plus 中扮演着核心角色。

**PoM 与社区共识的关系**：

**1. 通过社会关系验证**
- 用户需要他人的 URC 才能参与
- 建立真实的社区连接
- 形成去中心化的信任网络

**2. 共识驱动增长**
- 每个参与者都有动机邀请真实用户
- 优质项目会自然吸引社区支持
- 社区质量决定项目成功

**3. 经济激励共识**
- 推荐人和使用者都能获益
- 创造双赢的社区经济
- 激励良性发展

**与传统模式的区别**：
- ❌ 传统：依赖算法或质押，社区联系薄弱
- ✅ FlipFlop.plus：依赖真实社会关系，社区紧密

**社区力量的体现**：
- 💪 推荐机制让社区自我扩展
- 💪 早期参与者成为项目推广者
- 💪 去中心化的共识更强大持久

FlipFlop.plus 相信，真正的去中心化始于紧密的社区共识。`
  },
  {
    id: 'cc10',
    question: '什么是代币版本选择？',
    answer: `FlipFlop.plus 提供两种代币发行版本，满足不同需求。

**标准版**

**适合对象**：
- 有长期项目规划的团队
- 需要精细控制经济模型
- 希望自定义更多参数

**特点**：
- 📊 完整的经济模型配置
- ⚙️ 可自定义各项参数
- 🎯 适合正式项目运营
- 📈 支持复杂的经济机制

**迷因版 (Meme)**

**适合对象**：
- 玩梗和测试项目
- 快速实验创意
- 社区驱动的代币

**特点**：
- 🎨 简化的发行流程
- 🚀 一键快速启动
- 📱 预设优化参数
- 🌈 适合病毒式传播

**如何选择**？

| 考虑因素 | 选择标准版 | 选择迷因版 |
|---------|-----------|-----------|
| 项目类型 | 正式商业项目 | 玩梗/测试项目 |
| 长期规划 | 有详细路线图 | 短期娱乐为主 |
| 团队规模 | 专业团队 | 个人或小团队 |
| 定制需求 | 需要精细控制 | 快速启动即可 |

无论选择哪个版本，都享受相同的 PoM 安全机制和公平分配保障。`
  }
];

// 英文数据
const enOperationGuide: FAQItem[] = [
  {
    id: 'op1',
    question: 'How to issue tokens on FlipFlop.plus?',
    answer: `To issue tokens on FlipFlop.plus:

**1. Visit Launch Page**
   Go to https://app.flipflop.plus/launch-token

**2. Fill Token Information**
   - Token name
   - Token symbol
   - Upload token image
   - Choose version: Standard or Meme

**3. Create Token**
   Click "Create" to launch your token

💡 The platform uses **Proof of Mint (PoM)** mechanism to ensure fair distribution and prevent Sybil attacks.`
  },
  {
    id: 'op2',
    question: 'How to mint tokens?',
    answer: `Steps to mint tokens:

**1. Go to Discover Page**
   Visit https://app.flipflop.plus/discover

**2. Select Token**
   Find and browse the token you want to mint

**3. Prepare URC (Important)**
   ⚠️ You need a URC (Unique Referral Code) to mint
   - URC must be generated from another wallet
   - Switch to a different wallet address
   - Click "Generate URC" to create a referral code

**4. Start Minting**
   - Switch back to your minting wallet
   - Enter the amount you want to mint
   - Click the mint button

💡 Use a URC with discount for better rates!`
  },
  {
    id: 'op3',
    question: 'How to generate a URC code?',
    answer: `To generate a Unique Referral Code (URC):

**1. Switch Wallet**
   ⚠️ Make sure you're using a different wallet address (not your minting wallet)

**2. Go to URC Section**
   Find the URC section on the platform

**3. Generate Code**
   Click "Generate URC"

**4. Share Your Code**
   Your unique referral code is created and ready to share

🎁 **Benefits**:
- Referrers earn discounts on their own minting
- Users using your URC get discounts too
- Helps prevent bot attacks and ensures real users

⚠️ **Remember**: You cannot use your own URC code for minting!`
  },
  {
    id: 'op4',
    question: 'How to request a refund?',
    answer: `To request a refund:

**1. Go to My Minting**
   Find the "My Minting" section

**2. Select Minting Record**
   Find the minting record you want to refund

**3. Initiate Refund**
   Click the "Refund" button

**4. Confirm Operation**
   Follow the instructions to complete the refund

⚠️ **Important Limitation**:
- Refunds are only available BEFORE the target milestone is completed
- Once the target milestone (25% of total supply) is reached, refunds are no longer possible
- This protection mechanism ensures zero-risk participation for early users`
  }
];

const enCoreConcepts: FAQItem[] = [
  {
    id: 'cc1',
    question: 'What is Proof of Mint (PoM)?',
    answer: `**Proof of Mint** is FlipFlop.plus's core innovation mechanism.

**How It Works**:
- Users must hold a Unique Referral Code (URC) generated by others to participate
- Ensures every participant has a real community connection

**Key Benefits**:
- 🛡️ Prevents Sybil attacks and bot manipulation
- 🤝 Encourages community growth and real user participation
- ⚖️ Ensures fair distribution with reasonable returns for early participants

**Difference from Traditional Models**:
- No staking or locking required
- Authenticity verified through social relationships
- Lower barrier to entry with higher decentralization`
  },
  {
    id: 'cc2',
    question: 'What is URC?',
    answer: `**URC (Unique Referral Code)** is the core of FlipFlop.plus's referral system.

**Features**:
- 🔑 Each referral code is unique
- 🔄 Generated by users for others to use
- 💰 Provides minting discount incentives

**Usage Rules**:
- ✅ You can use others' URC to mint (get discount)
- ❌ You cannot use your own generated URC
- 🎁 You get rewards when others use your URC

**Economic Model**:
- Both referrer and user get discounts
- Creates win-win community economics
- Incentivizes users to invite real users`
  },
  {
    id: 'cc3',
    question: 'What is the target milestone?',
    answer: `**Target Milestone** is a key concept in FlipFlop.plus token economics.

**Definition**:
- Target milestone = **25%** of total supply
- When token minting reaches 25% of total supply, target milestone is completed

**Before Milestone**:
- ✅ Users can request refund anytime
- ✅ Zero-risk for early participants
- ✅ Protection mechanism active

**After Milestone**:
- ❌ Refund feature no longer available
- 🚀 Token enters full market phase
- 📈 Price determined by market supply and demand

**Design Purpose**:
- Balance early user protection with long-term project development
- Clear exit window for early participants
- Encourage long-term value investment over short-term speculation`
  },
  {
    id: 'cc4',
    question: 'What is the difference between Standard and Meme version?',
    answer: `**Standard Version**:
- 📊 Complete economic model parameters
- 🎯 Suitable for projects with long-term development plans
- ⚙️ More customizable configuration options

**Meme Version**:
- 🎨 Simplified issuance process
- 🚀 Quick launch for viral potential
- 📱 Pre-optimized parameters, ready to use

**Selection Advice**:
- If you're building a serious project → Choose **Standard**
- If it's for memes/testing/quick experiments → Choose **Meme**

Both use the same PoM mechanism and security infrastructure.`
  },
  {
    id: 'cc5',
    question: 'What is a Sybil Attack?',
    answer: `**Sybil Attack** is an attack method that manipulates systems by creating numerous fake identities.

**Attack Method**:
- Attackers create hundreds or thousands of fake accounts/wallets
- Use these accounts to gain unfair advantages
- Undermine system fairness and decentralization

**Impact on Token Minting**:
- Single person controls multiple wallets for massive minting
- Crowds out genuine user participation
- Leads to extremely unfair token distribution

**How PoM Defends Against It**:
- ✅ Requires URC generated by others to mint
- ✅ Each wallet can only generate one URC
- ✅ Cost of creating fake accounts far exceeds benefits
- ✅ Verifies identity authenticity through social relationship networks

This mechanism makes Sybil attacks economically infeasible.`
  },
  {
    id: 'cc6',
    question: 'What is the Referral Reward Mechanism?',
    answer: `**Referral Reward Mechanism** is the core design that incentivizes FlipFlop.plus community growth.

**Dual Rewards**:
- 🎁 **Referrer Reward**: When your URC is used by others, you get discounts on your minting
- 🎁 **User Reward**: When you use someone's URC to mint, you also get discounts

**Discount Benefits**:
- Lower minting costs
- More recommendations lead to more discount opportunities
- Creates a positive referral ecosystem loop

**Difference from Traditional Referrals**:
- ❌ Traditional: Only referrer profits, user gets no discount
- ✅ FlipFlop.plus: Both parties get discounts, truly win-win

**Anti-Manipulation**:
- Each wallet can only generate one URC
- Cannot use your own generated URC
- Ensures referrals are established between real users`
  },
  {
    id: 'cc7',
    question: 'What is Zero-Risk Participation?',
    answer: `**Zero-Risk Participation** is FlipFlop.plus's innovative protection mechanism for early participants.

**Core Protection**:
- 🛡️ Before the target milestone (25% of total supply) is reached
- 🛡️ Users can request full refunds anytime
- 🛡️ No reasons needed, no handling fees

**Protection Significance**:
- ✅ Reduces early participation risk
- ✅ Allows users to confidently try new tokens
- ✅ Avoids losses if project development falls short of expectations

**How It Works**:
1. User participates in token minting
2. Token price fluctuates or project doesn't meet expectations
3. Before the milestone, user can click "Refund" button
4. System refunds the amount paid by the user

**After Market Maturity**:
- Once target milestone is reached
- Refund feature automatically closes
- Token enters full market phase
- Price determined by market supply and demand

This design balances early user protection with long-term project development needs.`
  },
  {
    id: 'cc8',
    question: 'What is Fair Distribution?',
    answer: `**Fair Distribution** is the core principle of FlipFlop.plus token issuance.

**Traditional Problems**:
- 🐋 Whales buy early, ordinary users have no chance
- 🤖 Bot scripts snatch tokens, real users get crowded out
- 📉 Big players control the market, prices are manipulated

**FlipFlop.plus Solutions**:

**1. Proof of Mint (PoM)**
- Limits single account participation capacity
- Requires real social relationships to participate
- Prevents bot batch operations

**2. Referral Mechanism**
- Each wallet can only generate one URC
- Prevents single person from creating multiple accounts
- Ensures participants are real users

**3. Milestone Protection**
- Early users can exit anytime
- Reduces participation risk
- Avoids being trapped

**Distribution Results**:
- ✅ More real user participation
- ✅ Tokens distributed among more people
- ✅ Higher degree of decentralization
- ✅ Healthier and more stable prices

Fair distribution is not just a slogan, but a goal achieved through technological innovation.`
  },
  {
    id: 'cc9',
    question: 'What is Community Consensus?',
    answer: `**Community Consensus** plays a central role in FlipFlop.plus.

**PoM and Community Consensus Relationship**:

**1. Verification Through Social Relationships**
- Users need others' URC to participate
- Establishes real community connections
- Forms a decentralized trust network

**2. Consensus-Driven Growth**
- Every participant has incentive to invite real users
- Quality projects naturally attract community support
- Community quality determines project success

**3. Economic Incentive Consensus**
- Both referrers and users benefit
- Creates win-win community economics
- Incentivizes healthy development

**Difference from Traditional Models**:
- ❌ Traditional: Relies on algorithms or staking, weak community ties
- ✅ FlipFlop.plus: Relies on real social relationships, tight community

**Manifestation of Community Power**:
- 💪 Referral mechanism lets community self-expand
- 💪 Early participants become project promoters
- 💪 Decentralized consensus is stronger and more lasting

FlipFlop.plus believes that true decentralization begins with tight community consensus.`
  },
  {
    id: 'cc10',
    question: 'What is Token Version Selection?',
    answer: `FlipFlop.plus offers two token issuance versions to meet different needs.

**Standard Version**

**Suitable For**:
- Teams with long-term project plans
- Need precise control over economic models
- Want to customize more parameters

**Features**:
- 📊 Complete economic model configuration
- ⚙️ Customizable various parameters
- 🎯 Suitable for formal project operations
- 📈 Supports complex economic mechanisms

**Meme Version**

**Suitable For**:
- Meme and testing projects
- Quick experiment with ideas
- Community-driven tokens

**Features**:
- 🎨 Simplified issuance process
- 🚀 One-click quick launch
- 📱 Pre-optimized parameters
- 🌈 Suitable for viral spread

**How to Choose?**

| Consideration | Choose Standard | Choose Meme |
|--------------|----------------|-------------|
| Project Type | Formal business project | Meme/testing project |
| Long-term Plan | Have detailed roadmap | Short-term entertainment |
| Team Size | Professional team | Individual or small team |
| Customization Need | Need precise control | Quick launch is enough |

Regardless of which version you choose, both enjoy the same PoM security mechanism and fair distribution guarantees.`
  }
];

// 繁体中文数据
const hkOperationGuide: FAQItem[] = [
  {
    id: 'op1',
    question: '如何在 FlipFlop.plus 上發行代幣？',
    answer: `在 FlipFlop.plus 上發行代幣嘅步驟：

**1. 訪問發行頁面**
   前往 https://app.flipflop.plus/launch-token

**2. 填寫代幣資訊**
   - 代幣名稱
   - 代幣符號
   - 上傳代幣圖片
   - 選擇版本：標準版或迷因版

**3. 創建代幣**
   點擊"創建"按鈕即可完成發行

💡 **平台使用鑄造證明（PoM）機制**，確保公平分配並防止女巫攻擊。`
  },
  {
    id: 'op2',
    question: '如何鑄造代幣？',
    answer: `鑄造代幣嘅完整步驟：

**1. 進入發現頁面**
   訪問 https://app.flipflop.plus/discover

**2. 選擇代幣**
   瀏覽並找到你想鑄造嘅代幣

**3. 準備 URC（重要）**
   ⚠️ 鑽造代幣需要 URC（唯一推薦碼）
   - URC 必須由其他錢包生成
   - 切換到不同嘅錢包地址
   - 點擊"生成 URC"創建推薦碼

**4. 開始鑄造**
   - 切換返你嘅鑄造錢包
   - 輸入想要鑄造嘅數量
   - 點擊鑄造按鈕

💡 **使用有折扣嘅 URC 可以享受優惠！**`
  },
  {
    id: 'op3',
    question: '如何生成 URC 推薦碼？',
    answer: `生成唯一推薦碼（URC）嘅步驟：

**1. 切換錢包**
   ⚠️ 確保你使用嘅係不同嘅錢包地址（唔係你嘅鑄造錢包）

**2. 進入 URC 頁面**
   在平台中找到 URC 部分

**3. 生成推薦碼**
   點擊"生成 URC"按鈕

**4. 分享推薦碼**
   你嘅唯一推薦碼已創建，可以分享給其他想要鑄造嘅人

🎁 **推薦優勢**：
- 推薦人喺自己嘅鑄造中獲得折扣
- 使用你 URC 嘅用户也能獲得折扣
- 幫助防止機器人攻擊，確保真实用户

⚠️ **重要提醒**：你不能使用自己生成嘅 URC 代碼進行鑄造！`
  },
  {
    id: 'op4',
    question: '如何申請退款？',
    answer: `申請退款嘅流程：

**1. 進入我嘅鑄造**
   找到"我嘅鑄造"部分

**2. 選擇鑄造記錄**
   找到你想退款嘅鑄造記錄

**3. 發起退款**
   點擊"退款"按鈕

**4. 確認操作**
   按照說明完成退款流程

⚠️ **重要限制**：
- 退款僅喺目標里程碑完成前可用
- 一旦達到目標里程碑（總供應量嘅 25%），將唔可以再退款
- 此保護機制確保早期用户嘅零風險參與`
  }
];

const hkCoreConcepts: FAQItem[] = [
  {
    id: 'cc1',
    question: '什麼是鑄造證明（PoM）？',
    answer: `**鑄造證明** 係 FlipFlop.plus 平台嘅核心創新機制。

**工作原理**：
- 用戶必須持有由其他人生成嘅唯一推薦碼（URC）先可以參與鑄造
- 確保每個參與者都有真實嘅社群關係

**主要優勢**：
- 🛡️ 防止女巫攻擊和機器人刷量
- 🤝 促進社群增長和真實用戶參與
- ⚖️ 確保公平分配，早期參與者獲得合理收益

**與傳統機制嘅區別**：
- 唔需要質押或鎖倉
- 通過社會關係網絡驗證真實性
- 降低參與門檻，提高去中心化程度`
  },
  {
    id: 'cc2',
    question: '什麼是 URC（唯一推薦碼）？',
    answer: `**URC (Unique Referral Code)** 係 FlipFlop.plus 嘅推薦系統核心。

**特點**：
- 🔑 每個推薦碼都係獨一無二嘅
- 🔄 由用戶生成，供其他用戶使用
- 💰 提供鑄造折扣激勵機制

**使用規則**：
- ✅ 你可以使用他人嘅 URC 進行鑄造（享受折扣）
- ❌ 你不能使用自己生成嘅 URC 進行鑄造
- 🎁 你生成嘅 URC 被他人使用時，你也會獲得獎勵

**經濟模型**：
- 推薦人同使用者都能獲得折扣
- 創造雙贏嘅社群經濟生態
- 激勵用戶邀請真實用戶加入`
  },
  {
    id: 'cc3',
    question: '什麼是目標里程碑？',
    answer: `**目標里程碑** 係 FlipFlop.plus 代幣經濟模型中嘅重要概念。

**定義**：
- 目標里程碑 = 總供應量嘅 **25%**
- 當代幣鑄造達到總量嘅 25% 時，視為完成目標里程碑

**里程碑前**：
- ✅ 用戶可以隨時申請退款
- ✅ 早期參與零風險
- ✅ 保護機制生效

**里程碑後**：
- ❌ 唔再支持退款功能
- 🚀 代幣進入完全市場化階段
- 📈 價格由市場供需決定

**設計目的**：
- 平衡早期用戶保護同項目長期發展
- 給早期參與者明確嘅退出窗口
- 鼓勵長期價值投資而非短期投機`
  },
  {
    id: 'cc4',
    question: '標準版同迷因版有什麼區別？',
    answer: `**標準版**：
- 📊 包含完整嘅經濟模型參數
- 🎯 適合有長期發展計劃嘅項目
- ⚙️ 可自定義更多配置選項

**迷因版 (Meme)**：
- 🎨 簡化嘅發行流程
- 🚀 快速啟動，適合病毒式傳播
- 📱 預設優化參數，開箱即用

**選擇建議**：
- 如果你係認真做項目 → 選擇**標準版**
- 如果係玩梗/測試/快速實驗 → 選擇**迷因版**

兩者都使用相同嘅 PoM 機制同安全基礎設施。`
  },
  {
    id: 'cc5',
    question: '什麼是女巫攻擊？',
    answer: `**女巫攻擊（Sybil Attack）** 係一種通過創建大量虛假身份嚟操縱系統嘅攻擊方式。

**攻擊方式**：
- 攻擊者創建成百上千個虛假賬戶/錢包
- 利用呢啲賬戶獲取不當利益
- 破壞系統嘅公平性同去中心化

**喺代幣鑄造中嘅影響**：
- 單人控制多個錢包進行大量鑄造
- 推擠真實用戶嘅參與機會
- 導致代幣分配極度不公

**PoM 如何防禦**：
- ✅ 要求使用他人生成嘅 URC 先可以鑄造
- ✅ 每個錢包只能生成一個 URC
- ✅ 創建虛假賬戶嘅成本遠高於收益
- ✅ 通過社會關係網絡驗證身份真實性

呢種機制令女巫攻擊喺經濟上變得不可行。`
  },
  {
    id: 'cc6',
    question: '什麼是推薦獎勵機制？',
    answer: `**推薦獎勵機制** 係 FlipFlop.plus 激勵社群增長嘅核心設計。

**雙重獎勵**：
- 🎁 **推薦人獎勵**：你生成嘅 URC 被他人使用時，你嘅鑄造可享受折扣
- 🎁 **使用者獎勵**：使用他人嘅 URC 鑄造時，你都可以享受折扣

**折扣優勢**：
- 鑄造成本更低
- 推薦越多，累積嘅折扣機會越多
- 形成正向循環嘅推薦生態

**與傳統推薦嘅區別**：
- ❌ 傳統模式：只有推薦人獲利，使用者無優惠
- ✅ FlipFlop.plus：雙方都能獲得折扣，真正雙贏

**防刷機制**：
- 每個錢包只能生成一個 URC
- 唔能使用自己生成嘅 URC
- 確保推薦關係喺真實用戶之間建立`
  },
  {
    id: 'cc7',
    question: '什麼是零風險參與？',
    answer: `**零風險參與** 係 FlipFlop.plus 對早期參與者嘅創新保護機制。

**核心保障**：
- 🛡️ 喺目標里程碑（25%總供應量）完成前
- 🛡️ 用戶可以隨時申請全額退款
- 🛡️ 無需任何理由，無手續費

**保護意義**：
- ✅ 降低早期參與風險
- ✅ 令用戶能夠放心嚟試新代幣
- ✅ 避免因項目發展不如預期而損失資金

**運作機制**：
1. 用戶參與鑄造代幣
2. 代幣價格波動或項目進展不如預期
3. 喺里程碑前，用戶可以點擊"退款"按鈕
4. 系統退還用戶支付嘅金額

**市場成熟後**：
- 一旦達到目標里程碑
- 退款功能自動關閉
- 代幣進入完全市場化階段
- 價格由市場供需決定

呢種設計平衡咗早期用戶保護同項目嘅長期發展需求。`
  },
  {
    id: 'cc8',
    question: '什麼是公平分配？',
    answer: `**公平分配** 係 FlipFlop.plus 代幣發行嘅核心原則。

**傳統問題**：
- 🐋 巨鯨早期掃貨，普通用戶無機會
- 🤖 機器人腳本搶奪，真實用戶被排擠
- 📉 大戶控盤，價格被操縱

**FlipFlop.plus 嘅解決方案**：

**1. 鑄造證明（PoM）**
- 限制單賬戶嘅參與能力
- 需要真實社交關係先可以參與
- 防止機器人批量操作

**2. 推薦機制**
- 每個錢包只能生成一個 URC
- 防止单人創建多個賬戶
- 確保參與者係真實用戶

**3. 里程碑保護**
- 早期用戶可隨時退出
- 降低參與風險
- 避免被套牢

**分配效果**：
- ✅ 更多真實用戶參與
- ✅ 代幣分散喺更多人手中
- ✅ 去中心化程度更高
- ✅ 價格更健康穩定

公平分配唔係淨係口号，而係通過技術創新實現嘅目標。`
  },
  {
    id: 'cc9',
    question: '什麼是社群共識？',
    answer: `**社群共識** 喺 FlipFlop.plus 中扮演著核心角色。

**PoM 與社群共識嘅關係**：

**1. 通過社會關係驗證**
- 用戶需要他人嘅 URC 先可以參與
- 建立真實嘅社群連接
- 形成去中心化嘅信任網絡

**2. 共識驅動增長**
- 每個參與者都有動機邀請真實用戶
- 優質項目會自然吸引社群支持
- 社群質量決定項目成功

**3. 經濟激勵共識**
- 推薦人同使用者都能獲益
- 創造雙贏嘅社群經濟
- 激勵良性發展

**與傳統模式嘅區別**：
- ❌ 傳統：依賴算法或質押，社群聯繫薄弱
- ✅ FlipFlop.plus：依賴真實社會關係，社群緊密

**社群力量嘅體現**：
- 💪 推薦機制令社群自我擴展
- 💪 早期參與者成為項目推廣者
- 💪 去中心化嘅共識更強大持久

FlipFlop.plus 相信，真正嘅去中心化始於緊密嘅社群共識。`
  },
  {
    id: 'cc10',
    question: '什麼是代幣版本選擇？',
    answer: `FlipFlop.plus 提供兩種代幣發行版本，滿足不同需求。

**標準版**

**適合對象**：
- 有長期項目規劃嘅團隊
- 需要精細控制經濟模型
- 希望自定義更多參數

**特點**：
- 📊 完整嘅經濟模型配置
- ⚙️ 可自定義各項參數
- 🎯 適合正式項目運營
- 📈 支持複雜嘅經濟機制

**迷因版 (Meme)**

**適合對象**：
- 玩梗同測試項目
- 快速實驗創意
- 社群驅動嘅代幣

**特點**：
- 🎨 簡化嘅發行流程
- 🚀 一鍵快速啟動
- 📱 預設優化參數
- 🌈 適合病毒式傳播

**如何選擇**？

| 考慮因素 | 選擇標準版 | 選擇迷因版 |
|---------|-----------|-----------|
| 項目類型 | 正式商業項目 | 玩梗/測試項目 |
| 長期規劃 | 有詳細路線圖 | 短期娛樂為主 |
| 團隊規模 | 專業團隊 | 個人或小團隊 |
| 定制需求 | 需要精細控制 | 快速啟動即可 |

無論選擇邊個版本，都享受相同嘅 PoM 安全機制同公平分配保障。`
  }
];

// 数据结构
const zhFAQs = [
  {
    id: 1,
    label: '操作指南',
    questions: zhOperationGuide
  },
  {
    id: 2,
    label: '核心概念',
    questions: zhCoreConcepts
  }
];

const enFAQs = [
  {
    id: 1,
    label: 'Quick Guide',
    questions: enOperationGuide
  },
  {
    id: 2,
    label: 'Core Concepts',
    questions: enCoreConcepts
  }
];

const hkFAQs = [
  {
    id: 1,
    label: '操作指南',
    questions: hkOperationGuide
  },
  {
    id: 2,
    label: '核心概念',
    questions: hkCoreConcepts
  }
];

// 根据语言代码获取 FAQ
export function getFAQsByLang(lang: string) {
  const langMap: Record<string, typeof zhFAQs> = {
    'zh-CN': zhFAQs,
    'en-US': enFAQs,
    'en': enFAQs,
    'zh-TW': hkFAQs,
    'ja-JP': enFAQs,
    'es-ES': enFAQs,
    'vi-VN': enFAQs,
  };

  return langMap[lang] || zhFAQs;
}
