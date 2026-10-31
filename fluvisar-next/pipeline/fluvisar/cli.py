"""
FluviSAR Pipeline Command Line Interface
Authority: plan.md Section 16.4
Commands: doctor, discover, inspect, prepare, variants, evaluate, publish, reproduce
"""

import os
import sys
import json
import shutil
import subprocess
from pathlib import Path

# Add project root to path for imports
BASE_DIR = Path(__file__).resolve().parent.parent.parent
sys.path.insert(0, str(BASE_DIR / "packages" / "contracts"))

try:
    from ruamel.yaml import YAML
    yaml_parser = YAML(typ='safe')
except ImportError:
    import json as yaml_parser

def run_doctor():
    print("==================================================")
    print("      FluviSAR System Diagnostic (Doctor)         ")
    print("      Authority: plan.md Section 16.4             ")
    print("==================================================")
    
    issues = 0
    
    # 1. Python Environment Check
    py_ver = f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}"
    print(f"\n[Python Runtime]: {py_ver} ({sys.executable})")
    if sys.version_info.major < 3 or (sys.version_info.major == 3 and sys.version_info.minor < 11):
        print("  [FAIL] Python 3.11+ is required.")
        issues += 1
    else:
        print("  [OK] Python version compatible.")
        
    # Check core python libraries
    for pkg in ["pydantic", "ruamel.yaml"]:
        try:
            __import__(pkg)
            print(f"  [OK] Module '{pkg}' installed.")
        except ImportError:
            print(f"  [WARN] Optional/Required module '{pkg}' not found.")
            issues += 1

    # 2. Node & npm Check
    node_path = shutil.which("node")
    npm_path = shutil.which("npm")
    if node_path:
        try:
            res = subprocess.run(["node", "-v"], capture_output=True, text=True, check=True)
            print(f"\n[Node.js Runtime]: {res.stdout.strip()} ({node_path})")
            print("  [OK] Node.js available for frontend builds.")
        except Exception:
            print("  [WARN] Node executable failed to return version.")
    else:
        print("\n[Node.js Runtime]: NOT FOUND")
        issues += 1

    if npm_path:
        try:
            res = subprocess.run(["npm", "-v"], capture_output=True, text=True, check=True)
            print(f"  [OK] npm {res.stdout.strip()} available.")
        except Exception:
            pass

    # 3. Git Repository Status
    git_path = shutil.which("git")
    if git_path:
        try:
            res = subprocess.run(["git", "rev-parse", "--short", "HEAD"], capture_output=True, text=True)
            commit = res.stdout.strip() if res.returncode == 0 else "unknown"
            print(f"\n[Git Version Control]: Active (Commit {commit})")
            print("  [OK] Git tracking enabled.")
        except Exception:
            pass

    # 4. Canonical Contracts & Schemas Check
    schemas_idx = BASE_DIR / "packages" / "contracts" / "schemas" / "index.json"
    types_ts = BASE_DIR / "packages" / "contracts" / "src" / "types.ts"
    print("\n[Canonical Data Contracts]:")
    if schemas_idx.exists() and types_ts.exists():
        with open(schemas_idx, "r", encoding="utf-8") as f:
            schemas = json.load(f)
        print(f"  [OK] Schemas verified: {len(schemas)} entity definitions.")
        print(f"  [OK] TypeScript types generated at packages/contracts/src/types.ts.")
    else:
        print("  [FAIL] Schemas or types missing. Run generate_schemas.py first.")
        issues += 1

    # 5. Active Region Configurations Check
    print("\n[Active Regions Configuration]:")
    for region_id in ["jamuna", "sundarbans"]:
        cfg_path = BASE_DIR / "configs" / "regions" / f"{region_id}.yaml"
        if cfg_path.exists():
            with open(cfg_path, "r", encoding="utf-8") as f:
                cfg = yaml_parser.load(f) if hasattr(yaml_parser, 'load') else {}
            name = cfg.get("name", {}).get("en", region_id)
            views = cfg.get("views", [])
            print(f"  [OK] Region '{region_id}' ({name}): {len(views)} views configured {views}.")
        else:
            print(f"  [FAIL] Missing configuration for region '{region_id}'.")
            issues += 1

    # 6. Storage & Directory Integrity
    print("\n[Storage & Artifact Directories]:")
    for d in ["data/raw", "data/derived", "data/demo"]:
        dir_path = BASE_DIR / d
        if dir_path.exists():
            print(f"  [OK] Directory exists: {d}")
        else:
            print(f"  [WARN] Missing directory: {d} (Creating...)")
            dir_path.mkdir(parents=True, exist_ok=True)

    # 7. Credential Presence Check (Without exposing secrets)
    print("\n[Credentials & Source Access Status]:")
    earthdata_user = os.environ.get("EARTHDATA_USERNAME")
    netrc_exists = (Path.home() / "_netrc").exists() or (Path.home() / ".netrc").exists()
    if earthdata_user or netrc_exists:
        auth_source = "EARTHDATA_USERNAME env" if earthdata_user else ".netrc configuration"
        print(f"  [OK] NASA Earthdata credentials detected via {auth_source}.")
    else:
        print("  [INFO] Earthdata Login not detected. (Public metadata discovery works; granule download will require login).")

    print("\n--------------------------------------------------")
    if issues == 0:
        print(">> Status: ALL SYSTEMS OPERATIONAL. Ready for B01 milestone.")
    else:
        print(f">> Status: Completed with {issues} issue(s) to review.")
    print("--------------------------------------------------\n")
    return issues

def main():
    if len(sys.argv) < 2:
        print("Usage: python cli.py <command> [options]")
        print("Available commands: doctor, discover, inspect, prepare, variants, evaluate, publish, reproduce")
        sys.exit(1)
        
    cmd = sys.argv[1].lower()
    if cmd == "doctor":
        sys.exit(run_doctor())
    else:
        print(f"Command '{cmd}' is a planned pipeline command. Full adapter implementation starts in B02.")
        sys.exit(0)

if __name__ == "__main__":
    main()

