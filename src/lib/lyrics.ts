// Curated short lyric passages from three artists. One passage is shown per
// day: days are mapped through a seeded shuffle of the whole set, so every
// passage appears exactly once per cycle and consecutive days never repeat
// (including across cycle boundaries).

export interface LyricExcerpt {
	artist: string;
	artistEn: string;
	song: string;
	lines: string[];
}

const JAY = "周杰伦";
const JAY_EN = "JAY CHOU";
const EASON = "陈奕迅";
const EASON_EN = "EASON CHAN";
const LEI = "赵雷";
const LEI_EN = "ZHAO LEI";

export const LYRICS: LyricExcerpt[] = [
	// 周杰伦
	{ artist: JAY, artistEn: JAY_EN, song: "晴天", lines: ["从前从前，有个人爱你很久", "但偏偏，风渐渐，把距离吹得好远"] },
	{ artist: JAY, artistEn: JAY_EN, song: "晴天", lines: ["故事的小黄花", "从出生那年就飘着"] },
	{ artist: JAY, artistEn: JAY_EN, song: "七里香", lines: ["窗外的麻雀，在电线杆上多嘴", "你说这一句，很有夏天的感觉"] },
	{ artist: JAY, artistEn: JAY_EN, song: "稻香", lines: ["对这个世界，如果你有太多的抱怨", "跌倒了，就不敢继续往前走"] },
	{ artist: JAY, artistEn: JAY_EN, song: "青花瓷", lines: ["天青色等烟雨，而我在等你", "炊烟袅袅升起，隔江千万里"] },
	{ artist: JAY, artistEn: JAY_EN, song: "告白气球", lines: ["亲爱的，爱上你，从那天起", "甜蜜的很轻易"] },
	{ artist: JAY, artistEn: JAY_EN, song: "简单爱", lines: ["我想就这样，牵着你的手不放开", "爱能不能够，永远单纯没有悲哀"] },
	{ artist: JAY, artistEn: JAY_EN, song: "夜曲", lines: ["为你弹奏肖邦的夜曲", "纪念我死去的爱情"] },
	{ artist: JAY, artistEn: JAY_EN, song: "枫", lines: ["缓缓飘落的枫叶像思念", "我点燃烛火，温暖岁末的秋天"] },
	{ artist: JAY, artistEn: JAY_EN, song: "安静", lines: ["你说你也会难过，我不相信", "牵着你陪着我，也只是曾经"] },
	{ artist: JAY, artistEn: JAY_EN, song: "不能说的秘密", lines: ["最美的不是下雨天", "是曾与你躲过雨的屋檐"] },
	{ artist: JAY, artistEn: JAY_EN, song: "蒲公英的约定", lines: ["小学篱笆旁的蒲公英", "是记忆里有味道的风景"] },
	{ artist: JAY, artistEn: JAY_EN, song: "听妈妈的话", lines: ["听妈妈的话，别让她受伤", "想快快长大，才能保护她"] },
	{ artist: JAY, artistEn: JAY_EN, song: "东风破", lines: ["一壶漂泊，浪迹天涯难入喉", "你走之后，酒暖回忆思念瘦"] },
	{ artist: JAY, artistEn: JAY_EN, song: "发如雪", lines: ["你发如雪，凄美了离别", "我焚香感动了谁"] },
	{ artist: JAY, artistEn: JAY_EN, song: "千里之外", lines: ["我送你离开，千里之外，你无声黑白", "沉默年代，或许不该，太遥远的相爱"] },
	{ artist: JAY, artistEn: JAY_EN, song: "菊花台", lines: ["你的泪光，柔弱中带伤", "惨白的月弯弯，勾住过往"] },
	{ artist: JAY, artistEn: JAY_EN, song: "彩虹", lines: ["看不见你的笑，我怎么睡得着", "你的身影这么近，我却抱不到"] },
	{ artist: JAY, artistEn: JAY_EN, song: "说好的幸福呢", lines: ["说好的幸福呢，我懂了，不说了", "爱淡了，梦远了"] },
	{ artist: JAY, artistEn: JAY_EN, song: "兰亭序", lines: ["兰亭临帖，行书如行云流水", "月下门推，心细如你脚步碎"] },
	{ artist: JAY, artistEn: JAY_EN, song: "烟花易冷", lines: ["雨纷纷，旧故里草木深", "我听闻，你始终一个人"] },
	{ artist: JAY, artistEn: JAY_EN, song: "珊瑚海", lines: ["海鸟和鱼相爱，只是一场意外", "我们的爱，差异一直存在"] },
	{ artist: JAY, artistEn: JAY_EN, song: "最长的电影", lines: ["我们的开始，是很长的电影", "放映了三年，我票都还留着"] },
	{ artist: JAY, artistEn: JAY_EN, song: "搁浅", lines: ["久未放晴的天空", "依旧留着你的笑容"] },
	{ artist: JAY, artistEn: JAY_EN, song: "一路向北", lines: ["我一路向北，离开有你的季节", "你说你好累，已无法再爱上谁"] },
	{ artist: JAY, artistEn: JAY_EN, song: "星晴", lines: ["手牵手，一步两步三步四步，望着天", "看星星，一颗两颗三颗四颗，连成线"] },
	{ artist: JAY, artistEn: JAY_EN, song: "龙卷风", lines: ["爱情来得太快，就像龙卷风", "不能承受，我已无处可躲"] },
	{ artist: JAY, artistEn: JAY_EN, song: "回到过去", lines: ["想回到过去，试着抱你在怀里", "羞怯的脸，带有一点稚气"] },
	{ artist: JAY, artistEn: JAY_EN, song: "轨迹", lines: ["我会发着呆，然后忘记你", "接着紧紧闭上眼"] },
	{ artist: JAY, artistEn: JAY_EN, song: "断了的弦", lines: ["断了的弦，再怎么连", "我的感觉，你已听不见"] },
	{ artist: JAY, artistEn: JAY_EN, song: "给我一首歌的时间", lines: ["能不能给我一首歌的时间", "紧紧的把那拥抱变成永远"] },
	{ artist: JAY, artistEn: JAY_EN, song: "我不配", lines: ["这街上太拥挤，太多人有秘密", "玻璃上有雾气，在被隐藏起过去"] },
	{ artist: JAY, artistEn: JAY_EN, song: "甜甜的", lines: ["我轻轻地尝一口，你说的爱我", "还在回味，你给过的温柔"] },
	{ artist: JAY, artistEn: JAY_EN, song: "小小", lines: ["回忆像个说书的人", "用充满乡音的口吻"] },
	{ artist: JAY, artistEn: JAY_EN, song: "花海", lines: ["静止了，所有的花开", "遥远了，清晰了爱"] },
	{ artist: JAY, artistEn: JAY_EN, song: "说了再见", lines: ["说了再见，才发现再也见不到", "我不能，就这样失去你的微笑"] },
	{ artist: JAY, artistEn: JAY_EN, song: "红尘客栈", lines: ["剑出鞘，恩怨了，谁笑", "我只求今朝，拥你入怀抱"] },
	{ artist: JAY, artistEn: JAY_EN, song: "算什么男人", lines: ["亲爱的，别任性", "你的眼睛，在说我愿意"] },
	{ artist: JAY, artistEn: JAY_EN, song: "美人鱼", lines: ["美人鱼的眼泪", "是一个连伤心都透明的世界"] },
	{ artist: JAY, artistEn: JAY_EN, song: "等你下课", lines: ["躺在你学校的操场看星空", "教室里的灯还亮着，你没走"] },
	{ artist: JAY, artistEn: JAY_EN, song: "说好不哭", lines: ["没有了联络，后来的生活", "我都是听别人说"] },
	{ artist: JAY, artistEn: JAY_EN, song: "Mojito", lines: ["麻烦给我的爱人来一杯 Mojito", "我喜欢阅读她微醺时的眼眸"] },
	{ artist: JAY, artistEn: JAY_EN, song: "园游会", lines: ["琥珀色黄昏，像糖在很美的远方", "你的脸没有化妆，我却疯狂爱上"] },

	// 陈奕迅
	{ artist: EASON, artistEn: EASON_EN, song: "孤勇者", lines: ["爱你孤身走暗巷，爱你不跪的模样", "爱你对峙过绝望，不肯哭一场"] },
	{ artist: EASON, artistEn: EASON_EN, song: "孤勇者", lines: ["谁说站在光里的", "才算英雄"] },
	{ artist: EASON, artistEn: EASON_EN, song: "K歌之王", lines: ["我已经相信，有些人我永远不必等", "所以我明白，在灯火阑珊处为什么会哭"] },
	{ artist: EASON, artistEn: EASON_EN, song: "浮夸", lines: ["你当我是浮夸吧", "夸张只因我很怕"] },
	{ artist: EASON, artistEn: EASON_EN, song: "十年", lines: ["如果那两个字没有颤抖", "我不会发现我难受"] },
	{ artist: EASON, artistEn: EASON_EN, song: "十年", lines: ["十年之前，我不认识你，你不属于我", "我们还是一样，陪在一个陌生人左右"] },
	{ artist: EASON, artistEn: EASON_EN, song: "红玫瑰", lines: ["得不到的永远在骚动", "被偏爱的都有恃无恐"] },
	{ artist: EASON, artistEn: EASON_EN, song: "爱情转移", lines: ["把一个人的温暖", "转移到另一个的胸膛"] },
	{ artist: EASON, artistEn: EASON_EN, song: "富士山下", lines: ["拦路雨偏似雪花", "饮泣的你冻吗"] },
	{ artist: EASON, artistEn: EASON_EN, song: "好久不见", lines: ["我来到你的城市", "走过你来时的路"] },
	{ artist: EASON, artistEn: EASON_EN, song: "不要说话", lines: ["深色的海面，布满白色的月光", "我出神望着海，心不知飞哪去"] },
	{ artist: EASON, artistEn: EASON_EN, song: "稳稳的幸福", lines: ["我要稳稳的幸福", "能抵挡末日的残酷"] },
	{ artist: EASON, artistEn: EASON_EN, song: "陪你度过漫长岁月", lines: ["陪你把沿路感想，活出了答案", "陪你把独自孤单，变成了勇敢"] },
	{ artist: EASON, artistEn: EASON_EN, song: "我们", lines: ["我最大的遗憾", "是你的遗憾与我有关"] },
	{ artist: EASON, artistEn: EASON_EN, song: "让我留在你身边", lines: ["我从来不说再见", "让我留在你身边"] },
	{ artist: EASON, artistEn: EASON_EN, song: "明年今日", lines: ["在有生的瞬间能遇到你", "竟花光所有运气"] },
	{ artist: EASON, artistEn: EASON_EN, song: "人来人往", lines: ["闭起双眼，我最挂念谁", "眼睛张开，身边竟是谁"] },
	{ artist: EASON, artistEn: EASON_EN, song: "最佳损友", lines: ["朋友，我当你一秒朋友", "朋友，我当你一生朋友"] },
	{ artist: EASON, artistEn: EASON_EN, song: "无条件", lines: ["你何以始终不说话", "尽管讲出不快吧"] },
	{ artist: EASON, artistEn: EASON_EN, song: "任我行", lines: ["天真得只有你", "令神仙鱼归天要怪谁"] },
	{ artist: EASON, artistEn: EASON_EN, song: "岁月如歌", lines: ["爱上了看得见及看不见的台", "那满载欢乐与悲哀的舞台"] },
	{ artist: EASON, artistEn: EASON_EN, song: "淘汰", lines: ["我说了所有的谎", "你全都相信"] },
	{ artist: EASON, artistEn: EASON_EN, song: "你的背包", lines: ["你的背包，让我走得好缓慢", "终有一天陪着我腐烂"] },
	{ artist: EASON, artistEn: EASON_EN, song: "因为爱情", lines: ["因为爱情，不会轻易悲伤", "所以一切都是幸福的模样"] },
	{ artist: EASON, artistEn: EASON_EN, song: "阴天快乐", lines: ["天空好想下雨，我好想住你隔壁", "傻站在你家楼下，抬起头，数乌云"] },

	// 赵雷
	{ artist: LEI, artistEn: LEI_EN, song: "成都", lines: ["让我掉下眼泪的，不止昨夜的酒", "让我依依不舍的，不止你的温柔"] },
	{ artist: LEI, artistEn: LEI_EN, song: "成都", lines: ["和我在成都的街头走一走", "直到所有的灯都熄灭了也不停留"] },
	{ artist: LEI, artistEn: LEI_EN, song: "成都", lines: ["在那座阴雨的小城里，我从未忘记你", "成都，带不走的，只有你"] },
	{ artist: LEI, artistEn: LEI_EN, song: "南方姑娘", lines: ["南方的小镇，阴雨的冬天没有北方冷", "她不需要臃肿的棉衣，去遮盖她似水的面容"] },
	{ artist: LEI, artistEn: LEI_EN, song: "理想", lines: ["理想今年你几岁", "你总是诱惑着年轻的朋友"] },
	{ artist: LEI, artistEn: LEI_EN, song: "理想", lines: ["理想永远都年轻", "你让我倔强地反抗着命运"] },
	{ artist: LEI, artistEn: LEI_EN, song: "吉姆餐厅", lines: ["离开北京时，正值深秋", "我穿着一件单薄的夹克"] },
	{ artist: LEI, artistEn: LEI_EN, song: "鼓楼", lines: ["我走在鼓楼下面，路在堵着", "我是个沉默不语的，靠着车窗想念你的乘客"] },
	{ artist: LEI, artistEn: LEI_EN, song: "画", lines: ["为寂寞的夜空画上一个月亮", "把我画在那月亮下面歌唱"] },
	{ artist: LEI, artistEn: LEI_EN, song: "三十岁的女人", lines: ["她是个三十岁，至今还没有结婚的女人", "她笑脸中眼旁，已有几道波纹"] },
	{ artist: LEI, artistEn: LEI_EN, song: "阿刁", lines: ["阿刁，住在西藏的某个地方", "秃鹫一样，栖息在山顶上"] },
	{ artist: LEI, artistEn: LEI_EN, song: "阿刁", lines: ["命运多舛，痴迷淡然", "挥别了青春，数不尽的车站"] },
	{ artist: LEI, artistEn: LEI_EN, song: "我们的时光", lines: ["头顶的太阳，燃烧着青春的余热", "它从来不会放弃，照耀着我们"] },
	{ artist: LEI, artistEn: LEI_EN, song: "未给姐姐递出的信", lines: ["我亲爱的姐姐", "你现在可还好"] },
];

function mulberry32(seed: number): () => number {
	let a = seed >>> 0;
	return () => {
		a = (a + 0x6d2b79f5) | 0;
		let t = Math.imul(a ^ (a >>> 15), 1 | a);
		t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
		return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
	};
}

function shuffledIndices(count: number, cycle: number): number[] {
	const rng = mulberry32((cycle * 2654435761 + 1013904223) >>> 0);
	const order = Array.from({ length: count }, (_, i) => i);
	for (let i = count - 1; i > 0; i -= 1) {
		const j = Math.floor(rng() * (i + 1));
		[order[i], order[j]] = [order[j], order[i]];
	}
	return order;
}

export function getDailyLyric(now: Date): LyricExcerpt {
	const epochDays = Math.floor(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate()) / 86400000);
	const count = LYRICS.length;
	const cycle = Math.floor(epochDays / count);
	const pos = epochDays - cycle * count;
	const order = shuffledIndices(count, cycle);
	let index = order[pos];
	if (pos === 0 && count > 1) {
		const previousLast = shuffledIndices(count, cycle - 1)[count - 1];
		if (index === previousLast) index = order[1];
	}
	return LYRICS[index];
}
