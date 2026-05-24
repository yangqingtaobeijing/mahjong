// 国标麻将计分系统 - 88番
import { SUIT, ZI_TYPE, isWindTile, isDragonTile, isSameTileType, isNumberTile } from './tiles.js';
import { tilesToCountMap } from './winDetector.js';

// 番型定义
export const FAN_CATEGORIES = {
  88: [
    { name: '大四喜', desc: '4副风牌刻子', check: checkDaSiXi },
    { name: '大三元', desc: '3副箭牌刻子', check: checkDaSanYuan },
    { name: '九莲宝灯', desc: '同花色1112345678999+任意一张', check: checkJiuLianBaoDeng },
    { name: '绿一色', desc: '由23468条和发组成的胡牌', check: checkLvYiSe },
    { name: '连七对', desc: '同花色相连7对', check: checkLianQiDui },
    { name: '四杠', desc: '4副杠', check: checkSiGang },
    { name: '十三幺', desc: '13种幺九牌+其中一种重复', check: checkShiSanYao },
  ],
  64: [
    { name: '小四喜', desc: '3副风牌刻子+1副风牌雀头', check: checkXiaoSiXi },
    { name: '小三元', desc: '2副箭牌刻子+1副箭牌雀头', check: checkXiaoSanYuan },
    { name: '字一色', desc: '全部由字牌组成', check: checkZiYiSe },
    { name: '四暗刻', desc: '4副暗刻', check: checkSiAnKe },
    { name: '一色双龙会', desc: '同花色123、789各两组+5做雀头', check: checkYiSeShuangLongHui },
  ],
  48: [
    { name: '一色四同顺', desc: '同花色4组相同的顺子', check: checkYiSeSiTongShun },
    { name: '一色四节高', desc: '同花色4组递增的刻子', check: checkYiSeSiJieGao },
  ],
  32: [
    { name: '一色四步高', desc: '同花色4组递增的顺子', check: checkYiSeSiBuGao },
    { name: '三杠', desc: '3副杠', check: checkSanGang },
    { name: '混幺九', desc: '由幺九牌和字牌组成的胡牌', check: checkHunYaoJiu },
  ],
  24: [
    { name: '七对', check: checkQiDui },
    { name: '七星不靠', check: checkQiXingBuKao },
    { name: '全双刻', check: checkQuanShuangKe },
    { name: '清一色', check: checkQingYiSe },
    { name: '一色三同顺', check: checkYiSeSanTongShun },
    { name: '一色三节高', check: checkYiSeSanJieGao },
    { name: '全大', check: checkQuanDa },
    { name: '全中', check: checkQuanZhong },
    { name: '全小', check: checkQuanXiao },
  ],
  16: [
    { name: '清龙', check: checkQingLong },
    { name: '三色双龙会', check: checkSanSeShuangLongHui },
    { name: '一色三步高', check: checkYiSeSanBuGao },
    { name: '全带五', check: checkQuanDaiWu },
    { name: '三同刻', check: checkSanTongKe },
    { name: '三暗刻', check: checkSanAnKe },
  ],
  12: [
    { name: '全不靠', check: checkQuanBuKao },
    { name: '组合龙', check: checkZuHeLong },
    { name: '大于五', check: checkDaYuWu },
    { name: '小于五', check: checkXiaoYuWu },
    { name: '三风刻', check: checkSanFengKe },
  ],
  8: [
    { name: '妙手回春', check: checkMiaoShouHuiChun },
    { name: '海底捞月', check: checkHaiDiLaoYue },
    { name: '杠上开花', check: checkGangShangKaiHua },
    { name: '抢杠和', check: checkQiangGangHu },
    { name: '花牌', check: checkHuaPai },
  ],
  6: [
    { name: '碰碰和', check: checkPengPengHu },
    { name: '混一色', check: checkHunYiSe },
    { name: '三色三同顺', check: checkSanSeSanTongShun },
    { name: '三色三节高', check: checkSanSeSanJieGao },
    { name: '五门齐', check: checkWuMenQi },
    { name: '全求人', check: checkQuanQiuRen },
    { name: '双暗杠', check: checkShuangAnGang },
    { name: '双箭刻', check: checkShuangJianKe },
  ],
  4: [
    { name: '全带幺', check: checkQuanDaiYao },
    { name: '不求人', check: checkBuQiuRen },
    { name: '双明杠', check: checkShuangMingGang },
    { name: '和绝张', check: checkHeJueZhang },
  ],
  2: [
    { name: '箭刻', check: checkJianKe },
    { name: '圈风刻', check: checkQuanFengKe },
    { name: '门风刻', check: checkMenFengKe },
    { name: '门前清', check: checkMenQianQing },
    { name: '平和', check: checkPingHu },
    { name: '四归一', check: checkSiGuiYi },
    { name: '双同刻', check: checkShuangTongKe },
    { name: '双暗刻', check: checkShuangAnKe },
    { name: '暗杠', check: checkAnGang },
    { name: '断幺', check: checkDuanYao },
  ],
  1: [
    { name: '一般高', check: checkYiBanGao },
    { name: '喜相逢', check: checkXiXiangFeng },
    { name: '连六', check: checkLianLiu },
    { name: '老少副', check: checkLaoShaoFu },
    { name: '幺九刻', check: checkYaoJiuKe },
    { name: '明杠', check: checkMingGang },
    { name: '缺一门', check: checkQueYiMen },
    { name: '无字', check: checkWuZi },
    { name: '边张', check: checkBianZhang },
    { name: '坎张', check: checkKanZhang },
    { name: '单钓将', check: checkDanDiaoJiang },
    { name: '自摸', check: checkZiMo },
  ],
};

// 计分函数
export function calculateScore(hand, melds, winType, context = {}) {
  const results = [];
  let totalFan = 0;

  for (const [fan, checks] of Object.entries(FAN_CATEGORIES)) {
    for (const check of checks) {
      const result = check.check(hand, melds, winType, context);
      if (result) {
        results.push({ name: check.name, fan: parseInt(fan), desc: check.desc || '' });
        totalFan += parseInt(fan);
      }
    }
  }

  // 国标规则：最低8番起胡
  if (totalFan < 8 && !context.isTutorial) {
    return { valid: false, totalFan: 0, results: [], message: '不够8番，无法胡牌' };
  }

  return { valid: true, totalFan, results };
}

// === 88番检测函数 ===

function checkDaSiXi(hand, melds) {
  // 大四喜：4副风牌刻子
  const windKongs = melds.filter(m =>
    (m.type === 'pong' || m.type === 'open_kong' || m.type === 'concealed_kong' || m.type === 'upgrade_kong') &&
    isWindTile(m.tiles[0])
  );
  if (windKongs.length < 3) return false;

  // 检查手牌中是否还有风牌刻子
  const countMap = tilesToCountMap(hand);
  const windRanks = [ZI_TYPE.DONG, ZI_TYPE.NAN, ZI_TYPE.XI, ZI_TYPE.BEI];
  let windSetsInHand = 0;
  for (const rank of windRanks) {
    const key = `zi_${rank}`;
    if (countMap[key] >= 3) windSetsInHand++;
  }

  return windKongs.length + windSetsInHand >= 4;
}

function checkDaSanYuan(hand, melds) {
  // 大三元：3副箭牌刻子
  const dragonKongs = melds.filter(m =>
    (m.type === 'pong' || m.type === 'open_kong' || m.type === 'concealed_kong' || m.type === 'upgrade_kong') &&
    isDragonTile(m.tiles[0])
  );

  const countMap = tilesToCountMap(hand);
  const dragonRanks = [ZI_TYPE.ZHONG, ZI_TYPE.FA, ZI_TYPE.BAI];
  let dragonSetsInHand = 0;
  for (const rank of dragonRanks) {
    const key = `zi_${rank}`;
    if (countMap[key] >= 3) dragonSetsInHand++;
  }

  return dragonKongs.length + dragonSetsInHand >= 3;
}

function checkJiuLianBaoDeng(hand, melds) {
  // 九莲宝灯
  if (melds.length > 0) return false;
  if (hand.length !== 14) return false;

  // 必须是同花色
  const suit = hand[0].suit;
  if (hand.some(t => t.suit !== suit || t.isZi)) return false;

  const countMap = {};
  for (const tile of hand) {
    countMap[tile.rank] = (countMap[tile.rank] || 0) + 1;
  }

  // 必须包含1112345678999
  const required = { 1: 3, 2: 1, 3: 1, 4: 1, 5: 1, 6: 1, 7: 1, 8: 1, 9: 3 };
  for (const [rank, count] of Object.entries(required)) {
    if ((countMap[rank] || 0) < count) return false;
  }

  return true;
}

function checkLvYiSe(hand, melds) {
  // 绿一色
  const allTiles = [...hand];
  for (const meld of melds) {
    allTiles.push(...meld.tiles);
  }

  const greenTiles = ['tiao_2', 'tiao_3', 'tiao_4', 'tiao_6', 'tiao_8', 'zi_fa'];
  return allTiles.every(t => {
    const key = t.isZi ? `zi_${t.rank}` : `${t.suit}_${t.rank}`;
    return greenTiles.includes(key);
  });
}

function checkLianQiDui(hand, melds) {
  // 连七对
  if (melds.length > 0) return false;
  if (hand.length !== 14) return false;

  const suit = hand[0].suit;
  if (hand.some(t => t.suit !== suit || t.isZi)) return false;

  const sorted = [...hand].sort((a, b) => a.rank - b.rank);
  for (let i = 0; i < 7; i++) {
    if (sorted[i * 2].rank !== sorted[i * 2 + 1].rank) return false;
    if (i < 6 && sorted[i * 2].rank + 1 !== sorted[(i + 1) * 2].rank) return false;
  }

  return true;
}

function checkSiGang(hand, melds) {
  return melds.filter(m => ['open_kong', 'concealed_kong', 'upgrade_kong'].includes(m.type)).length >= 4;
}

function checkShiSanYao(hand, melds) {
  if (melds.length > 0) return false;
  if (hand.length !== 14) return false;

  const required = ['wan_1', 'wan_9', 'tiao_1', 'tiao_9', 'tong_1', 'tong_9',
    'zi_dong', 'zi_nan', 'zi_xi', 'zi_bei', 'zi_zhong', 'zi_fa', 'zi_bai'];

  const countMap = tilesToCountMap(hand);
  for (const key of required) {
    if (!countMap[key] || countMap[key] < 1) return false;
  }

  return Object.values(countMap).some(c => c === 2);
}

// === 64番检测函数 ===

function checkXiaoSiXi(hand, melds) {
  const windSets = melds.filter(m =>
    (m.type === 'pong' || m.type.includes('kong')) && isWindTile(m.tiles[0])
  ).length;

  const countMap = tilesToCountMap(hand);
  const windRanks = [ZI_TYPE.DONG, ZI_TYPE.NAN, ZI_TYPE.XI, ZI_TYPE.BEI];
  let windSetsInHand = 0;
  let windPair = false;

  for (const rank of windRanks) {
    const key = `zi_${rank}`;
    if (countMap[key] >= 3) windSetsInHand++;
    if (countMap[key] === 2) windPair = true;
  }

  return windSets + windSetsInHand >= 3 && windPair;
}

function checkXiaoSanYuan(hand, melds) {
  const dragonSets = melds.filter(m =>
    (m.type === 'pong' || m.type.includes('kong')) && isDragonTile(m.tiles[0])
  ).length;

  const countMap = tilesToCountMap(hand);
  const dragonRanks = [ZI_TYPE.ZHONG, ZI_TYPE.FA, ZI_TYPE.BAI];
  let dragonSetsInHand = 0;
  let dragonPair = false;

  for (const rank of dragonRanks) {
    const key = `zi_${rank}`;
    if (countMap[key] >= 3) dragonSetsInHand++;
    if (countMap[key] === 2) dragonPair = true;
  }

  return dragonSets + dragonSetsInHand >= 2 && dragonPair;
}

function checkZiYiSe(hand, melds) {
  const allTiles = [...hand];
  for (const meld of melds) allTiles.push(...meld.tiles);
  return allTiles.every(t => t.isZi);
}

function checkSiAnKe(hand, melds) {
  const concealedKongs = melds.filter(m => m.type === 'concealed_kong').length;
  const countMap = tilesToCountMap(hand);
  let tripletsInHand = Object.values(countMap).filter(c => c >= 3).length;
  return concealedKongs + tripletsInHand >= 4;
}

function checkYiSeShuangLongHui(hand, melds) {
  if (melds.length > 0) return false;
  if (hand.length !== 14) return false;

  const suit = hand[0].suit;
  if (hand.some(t => t.suit !== suit || t.isZi)) return false;

  const countMap = {};
  for (const tile of hand) countMap[tile.rank] = (countMap[tile.rank] || 0) + 1;

  return countMap[1] >= 2 && countMap[2] >= 2 && countMap[3] >= 2 &&
    countMap[5] >= 2 && countMap[7] >= 2 && countMap[8] >= 2 && countMap[9] >= 2;
}

// === 简化实现：后续番型 ===

function checkYiSeSiTongShun() { return false; }
function checkYiSeSiJieGao() { return false; }
function checkYiSeSiBuGao() { return false; }
function checkSanGang(hand, melds) {
  return melds.filter(m => ['open_kong', 'concealed_kong', 'upgrade_kong'].includes(m.type)).length >= 3;
}
function checkHunYaoJiu(hand, melds) {
  const allTiles = [...hand];
  for (const meld of melds) allTiles.push(...meld.tiles);
  return allTiles.every(t => t.isYaoJiu) && allTiles.some(t => t.isZi) && allTiles.some(t => !t.isZi);
}
function checkQiDui(hand, melds) {
  if (melds.length > 0 || hand.length !== 14) return false;
  const countMap = tilesToCountMap(hand);
  return Object.values(countMap).every(c => c % 2 === 0) && Object.values(countMap).reduce((s, c) => s + c / 2, 0) === 7;
}
function checkQiXingBuKao() { return false; }
function checkQuanShuangKe() { return false; }
function checkQingYiSe(hand, melds) {
  const allTiles = [...hand];
  for (const meld of melds) allTiles.push(...meld.tiles);
  const suit = allTiles[0].suit;
  return allTiles.every(t => t.suit === suit && !t.isZi);
}
function checkYiSeSanTongShun() { return false; }
function checkYiSeSanJieGao() { return false; }
function checkQuanDa(hand, melds) {
  const allTiles = [...hand];
  for (const meld of melds) allTiles.push(...meld.tiles);
  return allTiles.every(t => !t.isZi && t.rank >= 7);
}
function checkQuanZhong(hand, melds) {
  const allTiles = [...hand];
  for (const meld of melds) allTiles.push(...meld.tiles);
  return allTiles.every(t => !t.isZi && t.rank >= 4 && t.rank <= 6);
}
function checkQuanXiao(hand, melds) {
  const allTiles = [...hand];
  for (const meld of melds) allTiles.push(...meld.tiles);
  return allTiles.every(t => !t.isZi && t.rank <= 3);
}
function checkQingLong() { return false; }
function checkSanSeShuangLongHui() { return false; }
function checkYiSeSanBuGao() { return false; }
function checkQuanDaiWu() { return false; }
function checkSanTongKe() { return false; }
function checkSanAnKe(hand, melds) {
  const concealedKongs = melds.filter(m => m.type === 'concealed_kong').length;
  const countMap = tilesToCountMap(hand);
  let tripletsInHand = Object.values(countMap).filter(c => c >= 3).length;
  return concealedKongs + tripletsInHand >= 3;
}
function checkQuanBuKao() { return false; }
function checkZuHeLong() { return false; }
function checkDaYuWu(hand, melds) {
  const allTiles = [...hand];
  for (const meld of melds) allTiles.push(...meld.tiles);
  return allTiles.every(t => !t.isZi && t.rank > 5);
}
function checkXiaoYuWu(hand, melds) {
  const allTiles = [...hand];
  for (const meld of melds) allTiles.push(...meld.tiles);
  return allTiles.every(t => !t.isZi && t.rank < 5);
}
function checkSanFengKe(hand, melds) {
  const windSets = melds.filter(m => (m.type === 'pong' || m.type.includes('kong')) && isWindTile(m.tiles[0])).length;
  const countMap = tilesToCountMap(hand);
  let windSetsInHand = 0;
  for (const rank of [ZI_TYPE.DONG, ZI_TYPE.NAN, ZI_TYPE.XI, ZI_TYPE.BEI]) {
    if ((countMap[`zi_${rank}`] || 0) >= 3) windSetsInHand++;
  }
  return windSets + windSetsInHand >= 3;
}
function checkMiaoShouHuiChun(hand, melds, winType, ctx) { return ctx?.isLastTile && winType === 'self_draw'; }
function checkHaiDiLaoYue(hand, melds, winType, ctx) { return ctx?.isLastTile && winType === 'discard'; }
function checkGangShangKaiHua(hand, melds, winType, ctx) { return ctx?.afterKong && winType === 'self_draw'; }
function checkQiangGangHu(hand, melds, winType, ctx) { return ctx?.isRobbingKong; }
function checkHuaPai() { return false; }
function checkPengPengHu(hand, melds) {
  const allMelds = melds.filter(m => m.type === 'pong' || m.type.includes('kong'));
  const countMap = tilesToCountMap(hand);
  const triplets = Object.values(countMap).filter(c => c >= 3).length;
  return allMelds.length + triplets >= 4;
}
function checkHunYiSe(hand, melds) {
  const allTiles = [...hand];
  for (const meld of melds) allTiles.push(...meld.tiles);
  const hasZi = allTiles.some(t => t.isZi);
  const suits = new Set(allTiles.filter(t => !t.isZi).map(t => t.suit));
  return hasZi && suits.size === 1;
}
function checkSanSeSanTongShun() { return false; }
function checkSanSeSanJieGao() { return false; }
function checkWuMenQi(hand, melds) {
  const allTiles = [...hand];
  for (const meld of melds) allTiles.push(...meld.tiles);
  const suits = new Set(allTiles.filter(t => !t.isZi).map(t => t.suit));
  const hasZi = allTiles.some(t => t.isZi);
  return suits.size === 3 && hasZi;
}
function checkQuanQiuRen(hand, melds, winType, ctx) {
  return melds.length >= 3 && winType === 'discard';
}
function checkShuangAnGang(hand, melds) {
  return melds.filter(m => m.type === 'concealed_kong').length >= 2;
}
function checkShuangJianKe(hand, melds) {
  const dragonSets = melds.filter(m => (m.type === 'pong' || m.type.includes('kong')) && isDragonTile(m.tiles[0])).length;
  const countMap = tilesToCountMap(hand);
  let dragonSetsInHand = 0;
  for (const rank of [ZI_TYPE.ZHONG, ZI_TYPE.FA, ZI_TYPE.BAI]) {
    if ((countMap[`zi_${rank}`] || 0) >= 3) dragonSetsInHand++;
  }
  return dragonSets + dragonSetsInHand >= 2;
}
function checkQuanDaiYao(hand, melds) {
  const allTiles = [...hand];
  for (const meld of melds) allTiles.push(...meld.tiles);
  return allTiles.every(t => t.isYaoJiu);
}
function checkBuQiuRen(hand, melds, winType) {
  return melds.length === 0 && winType === 'self_draw';
}
function checkShuangMingGang(hand, melds) {
  return melds.filter(m => m.type === 'open_kong' || m.type === 'upgrade_kong').length >= 2;
}
function checkHeJueZhang() { return false; }
function checkJianKe(hand, melds) {
  const dragonSets = melds.filter(m => (m.type === 'pong' || m.type.includes('kong')) && isDragonTile(m.tiles[0])).length;
  const countMap = tilesToCountMap(hand);
  let dragonSetsInHand = 0;
  for (const rank of [ZI_TYPE.ZHONG, ZI_TYPE.FA, ZI_TYPE.BAI]) {
    if ((countMap[`zi_${rank}`] || 0) >= 3) dragonSetsInHand++;
  }
  return dragonSets + dragonSetsInHand >= 1;
}
function checkQuanFengKe() { return false; }
function checkMenFengKe() { return false; }
function checkMenQianQing(hand, melds) { return melds.length === 0; }
function checkPingHu(hand, melds) {
  if (melds.length > 0) return false;
  const countMap = tilesToCountMap(hand);
  const pairs = Object.values(countMap).filter(c => c === 2).length;
  return pairs === 1;
}
function checkSiGuiYi() { return false; }
function checkShuangTongKe() { return false; }
function checkShuangAnKe(hand, melds) {
  const countMap = tilesToCountMap(hand);
  const concealedKongs = melds.filter(m => m.type === 'concealed_kong').length;
  const triplets = Object.values(countMap).filter(c => c >= 3).length;
  return concealedKongs + triplets >= 2;
}
function checkAnGang(hand, melds) {
  return melds.some(m => m.type === 'concealed_kong');
}
function checkDuanYao(hand, melds) {
  const allTiles = [...hand];
  for (const meld of melds) allTiles.push(...meld.tiles);
  return allTiles.every(t => !t.isYaoJiu);
}
function checkYiBanGao() { return false; }
function checkXiXiangFeng() { return false; }
function checkLianLiu() { return false; }
function checkLaoShaoFu() { return false; }
function checkYaoJiuKe(hand, melds) {
  return melds.some(m => m.type === 'pong' && m.tiles[0].isYaoJiu);
}
function checkMingGang(hand, melds) {
  return melds.some(m => m.type === 'open_kong' || m.type === 'upgrade_kong');
}
function checkQueYiMen(hand, melds) {
  const allTiles = [...hand];
  for (const meld of melds) allTiles.push(...meld.tiles);
  const suits = new Set(allTiles.filter(t => !t.isZi).map(t => t.suit));
  return suits.size <= 2;
}
function checkWuZi(hand, melds) {
  const allTiles = [...hand];
  for (const meld of melds) allTiles.push(...meld.tiles);
  return allTiles.every(t => !t.isZi);
}
function checkBianZhang() { return false; }
function checkKanZhang() { return false; }
function checkDanDiaoJiang(hand, melds) { return melds.length === 0 && hand.length === 2; }
function checkZiMo(hand, melds, winType) { return winType === 'self_draw'; }
