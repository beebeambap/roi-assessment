# ROI 자기진단 체크리스트

## 🚀 빠른 배포 가이드

### Step 1: GitHub에 저장소 만들기

1. https://github.com 접속 (이미 로그인 되어있을 것)
2. 우측 상단 `+` 버튼 클릭 → `New repository` 선택
3. Repository name: `roi-assessment` 입력
4. 설명 (선택): "ROI 자기진단 체크리스트"
5. **Public** 선택 (Private 아님!)
6. **"Add a README file" 체크 해제** ← 중요!
7. `Create repository` 버튼 클릭

### Step 2: 파일 업로드

#### 방법 A: 웹에서 직접 업로드 (가장 쉬움) ⭐

1. 생성된 저장소 페이지에서 `uploading an existing file` 링크 클릭
2. 이 폴더의 **모든 파일**을 드래그앤드롭
   - package.json
   - vite.config.js
   - index.html
   - .gitignore
   - src/main.jsx
   - src/App.jsx
3. 하단 "Commit changes" 클릭
4. 완료!

#### 방법 B: 폴더 구조 유지하며 업로드

GitHub 웹에서는 폴더를 직접 업로드할 수 없어서, 파일을 하나씩 올려야 해요:

1. 저장소에서 `Add file` → `Create new file` 클릭
2. 파일명에 `src/main.jsx` 입력 (자동으로 폴더 생성됨)
3. main.jsx 내용 복사해서 붙여넣기
4. 하단 `Commit new file` 클릭
5. 같은 방식으로 `src/App.jsx` 생성
6. 나머지 파일들 (package.json, vite.config.js, index.html, .gitignore)도 업로드

### Step 3: Vercel에서 Import

1. https://vercel.com 접속 (이미 로그인 되어있을 것)
2. `Add New...` → `Project` 클릭
3. GitHub 저장소 목록에서 `roi-assessment` 찾기
4. `Import` 클릭
5. 설정 그대로 두고 `Deploy` 클릭
6. 2-3분 기다리면 배포 완료!
7. 생성된 URL 확인: `https://roi-assessment-xxx.vercel.app`

### 완료! 🎉

이제 이 링크를 친구들에게 공유하면 됩니다!

## 📱 로컬에서 테스트하기 (선택사항)

```bash
npm install
npm run dev
```

http://localhost:5173 에서 확인 가능

## 🔧 수정 후 재배포

코드 수정 후:
1. GitHub 저장소에서 파일 수정
2. Commit changes
3. Vercel이 자동으로 재배포!

## 💡 도움말

문제가 생기면:
- GitHub Issues에 질문
- 또는 직접 연락주세요!
