# GitHub Repository Automation Script

이 스크립트는 새로운 GitHub 레포지토리를 생성하고, 사용자 정의 이슈 템플릿과 레이블을 자동으로 추가하는 데 사용됩니다.

## 설치 및 설정 가이드

### 1. Node.js 및 npm 설치

이 스크립트는 Node.js 환경에서 실행되므로, 먼저 Node.js와 npm(Node Package Manager)이 설치되어 있어야 합니다. Node.js와 npm이 설치되어 있는지 확인하려면 다음 명령어를 사용하세요:


### 1. nodejs 설치 확인
```bash
node -v
npm -v

이 레포지토리 클론받고
```
### 2. octokit 패키지 설치
```
npm install @octokit/rest simple-git
```

3. GitHub Personal Access Token 설정
이 스크립트를 실행하기 위해서는 GitHub Personal Access Token(PAT)이 필요합니다.

GitHub 계정에 로그인한 후, 오른쪽 상단의 프로필 사진을 클릭하고 Settings로 이동합니다.
왼쪽 사이드바에서 Developer settings를 선택합니다.
이미 토큰이 있거나 쉘에 설정하였다면 다음 명령어로 사용하던 토큰값을 사용하면 됩니다.
```bash
git config --global user.password
```
```bash
export GITHUB_TOKEN=your_personal_access_token_here
```

### 4. github.com 유저및 생성할 repo 정보 설정
토큰 설정후 template.mjs에서
11-12번째줄에 계정과 생성할 레포지토리 이름을 입력하고
저장합니다.

코드 읽어보고 추가하고싶거나 변경하고싶은 컨벤션, 라벨 색상, 이슈템플릿 내용 등 변경가능

```js
const OWNER = "junsyun22"; // 변경 필요
const REPO = "Repo_Template";  // 변경 필요
```

### 5. repository 생성
```bash
node template.mjs
```
