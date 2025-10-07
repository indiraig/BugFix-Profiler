from github import Github
import os

gh = Github(os.getenv("GITHUB_TOKEN"))
repo = gh.get_repo("indiraig/Auto-Hot-fix")
print("Repo full name:", repo.full_name)
print("Default branch:", repo.default_branch)

file = repo.get_contents("utils.py", ref="main")
print("File path:", file.path)
print("SHA:", file.sha)
