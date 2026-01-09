import './App.css';
import React, { useState } from 'react';

export default function ROISelfAssessment() {
  const [currentStep, setCurrentStep] = useState(0);
  const [activityName, setActivityName] = useState('');
  const [scores, setScores] = useState({
    A: Array(5).fill(null),
    B: Array(5).fill(null),
    C: Array(5).fill(null),
    D: Array(5).fill(null),
    E: Array(3).fill(null)
  });

  const questions = {
    A: [
      '이 활동으로 수입을 얻고 있거나 얻을 계획이 있다',
      '이 활동을 하지 않으면 경제적 불이익이 생긴다',
      '이 활동의 성과를 타인(고객, 상사 등)에게 증명해야 한다',
      '이 활동에 들이는 시간/돈에 대한 회수 압박을 느낀다',
      '이 활동을 "일"이나 "의무"로 느낀다'
    ],
    B: [
      '지난 3개월간 이 활동에서 더 나아지고 싶어서 새로운 시도를 했다',
      '현재 상태에 만족하지 않고 개선점을 찾으려 노력했다',
      '이 활동에 대한 학습/연구/정보 탐색을 적극적으로 했다',
      '"더 잘하고 싶다"는 생각이 자주 들었고, 실제로 행동했다',
      '과거의 나와 비교하며 발전을 의식했다'
    ],
    C: [
      { text: '이 활동을 시작한 시점이 명확하다', points: [2, 1, 0] },
      { text: '정량적 지표(숫자, 사진, 기록 등)가 3개 이상 있다', points: [2, 1, 0] },
      { text: '3개월 이상의 기간 동안 기록이 연속적으로 존재한다', points: [2, 1, 0] },
      { text: '과거 데이터와 현재를 비교할 수 있다', points: [2, 1, 0] },
      { text: '측정/기록 자체를 회피하지 않았다', points: [2, 1, 0] }
    ],
    D: [
      { text: '3개월 전과 비교하여 명확한 성장이 있다', points: [2, 1, 0] },
      { text: '6개월 전과 비교하여 명확한 성장이 있다', points: [2, 1, 0] },
      { text: '1년 전과 비교하여 명확한 성장이 있다', points: [2, 1, 0] },
      { text: '정체나 퇴보가 있었다면 명확한 맥락을 정량화할 수 있다', points: [2, 1, 0] },
      { text: '변화의 원인(효과적/비효과적 방법)을 파악할 수 있다', points: [2, 1, 0] }
    ],
    E: [
      { text: '"이 활동에서 성장하고 싶다"고 주변에 말했거나 생각했다', points: [2, 1, 0] },
      { text: '실제 행동(시간 투자, 노력)이 선언과 일치했다', points: [2, 1, 0] },
      { text: '"바빠서", "다음에" 같은 변명을 반복하지 않았다', points: [2, 1, 0] }
    ]
  };

  const sectionTitles = {
    A: '수익화 압박 측정',
    B: '성장 의도 측정 (과거 행동 기준)',
    C: '기록 존재 여부',
    D: '변화 분석',
    E: '선언-행동 일치도'
  };

  const handleScore = (section, index, value) => {
    const newScores = { ...scores };
    newScores[section][index] = value;
    setScores(newScores);
  };

  const getSectionTotal = (section) => {
    return scores[section].reduce((sum, score) => sum + (score || 0), 0);
  };

  const getQuadrant = () => {
    const aScore = getSectionTotal('A');
    const bScore = getSectionTotal('B');
    
    if (aScore >= 7 && bScore >= 7) return '비즈니스 성장';
    if (aScore >= 7 && bScore < 7) return '유지형 일';
    if (aScore < 7 && bScore >= 7) return '순수 성장 탐구';
    return '순수 향유';
  };

  const getJudgment = () => {
    const quadrant = getQuadrant();
    const aScore = getSectionTotal('A');
    const bScore = getSectionTotal('B');
    const cScore = getSectionTotal('C');
    const dScore = getSectionTotal('D');
    const eScore = getSectionTotal('E');
    const roiScore = cScore + dScore + eScore;

    if (quadrant === '순수 성장 탐구') {
      if (roiScore >= 20) return { type: '🌟 건강한 성장형', desc: '이상적. 즐기면서 성장 중', color: 'bg-green-100 border-green-500' };
      if (roiScore >= 13) return { type: '📈 성장 가능형', desc: '개선 여지 있음. 기록 강화 필요', color: 'bg-blue-100 border-blue-500' };
      if (roiScore >= 7) return { type: '⚠️ 메타인지 부족형', desc: '의도는 있지만 방법 개선 필요', color: 'bg-yellow-100 border-yellow-500' };
      return { type: '🚫 회피형', desc: '선언만 하고 행동 부족. 근본 원인 분석 필요', color: 'bg-red-100 border-red-500' };
    }
    
    if (quadrant === '순수 향유') {
      const cdScore = cScore + dScore;
      if (cdScore >= 8) return { type: '💚 건강한 향유형', desc: '완벽. 즐기는 것 자체가 목적', color: 'bg-purple-100 border-purple-500' };
      return { type: '💭 무심형', desc: '향유하되 의식 없음. 괜찮지만 가끔 확인 권장', color: 'bg-gray-100 border-gray-500' };
    }

    if (quadrant === '비즈니스 성장') {
      if (roiScore >= 20) return { type: '💼 프로형', desc: '수익+성장 병행. 지속 가능', color: 'bg-indigo-100 border-indigo-500' };
      if (roiScore >= 13) return { type: '📊 개선 필요형', desc: 'ROI 측정 체계 강화 필요', color: 'bg-blue-100 border-blue-500' };
      return { type: '⚠️ 번아웃 위험형', desc: '압박만 있고 성과 불명확. 위험', color: 'bg-red-100 border-red-500' };
    }

    if (cScore >= 7) return { type: '⚙️ 안정형', desc: '현상 유지 잘하고 있음', color: 'bg-green-100 border-green-500' };
    return { type: '⚠️ 관리 필요형', desc: '기본 관리 강화 필요', color: 'bg-yellow-100 border-yellow-500' };
  };

  const getGuide = () => {
    const judgment = getJudgment();
    
    const guides = {
      '🌟 건강한 성장형': {
        status: ['순수하게 즐기면서 성장하고 있음', '기록도 충실, 변화도 명확', '이상적인 상태 ⭐'],
        actions: [
          '현재 방식 유지: 지금 하는 방식이 최적',
          '분기별 회고: 3개월마다 체크리스트로 확인',
          '패턴 파악: 무엇이 효과적이었는지 기록',
          '다른 영역 적용: 이 방식을 다른 활동에도 적용'
        ],
        warnings: ['성과에 집착하지 말 것 (향유 → 압박 변질 위험)', 'ROI 회고는 분기별 1회로 충분']
      },
      '📈 성장 가능형': {
        status: ['성장하고 있지만 기록이 불완전', '또는 기록은 있지만 변화가 명확하지 않음'],
        actions: [
          '기록 시스템 강화: 주 1회 10분 체크 루틴',
          '지표 명확화: 측정할 지표 3개 정하기',
          '비교 시점 설정: 3개월 전 데이터와 비교'
        ],
        warnings: ['다음 분기 목표: C 점수 8점 이상, D 점수 7점 이상']
      },
      '⚠️ 메타인지 부족형': {
        status: ['성장하고 싶은 의도는 있음', '하지만 기록 부족 + 변화 불명확', '교정 가능성 가장 높은 그룹 ⭐'],
        actions: [
          '1단계: 왜 기록하지 않았는지 분석',
          '2단계: 초간단 기록 시스템 구축',
          '3단계: 2주 실험 후 변화 발견',
          '4단계: 멘토/친구 찾기'
        ],
        warnings: ['다음 분기 목표: C 점수 7점 이상, 기록 습관 형성']
      },
      '🚫 회피형': {
        status: ['"성장하고 싶다"고 말은 하지만', '실제 행동(기록, 측정, 실행)은 없음', '선언과 행동의 심각한 괴리'],
        actions: [
          '경로 A: 근본 원인 찾기 (왜 측정이 두려운가?)',
          '경로 B: 솔직하게 "지금은 안 할래" 인정',
          '초저부담 시작: 하루 5분, 단 1개 지표만'
        ],
        warnings: ['6개월 이상 지속 시 전문가 상담 고려']
      },
      '💚 건강한 향유형': {
        status: ['성장 의도 없이 순수하게 즐김', '완벽한 상태 ✓'],
        actions: [
          '이대로 계속: 바꿀 필요 없음',
          '죄책감 버리기: "생산적이지 않다"는 압박 무시',
          '가끔 확인: 즐거움이 줄었다면 원인 파악'
        ],
        warnings: []
      },
      '💼 프로형': {
        status: ['비즈니스이면서 성장도 함께', '지속 가능한 구조'],
        actions: [
          '번아웃 방지: 휴식 시간 확보',
          '효율 극대화: 시간당 단가 추적',
          '분기별 전략 회고'
        ],
        warnings: []
      }
    };

    return guides[judgment.type] || guides['💚 건강한 향유형'];
  };

  const allAnswered = () => {
    return Object.values(scores).every(section => 
      section.every(score => score !== null)
    );
  };

  const renderQuestion = (section, index) => {
    const q = questions[section][index];
    const isAB = section === 'A' || section === 'B';
    
    return (
      <div key={index} className="mb-6 p-4 bg-gray-50 rounded-lg">
        <p className="text-sm md:text-base font-medium text-gray-800 mb-3">
          {section}{index + 1}. {isAB ? q : q.text}
        </p>
        <div className="flex flex-wrap gap-2">
          {isAB ? (
            <>
              <button
                onClick={() => handleScore(section, index, 0)}
                className={`flex-1 min-w-[80px] px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                  scores[section][index] === 0
                    ? 'bg-red-100 border-red-500 text-red-800'
                    : 'bg-white border-gray-300 hover:border-red-300'
                }`}
              >
                전혀 아니다 (0점)
              </button>
              <button
                onClick={() => handleScore(section, index, 1)}
                className={`flex-1 min-w-[80px] px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                  scores[section][index] === 1
                    ? 'bg-yellow-100 border-yellow-500 text-yellow-800'
                    : 'bg-white border-gray-300 hover:border-yellow-300'
                }`}
              >
                약간 그렇다 (1점)
              </button>
              <button
                onClick={() => handleScore(section, index, 2)}
                className={`flex-1 min-w-[80px] px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                  scores[section][index] === 2
                    ? 'bg-green-100 border-green-500 text-green-800'
                    : 'bg-white border-gray-300 hover:border-green-300'
                }`}
              >
                매우 그렇다 (2점)
              </button>
            </>
          ) : (
            <>
              <button
                onClick={() => handleScore(section, index, q.points[0])}
                className={`flex-1 min-w-[80px] px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                  scores[section][index] === q.points[0]
                    ? 'bg-green-100 border-green-500 text-green-800'
                    : 'bg-white border-gray-300 hover:border-green-300'
                }`}
              >
                YES ({q.points[0]}점)
              </button>
              <button
                onClick={() => handleScore(section, index, q.points[1])}
                className={`flex-1 min-w-[80px] px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                  scores[section][index] === q.points[1]
                    ? 'bg-yellow-100 border-yellow-500 text-yellow-800'
                    : 'bg-white border-gray-300 hover:border-yellow-300'
                }`}
              >
                부분적 ({q.points[1]}점)
              </button>
              <button
                onClick={() => handleScore(section, index, q.points[2])}
                className={`flex-1 min-w-[80px] px-3 py-2 text-sm rounded-lg border-2 transition-all ${
                  scores[section][index] === q.points[2]
                    ? 'bg-red-100 border-red-500 text-red-800'
                    : 'bg-white border-gray-300 hover:border-red-300'
                }`}
              >
                NO ({q.points[2]}점)
              </button>
            </>
          )}
        </div>
      </div>
    );
  };

  const steps = [
    { id: 'intro', title: '시작하기' },
    { id: 'A', title: 'PART 1-A: 수익화 압박' },
    { id: 'B', title: 'PART 1-B: 성장 의도' },
    { id: 'quadrant', title: '사분면 분류 결과' },
    { id: 'C', title: 'PART 2-C: 기록 존재' },
    { id: 'D', title: 'PART 2-D: 변화 분석' },
    { id: 'E', title: 'PART 2-E: 선언-행동 일치' },
    { id: 'result', title: '최종 결과' }
  ];

  const renderStep = () => {
    const step = steps[currentStep];

    if (step.id === 'intro') {
      return (
        <div className="space-y-6">
          <div className="text-center">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mb-4">
              ROI 자기진단 체크리스트
            </h2>
            <p className="text-gray-600 mb-6">
              나의 활동을 분석하고, 성장 방향을 찾아보세요
            </p>
          </div>
          
          <div className="bg-blue-50 border-2 border-blue-300 rounded-lg p-4">
            <h3 className="font-semibold text-blue-900 mb-2">진단할 활동을 선택하세요</h3>
            <input
              type="text"
              value={activityName}
              onChange={(e) => setActivityName(e.target.value)}
              placeholder="예: 운동, 영상 제작, 프로젝트 등"
              className="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:border-blue-500 focus:outline-none text-base"
            />
          </div>

          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">진행 순서</h3>
            <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
              <li>활동 사분면 분류 (수익화 압박, 성장 의도)</li>
              <li>ROI 회고 점검 (기록, 변화, 일치도)</li>
              <li>종합 판정 및 맞춤 가이드</li>
            </ol>
          </div>

          <button
            onClick={() => setCurrentStep(1)}
            disabled={!activityName}
            className={`w-full py-4 rounded-lg text-white font-semibold text-lg transition-all ${
              activityName
                ? 'bg-blue-600 hover:bg-blue-700'
                : 'bg-gray-300 cursor-not-allowed'
            }`}
          >
            시작하기
          </button>
        </div>
      );
    }

    if (step.id === 'quadrant') {
      const aScore = getSectionTotal('A');
      const bScore = getSectionTotal('B');
      const quadrant = getQuadrant();
      
      return (
        <div className="space-y-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            {activityName} - 사분면 분류 결과
          </h2>

          <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">수익화 압박</div>
                <div className="text-3xl font-bold text-blue-600">{aScore}/10</div>
              </div>
              <div className="text-center">
                <div className="text-sm text-gray-600 mb-1">성장 의도</div>
                <div className="text-3xl font-bold text-green-600">{bScore}/10</div>
              </div>
            </div>

            <div className={`mt-6 p-4 rounded-lg border-2 ${
              quadrant === '순수 성장 탐구' ? 'bg-green-50 border-green-500' :
              quadrant === '순수 향유' ? 'bg-purple-50 border-purple-500' :
              quadrant === '비즈니스 성장' ? 'bg-blue-50 border-blue-500' :
              'bg-gray-50 border-gray-500'
            }`}>
              <h3 className="text-xl font-bold text-center mb-2">
                {quadrant}
                {quadrant === '순수 성장 탐구' && ' ⭐'}
              </h3>
              <p className="text-sm text-center text-gray-700">
                {quadrant === '순수 성장 탐구' && 'ROI 적용 의미 있음'}
                {quadrant === '순수 향유' && 'ROI 적용 불필요'}
                {quadrant === '비즈니스 성장' && 'ROI 필수'}
                {quadrant === '유지형 일' && 'ROI 유지 확인용'}
              </p>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition-all"
            >
              이전
            </button>
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
            >
              다음: ROI 회고 →
            </button>
          </div>
        </div>
      );
    }

    if (step.id === 'result') {
      const judgment = getJudgment();
      const guide = getGuide();
      const quadrant = getQuadrant();
      
      const aScore = getSectionTotal('A');
      const bScore = getSectionTotal('B');
      const cScore = getSectionTotal('C');
      const dScore = getSectionTotal('D');
      const eScore = getSectionTotal('E');
      const totalScore = aScore + bScore + cScore + dScore + eScore;

      return (
        <div className="space-y-6">
          <h2 className="text-xl md:text-2xl font-bold text-gray-800">
            {activityName} - 최종 진단 결과
          </h2>

          <div className="bg-white border-2 border-gray-300 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-3">점수 요약</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-gray-600">수익화 압박</div>
                <div className="text-lg font-bold">{aScore}/10</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-gray-600">성장 의도</div>
                <div className="text-lg font-bold">{bScore}/10</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-gray-600">기록 존재</div>
                <div className="text-lg font-bold">{cScore}/10</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-gray-600">변화 분석</div>
                <div className="text-lg font-bold">{dScore}/10</div>
              </div>
              <div className="bg-gray-50 p-2 rounded">
                <div className="text-gray-600">선언-행동 일치</div>
                <div className="text-lg font-bold">{eScore}/6</div>
              </div>
              <div className="bg-blue-50 p-2 rounded">
                <div className="text-blue-600 font-semibold">총점</div>
                <div className="text-lg font-bold text-blue-600">{totalScore}/46</div>
              </div>
            </div>
          </div>

          <div className={`border-2 rounded-lg p-6 ${judgment.color}`}>
            <h3 className="text-2xl font-bold mb-2">{judgment.type}</h3>
            <p className="text-gray-700 mb-4">{judgment.desc}</p>
            <div className="text-sm text-gray-600">
              사분면: <span className="font-semibold">{quadrant}</span>
            </div>
          </div>

          <div className="bg-white border-2 border-gray-300 rounded-lg p-6">
            <h3 className="text-lg font-bold text-gray-800 mb-4">당신의 상태</h3>
            <ul className="space-y-2">
              {guide.status.map((item, i) => (
                <li key={i} className="flex items-start text-sm text-gray-700">
                  <span className="text-blue-600 mr-2 mt-1">•</span>
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-green-50 border-2 border-green-300 rounded-lg p-6">
            <h3 className="text-lg font-bold text-green-900 mb-4">실천 가이드</h3>
            <ol className="space-y-3">
              {guide.actions.map((item, i) => (
                <li key={i} className="flex items-start text-sm text-gray-700">
                  <span className="font-bold text-green-700 mr-2">{i + 1}.</span>
                  <span>{item}</span>
                </li>
              ))}
            </ol>
          </div>

          {guide.warnings.length > 0 && (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-6">
              <h3 className="text-lg font-bold text-yellow-900 mb-4">주의사항</h3>
              <ul className="space-y-2">
                {guide.warnings.map((item, i) => (
                  <li key={i} className="flex items-start text-sm text-gray-700">
                    <span className="text-yellow-600 mr-2">⚠️</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="flex gap-3">
            <button
              onClick={() => {
                setCurrentStep(0);
                setActivityName('');
                setScores({
                  A: Array(5).fill(null),
                  B: Array(5).fill(null),
                  C: Array(5).fill(null),
                  D: Array(5).fill(null),
                  E: Array(3).fill(null)
                });
              }}
              className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition-all"
            >
              다른 활동 진단하기
            </button>
            <button
              onClick={() => window.print()}
              className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-semibold transition-all"
            >
              결과 저장/인쇄
            </button>
          </div>
        </div>
      );
    }

    if (['A', 'B', 'C', 'D', 'E'].includes(step.id)) {
      const section = step.id;
      const sectionComplete = scores[section].every(s => s !== null);

      return (
        <div className="space-y-6">
          <div className="sticky top-0 bg-white pb-4 border-b-2 border-gray-200 z-10">
            <h2 className="text-lg md:text-xl font-bold text-gray-800 mb-2">
              {sectionTitles[section]}
            </h2>
            <div className="flex justify-between items-center text-sm">
              <span className="text-gray-600">
                {activityName}
              </span>
              <span className="font-semibold text-blue-600">
                {getSectionTotal(section)}/{section === 'E' ? '6' : '10'}점
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{
                  width: `${(scores[section].filter(s => s !== null).length / scores[section].length) * 100}%`
                }}
              />
            </div>
          </div>

          {section === 'B' && (
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4">
              <p className="text-sm text-yellow-900 font-semibold">
                ⚠️ 주의: "선언"이 아니라 <span className="underline">과거 실제 행동</span>을 기준으로 답변하세요
              </p>
            </div>
          )}

          <div>
            {questions[section].map((_, index) => renderQuestion(section, index))}
          </div>

          <div className="flex gap-3 sticky bottom-0 bg-white pt-4 border-t-2 border-gray-200">
            <button
              onClick={() => setCurrentStep(currentStep - 1)}
              className="flex-1 py-3 bg-gray-200 hover:bg-gray-300 rounded-lg font-semibold transition-all"
            >
              이전
            </button>
            <button
              onClick={() => setCurrentStep(currentStep + 1)}
              disabled={!sectionComplete}
              className={`flex-1 py-3 rounded-lg font-semibold transition-all ${
                sectionComplete
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              다음 →
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-8">
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6 md:p-8">
        {/* Progress bar */}
        {currentStep > 0 && (
          <div className="mb-6">
            <div className="flex justify-between text-xs text-gray-600 mb-2">
              <span>진행률</span>
              <span>{Math.round((currentStep / (steps.length - 1)) * 100)}%</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              />
            </div>
          </div>
        )}

        {renderStep()}
      </div>

      <div className="max-w-2xl mx-auto mt-4 text-center text-xs text-gray-500">
        권장 주기: 분기별(3개월) 진단 | 월별 간단 확인 | 주별 기록 유지
      </div>
    </div>
  );
}
