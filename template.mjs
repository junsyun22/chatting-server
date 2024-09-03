import { Octokit } from "@octokit/rest";
import simpleGit from "simple-git";
import fs from "fs";
import path from "path";

// 환경 변수에서 토큰을 가져옵니다.
const GITHUB_TOKEN = process.env.GITHUB_TOKEN;
const octokit = new Octokit({ auth: GITHUB_TOKEN });

// GitHub 사용자 이름과 새 레포지토리 이름
const OWNER = "junsyun22"; // 변경 필요
const REPO = "Repo_Template";  // 변경 필요

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

// 레이블 색상 설정 (랜덤한 고유 색상 선택)
const LABEL_COLORS = {
  "Feat": "1D76DB",
  "Fix": "E11D21",
  "Docs": "0E8A16",
  "Style": "FBCA04",
  "Refactor": "8E44AD",
  "Test": "BADA55",
  "Chore": "FFC0CB",
  "Comment": "F39C12",
  "Remove": "34495E",
  "Rename": "2ECC71"
};

// 기본 레이블 설정
const LABELS = Object.keys(COMMIT_MESSAGE_CONVENTIONS).map(key => ({
  name: key,
  color: LABEL_COLORS[key],
  description: COMMIT_MESSAGE_CONVENTIONS[key]
}));

// 기능 이슈 템플릿 내용
const FEATURE_ISSUE_TEMPLATE = `

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
    
    // 변경 사항 추가
    await git.add("./*");
    await git.commit(commitMessage);

    // 원격 추가 전에 기존 원격이 있는지 확인
    const remotes = await git.getRemotes();
    if (!remotes.find(remote => remote.name === "origin")) {
      // 원격 리포지토리 추가 (origin이 없을 때만)
      await git.addRemote("origin", `https://github.com/${OWNER}/${REPO}.git`);
    }

    // 원격 리포지토리에 푸시
    await git.push("origin", "main");

    console.log("Changes pushed to repository");

    // 기존 레이블 삭제
    const { data: existingLabels } = await octokit.issues.listLabelsForRepo({
      owner: OWNER,
      repo: REPO,
    });

    for (const label of existingLabels) {
      try {
        await octokit.issues.deleteLabel({
          owner: OWNER,
          repo: REPO,
          name: label.name
        });
        console.log(`Deleted existing label: ${label.name}`);
      } catch (deleteError) {
        console.error(`Error deleting label '${label.name}': ${deleteError.message}`);
      }
    }

    // 사용자 정의 레이블 추가
    for (const label of LABELS) {
      try {
        await octokit.issues.createLabel({
          owner: OWNER,
          repo: REPO,
          name: label.name,
          color: label.color,
          description: label.description
        });
        console.log(`Label '${label.name}' created successfully.`);
      } catch (labelError) {
        console.error(`Error creating label '${label.name}': ${labelError.message}`);
      }
    }

  } catch (error) {
    console.error(`Error creating repository: ${error.message}`);
  }
}

createRepository();
