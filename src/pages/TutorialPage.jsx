import { useState } from 'react'
import TileComponent from '../components/TileComponent'
import { createFullTileSet, SUIT, ZI_TYPE, SUIT_NAMES, ZI_NAMES } from '../core/tiles'

const chapters = [
  {
    title: '第1章：认识麻将牌',
    content: 'intro',
  },
  {
    title: '第2章：基本规则',
    content: 'rules',
  },
  {
    title: '第3章：胡牌牌型',
    content: 'winning',
  },
  {
    title: '第4章：国标番型',
    content: 'scoring',
  },
  {
    title: '第5章：实战练习',
    content: 'practice',
  },
]

function IntroChapter() {
  const [selectedType, setSelectedType] = useState(null)

  const wanTiles = Array.from({ length: 9 }, (_, i) => ({
    id: `wan_${i}`, suit: SUIT.WAN, rank: i + 1, isZi: false, isYaoJiu: i === 0 || i === 8,
  }))
  const tiaoTiles = Array.from({ length: 9 }, (_, i) => ({
    id: `tiao_${i}`, suit: SUIT.TIAO, rank: i + 1, isZi: false, isYaoJiu: i === 0 || i === 8,
  }))
  const tongTiles = Array.from({ length: 9 }, (_, i) => ({
    id: `tong_${i}`, suit: SUIT.TONG, rank: i + 1, isZi: false, isYaoJiu: i === 0 || i === 8,
  }))
  const ziTiles = Object.entries(ZI_TYPE).map(([key, val], i) => ({
    id: `zi_${i}`, suit: SUIT.ZI, rank: val, isZi: true, isYaoJiu: true,
  }))

  const descriptions = {
    wan: '万子牌：从一万到九万，共9种，每种4张，合计36张。',
    tiao: '条子牌：从一条到九条，共9种，每种4张，合计36张。一条通常画成一只鸟。',
    tong: '筒子牌：从一筒到九筒，共9种，每种4张，合计36张。',
    zi: '字牌：包括风牌（东南西北）和箭牌（中发白），共7种，每种4张，合计28张。',
  }

  return (
    <div>
      <h3 style={{ color: '#f9a825', marginBottom: '16px' }}>麻将牌的组成</h3>
      <p style={{ marginBottom: '20px', color: 'rgba(255,255,255,0.8)' }}>
        国标麻将共136张牌，分为数牌和字牌两大类。点击下面的牌组查看详情。
      </p>

      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', marginBottom: '20px' }}>
        {[
          { name: '万子', type: 'wan', tiles: wanTiles, color: '#333' },
          { name: '条子', type: 'tiao', tiles: tiaoTiles, color: '#2e7d32' },
          { name: '筒子', type: 'tong', tiles: tongTiles, color: '#1565c0' },
          { name: '字牌', type: 'zi', tiles: ziTiles, color: '#d32f2f' },
        ].map(group => (
          <div
            key={group.type}
            onClick={() => setSelectedType(group.type === selectedType ? null : group.type)}
            style={{
              background: selectedType === group.type ? 'rgba(255,255,255,0.15)' : 'rgba(255,255,255,0.05)',
              border: selectedType === group.type ? '2px solid #f9a825' : '2px solid transparent',
              borderRadius: '12px',
              padding: '16px',
              cursor: 'pointer',
              textAlign: 'center',
              minWidth: '120px',
            }}
          >
            <div style={{ color: group.color, fontSize: '18px', fontWeight: 'bold', marginBottom: '8px' }}>
              {group.name}
            </div>
            <div style={{ fontSize: '12px', color: '#888' }}>
              {group.type === 'zi' ? '28张' : '36张'}
            </div>
          </div>
        ))}
      </div>

      {selectedType && (
        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: '12px',
          padding: '16px',
          animation: 'fadeIn 0.3s ease',
        }}>
          <p style={{ marginBottom: '12px', color: '#aaa' }}>{descriptions[selectedType]}</p>
          <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
            {(selectedType === 'wan' ? wanTiles :
              selectedType === 'tiao' ? tiaoTiles :
                selectedType === 'tong' ? tongTiles : ziTiles
            ).map(tile => (
              <TileComponent key={tile.id} tile={tile} size="small" />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}

function RulesChapter() {
  return (
    <div>
      <h3 style={{ color: '#f9a825', marginBottom: '16px' }}>基本规则</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {[
          { title: '游戏流程', desc: '4人游戏，每人初始13张牌。庄家多摸1张（14张）。轮流摸牌、出牌，直到有人胡牌或流局。' },
          { title: '吃', desc: '只有下家可以吃。用自己手牌中的2张，加上上家打出的1张，组成一个顺子（如：3万4万+5万）。' },
          { title: '碰', desc: '任何人打出的牌，如果你手中有2张相同的，可以碰。碰后需要打出一张牌。' },
          { title: '杠', desc: '明杠：手中有3张相同，别人打出第4张。暗杠：自己摸到4张相同。加杠：已经碰了，又摸到第4张。' },
          { title: '胡牌', desc: '手中的牌组成4个面子（顺子或刻子）+ 1个雀头（对子），即可胡牌。也可以胡七对、十三幺等特殊牌型。' },
        ].map((rule, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '8px',
            padding: '16px',
          }}>
            <div style={{ color: '#f9a825', fontWeight: 'bold', marginBottom: '8px', fontSize: '16px' }}>
              {rule.title}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.6' }}>
              {rule.desc}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function WinningChapter() {
  return (
    <div>
      <h3 style={{ color: '#f9a825', marginBottom: '16px' }}>胡牌牌型</h3>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {[
          {
            title: '基本胡牌（4面子+1雀头）',
            desc: '最常见的胡牌方式。面子可以是顺子（3张连续数牌）或刻子（3张相同牌）。',
            example: '1万2万3万 + 5条6条7条 + 8筒8筒8筒 + 东东东 + 9万9万',
          },
          {
            title: '七对子',
            desc: '7个不同的对子组成。',
            example: '1万1万 + 3条3条 + 5筒5筒 + 7万7万 + 东东 + 发发 + 9条9条',
          },
          {
            title: '十三幺',
            desc: '由13种幺九牌各一张，加其中任意一张重复组成。',
            example: '1万9万1条9条1筒9筒东南西北中发白 + 其中一张重复',
          },
        ].map((win, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '8px',
            padding: '16px',
          }}>
            <div style={{ color: '#f9a825', fontWeight: 'bold', marginBottom: '8px', fontSize: '16px' }}>
              {win.title}
            </div>
            <div style={{ color: 'rgba(255,255,255,0.8)', lineHeight: '1.6', marginBottom: '8px' }}>
              {win.desc}
            </div>
            <div style={{ color: '#4caf50', fontSize: '14px', fontFamily: 'monospace' }}>
              示例：{win.example}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function ScoringChapter() {
  const fanGroups = [
    { fan: 88, names: ['大四喜', '大三元', '九莲宝灯', '绿一色', '连七对', '四杠', '十三幺'] },
    { fan: 64, names: ['小四喜', '小三元', '字一色', '四暗刻', '一色双龙会'] },
    { fan: 24, names: ['七对', '清一色', '全大', '全中', '全小'] },
    { fan: 16, names: ['清龙', '全带五', '三同刻', '三暗刻'] },
    { fan: 8, names: ['妙手回春', '海底捞月', '杠上开花'] },
    { fan: 6, names: ['碰碰和', '混一色', '五门齐'] },
    { fan: 2, names: ['箭刻', '门前清', '平和', '断幺'] },
    { fan: 1, names: ['一般高', '喜相逢', '连六', '缺一门', '自摸'] },
  ]

  return (
    <div>
      <h3 style={{ color: '#f9a825', marginBottom: '16px' }}>国标番型（88番计分）</h3>
      <p style={{ marginBottom: '20px', color: 'rgba(255,255,255,0.8)' }}>
        国标麻将采用88番计分系统，不同的胡牌方式对应不同的番数。最低8番起胡。
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {fanGroups.map((group, i) => (
          <div key={i} style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: '8px',
            padding: '12px 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
          }}>
            <div style={{
              background: 'rgba(249,168,37,0.2)',
              borderRadius: '8px',
              padding: '8px 12px',
              minWidth: '60px',
              textAlign: 'center',
            }}>
              <div style={{ color: '#f9a825', fontWeight: 'bold', fontSize: '18px' }}>{group.fan}</div>
              <div style={{ color: '#888', fontSize: '12px' }}>番</div>
            </div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {group.names.map((name, j) => (
                <span key={j} style={{
                  background: 'rgba(255,255,255,0.1)',
                  padding: '4px 10px',
                  borderRadius: '16px',
                  fontSize: '13px',
                }}>
                  {name}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

function PracticeChapter({ onStartGame }) {
  return (
    <div>
      <h3 style={{ color: '#f9a825', marginBottom: '16px' }}>实战练习</h3>
      <p style={{ marginBottom: '20px', color: 'rgba(255,255,255,0.8)', lineHeight: '1.6' }}>
        学习了基本规则后，最好的方式就是实战练习！
        <br /><br />
        新手模式下，每一步都会有提示告诉你该怎么操作。AI也比较弱，适合练习。
        <br /><br />
        准备好了吗？点击下面的按钮开始你的第一局麻将！
      </p>

      <div style={{ textAlign: 'center', marginTop: '30px' }}>
        <button
          className="btn btn-primary"
          style={{ fontSize: '18px', padding: '14px 40px' }}
          onClick={() => onStartGame({ difficulty: 'beginner' })}
        >
          开始新手对局
        </button>
      </div>
    </div>
  )
}

export default function TutorialPage({ onGoHome, onStartGame }) {
  const [currentChapter, setCurrentChapter] = useState(0)

  const chapterComponents = [
    <IntroChapter />,
    <RulesChapter />,
    <WinningChapter />,
    <ScoringChapter />,
    <PracticeChapter onStartGame={onStartGame} />,
  ]

  return (
    <div style={{
      width: '100%',
      height: '100%',
      display: 'flex',
      background: '#071a0c',
    }}>
      {/* 侧边栏 */}
      <div style={{
        width: '220px',
        background: 'rgba(0,0,0,0.5)',
        padding: '20px 0',
        borderRight: '1px solid rgba(255,255,255,0.1)',
      }}>
        <div style={{
          padding: '0 16px 20px',
          borderBottom: '1px solid rgba(255,255,255,0.1)',
          marginBottom: '12px',
        }}>
          <button className="btn btn-secondary" style={{ width: '100%', padding: '8px', fontSize: '14px' }} onClick={onGoHome}>
            返回主页
          </button>
        </div>

        {chapters.map((ch, i) => (
          <div
            key={i}
            onClick={() => setCurrentChapter(i)}
            style={{
              padding: '12px 16px',
              cursor: 'pointer',
              background: currentChapter === i ? 'rgba(249,168,37,0.15)' : 'transparent',
              borderLeft: currentChapter === i ? '3px solid #f9a825' : '3px solid transparent',
              color: currentChapter === i ? '#f9a825' : '#aaa',
              fontSize: '14px',
              transition: 'all 0.2s ease',
            }}
          >
            {ch.title}
          </div>
        ))}
      </div>

      {/* 内容区 */}
      <div style={{
        flex: 1,
        padding: '32px',
        overflow: 'auto',
      }}>
        <h2 style={{ color: '#fff', marginBottom: '24px', fontSize: '24px' }}>
          {chapters[currentChapter].title}
        </h2>

        <div style={{ animation: 'fadeIn 0.3s ease' }}>
          {chapterComponents[currentChapter]}
        </div>

        {/* 翻页按钮 */}
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          marginTop: '40px',
          paddingTop: '20px',
          borderTop: '1px solid rgba(255,255,255,0.1)',
        }}>
          <button
            className="btn btn-secondary"
            onClick={() => setCurrentChapter(Math.max(0, currentChapter - 1))}
            disabled={currentChapter === 0}
          >
            上一章
          </button>
          <button
            className="btn btn-primary"
            onClick={() => setCurrentChapter(Math.min(chapters.length - 1, currentChapter + 1))}
            disabled={currentChapter === chapters.length - 1}
          >
            下一章
          </button>
        </div>
      </div>
    </div>
  )
}
