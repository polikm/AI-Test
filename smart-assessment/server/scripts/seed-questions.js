require('dotenv').config();
const mysql = require('mysql2/promise');

const seedQuestions = async () => {
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    database: process.env.DB_NAME || 'smart_assessment'
  });

  const questions = [];

  const aigcBasicQ1 = [
    { course_id: 1, grade: 1, type: 'single', content: '以下哪个是人工智能（AI）的应用？', options: [{ key: 'A', value: '电视遥控器' }, { key: 'B', value: '手机语音助手' }, { key: 'C', value: '自行车' }, { key: 'D', value: '笔记本' }], answer: 'B', analysis: '手机语音助手是人工智能的应用，它可以理解和响应人类的语音指令。', difficulty: 1, dimensions: ['basic'] },
    { course_id: 1, grade: 1, type: 'judge', content: '机器人可以帮助人类做很多事情，比如打扫卫生。', options: [], answer: 'A', analysis: '机器人确实可以帮助人类完成打扫卫生等家务工作。', difficulty: 1, dimensions: ['basic'] },
    { course_id: 1, grade: 1, type: 'single', content: '什么是AI助手？', options: [{ key: 'A', value: '一种机器人朋友' }, { key: 'B', value: '可以帮助人们回答问题和完成任务的小助手' }, { key: 'C', value: '一种游戏' }, { key: 'D', value: '一种学习工具' }], answer: 'B', analysis: 'AI助手是一种可以帮助人们回答问题和完成各种任务的智能程序。', difficulty: 1, dimensions: ['basic'] },
    { course_id: 1, grade: 1, type: 'judge', content: '人工智能可以像人类一样学习和思考。', options: [], answer: 'A', analysis: '人工智能可以通过学习来改进自己，但它思考的方式与人类不同。', difficulty: 1, dimensions: ['basic'] },
    { course_id: 1, grade: 1, type: 'single', content: '以下哪种设备可能会用到人工智能？', options: [{ key: 'A', value: '智能音箱' }, { key: 'B', value: '老式收音机' }, { key: 'C', value: '算盘' }, { key: 'D', value: '纸质书' }], answer: 'A', analysis: '智能音箱可以识别语音指令，是人工智能的应用。', difficulty: 1, dimensions: ['basic'] },
    { course_id: 1, grade: 2, type: 'single', content: '什么是机器学习？', options: [{ key: 'A', value: '机器人跑步' }, { key: 'B', value: '计算机通过数据学习并改进' }, { key: 'C', value: '学习机器操作' }, { key: 'D', value: '修理机器' }], answer: 'B', analysis: '机器学习是让计算机通过分析数据来学习和改进的技术。', difficulty: 2, dimensions: ['basic'] },
    { course_id: 1, grade: 2, type: 'judge', content: 'AI绘画工具可以根据文字描述生成图片。', options: [], answer: 'A', analysis: 'AI绘画工具确实可以根据文字描述生成相应的图片。', difficulty: 2, dimensions: ['basic', 'creative'] },
    { course_id: 1, grade: 2, type: 'single', content: '以下哪个不是人工智能的特点？', options: [{ key: 'A', value: '可以学习' }, { key: 'B', value: '可以识别图像' }, { key: 'C', value: '需要吃饭睡觉' }, { key: 'D', value: '可以回答问题' }], answer: 'C', analysis: '人工智能不需要吃饭睡觉，这是人类的特点。', difficulty: 2, dimensions: ['basic'] },
    { course_id: 1, grade: 2, type: 'single', content: '人脸识别技术主要用于什么？', options: [{ key: 'A', value: '玩游戏' }, { key: 'B', value: '通过面部特征识别身份' }, { key: 'C', value: '拍照美颜' }, { key: 'D', value: '听音乐' }], answer: 'B', analysis: '人脸识别通过分析面部特征来识别一个人的身份。', difficulty: 2, dimensions: ['basic'] },
    { course_id: 1, grade: 3, type: 'single', content: '智能推荐系统会根据什么来推荐内容？', options: [{ key: 'A', value: '随机选择' }, { key: 'B', value: '用户的兴趣和行为' }, { key: 'C', value: '天气情况' }, { key: 'D', value: '时间顺序' }], answer: 'B', analysis: '智能推荐系统会分析用户的历史行为和兴趣来推荐相关内容。', difficulty: 3, dimensions: ['basic', 'logic'] },
    { course_id: 1, grade: 3, type: 'judge', content: 'AI创作的内容一定都是正确的，不需要审核。', options: [], answer: 'B', analysis: 'AI创作的内容可能存在错误或不当之处，需要人工审核。', difficulty: 3, dimensions: ['basic', 'logic'] },
    { course_id: 1, grade: 3, type: 'single', content: '什么是自然语言处理（NLP）？', options: [{ key: 'A', value: '处理自然风景' }, { key: 'B', value: '让计算机理解和生成人类语言' }, { key: 'C', value: '学习外语' }, { key: 'D', value: '处理图片' }], answer: 'B', analysis: '自然语言处理是让计算机能够理解和生成人类语言的技术。', difficulty: 3, dimensions: ['basic'] },
    { course_id: 1, grade: 3, type: 'multiple', content: '以下哪些是人工智能的应用领域？', options: [{ key: 'A', value: '语音助手' }, { key: 'B', value: '自动驾驶' }, { key: 'C', value: '人脸识别' }, { key: 'D', value: '智能推荐' }], answer: 'ABCD', analysis: '语音助手、自动驾驶、人脸识别和智能推荐都是人工智能的典型应用。', difficulty: 3, dimensions: ['basic'] },
    { course_id: 1, grade: 3, type: 'judge', content: 'AI可以模仿著名画家的风格创作新的绘画作品。', options: [], answer: 'A', analysis: 'AI绘画工具可以学习并模仿不同画家的风格进行创作。', difficulty: 3, dimensions: ['basic', 'creative'] },
    { course_id: 1, grade: 3, type: 'single', content: '什么是生成式AI？', options: [{ key: 'A', value: '只能复制已有内容的技术' }, { key: 'B', value: '能够创造新内容的技术' }, { key: 'C', value: '删除内容的工具' }, { key: 'D', value: '保存文件的方式' }], answer: 'B', analysis: '生成式AI能够创造全新的内容，如文章、图片、音乐等。', difficulty: 3, dimensions: ['basic', 'creative'] },
  ];

  const aigcMiddleQ1 = [
    { course_id: 1, grade: 4, type: 'single', content: '深度学习是机器学习的一个分支，主要使用什么技术？', options: [{ key: 'A', value: '神经网络' }, { key: 'B', value: '手工编码' }, { key: 'C', value: '传统计算' }, { key: 'D', value: '机械装置' }], answer: 'A', analysis: '深度学习使用人工神经网络来模拟人脑的学习方式。', difficulty: 3, dimensions: ['basic'] },
    { course_id: 1, grade: 4, type: 'judge', content: '在AI领域，"训练"指的是让模型从数据中学习规律。', options: [], answer: 'A', analysis: '训练是AI模型通过大量数据学习的过程。', difficulty: 3, dimensions: ['basic'] },
    { course_id: 1, grade: 4, type: 'single', content: '以下哪个不是监督学习的应用？', options: [{ key: 'A', value: '图像分类' }, { key: 'B', value: '垃圾邮件识别' }, { key: 'C', value: '自主探索环境' }, { key: 'D', value: '疾病诊断' }], answer: 'C', analysis: '自主探索环境通常是无监督学习或强化学习的应用。', difficulty: 4, dimensions: ['basic', 'logic'] },
    { course_id: 1, grade: 4, type: 'multiple', content: 'AI伦理关注的主要问题包括？', options: [{ key: 'A', value: '隐私保护' }, { key: 'B', value: '算法偏见' }, { key: 'C', value: '数据安全' }, { key: 'D', value: '代码规范' }], answer: 'ABC', analysis: 'AI伦理主要关注隐私保护、算法偏见和数据安全等问题。', difficulty: 4, dimensions: ['basic', 'comprehensive'] },
    { course_id: 1, grade: 4, type: 'single', content: '什么是计算机视觉？', options: [{ key: 'A', value: '让计算机玩游戏' }, { key: 'B', value: '让计算机理解和处理图像和视频' }, { key: 'C', value: '用摄像头监控' }, { key: 'D', value: '制作动画' }], answer: 'B', analysis: '计算机视觉是让计算机能够理解和分析图像和视频内容的技术。', difficulty: 4, dimensions: ['basic'] },
    { course_id: 1, grade: 5, type: 'single', content: 'Transformer架构最初是为哪个任务设计的？', options: [{ key: 'A', value: '图像识别' }, { key: 'B', value: '自然语言处理' }, { key: 'C', value: '语音识别' }, { key: 'D', value: '推荐系统' }], answer: 'B', analysis: 'Transformer架构最初是为了解决自然语言处理任务而设计的。', difficulty: 4, dimensions: ['basic'] },
    { course_id: 1, grade: 5, type: 'judge', content: '大语言模型(LLM)是通过在大规模文本数据上训练得到的。', options: [], answer: 'A', analysis: '大语言模型通过学习海量文本数据来获得语言理解和生成能力。', difficulty: 4, dimensions: ['basic'] },
    { course_id: 1, grade: 5, type: 'single', content: '以下哪个技术可以帮助AI生成逼真的图片？', options: [{ key: 'A', value: 'GAN（生成对抗网络）' }, { key: 'B', value: 'TCP协议' }, { key: 'C', value: 'HTML语言' }, { key: 'D', value: 'CSS样式' }], answer: 'A', analysis: 'GAN（生成对抗网络）是用于生成逼真图片的重要AI技术。', difficulty: 5, dimensions: ['basic', 'creative'] },
    { course_id: 1, grade: 5, type: 'multiple', content: 'AI视频生成可能涉及哪些技术？', options: [{ key: 'A', value: '图像生成' }, { key: 'B', value: '语音合成' }, { key: 'C', value: '视频剪辑' }, { key: 'D', value: '所有选项' }], answer: 'D', analysis: 'AI视频生成综合运用了图像生成、语音合成和视频剪辑等多种技术。', difficulty: 5, dimensions: ['basic', 'creative'] },
    { course_id: 1, grade: 5, type: 'single', content: '什么是Prompt（提示词）？', options: [{ key: 'A', value: '程序错误' }, { key: 'B', value: '给AI的指令或描述' }, { key: 'C', value: '代码注释' }, { key: 'D', value: '文件格式' }], answer: 'B', analysis: 'Prompt是用户给AI系统的指令或描述，用于引导AI生成相应的输出。', difficulty: 4, dimensions: ['basic'] },
    { course_id: 1, grade: 6, type: 'single', content: '在AI中，"幻觉"指的是什么？', options: [{ key: 'A', value: 'AI的眼睛出现问题' }, { key: 'B', value: 'AI生成看似合理但实际错误的内容' }, { key: 'C', value: 'AI学习太慢' }, { key: 'D', value: '程序崩溃' }], answer: 'B', analysis: 'AI幻觉指AI生成的内容看起来合理但实际上是错误或虚假的信息。', difficulty: 5, dimensions: ['basic', 'logic'] },
    { course_id: 1, grade: 6, type: 'judge', content: 'AI生成的内容不享有传统意义上的版权保护。', options: [], answer: 'A', analysis: '目前AI生成内容的版权归属在法律上还存在争议。', difficulty: 5, dimensions: ['basic', 'comprehensive'] },
    { course_id: 1, grade: 6, type: 'single', content: '什么是RAG技术？', options: [{ key: 'A', value: '一种机器人技术' }, { key: 'B', value: '结合检索和生成的技术' }, { key: 'C', value: '虚拟现实技术' }, { key: 'D', value: '网络协议' }], answer: 'B', analysis: 'RAG（检索增强生成）结合了信息检索和AI生成技术。', difficulty: 5, dimensions: ['basic'] },
    { course_id: 1, grade: 6, type: 'multiple', content: 'AI Agent（AI智能体）通常具备哪些能力？', options: [{ key: 'A', value: '感知环境' }, { key: 'B', value: '自主决策' }, { key: 'C', value: '执行行动' }, { key: 'D', value: '学习改进' }], answer: 'ABCD', analysis: 'AI智能体具备感知、决策、行动和学习等综合能力。', difficulty: 5, dimensions: ['basic', 'logic'] },
    { course_id: 1, grade: 6, type: 'single', content: '什么是模型的"参数"？', options: [{ key: 'A', value: '程序代码' }, { key: 'B', value: '模型在训练中学习到的数值' }, { key: 'C', value: '用户输入' }, { key: 'D', value: '硬件配置' }], answer: 'B', analysis: '参数是模型在训练过程中学习到的内部数值，决定模型的行为。', difficulty: 5, dimensions: ['basic'] },
  ];

  const aigcSeniorQ1 = [
    { course_id: 1, grade: 7, type: 'single', content: '卷积神经网络(CNN)主要擅长处理什么类型的数据？', options: [{ key: 'A', value: '文本数据' }, { key: 'B', value: '图像数据' }, { key: 'C', value: '音频数据' }, { key: 'D', value: '表格数据' }], answer: 'B', analysis: 'CNN特别擅长处理图像和视频等网格结构的数据。', difficulty: 4, dimensions: ['basic'] },
    { course_id: 1, grade: 7, type: 'judge', content: '注意力机制(Attention Mechanism)可以让模型关注输入中最相关的部分。', options: [], answer: 'A', analysis: '注意力机制帮助模型自动关注输入中最重要和相关的部分。', difficulty: 5, dimensions: ['basic', 'logic'] },
    { course_id: 1, grade: 7, type: 'single', content: '扩散模型(Diffusion Model)生成图片的基本原理是什么？', options: [{ key: 'A', value: '随机像素组合' }, { key: 'B', value: '从噪声中逐步恢复图像' }, { key: 'C', value: '复制现有图片' }, { key: 'D', value: '手工绘制' }], answer: 'B', analysis: '扩散模型通过从随机噪声逐步去噪来生成图像。', difficulty: 5, dimensions: ['basic', 'creative'] },
    { course_id: 1, grade: 7, type: 'multiple', content: '多模态AI模型可以同时处理哪些类型的数据？', options: [{ key: 'A', value: '文本' }, { key: 'B', value: '图像' }, { key: 'C', value: '音频' }, { key: 'D', value: '视频' }], answer: 'ABCD', analysis: '多模态模型能够理解和处理文本、图像、音频、视频等多种数据类型。', difficulty: 5, dimensions: ['basic', 'comprehensive'] },
    { course_id: 1, grade: 7, type: 'single', content: '什么是迁移学习？', options: [{ key: 'A', value: '把数据从一个地方移动到另一个地方' }, { key: 'B', value: '将在一个任务上学到的知识应用到另一个相关任务' }, { key: 'C', value: '学习如何搬运东西' }, { key: 'D', value: '数据库技术' }], answer: 'B', analysis: '迁移学习是将已学到的知识应用到新任务的技术，可以节省训练时间和数据。', difficulty: 5, dimensions: ['basic', 'logic'] },
    { course_id: 1, grade: 8, type: 'single', content: '什么是微调(Fine-tuning)？', options: [{ key: 'A', value: '调整电视画面' }, { key: 'B', value: '在预训练模型基础上用特定数据进行进一步训练' }, { key: 'C', value: '修改代码格式' }, { key: 'D', value: '清理磁盘空间' }], answer: 'B', analysis: '微调是在已经训练好的大模型基础上，用特定数据进一步训练以适应新任务。', difficulty: 5, dimensions: ['basic'] },
    { course_id: 1, grade: 8, type: 'judge', content: 'AI对齐(AI Alignment)的目标是确保AI系统的行为符合人类意图和价值观。', options: [], answer: 'A', analysis: 'AI对齐研究致力于确保AI系统的目标和行为与人类意图保持一致。', difficulty: 5, dimensions: ['basic', 'comprehensive'] },
    { course_id: 1, grade: 8, type: 'single', content: '什么是Embedding（嵌入）？', options: [{ key: 'A', value: '插入广告' }, { key: 'B', value: '将数据转换为向量表示' }, { key: 'C', value: '压缩文件' }, { key: 'D', value: '加密传输' }], answer: 'B', analysis: '嵌入是将文字、图片等内容转换为数值向量的技术，便于计算机处理。', difficulty: 5, dimensions: ['basic', 'logic'] },
    { course_id: 1, grade: 8, type: 'multiple', content: '提示工程(Prompt Engineering)包括哪些技巧？', options: [{ key: 'A', value: 'Few-shot示例' }, { key: 'B', value: '思维链提示' }, { key: 'C', value: '角色设定' }, { key: 'D', value: '代码编译' }], answer: 'ABC', analysis: '提示工程包括使用示例、思维链、角色设定等技巧来优化AI输出。', difficulty: 5, dimensions: ['basic', 'logic', 'creative'] },
    { course_id: 1, grade: 8, type: 'single', content: 'AI中的"涌现能力"是什么？', options: [{ key: 'A', value: '突然获得超能力' }, { key: 'B', value: '模型规模达到一定程度后突然出现的新能力' }, { key: 'C', value: '系统崩溃' }, { key: 'D', value: '意外错误' }], answer: 'B', analysis: '涌现能力是指当模型规模增大到一定程度时，突然表现出之前没有的新能力。', difficulty: 5, dimensions: ['basic', 'logic'] },
    { course_id: 1, grade: 9, type: 'single', content: '强化学习中的"奖励函数"作用是什么？', options: [{ key: 'A', value: '给玩家发奖金' }, { key: 'B', value: '指导AI学习方向的信号' }, { key: 'C', value: '计算程序运行时间' }, { key: 'D', value: '显示分数' }], answer: 'B', analysis: '奖励函数提供指导AI学习的信号，告诉AI行为的好坏。', difficulty: 5, dimensions: ['basic', 'logic'] },
    { course_id: 1, grade: 9, type: 'judge', content: 'AI系统的可解释性(Explainability)对于建立信任和debug非常重要。', options: [], answer: 'A', analysis: '可解释性帮助我们理解AI做出决策的原因，对于调试和建立信任很关键。', difficulty: 5, dimensions: ['basic', 'comprehensive'] },
    { course_id: 1, grade: 9, type: 'single', content: '什么是联邦学习(Federated Learning)？', options: [{ key: 'A', value: '联邦政府使用的学习' }, { key: 'B', value: '在保护隐私前提下多方协作训练模型' }, { key: 'C', value: '联邦制的教育系统' }, { key: 'D', value: '网络连接技术' }], answer: 'B', analysis: '联邦学习允许在不共享原始数据的情况下协作训练AI模型，保护隐私。', difficulty: 5, dimensions: ['basic', 'comprehensive'] },
    { course_id: 1, grade: 9, type: 'multiple', content: '评估生成式AI模型的常用指标包括？', options: [{ key: 'A', value: 'BLEU（文本质量）' }, { key: 'B', value: 'FID（图像质量）' }, { key: 'C', value: '人工评估' }, { key: 'D', value: '代码行数' }], answer: 'ABC', analysis: 'BLEU、FID和人工评估都是评估AI生成内容的常用方法。', difficulty: 5, dimensions: ['basic', 'logic'] },
    { course_id: 1, grade: 9, type: 'blank', content: '在AI伦理中，____学习是指在不暴露敏感信息的情况下进行机器学习。', options: [], answer: '联邦', analysis: '联邦学习可以在不直接访问原始数据的情况下进行模型训练，保护用户隐私。', difficulty: 5, dimensions: ['basic', 'comprehensive'] },
  ];

  questions.push(...aigcBasicQ1, ...aigcMiddleQ1, ...aigcSeniorQ1);

  const scratchBasicQ1 = [
    { course_id: 2, grade: 1, type: 'single', content: '在Scratch中，角色默认被称为什么？', options: [{ key: 'A', value: '小猫' }, { key: 'B', value: '角色' }, { key: 'C', value: '精灵' }, { key: 'D', value: '对象' }], answer: 'A', analysis: 'Scratch默认的角色是一只可爱的小猫。', difficulty: 1, dimensions: ['basic'] },
    { course_id: 2, grade: 1, type: 'judge', content: '在Scratch中，积木块需要拼在一起才能让角色执行动作。', options: [], answer: 'A', analysis: 'Scratch的积木块需要像拼图一样组合在一起才能工作。', difficulty: 1, dimensions: ['basic'] },
    { course_id: 2, grade: 1, type: 'single', content: '哪个积木可以让角色说话？', options: [{ key: 'A', value: '说(你好！)2秒' }, { key: 'B', value: '移动10步' }, { key: 'C', value: '播放声音' }, { key: 'D', value: '下一个造型' }], answer: 'A', analysis: '"说"积木可以让角色显示文字气泡。', difficulty: 1, dimensions: ['basic'] },
    { course_id: 2, grade: 1, type: 'single', content: 'Scratch属于哪种编程方式？', options: [{ key: 'A', value: '打字编程' }, { key: 'B', value: '积木块拖拽编程' }, { key: 'C', value: '电路连接' }, { key: 'D', value: '手势编程' }], answer: 'B', analysis: 'Scratch通过拖拽积木块来编程，非常适合初学者。', difficulty: 1, dimensions: ['basic'] },
    { course_id: 2, grade: 1, type: 'judge', content: '角色的造型可以切换来创建动画效果。', options: [], answer: 'A', analysis: '通过切换角色的不同造型，可以制作简单的动画效果。', difficulty: 1, dimensions: ['basic', 'creative'] },
    { course_id: 2, grade: 2, type: 'single', content: '哪个积木可以让角色向右移动？', options: [{ key: 'A', value: '移动10步' }, { key: 'B', value: '旋转15度' }, { key: 'C', value: '说(你好！)2秒' }, { key: 'D', value: '换成某造型' }], answer: 'A', analysis: '"移动10步"积木可以让角色向其面向的方向移动。', difficulty: 2, dimensions: ['basic'] },
    { course_id: 2, grade: 2, type: 'single', content: '当绿旗被点击时，程序从哪里开始执行？', options: [{ key: 'A', value: '任意位置' }, { key: 'B', value: '带绿旗的积木下方' }, { key: 'C', value: '最下面' }, { key: 'D', value: '不开始' }], answer: 'B', analysis: '程序从"当绿旗被点击"积木开始执行。', difficulty: 2, dimensions: ['basic'] },
    { course_id: 2, grade: 2, type: 'judge', content: '角色可以同时播放多个声音。', options: [], answer: 'A', analysis: 'Scratch支持同时播放多个声音。', difficulty: 2, dimensions: ['basic'] },
    { course_id: 2, grade: 2, type: 'single', content: '哪个积木可以重复执行一段代码？', options: [{ key: 'A', value: '说(你好！)2秒' }, { key: 'B', value: '重复执行10次' }, { key: 'C', value: '停止全部' }, { key: 'D', value: '如果...那么' }], answer: 'B', analysis: '"重复执行"积木可以让代码块循环执行。', difficulty: 2, dimensions: ['basic', 'logic'] },
    { course_id: 2, grade: 3, type: 'single', content: '什么是循环？', options: [{ key: 'A', value: '让程序停止' }, { key: 'B', value: '让代码反复执行' }, { key: 'C', value: '删除角色' }, { key: 'D', value: '添加背景' }], answer: 'B', analysis: '循环可以让一段代码反复执行多次。', difficulty: 3, dimensions: ['basic', 'logic'] },
    { course_id: 2, grade: 3, type: 'judge', content: '条件判断可以让程序根据不同情况做不同的事。', options: [], answer: 'A', analysis: '条件判断让程序能够根据条件选择不同的执行路径。', difficulty: 3, dimensions: ['basic', 'logic'] },
    { course_id: 2, grade: 3, type: 'single', content: '"如果...那么"属于什么类型的积木？', options: [{ key: 'A', value: '运动积木' }, { key: 'B', value: '声音积木' }, { key: 'C', value: '控制积木' }, { key: 'D', value: '外观积木' }], answer: 'C', analysis: '"如果...那么"属于控制类积木，用于条件判断。', difficulty: 3, dimensions: ['basic'] },
    { course_id: 2, grade: 3, type: 'multiple', content: '以下哪些是Scratch中的事件积木？', options: [{ key: 'A', value: '当绿旗被点击' }, { key: 'B', value: '当角色被点击' }, { key: 'C', value: '当按下空格键' }, { key: 'D', value: '移动10步' }], answer: 'ABC', analysis: '当绿旗被点击、当角色被点击、当按下空格键都是事件积木。', difficulty: 3, dimensions: ['basic'] },
    { course_id: 2, grade: 3, type: 'single', content: '变量的作用是什么？', options: [{ key: 'A', value: '存储和跟踪变化的数据' }, { key: 'B', value: '让角色消失' }, { key: 'C', value: '播放音乐' }, { key: 'D', value: '改变背景' }], answer: 'A', analysis: '变量用于存储可以变化的数据，如分数、生命值等。', difficulty: 3, dimensions: ['basic', 'logic'] },
    { course_id: 2, grade: 3, type: 'judge', content: '在Scratch中，一个程序可以有多个角色。', options: [], answer: 'A', analysis: 'Scratch项目可以包含多个角色，每个角色都有自己的脚本。', difficulty: 3, dimensions: ['basic'] },
  ];

  questions.push(...scratchBasicQ1);

  const pythonBasicQ1 = [
    { course_id: 3, grade: 4, type: 'single', content: 'Python中使用什么符号来输出内容？', options: [{ key: 'A', value: 'print' }, { key: 'B', value: 'echo' }, { key: 'C', value: 'console' }, { key: 'D', value: 'output' }], answer: 'A', analysis: 'print()是Python中用于输出的函数。', difficulty: 3, dimensions: ['basic'] },
    { course_id: 3, grade: 4, type: 'judge', content: 'Python是一种解释型编程语言。', options: [], answer: 'A', analysis: 'Python代码由解释器逐行执行，无需编译。', difficulty: 3, dimensions: ['basic'] },
    { course_id: 3, grade: 4, type: 'single', content: '以下哪个是合法的Python变量名？', options: [{ key: 'A', value: '2name' }, { key: 'B', value: 'my-name' }, { key: 'C', value: 'my_name' }, { key: 'D', value: 'my name' }], answer: 'C', analysis: '变量名不能以数字开头，不能包含连字符和空格。', difficulty: 3, dimensions: ['basic'] },
    { course_id: 3, grade: 4, type: 'single', content: 'print("Hello" + "World")的输出是什么？', options: [{ key: 'A', value: 'HelloWorld' }, { key: 'B', value: 'Hello World' }, { key: 'C', value: '"HelloWorld"' }, { key: 'D', value: '错误' }], answer: 'A', analysis: '字符串用+连接会直接拼接，不会有空格。', difficulty: 3, dimensions: ['basic', 'logic'] },
    { course_id: 3, grade: 4, type: 'judge', content: '在Python中，注释以#开头。', options: [], answer: 'A', analysis: '#后的内容是注释，不会被程序执行。', difficulty: 3, dimensions: ['basic'] },
    { course_id: 3, grade: 5, type: 'single', content: 'Python中的数据类型int表示什么？', options: [{ key: 'A', value: '整数' }, { key: 'B', value: '小数' }, { key: 'C', value: '文字' }, { key: 'D', value: '真假' }], answer: 'A', analysis: 'int是整数类型，如1、100、-5等。', difficulty: 4, dimensions: ['basic'] },
    { course_id: 3, grade: 5, type: 'single', content: 'print(10 > 5)的输出是什么？', options: [{ key: 'A', value: '10' }, { key: 'B', value: '5' }, { key: 'C', value: 'True' }, { key: 'D', value: 'False' }], answer: 'C', analysis: '10 > 5是比较运算，结果为真(True)。', difficulty: 4, dimensions: ['basic', 'logic'] },
    { course_id: 3, grade: 5, type: 'multiple', content: '以下哪些是Python中的比较运算符？', options: [{ key: 'A', value: '==' }, { key: 'B', value: '!=' }, { key: 'C', value: '&&' }, { key: 'D', value: '<' }], answer: 'ABD', analysis: '==、!=、<都是比较运算符，&&是逻辑运算符。', difficulty: 4, dimensions: ['basic'] },
    { course_id: 3, grade: 5, type: 'single', content: 'for i in range(5)会循环多少次？', options: [{ key: 'A', value: '4次' }, { key: 'B', value: '5次' }, { key: 'C', value: '6次' }, { key: 'D', value: '无限次' }], answer: 'B', analysis: 'range(5)生成0-4，共5个数字，所以循环5次。', difficulty: 4, dimensions: ['basic', 'logic'] },
    { course_id: 3, grade: 5, type: 'judge', content: '列表(List)是一种有序的可变数据类型。', options: [], answer: 'A', analysis: '列表可以存储多个元素，且可以添加、删除、修改元素。', difficulty: 4, dimensions: ['basic'] },
    { course_id: 3, grade: 6, type: 'single', content: 'Python中如何定义一个函数？', options: [{ key: 'A', value: 'function myFunc()' }, { key: 'B', value: 'def myFunc():' }, { key: 'C', value: 'func myFunc{}' }, { key: 'D', value: 'define myFunc()' }], answer: 'B', analysis: 'Python使用def关键字来定义函数。', difficulty: 4, dimensions: ['basic'] },
    { course_id: 3, grade: 6, type: 'single', content: '字典(dict)中的数据是什么格式？', options: [{ key: 'A', value: '[1, 2, 3]' }, { key: 'B', value: '(1, 2, 3)' }, { key: 'C', value: '{"name": "Tom", "age": 10}' }, { key: 'D', value: '"hello"' }], answer: 'C', analysis: '字典使用键值对形式存储数据，如{"键": "值"}。', difficulty: 5, dimensions: ['basic'] },
    { course_id: 3, grade: 6, type: 'judge', content: 'Python中的字符串是不可变的，不能直接修改。', options: [], answer: 'A', analysis: '字符串一旦创建就不能直接修改，需要创建新的字符串。', difficulty: 5, dimensions: ['basic'] },
    { course_id: 3, grade: 6, type: 'single', content: 'print(len("Python"))的输出是什么？', options: [{ key: 'A', value: '5' }, { key: 'B', value: '6' }, { key: 'C', value: '7' }, { key: 'D', value: '错误' }], answer: 'B', analysis: 'len()函数返回字符串长度，Python有6个字符。', difficulty: 5, dimensions: ['basic', 'logic'] },
    { course_id: 3, grade: 6, type: 'multiple', content: 'Python中的数据类型包括？', options: [{ key: 'A', value: 'int' }, { key: 'B', value: 'str' }, { key: 'C', value: 'list' }, { key: 'D', value: 'bool' }], answer: 'ABCD', analysis: 'int、str、list、bool都是Python的基本数据类型。', difficulty: 4, dimensions: ['basic'] },
  ];

  questions.push(...pythonBasicQ1);

  const cppBasicQ1 = [
    { course_id: 4, grade: 7, type: 'single', content: 'C++中使用什么输出内容到屏幕？', options: [{ key: 'A', value: 'print()' }, { key: 'B', value: 'cout <<' }, { key: 'C', value: 'echo' }, { key: 'D', value: 'printf()' }], answer: 'B', analysis: 'C++使用cout<<进行输出，printf是C语言的方式。', difficulty: 4, dimensions: ['basic'] },
    { course_id: 4, grade: 7, type: 'judge', content: 'C++是一种强类型语言，每个变量都需要指定类型。', options: [], answer: 'A', analysis: 'C++要求变量声明时必须指定明确的数据类型。', difficulty: 4, dimensions: ['basic'] },
    { course_id: 4, grade: 7, type: 'single', content: 'C++中int类型通常占用多少字节？', options: [{ key: 'A', value: '1字节' }, { key: 'B', value: '2字节' }, { key: 'C', value: '4字节' }, { key: 'D', value: '8字节' }], answer: 'C', analysis: '在大多数系统中，int类型占用4个字节。', difficulty: 4, dimensions: ['basic'] },
    { course_id: 4, grade: 7, type: 'single', content: '以下哪个不是C++的关键字？', options: [{ key: 'A', value: 'int' }, { key: 'B', value: 'class' }, { key: 'C', value: 'python' }, { key: 'D', value: 'return' }], answer: 'C', analysis: 'python不是C++的关键字，int、class、return都是。', difficulty: 4, dimensions: ['basic'] },
    { course_id: 4, grade: 7, type: 'judge', content: 'C++程序通常需要包含头文件，如iostream。', options: [], answer: 'A', analysis: '头文件提供了程序需要的各种功能和声明。', difficulty: 4, dimensions: ['basic'] },
    { course_id: 4, grade: 8, type: 'single', content: '什么是面向对象编程？', options: [{ key: 'A', value: '只使用对象的编程' }, { key: 'B', value: '以类和对象为核心的程序设计方法' }, { key: 'C', value: '面向目标的编程' }, { key: 'D', value: '使用图形的编程' }], answer: 'B', analysis: '面向对象编程以类(class)和对象(object)为核心组织代码。', difficulty: 5, dimensions: ['basic'] },
    { course_id: 4, grade: 8, type: 'single', content: 'C++中类的访问修饰符不包括哪个？', options: [{ key: 'A', value: 'public' }, { key: 'B', value: 'private' }, { key: 'C', value: 'protected' }, { key: 'D', value: 'friend' }], answer: 'D', analysis: 'friend不是访问修饰符，它用于友元声明。', difficulty: 5, dimensions: ['basic'] },
    { course_id: 4, grade: 8, type: 'multiple', content: 'C++中的基本数据类型包括？', options: [{ key: 'A', value: 'int' }, { key: 'B', value: 'float' }, { key: 'C', value: 'double' }, { key: 'D', value: 'string' }], answer: 'ABC', analysis: 'int、float、double都是基本类型，string是标准库类型。', difficulty: 5, dimensions: ['basic'] },
    { course_id: 4, grade: 8, type: 'single', content: '什么是构造函数？', options: [{ key: 'A', value: '建立程序的函数' }, { key: 'B', value: '与类名相同的特殊成员函数' }, { key: 'C', value: '用于输出的函数' }, { key: 'D', value: '主程序入口' }], answer: 'B', analysis: '构造函数是类中与类名同名的特殊成员函数，用于初始化对象。', difficulty: 5, dimensions: ['basic', 'logic'] },
    { course_id: 4, grade: 8, type: 'judge', content: '虚函数可以实现多态性。', options: [], answer: 'A', analysis: '通过虚函数和继承，可以实现面向对象的多态特性。', difficulty: 5, dimensions: ['basic', 'logic'] },
    { course_id: 4, grade: 9, type: 'single', content: 'C++中，new和delete用于什么？', options: [{ key: 'A', value: '创建和删除对象' }, { key: 'B', value: '定义新变量' }, { key: 'C', value: '输入输出' }, { key: 'D', value: '条件判断' }], answer: 'A', analysis: 'new用于动态分配内存创建对象，delete用于释放内存。', difficulty: 5, dimensions: ['basic'] },
    { course_id: 4, grade: 9, type: 'single', content: '什么是模板(Template)？', options: [{ key: 'A', value: '程序的文件格式' }, { key: 'B', value: '实现泛型编程的机制' }, { key: 'C', value: '类的别名' }, { key: 'D', value: '输入方式' }], answer: 'B', analysis: '模板允许编写与类型无关的代码，实现泛型编程。', difficulty: 5, dimensions: ['basic', 'logic'] },
    { course_id: 4, grade: 9, type: 'judge', content: 'STL(标准模板库)提供了容器、算法和迭代器等组件。', options: [], answer: 'A', analysis: 'STL是C++标准库的重要组成部分，提供了丰富的数据结构和算法。', difficulty: 5, dimensions: ['basic', 'comprehensive'] },
    { course_id: 4, grade: 9, type: 'single', content: '什么是智能指针？', options: [{ key: 'A', value: '会思考的指针' }, { key: 'B', value: '自动管理内存的指针包装类' }, { key: 'C', value: '指向智能设备的指针' }, { key: 'D', value: '特殊的整型变量' }], answer: 'B', analysis: '智能指针可以自动管理内存，避免内存泄漏问题。', difficulty: 5, dimensions: ['basic', 'logic'] },
    { course_id: 4, grade: 9, type: 'multiple', content: 'C++中的异常处理机制包括哪些关键字？', options: [{ key: 'A', value: 'try' }, { key: 'B', value: 'catch' }, { key: 'C', value: 'throw' }, { key: 'D', value: 'except' }], answer: 'ABC', analysis: 'C++使用try、catch、throw处理异常，except不是C++关键字。', difficulty: 5, dimensions: ['basic', 'logic'] },
  ];

  questions.push(...cppBasicQ1);

  for (const q of questions) {
    try {
      await connection.execute(
        `INSERT INTO questions (course_id, grade, type, content, options, answer, analysis, difficulty, dimensions, status) 
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'approved')`,
        [
          q.course_id,
          q.grade,
          q.type,
          q.content,
          JSON.stringify(q.options || []),
          q.answer,
          q.analysis || '',
          q.difficulty || 3,
          JSON.stringify(q.dimensions || ['basic'])
        ]
      );
    } catch (err) {
      console.error(`Error inserting question: ${err.message}`);
    }
  }

  console.log(`Successfully seeded ${questions.length} questions!`);
  
  const [rows] = await connection.execute('SELECT COUNT(*) as count FROM questions');
  console.log(`Total questions in database: ${rows[0].count}`);

  await connection.end();
};

seedQuestions().catch(console.error);
