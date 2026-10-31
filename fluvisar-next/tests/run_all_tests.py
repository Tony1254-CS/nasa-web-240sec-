"""
FluviSAR Master Test Runner (Milestone B11)
Authority: plan.md Section 19.2, 20.1 (Milestone B11)
Runs all milestone unit and scientific invariant tests in sequence.
"""

import sys
import subprocess
from pathlib import Path

def main():
    test_dir = Path(__file__).resolve().parent
    python_exe = sys.executable

    test_files = [
        "test_contracts.py",
        "test_b02_source_and_api.py",
        "test_b04_change_and_checks.py",
        "test_b05_sundarbans.py",
        "test_b06_jamuna_decisions.py",
        "test_b07_specialty.py",
        "test_b08_evidence_and_reports.py",
        "test_b09_stories_and_learn.py",
        "test_b10_scenarios_and_comprehension.py",
    ]

    print("======================================================================")
    print("🚀 FLUVISAR MASTER SCIENTIFIC SUITE - RUNNING ALL MILESTONE TESTS")
    print("======================================================================")

    passed_count = 0
    failed_count = 0

    for test_file in test_files:
        test_path = test_dir / test_file
        print(f"\n▶ Executing: {test_file} ...", end=" ", flush=True)
        res = subprocess.run([python_exe, str(test_path)], capture_output=True, text=True)
        if res.returncode == 0:
            print("✅ PASSED")
            passed_count += 1
        else:
            print("❌ FAILED")
            print(res.stdout)
            print(res.stderr)
            failed_count += 1

    print("\n======================================================================")
    print(f"📊 SUMMARY: {passed_count} PASSED, {failed_count} FAILED out of {len(test_files)} suites.")
    print("======================================================================")

    if failed_count > 0:
        sys.exit(1)
    else:
        print("🌟 All FluviSAR scientific invariant test suites PASSED with 0 errors!")

if __name__ == "__main__":
    main()
