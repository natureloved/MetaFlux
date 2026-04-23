import json
from client import OpenMetadataClient


def get_data_quality_status(om: OpenMetadataClient, table_fqn: str) -> str:
    """
    Get data quality test results and status for a table.

    Args:
        table_fqn: Fully qualified name of the table to check
    """
    try:
        response = om.get_data_quality(table_fqn)
        test_cases = response.get("data", [])

        if not test_cases:
            return f"No data quality tests found for '{table_fqn}'. Tests may not be configured yet."

        passed = []
        failed = []
        aborted = []

        for tc in test_cases:
            result = tc.get("testCaseResult", {})
            status = result.get("testCaseStatus", "Unknown")
            test_info = {
                "name": tc.get("name"),
                "description": tc.get("description") or "",
                "status": status,
                "result": result.get("result") or "",
                "lastRun": result.get("timestamp"),
            }

            if status == "Success":
                passed.append(test_info)
            elif status == "Failed":
                failed.append(test_info)
            else:
                aborted.append(test_info)

        total = len(test_cases)
        pass_rate = round(len(passed) / total * 100, 1) if total > 0 else 0

        summary = {
            "table": table_fqn,
            "overallHealth": "✅ Healthy" if len(failed) == 0 else "❌ Issues Detected",
            "passRate": f"{pass_rate}%",
            "totalTests": total,
            "passed": len(passed),
            "failed": len(failed),
            "aborted": len(aborted),
            "failingTests": failed,
            "passingTests": [t["name"] for t in passed],
        }

        return json.dumps(summary, indent=2)
    except Exception as e:
        return f"Could not retrieve data quality status: {str(e)}"
