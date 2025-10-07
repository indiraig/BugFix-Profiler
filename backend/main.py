import os
import tempfile
from datetime import datetime
import uuid
import traceback
import logging
from fastapi import FastAPI, UploadFile, Form, File, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from github import Github
from dotenv import load_dotenv
from services.ai_bug_fixer import AIBugFixer

# ✅ Load .env file at startup
load_dotenv()

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# --- FastAPI setup ---
app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- Environment variables ---
GITHUB_TOKEN = os.getenv("GITHUB_TOKEN")
GITHUB_REPO = os.getenv("GITHUB_REPO", "indiraig/Auto-Hot-fix")
GITHUB_BRANCH = os.getenv("GITHUB_BRANCH", "main")
OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")

if not GITHUB_TOKEN:
    raise RuntimeError("❌ GITHUB_TOKEN not found in environment variables")
if not GITHUB_REPO:
    raise RuntimeError("❌ GITHUB_REPO not found in environment variables")
if not OPENAI_API_KEY:
    raise RuntimeError("❌ OPENAI_API_KEY not found in environment variables")

# --- GitHub client ---
gh = Github(GITHUB_TOKEN)

# --- AI Bug Fixer ---
ai_fixer = AIBugFixer()

# --- FastAPI Root endpoint ---
@app.get("/")
async def root():
    return {"message": "🚀 Auto Hot-Fix Backend Running"}

@app.post("/process-bug")
async def process_bug(
    actual_bug: str = Form(...),
    expected_fix: str = Form(...),
    bug_file: UploadFile = File(None)
):
    """
    AI-Powered Bug Processing:
    1. Read utils.py from GitHub repo
    2. Use AI to analyze the bug and generate a fix
    3. Run tests to verify the fix
    4. Create a new branch + commit
    5. Open a Pull Request
    """
    
    logger.info(f"🐞 Received bug report | Bug: '{actual_bug}' | Expected: '{expected_fix}'")

    try:
        # Log the repository name for debugging
        logger.info(f"🔎 Trying to access GitHub repo: {GITHUB_REPO}")
        repo = gh.get_repo(GITHUB_REPO)
        logger.info(f"✅ Connected to repo: {repo.full_name}")

        # --- Handle optional uploaded file ---
        file_saved_path = None
        if bug_file:
            with tempfile.NamedTemporaryFile(delete=False) as tmp:
                tmp.write(await bug_file.read())
                file_saved_path = tmp.name
            logger.info(f"📂 Uploaded file temporarily saved at: {file_saved_path}")

        # --- Get branch reference ---
        try:
            branch = repo.get_branch(GITHUB_BRANCH)
            logger.info(f"✅ Fetched branch '{branch.name}' | commit SHA: {branch.commit.sha}")
        except Exception as e:
            logger.error(f"❌ Error fetching branch '{GITHUB_BRANCH}': {str(e)}")
            raise HTTPException(status_code=404, detail=f"Branch '{GITHUB_BRANCH}' not found: {e}")

        # --- Read utils.py ---
        try:
            utils_file = repo.get_contents("utils.py", ref=GITHUB_BRANCH)
            utils_content = utils_file.decoded_content.decode("utf-8")
            logger.info(f"✅ Fetched 'utils.py' content")
        except Exception as e:
            logger.error(f"❌ Error fetching 'utils.py': {str(e)}")
            raise HTTPException(status_code=404, detail=f"utils.py not found in branch '{GITHUB_BRANCH}': {e}")

        # --- AI Analysis and Fix Generation ---
        logger.info("🤖 Starting AI analysis...")
        ai_result = ai_fixer.analyze_and_fix_bug(actual_bug, expected_fix, utils_content)
        
        if not ai_result["success"]:
            return {
                "message": f"❌ AI analysis failed: {ai_result.get('error', 'Unknown error')}",
                "branch": GITHUB_BRANCH,
                "pr_url": None,
                "file_saved": file_saved_path,
                "ai_analysis": ai_result
            }

        fixed_code = ai_result["fixed_code"]
        if not fixed_code or fixed_code.strip() == "":
            return {
                "message": "❌ AI could not generate a fix for this bug",
                "branch": GITHUB_BRANCH,
                "pr_url": None,
                "file_saved": file_saved_path,
                "ai_analysis": ai_result
            }

        # --- Run Tests ---
        logger.info("🧪 Running tests on the fixed code...")
        test_result = ai_fixer.run_tests(
    fixed_code,
    ai_result.get("test_cases", []),
    ai_result.get("function_name")  # default fallback
)
        
        if not test_result["success"]:
            logger.warning(f"⚠️ Tests failed: {test_result.get('error', 'Unknown error')}")
            # Block PR creation when tests fail
            return {
                "message": "❌ Tests failed. PR not created.",
                "branch": None,
                "pr_url": None,
                "file_saved": file_saved_path,
                "ai_analysis": ai_result,
                "test_results": test_result
            }

        # --- Create new branch ---
        fix_branch_name = f"ai-fix-{datetime.now().strftime('%Y%m%d%H%M%S')}-{uuid.uuid4().hex[:6]}"
        try:
            repo.create_git_ref(ref=f"refs/heads/{fix_branch_name}", sha=branch.commit.sha)
            logger.info(f"🌿 Created branch: {fix_branch_name}")
        except Exception as e:
            logger.error(f"❌ Failed to create branch: {str(e)}")
            # Return the AI analysis without creating PR - this is actually working!
            return {
                "message": "✅ AI Bug Analysis Complete! (GitHub integration needs token scopes update)",
                "branch": None,
                "pr_url": None,
                "file_saved": file_saved_path,
                "ai_analysis": ai_result,
                "test_results": test_result,
                "ai_fixed_code": ai_result.get("fixed_code", ""),
                "ai_explanation": ai_result.get("explanation", ""),
                "ai_confidence": ai_result.get("confidence", ""),
                "note": "To enable GitHub PR creation, update your token scopes to include 'repo' permission"
            }

        # --- Commit the AI-generated fix ---
        commit_message = f"AI Fix: {ai_result.get('explanation', 'Bug fix generated by AI')}"
        repo.update_file(
            utils_file.path,
            commit_message,
            fixed_code,
            utils_file.sha,
            branch=fix_branch_name,
        )
        logger.info(f"💾 Committed AI fix to {fix_branch_name}")

        # --- Optionally commit uploaded file ---
        if file_saved_path and bug_file:
            with open(file_saved_path, "rb") as f:
                repo.create_file(
                    f"bug_reports/{bug_file.filename}",
                    f"Bug report for: {actual_bug}",
                    f.read(),
                    branch=fix_branch_name,
                )
            logger.info(f"📎 Uploaded bug file committed to bug_reports/{bug_file.filename}")

        # --- Create Pull Request ---
        pr_title = f"AI Fix: {actual_bug}"
        pr_body = f"""## 🤖 AI-Generated Bug Fix

**Bug Description:** {actual_bug}
**Expected Fix:** {expected_fix}

### AI Analysis:
{ai_result.get('analysis', 'No analysis provided')}

### Fix Explanation:
{ai_result.get('explanation', 'No explanation provided')}

### Test Results:
- Tests Passed: {'✅ Yes' if test_result['success'] else '❌ No'}
- Test Output: {test_result.get('output', 'No output')}

### Confidence Level:
{ai_result.get('confidence', 'Unknown')}

---
*This PR was automatically generated by the AI Bug Fixer system.*
"""
        
        pr = repo.create_pull(
            title=pr_title,
            body=pr_body,
            head=fix_branch_name,
            base=GITHUB_BRANCH,
        )
        logger.info(f"🔀 Pull Request created: {pr.html_url}")

        return {
            "message": "✅ AI-powered bug fix completed and PR created successfully",
            "branch": fix_branch_name,
            "pr_url": pr.html_url,
            "file_saved": file_saved_path,
            "ai_analysis": ai_result,
            "test_results": test_result
        }

    except Exception as e:
        logger.error(f"❌ Error processing bug: {str(e)}")
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=f"Failed to process bug report: {str(e)}")


# --- Pydantic model (if you later switch frontend to JSON) ---
class BugReport(BaseModel):
    actual_bug: str
    expected_fix: str
