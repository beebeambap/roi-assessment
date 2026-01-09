import './App.css';
import React, { useState, useEffect } from 'react';
import { supabase, auth, db } from './supabaseClient';

export default function ROISelfAssessment() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('assessment'); // 'assessment' | 'history'
  const [history, setHistory] = useState([]);
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
      '이 활동을 시작한 시점이 명확하다',
      '정량적 지표(숫자, 사진, 기록 등)가 3개 이상 있다',
      '3개월 이상의 기간 동안 기록이 연속적으로 존재한다',
      '과거 데이터와 현재를 비교할 수 있다',
      '측정/기록 자체를 회피하지 않았다'
    ],
    D: [
      '3개월 전과 비교하여 명확한 성장이 있다',
      '6개월 전과 비교하여 명확한 성장이 있다',
      '1년 전과 비교하여 명확한 성장이 있다',
      '정체/퇴보가 있었다면 명확한 맥락을 정량화할 수 있다',
      '변화의 원인(효과적/비효과적 방법)을 파악할 수 있다'
    ],
    E: [
      '"이 활동에서 성장하고 싶다"고 주변에 말했거나 생각했다',
      '실제 행동(시간 투자, 노력)이 선언과 일치했다',
      '"바빠서", "다음에" 같은 변명을 반복하지 않았다'
    ]
  };

  const steps = ['intro', 'A', 'B', 'quadrant', 'C', 'D', 'E', 'result'];

  // 초기 사용자 인증
  useEffect(() => {
    checkUser();
  }, []);

  // 히스토리 로드
  useEffect(() => {
    if (user && view === 'history') {
      loadHistory();
    }
  }, [user, view]);

  async function checkUser() {
    try {
      const currentUser = await auth.getCurrentUser();
      if (!currentUser) {
        const { user: newUser } = await auth.signInAnonymously();
        setUser(newUser);
      } else {
        setUser(currentUser);
      }
    } catch (error) {
      console.error('인증 오류:', error);
    } finally {
      setLoading(false);
    }
  }

  async function loadHistory() {
    if (!user) return;
    try {
      const data = await db.getRecentAssessments(user.id, 20);
      setHistory(data);
    } catch (error) {
      console.error('히스토리 로드 오류:', error);
    }
  }

  function getSectionTotal(section) {
    return scores[section].reduce((sum, score) => sum + (score || 0), 0);
  }

  function getTotalScore() {
    return getSectionTotal('A') + getSectionTotal('B') + getSectionTotal('C') + 
           getSectionTotal('D') + getSectionTotal('E');
  }

  function getQuadrant() {
    const aScore = getSectionTotal('A');
    const bScore = getSectionTotal('B');
    
    if (aScore >= 7 && bScore >= 7) return '비즈니스 성장';
    if (aScore >= 7 && bScore < 7) return '유지형 일';
    if (aScore < 7 && bScore >= 7) return '순수 성장 탐구 ⭐';
    return '순수 향유';
  }

  function getJudgment() {
    const quadrant = getQuadrant();
    const cScore = getSectionTotal('C');
    const dScore = getSectionTotal('D');
    const eScore = getSectionTotal('E');
    const roiScore = cScore + dScore + eScore;

    if (quadrant === '순수 성장 탐구 ⭐') {
      if (roiScore >= 20) return { type: '🌟 건강한 성장형', desc: '이상적. 즐기면서 성장 중', color: '#dcfce7' };
      if (roiScore >= 13) return { type: '📈 성장 가능형', desc: '개선 여지 있음', color: '#dbeafe' };
      if (roiScore >= 7) return { type: '⚠️ 메타인지 부족형', desc: '방법 개선 필요', color: '#fef3c7' };
      return { type: '🚫 회피형', desc: '행동 부족', color: '#fee2e2' };
    }
    
    if (quadrant === '순수 향유') {
      const cdScore = cScore + dScore;
      if (cdScore >= 8) return { type: '💚 건강한 향유형', desc: '완벽', color: '#f0fdf4' };
      return { type: '💭 무심형', desc: '향유하되 의식 없음', color: '#f3f4f6' };
    }

    if (quadrant === '비즈니스 성장') {
      if (roiScore >= 20) return { type: '💼 프로형', desc: '지속 가능', color: '#ede9fe' };
      if (roiScore >= 13) return { type: '📊 개선 필요형', desc: 'ROI 측정 강화', color: '#dbeafe' };
      return { type: '⚠️ 번아웃 위험형', desc: '압박만 있고 성과 불명확', color: '#fee2e2' };
    }

    if (cScore >= 7) return { type: '⚙️ 안정형', desc: '현상 유지 잘함', color: '#dcfce7' };
    return { type: '⚠️ 관리 필요형', desc: '기본 관리 강화', color: '#fef3c7' };
  }

  async function handleSaveResult() {
    if (!user) {
      alert('로그인이 필요합니다.');
      return;
    }
    
    try {
      const assessmentData = {
        activityName,
        scores: {
          A: getSectionTotal('A'),
          B: getSectionTotal('B'),
          C: getSectionTotal('C'),
          D: getSectionTotal('D'),
          E: getSectionTotal('E')
        },
        totalScore: getTotalScore(),
        quadrant: getQuadrant(),
        judgment: getJudgment()
      };
      
      await db.saveAssessment(user.id, assessmentData);
      alert('✅ 진단 결과가 저장되었습니다!');
    } catch (error) {
      console.error('저장 오류:', error);
      alert('저장에 실패했습니다. 다시 시도해주세요.');
    }
  }

  function selectOption(section, index, score) {
    const newScores = { ...scores };
    newScores[section][index] = score;
    setScores(newScores);
  }

  function nextStep() {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
      window.scrollTo(0, 0);
    }
  }

  function previousStep() {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
      window.scrollTo(0, 0);
    }
  }

  function restart() {
    setCurrentStep(0);
    setActivityName('');
    setScores({
      A: Array(5).fill(null),
      B: Array(5).fill(null),
      C: Array(5).fill(null),
      D: Array(5).fill(null),
      E: Array(3).fill(null)
    });
    window.scrollTo(0, 0);
  }

  function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  }

  // 히스토리 뷰
  function renderHistory() {
    if (history.length === 0) {
      return (
        <div>
          <h1>진단 히스토리</h1>
          <div className="result-card">
            <p style={{ textAlign: 'center' }}>아직 저장된 진단이 없습니다.</p>
            <p style={{ textAlign: 'center', marginTop: '10px' }}>
              첫 진단을 시작해보세요!
            </p>
          </div>
          <div className="nav-buttons">
            <button className="btn btn-primary" onClick={() => setView('assessment')}>
              새 진단 시작
            </button>
          </div>
        </div>
      );
    }

    // 활동별로 그룹화
    const groupedByActivity = {};
    history.forEach(item => {
      if (!groupedByActivity[item.activity_name]) {
        groupedByActivity[item.activity_name] = [];
      }
      groupedByActivity[item.activity_name].push(item);
    });

    return (
      <div>
        <h1>진단 히스토리</h1>
        <div className="nav-buttons" style={{ marginBottom: '20px' }}>
          <button className="btn btn-secondary" onClick={() => setView('assessment')}>
            ← 새 진단
          </button>
        </div>

        {Object.keys(groupedByActivity).map(activityName => {
          const items = groupedByActivity[activityName];
          const latest = items[0];
          
          return (
            <div key={activityName} style={{ marginBottom: '30px' }}>
              <div className="section-title">{activityName}</div>
              
              <div className="result-card" style={{ background: latest.judgment_type.includes('건강') ? '#dcfce7' : '#fef3c7' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <div className="result-title">{latest.judgment_type}</div>
                    <div className="result-desc">{latest.quadrant}</div>
                  </div>
                  <div className="score-value" style={{ fontSize: '32px' }}>
                    {latest.total_score}/46
                  </div>
                </div>
              </div>

              {items.length > 1 && (
                <div style={{ marginTop: '15px' }}>
                  <strong>과거 기록 ({items.length - 1}개)</strong>
                  <div style={{ display: 'grid', gap: '10px', marginTop: '10px' }}>
                    {items.slice(1).map((item, index) => (
                      <div key={item.id} className="question-box" style={{ padding: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div>
                            <div style={{ fontSize: '14px', fontWeight: '500' }}>
                              {formatDate(item.assessment_date)}
                            </div>
                            <div style={{ fontSize: '12px', color: '#6b7280' }}>
                              {item.judgment_type}
                            </div>
                          </div>
                          <div style={{ fontSize: '18px', fontWeight: 'bold', color: '#3b82f6' }}>
                            {item.total_score}점
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {items.length >= 2 && (
                <div style={{ marginTop: '15px', padding: '12px', background: '#f0f9ff', borderRadius: '8px' }}>
                  <strong>변화 분석</strong>
                  <div style={{ marginTop: '8px', fontSize: '14px' }}>
                    총점 변화: {items[items.length - 1].total_score}점 → {items[0].total_score}점 
                    <span style={{ color: items[0].total_score >= items[items.length - 1].total_score ? '#22c55e' : '#ef4444', fontWeight: 'bold', marginLeft: '8px' }}>
                      ({items[0].total_score >= items[items.length - 1].total_score ? '+' : ''}{items[0].total_score - items[items.length - 1].total_score})
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  // 로딩 상태
  if (loading) {
    return (
      <div className="container">
        <h1>로딩 중...</h1>
      </div>
    );
  }

  // 히스토리 뷰
  if (view === 'history') {
    return (
      <div className="container">
        {renderHistory()}
      </div>
    );
  }

  // 진단 뷰
  const step = steps[currentStep];
  const progress = Math.round((currentStep / (steps.length - 1)) * 100);

  return (
    <div className="container">
      {currentStep > 0 && (
        <div style={{ marginBottom: '20px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12px', color: '#6b7280', marginBottom: '10px' }}>
            <span>진행률</span>
            <span>{progress}%</span>
          </div>
          <div className="progress-bar">
            <div className="progress-fill" style={{ width: `${progress}%` }}></div>
          </div>
        </div>
      )}

      {step === 'intro' && (
        <div>
          <h1>ROI 자기진단 체크리스트</h1>
          <p className="subtitle">나의 활동을 분석하고, 성장 방향을 찾아보세요</p>
          
          <div className="section-title">진단할 활동을 선택하세요</div>
          <input 
            type="text" 
            className="input-field"
            placeholder="예: 운동, 영상 제작, 프로젝트 등"
            value={activityName}
            onChange={(e) => setActivityName(e.target.value)}
          />
          
          <div className="nav-buttons">
            <button 
              className="btn btn-secondary" 
              onClick={() => setView('history')}
            >
              📊 히스토리 보기
            </button>
            <button 
              className="btn btn-primary" 
              onClick={() => activityName && nextStep()}
              disabled={!activityName}
            >
              시작하기
            </button>
          </div>
        </div>
      )}

      {['A', 'B', 'C', 'D', 'E'].includes(step) && (
        <div>
          <h1>{activityName}</h1>
          <div className="section-title">
            {step === 'A' && 'PART 1-A: 수익화 압박 측정'}
            {step === 'B' && 'PART 1-B: 성장 의도 측정 (⚠️ 과거 실제 행동 기준!)'}
            {step === 'C' && 'PART 2-C: 기록 존재 여부'}
            {step === 'D' && 'PART 2-D: 변화 분석'}
            {step === 'E' && 'PART 2-E: 선언-행동 일치도'}
          </div>

          <div className="score-display">
            현재 점수: {getSectionTotal(step)}/{step === 'E' ? 6 : 10}점
          </div>

          {questions[step].map((question, index) => (
            <div key={index} className="question-box">
              <div className="question-text">
                {step}{index + 1}. {question}
              </div>
              <div className="options">
                {[0, 1, 2].map(score => (
                  <button
                    key={score}
                    className={`option-btn ${scores[step][index] === score ? `selected-${score}` : ''}`}
                    onClick={() => selectOption(step, index, score)}
                  >
                    {['A', 'B'].includes(step) 
                      ? ['전혀 (0점)', '약간 (1점)', '매우 (2점)'][score]
                      : ['NO (0점)', '부분 (1점)', 'YES (2점)'][score]
                    }
                  </button>
                ))}
              </div>
            </div>
          ))}

          <div className="nav-buttons">
            <button className="btn btn-secondary" onClick={previousStep}>
              이전
            </button>
            <button 
              className="btn btn-primary" 
              onClick={nextStep}
              disabled={scores[step].some(s => s === null)}
            >
              다음 →
            </button>
          </div>
        </div>
      )}

      {step === 'quadrant' && (
        <div>
          <h1>{activityName} - 사분면 분류</h1>
          
          <div className="score-grid">
            <div className="score-item">
              <div className="score-label">수익화 압박</div>
              <div className="score-value">{getSectionTotal('A')}/10</div>
            </div>
            <div className="score-item">
              <div className="score-label">성장 의도</div>
              <div className="score-value">{getSectionTotal('B')}/10</div>
            </div>
          </div>

          <div className="result-card">
            <div className="result-title">{getQuadrant()}</div>
            <div className="result-desc">
              {getQuadrant() === '순수 성장 탐구 ⭐' && 'ROI 적용 의미 있음'}
              {getQuadrant() === '순수 향유' && 'ROI 적용 불필요'}
              {getQuadrant() === '비즈니스 성장' && 'ROI 필수'}
              {getQuadrant() === '유지형 일' && 'ROI 유지 확인용'}
            </div>
          </div>

          <div className="nav-buttons">
            <button className="btn btn-secondary" onClick={previousStep}>
              이전
            </button>
            <button className="btn btn-primary" onClick={nextStep}>
              다음: ROI 회고 →
            </button>
          </div>
        </div>
      )}

      {step === 'result' && (
        <div>
          <h1>{activityName} - 최종 결과</h1>
          
          <div className="score-grid">
            {['A', 'B', 'C', 'D', 'E'].map(section => (
              <div key={section} className="score-item">
                <div className="score-label">
                  {section === 'A' && '수익화 압박'}
                  {section === 'B' && '성장 의도'}
                  {section === 'C' && '기록 존재'}
                  {section === 'D' && '변화 분석'}
                  {section === 'E' && '선언-행동'}
                </div>
                <div className="score-value">
                  {getSectionTotal(section)}/{section === 'E' ? 6 : 10}
                </div>
              </div>
            ))}
            <div className="score-item" style={{ background: '#dbeafe' }}>
              <div className="score-label" style={{ fontWeight: 'bold' }}>총점</div>
              <div className="score-value">{getTotalScore()}/46</div>
            </div>
          </div>

          <div className="result-card" style={{ background: getJudgment().color }}>
            <div className="result-title">{getJudgment().type}</div>
            <div className="result-desc">{getJudgment().desc}</div>
            <div style={{ textAlign: 'center', marginTop: '10px', fontSize: '14px' }}>
              사분면: <strong>{getQuadrant()}</strong>
            </div>
          </div>

          <div className="nav-buttons">
            <button className="btn btn-secondary" onClick={restart}>
              다른 활동 진단
            </button>
            <button className="btn btn-primary" onClick={handleSaveResult}>
              💾 결과 저장
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
