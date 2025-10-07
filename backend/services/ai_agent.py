import tempfile
import git
from github import Github
from ai_bug_fixer import AIBugFixer

def fix_bug(actual_bug, expected_fix, bug_file_content):
    fixer = AIBugFixer()

    # Step 1: AI analyzes and fixes
    result = fixer.analyze_and_fix_bug(actual_bug, expected_fix, bug_file_content, "utils.py")
    if not result["success"]:
        return {"status": "failed", "reason": result.get("error", "AI analysis failed")}

    # Step 2: Run unit tests
    test_result = fixer.run_tests(
        result["fixed_code"],
        result.get("test_cases", []),
        result.get("function_name") or "add_numbers"
    )
    if not test_result["success"]:
        return {"status": "failed", "reason": f"Tests failed: {test_result.get('stderr')}"}

    # Step 3: Clone repo
    repo_path = tempfile.mkdtemp()
    repo = git.Repo.clone_from("https://github.com/YOUR_USERNAME/YOUR_REPO.git", repo_path)

    # Step 4: Apply fix to utils.py
    file_path = f"{repo_path}/utils.py"
    with open(file_path, "w", encoding="utf-8") as f:
        f.write(result["fixed_code"])

    # Step 5: Commit & push
    branch_name = "ai-bug-fix-branch"
    repo.git.checkout("-b", branch_name)
    repo.git.add(file_path)
    repo.index.commit(f"AI: Fixed bug - {actual_bug}")
    origin = repo.remote(name="origin")
    origin.push(branch_name, set_upstream=True)

    # Step 6: Create PR
    g = Github("YOUR_GITHUB_TOKEN")
    gh_repo = g.get_repo("YOUR_USERNAME/YOUR_REPO")
    pr = gh_repo.create_pull(
        title="AI Bug Fix",
        body=f"AI fixed bug: {actual_bug}\n\nExplanation: {result['explanation']}",
        head=branch_name,
        base="main"
    )

    return {"status": "success", "pr_url": pr.html_url}
