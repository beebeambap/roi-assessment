import './App.css';
import React, { useState, useEffect } from 'react';
import { supabase, auth, db } from './supabaseClient';

export default function ROISelfAssessment() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState('assessment');
  const [history, setHistory] = useState([]);
  const [showAuthPrompt, setShowAuthPrompt] = useState(false);
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

  useEffect(() => {
    const savedCount = parseInt(localStorage.getItem('roi_save_count') || '0');
    if (savedCount >= 3 && !user?.email && !showAuthPrompt) {
      setTimeout(() => {
        if (confirm('🎯 3번째 진단을 완료했습니다!\n\n데이터를 안전하게 보관하고 여러 기기에서 사용하시겠어요?\n\n계정 연결을 추천드립니다.')) {
          setView('auth');
        }
      }, 1000);
    }
  }, [user, showAuthPrompt]);

  async function checkUser() {
    try {
      let currentUser = await auth.getCurrentUser();
      
      if (!currentUser) {
        try {
          const { user: anonymousUser } = await auth.signInAnonymously();
          currentUser = anonymousUser;
        } catch (error) {
          console.error('익명 로그인 실패:', error);
          const localUserId = localStorage.getItem('local_user_id') || `local_${Date.now()}`;
          localStorage.setItem('local_user_id', localUserId);
          currentUser = { id: localUserId, is_local: true };
        }
      }
      
      setUser(currentUser);
    } catch (error) {
      console.error('인증 오류:', error);
      const localUserId = localStorage.getItem('local_user_id') || `local_${Date.now()}`;
      localStorage.setItem('local_user_id', localUserId);
      setUser({ id: localUserId, is_local: true });
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      await auth.signInWithGoogle();
      alert('✅ Google 로그인 성공!');
      await checkUser();
      setView('assessment');
    } catch (error) {
      console.error('Google 로그인 오류:', error);
      alert('Google 로그인에 실패했습니다.');
    }
  }

  async function handleKakaoLogin() {
    try {
      await auth.signInWithKakao();
      alert('✅ Kakao 로그인 성공!');
      await checkUser();
      setView('assessment');
    } catch (error) {
      console.error('Kakao 로그인 오류:', error);
      alert('Kakao 로그인에 실패했습니다.');
    }
  }

  async function handleLogout() {
    try {
      await auth.signOut();
      setUser(null);
      await checkUser();
      alert('✅ 로그아웃 완료');
    } catch (error) {
      console.error('로그아웃 오류:', error);
    }
  }

  async function loadHistory() {
    if (!user) return;
    
    try {
      if (user.is_local) {
        const localHistory = JSON.parse(localStorage.getItem('roi_history') || '[]');
        setHistory(localHistory.sort((a, b) => new Date(b.assessment_date) - new Date(a.assessment_date)));
      } else {
        const data = await db.getRecentAssessments(user.id, 20);
        setHistory(data);
      }
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

  // 판정별 상세 가이드
  function getDetailedGuidance() {
    const judgment = getJudgment();
    const quadrant = getQuadrant();
    const cScore = getSectionTotal('C');
    const dScore = getSectionTotal('D');
    const eScore = getSectionTotal('E');

    const guidanceMap = {
      '🌟 건강한 성장형': {
        state: '완벽한 상태입니다. 즐기면서 성장하고 있으며, 그 과정을 정량화하고 있습니다.',
        characteristics: [
          '✅ 기록이 체계적으로 존재함',
          '✅ 명확한 성장 추세 확인 가능',
          '✅ 선언과 행동이 일치함'
        ],
        guide: [
          '📌 현재 방식을 유지하세요',
          '📌 주기적으로 진단하여 패턴 확인 (월 1회 권장)',
          '📌 다른 활동에도 이 프레임워크 적용 고려',
          '📌 성장 스토리를 다른 사람과 공유'
        ]
      },
      '📈 성장 가능형': {
        state: '성장 의도가 있고 실행 중이나, 측정이 부족합니다.',
        characteristics: [
          cScore < 7 ? '⚠️ 기록이 부족함' : '✅ 기록 존재',
          dScore < 7 ? '⚠️ 변화 측정이 어려움' : '✅ 변화 측정 가능',
          eScore < 4 ? '⚠️ 선언-행동 불일치' : '✅ 선언-행동 일치'
        ],
        guide: [
          cScore < 7 ? '📌 정량적 지표 3개 이상 설정 (숫자/사진/기록)' : '📌 기록을 더 세밀하게',
          dScore < 7 ? '📌 3개월 단위로 Before/After 비교' : '📌 변화 원인 분석 강화',
          eScore < 4 ? '📌 "바빠서" 변명 줄이기, 실제 시간 투자' : '📌 일관성 유지',
          '📌 주 1회 체크인으로 진행 상황 확인'
        ]
      },
      '⚠️ 메타인지 부족형': {
        state: '성장 의도는 있지만, 체계적 접근이 부족합니다.',
        characteristics: [
          '⚠️ 기록이 거의 없음',
          '⚠️ 성장 여부를 감으로만 판단',
          '⚠️ 방법론 개선 필요'
        ],
        guide: [
          '📌 즉시 시작: 정량 지표 3개 정하기',
          '📌 예시: 운동 → (1)체중 (2)벤치프레스 무게 (3)러닝 시간',
          '📌 매주 일요일 저녁 기록 습관',
          '📌 사진으로 남기기 (숫자보다 쉬움)',
          '📌 1개월 후 재진단'
        ]
      },
      '🚫 회피형': {
        state: '심각: 선언만 하고 행동하지 않는 패턴입니다.',
        characteristics: [
          '🚨 기록 전무',
          '🚨 실제 시간 투자 매우 적음',
          '🚨 "바빠서", "다음에" 반복'
        ],
        guide: [
          '📌 현실 직시: 정말 이 활동을 원하는가?',
          '📌 원한다면: 하루 15분부터 시작',
          '📌 SNS 인증보다 실제 행동',
          '📌 멘토/코치 찾기 (책임감 확보)',
          '📌 2주 후 재진단 (행동 변화 확인)'
        ]
      },
      '💚 건강한 향유형': {
        state: '완벽합니다. 즐기는 것 자체가 목적이며, 압박 없이 즐기고 있습니다.',
        characteristics: [
          '✅ 수익화 압박 없음',
          '✅ 성장 압박 없음',
          '✅ 순수하게 향유'
        ],
        guide: [
          '📌 ROI 측정 불필요',
          '📌 현재처럼 즐기세요',
          '📌 압박 느끼면 오히려 해로움',
          '📌 이 활동은 "쉼"의 역할'
        ]
      },
      '💭 무심형': {
        state: '즐기고는 있지만, 의식적이지 않습니다.',
        characteristics: [
          '✅ 수익화 압박 없음',
          '✅ 성장 압박 없음',
          '⚠️ 기록/측정 없음'
        ],
        guide: [
          '📌 ROI 측정 불필요',
          '📌 하지만 기록하면 재미있을 수 있음',
          '📌 예: 여행 → 사진 앨범',
          '📌 "추억"용 기록은 OK'
        ]
      },
      '💼 프로형': {
        state: '전문가 수준입니다. 일도 성장도 동시에 관리하고 있습니다.',
        characteristics: [
          '✅ 수익 발생 중',
          '✅ 지속적 성장',
          '✅ ROI 명확'
        ],
        guide: [
          '📌 현재 방식 유지',
          '📌 분기별 ROI 리뷰',
          '📌 시스템 자동화 고려',
          '📌 팀/후배 멘토링'
        ]
      },
      '📊 개선 필요형': {
        state: '수익은 있으나, ROI 측정이 부족합니다.',
        characteristics: [
          '✅ 수익 발생 중',
          '⚠️ 성장 측정 부족',
          '⚠️ 효율성 불명확'
        ],
        guide: [
          '📌 매출/시간 추적 시작',
          '📌 시간당 수익률 계산',
          '📌 비효율적 작업 제거',
          '📌 월별 ROI 리포트'
        ]
      },
      '⚠️ 번아웃 위험형': {
        state: '위험: 압박만 있고 성과가 불명확합니다.',
        characteristics: [
          '🚨 수익화 압박 높음',
          '🚨 성장 실감 못함',
          '🚨 소진 위험'
        ],
        guide: [
          '📌 즉시 조치: 휴식 필요',
          '📌 3개월 전과 지금 비교 (구체적 숫자)',
          '📌 성장 없으면 방향 전환 고려',
          '📌 멘토/코치 상담 필수',
          '📌 1개월 후 재진단'
        ]
      },
      '⚙️ 안정형': {
        state: '안정적입니다. 현상 유지를 잘하고 있습니다.',
        characteristics: [
          '✅ 수익화 압박 있음',
          '➖ 성장 압박 없음',
          '✅ 기록 존재'
        ],
        guide: [
          '📌 현재 수준 유지',
          '📌 효율성 개선 탐색',
          '📌 자동화 가능 부분 찾기',
          '📌 분기 1회 체크'
        ]
      },
      '⚠️ 관리 필요형': {
        state: '주의: 일인데 관리가 안 되고 있습니다.',
        characteristics: [
          '⚠️ 수익화 압박 있음',
          '⚠️ 기록 부족',
          '⚠️ 통제력 상실 위험'
        ],
        guide: [
          '📌 즉시: 최소 지표 3개 설정',
          '📌 예: 매출, 작업시간, 고객만족도',
          '📌 주간 체크인',
          '📌 2주 후 재진단'
        ]
      }
    };

    return guidanceMap[judgment.type] || {
      state: '진단 결과를 확인해주세요.',
      characteristics: [],
      guide: []
    };
  }

  async function handleSaveResult() {
    if (!user) {
      alert('저장을 위해 로그인이 필요합니다.');
      setView('auth');
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
      
      if (user.is_local) {
        const localHistory = JSON.parse(localStorage.getItem('roi_history') || '[]');
        const newAssessment = {
          id: `local_${Date.now()}`,
          user_id: user.id,
          activity_name: assessmentData.activityName,
          assessment_date: new Date().toISOString(),
          score_a: assessmentData.scores.A,
          score_b: assessmentData.scores.B,
          score_c: assessmentData.scores.C,
          score_d: assessmentData.scores.D,
          score_e: assessmentData.scores.E,
          total_score: assessmentData.totalScore,
          quadrant: assessmentData.quadrant,
          judgment_type: assessmentData.judgment.type,
          judgment_desc: assessmentData.judgment.desc
        };
        localHistory.push(newAssessment);
        localStorage.setItem('roi_history', JSON.stringify(localHistory));
        
        const savedCount = parseInt(localStorage.getItem('roi_save_count') || '0');
        localStorage.setItem('roi_save_count', (savedCount + 1).toString());
        
        alert('✅ 진단 결과가 저장되었습니다!\n\n💡 Tip: 계정 연결하면 여러 기기에서 사용할 수 있어요.');
      } else {
        await db.saveAssessment(user.id, assessmentData);
        alert('✅ 진단 결과가 저장되었습니다!');
      }
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

  // 인증 화면
  function renderAuth() {
    return (
      <div>
        <h1>계정 연결</h1>
        <p className="subtitle">데이터를 안전하게 보관하고 여러 기기에서 사용하세요</p>

        {user && !user.is_local && (
          <div className="result-card" style={{ background: '#dcfce7' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '10px' }}>
                ✅ 로그인 완료
              </div>
              <div style={{ fontSize: '14px', color: '#6b7280' }}>
                {user.email || '익명 사용자'}
              </div>
            </div>
          </div>
        )}

        {(!user || user.is_local) && (
          <>
            <div className="section-title">로그인 방법 선택</div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginBottom: '20px' }}>
              <button 
                className="btn" 
                onClick={handleGoogleLogin}
                style={{ 
                  background: 'white', 
                  border: '2px solid #e5e7eb',
                  color: '#374151',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
              >
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Google로 계속하기
              </button>

              <button 
                className="btn" 
                onClick={handleKakaoLogin}
                style={{ 
                  background: '#FEE500', 
                  color: '#000000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px'
                }}
              >
                <span style={{ fontSize: '20px' }}>💬</span>
                Kakao로 계속하기
              </button>
            </div>

            <div className="guide-section guide-1">
              <strong>💡 익명 사용 vs 계정 연결</strong>
              <ul style={{ margin: '10px 0 0 20px', lineHeight: '1.8' }}>
                <li><strong>익명 사용:</strong> 로그인 없이 바로 시작, 이 기기에만 저장</li>
                <li><strong>계정 연결:</strong> 여러 기기 동기화, 데이터 안전 보관</li>
              </ul>
            </div>
          </>
        )}

        <div className="nav-buttons">
          <button className="btn btn-secondary" onClick={() => setView('assessment')}>
            ← 돌아가기
          </button>
          {user && !user.is_local && (
            <button className="btn btn-secondary" onClick={handleLogout}>
              로그아웃
            </button>
          )}
        </div>
      </div>
    );
  }

  // 히스토리 뷰
  function renderHistory() {
    if (history.length === 0) {
      return (
        <div>
          <h1>진단 히스토리</h1>
          
          {user?.is_local && (
            <div className="warning-box" style={{ marginBottom: '20px' }}>
              💡 현재 이 기기에만 저장되어 있습니다. 
              <button 
                onClick={() => setView('auth')}
                style={{ 
                  marginLeft: '10px', 
                  padding: '5px 10px', 
                  background: '#3b82f6', 
                  color: 'white', 
                  border: 'none', 
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                계정 연결하기
              </button>
            </div>
          )}
          
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
        
        {user?.is_local && (
          <div className="warning-box" style={{ marginBottom: '20px' }}>
            💡 현재 이 기기에만 저장되어 있습니다. 
            <button 
              onClick={() => setView('auth')}
              style={{ 
                marginLeft: '10px', 
                padding: '5px 10px', 
                background: '#3b82f6', 
                color: 'white', 
                border: 'none', 
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              계정 연결하기
            </button>
          </div>
        )}
        
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
                <>
                  <div style={{ marginTop: '15px' }}>
                    <strong>과거 기록 ({items.length - 1}개)</strong>
                    <div style={{ display: 'grid', gap: '10px', marginTop: '10px' }}>
                      {items.slice(1).map((item) => (
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

                  <div style={{ marginTop: '15px', padding: '12px', background: '#f0f9ff', borderRadius: '8px' }}>
                    <strong>변화 분석</strong>
                    <div style={{ marginTop: '8px', fontSize: '14px' }}>
                      총점 변화: {items[items.length - 1].total_score}점 → {items[0].total_score}점 
                      <span style={{ color: items[0].total_score >= items[items.length - 1].total_score ? '#22c55e' : '#ef4444', fontWeight: 'bold', marginLeft: '8px' }}>
                        ({items[0].total_score >= items[items.length - 1].total_score ? '+' : ''}{items[0].total_score - items[items.length - 1].total_score})
                      </span>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
        })}
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container">
        <h1>로딩 중...</h1>
      </div>
    );
  }

  if (view === 'auth') {
    return (
      <div className="container">
        {renderAuth()}
      </div>
    );
  }

  if (view === 'history') {
    return (
      <div className="container">
        {renderHistory()}
      </div>
    );
  }

  const step = steps[currentStep];
  const progress = Math.round((currentStep / (steps.length - 1)) * 100);

  return (
    <div className="container">
      <div style={{ 
        position: 'absolute', 
        top: '20px', 
        right: '20px',
        display: 'flex',
        gap: '10px',
        alignItems: 'center'
      }}>
        {user && (
          <span style={{ fontSize: '12px', color: '#6b7280' }}>
            {user.is_local ? '익명 사용 중' : user.email}
          </span>
        )}
        <button 
          onClick={() => setView('auth')}
          style={{
            padding: '6px 12px',
            fontSize: '12px',
            background: user?.is_local ? '#3b82f6' : '#e5e7eb',
            color: user?.is_local ? 'white' : '#374151',
            border: 'none',
            borderRadius: '6px',
            cursor: 'pointer'
          }}
        >
          {user?.is_local ? '계정 연결' : '계정'}
        </button>
      </div>

      {currentStep > 0 && (
        <div style={{ marginBottom: '20px', marginTop: '40px' }}>
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

          {/* 당신의 상태 */}
          <div className="guide-section guide-1">
            <h3 style={{ marginBottom: '10px' }}>📋 당신의 상태</h3>
            <p style={{ lineHeight: '1.8' }}>{getDetailedGuidance().state}</p>
            <ul style={{ margin: '10px 0 0 20px', lineHeight: '1.8' }}>
              {getDetailedGuidance().characteristics.map((char, i) => (
                <li key={i}>{char}</li>
              ))}
            </ul>
          </div>

          {/* 실천 가이드 */}
          <div className="guide-section guide-2">
            <h3 style={{ marginBottom: '10px' }}>💡 실천 가이드</h3>
            <ul style={{ margin: '10px 0 0 20px', lineHeight: '1.8' }}>
              {getDetailedGuidance().guide.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
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
