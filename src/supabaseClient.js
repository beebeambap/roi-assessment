import { createClient } from '@supabase/supabase-js'

// ⚠️ 여기에 실제 Supabase 프로젝트 정보를 입력하세요!
const supabaseUrl = 'https://zktaarbwvnhryfnavvur.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InprdGFhcmJ3dm5ocnlmbmF2dnVyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njc5MDEyNDMsImV4cCI6MjA4MzQ3NzI0M30.drbvIAF7Sqe9jyWPzt-J2jqJWtgworNZbXEGBQHUGGA'

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// 인증 헬퍼 함수들
export const auth = {
  // 익명 로그인
  async signInAnonymously() {
    const { data, error } = await supabase.auth.signInAnonymously()
    if (error) throw error
    return data
  },
  
  // 현재 사용자 가져오기
  async getCurrentUser() {
    const { data: { user } } = await supabase.auth.getUser()
    return user
  },
  
  // 로그아웃
  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }
}

// 데이터베이스 헬퍼 함수들
export const db = {
  // 진단 결과 저장
  async saveAssessment(userId, assessmentData) {
    const { data, error } = await supabase
      .from('assessments')
      .insert([{
        user_id: userId,
        activity_name: assessmentData.activityName,
        score_a: assessmentData.scores.A,
        score_b: assessmentData.scores.B,
        score_c: assessmentData.scores.C,
        score_d: assessmentData.scores.D,
        score_e: assessmentData.scores.E,
        total_score: assessmentData.totalScore,
        quadrant: assessmentData.quadrant,
        judgment_type: assessmentData.judgment.type,
        judgment_desc: assessmentData.judgment.desc
      }])
      .select()
    
    if (error) throw error
    return data[0]
  },
  
  // 특정 활동의 히스토리 가져오기
  async getActivityHistory(userId, activityName) {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('user_id', userId)
      .eq('activity_name', activityName)
      .order('assessment_date', { ascending: false })
    
    if (error) throw error
    return data
  },
  
  // 최근 N개 진단 가져오기
  async getRecentAssessments(userId, limit = 20) {
    const { data, error } = await supabase
      .from('assessments')
      .select('*')
      .eq('user_id', userId)
      .order('assessment_date', { ascending: false })
      .limit(limit)
    
    if (error) throw error
    return data
  },
  
  // 진단 삭제
  async deleteAssessment(assessmentId) {
    const { error } = await supabase
      .from('assessments')
      .delete()
      .eq('id', assessmentId)
    
    if (error) throw error
  }
}
