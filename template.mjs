import { Octokit } from "@octokit/rest";
import simpleGit from "simple-git";
import fs from "fs";
import path from "path";


// 환경 변수에서 토큰을 가져옵니다.
const GITHUB_TOKEN = process.env.GITHUB_TOKEN; 
const octokit = new Octokit({ auth: GITHUB_TOKEN });

// GitHub 사용자 이름과 새 레포지토리 이름
const OWNER = "junsyun22"; // 변경 필요
const REPO = "chatting-server";  // 변경 필요

// Git 커밋 메시지 컨벤션 설정
const COMMIT_MESSAGE_CONVENTIONS = {
  "Feat": "새로운 기능 추가",
  "Fix": "버그 수정",
  "Docs": "문서 수정",
  "Style": "코드 포맷팅, 세미콜론 누락, 코드 변경이 없는 경우",
  "Refactor": "코드 리팩토링",
  "Test": "테스트 코드, 리팩토링 테스트 코드 추가",
  "Chore": "빌드 업무 수정, 패키지 매니저 수정, production code와 무관한 부분들 (.gitignore, build.gradle 같은)",
  "Comment": "주석 추가 및 변경",
  "Remove": "파일, 폴더 삭제",
  "Rename": "파일, 폴더명 수정"
};

// 기능 이슈 템플릿 내용
const FEATURE_ISSUE_TEMPLATE = `
---
name: "✅기능 이슈"
about: 개발할 상세 기능을 적어 주세요.
title: "[Feat] 추가할 기능"
labels: Feat, Fix
assignees: ''

---

## 📋 Description
기능 이름: 구현할 기능의 이름을 작성하세요. (예: "아이템 CRUD")
기능 설명: 개발할 기능의 상세 내용을 작성하세요. 해당 기능이 무엇을 수행하며, 왜 필요한지 설명합니다.
예: "사용자가 아이템을 생성, 수정, 삭제할 수 있도록 하는 CRUD 기능을 개발합니다."

## 🛠️ To Do
- [ ] 아이템 생성: 기능 설명 및 구현 사항을 작성하세요.
- [ ] 아이템 수정: 기능 설명 및 구현 사항을 작성하세요.
- [ ] 아이템 삭제: 기능 설명 및 구현 사항을 작성하세요.

## 📝 ETC
기타 사항: 기타 필요한 사항이나 주의할 점을 적어 주세요.
`;

// 버그 리포트 템플릿 내용
const BUG_REPORT_TEMPLATE = `
---
name: "🚨버그 리포트"
about: 어떤 버그인가요?
title: 어떤 버그인가요?
labels: Fix
assignees: ''

---

## 🐛 어떤 버그인가요?
- 버그 이름: 버그에 대한 간단한 제목을 작성하세요. (예: "아이템 생성 시 중복 이름 허용")
- 버그 발생 위치: 버그가 발생한 기능이나 화면의 위치를 명시하세요.
예: "아이템 생성 페이지"
- 버그 상세 설명: 발생한 버그에 대해 상세히 작성하세요. 어떤 문제가 발생했으며, 정상 동작은 어떻게 되어야 하는지 설명합니다.
예: "아이템 생성 시, 동일한 이름의 아이템을 여러 번 생성할 수 있습니다. 정상적으로는 중복된 이름의 아이템 생성이 불가능해야 합니다."

## 🔍 어떤 상황에서 겪으셨나요?
- 상황 설명: 버그를 겪으신 상황을 자세히 적어 주세요. (예: 어떤 기능을 사용할 때 발생했는지, 어떤 입력을 했는지 등)

## 📝 ETC
- 기타 사항: 기타 필요한 사항이나 추가로 제공할 정보가 있다면 적어 주세요.
`;

// 새 레포지토리 생성 함수
async function createRepository() {
  try {
    // GitHub 레포지토리 생성
    const response = await octokit.repos.createForAuthenticatedUser({
      name: REPO,
      private: false,
    });
    console.log(`Repository created at ${response.data.html_url}`);

    // 로컬 디렉토리 생성 및 초기화
    const git = simpleGit();
    await git.init();
    fs.writeFileSync(path.join(process.cwd(), ".gitignore"), "node_modules\n");
    fs.mkdirSync(path.join(process.cwd(), ".github/ISSUE_TEMPLATE"), { recursive: true });

    // 기능 이슈 템플릿 생성
    fs.writeFileSync(path.join(process.cwd(), ".github/ISSUE_TEMPLATE/feature_request.md"), FEATURE_ISSUE_TEMPLATE);
    // 버그 리포트 템플릿 생성
    fs.writeFileSync(path.join(process.cwd(), ".github/ISSUE_TEMPLATE/bug_report.md"), BUG_REPORT_TEMPLATE);

    // 커밋 메시지 선택 및 설정
    const commitType = "Feat"; // 기본값을 Feat로 설정. 필요 시 사용자 입력으로 변경 가능
    const commitMessage = `${commitType}: ${COMMIT_MESSAGE_CONVENTIONS[commitType]}`;
    
    // 커밋 및 푸시
    await git.add("./*");
    await git.commit(commitMessage);
    await git.addRemote("origin", `https://github.com/${OWNER}/${REPO}.git`);
    await git.push("origin", "main");
    console.log("Changes pushed to repository");

  } catch (error) {
    console.error(`Error creating repository: ${error.message}`);
  }
}

createRepository();
