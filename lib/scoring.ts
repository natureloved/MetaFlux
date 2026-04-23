import { TableEntity, TestCase, HealthScore } from '../types/openmetadata';

export function computeHealthScore(table: TableEntity, testCases: TestCase[]): HealthScore {
  const warnings: string[] = [];

  // 1. Description Scoring (max 25)
  let descriptionScore = 0;
  const hasTableDescription = !!table.description;
  const columnsWithDescription = table.columns.filter(c => !!c.description).length;
  const columnDescriptionRatio = table.columns.length > 0 ? columnsWithDescription / table.columns.length : 0;

  if (hasTableDescription && columnDescriptionRatio > 0.5) {
    descriptionScore = 25;
  } else if (hasTableDescription) {
    descriptionScore = 12;
    warnings.push("Less than 50% of columns have descriptions");
  } else {
    warnings.push("No table description assigned");
  }

  // 2. Quality Scoring (max 25)
  let qualityScore = 25;
  if (testCases.length > 0) {
    const passingTests = testCases.filter(t => t.testCaseResult?.testCaseStatus === 'Success').length;
    qualityScore = (passingTests / testCases.length) * 25;
    if (passingTests < testCases.length) {
      warnings.push(`${testCases.length - passingTests} data quality tests failing`);
    }
  }

  // 3. Ownership Scoring (max 25)
  let ownershipScore = 0;
  if (table.owners && table.owners.length > 0) {
    ownershipScore = 25;
  } else {
    warnings.push("No owner assigned");
  }

  // 4. Freshness Scoring (max 25)
  let freshnessScore = 0;
  const now = Date.now();
  const thirtyDays = 30 * 24 * 60 * 60 * 1000;
  const ninetyDays = 90 * 24 * 60 * 60 * 1000;

  if (table.updatedAt) {
    const age = now - table.updatedAt;
    if (age < thirtyDays) {
      freshnessScore = 25;
    } else if (age < ninetyDays) {
      freshnessScore = 12;
      warnings.push("Data has not been updated in over 30 days");
    } else {
      warnings.push("Data is stale (over 90 days since last update)");
    }
  } else {
    warnings.push("No update timestamp available");
  }

  const total = Math.round(descriptionScore + qualityScore + ownershipScore + freshnessScore);

  let grade: 'A' | 'B' | 'C' | 'D' | 'F' = 'F';
  if (total >= 80) grade = 'A';
  else if (total >= 65) grade = 'B';
  else if (total >= 50) grade = 'C';
  else if (total >= 35) grade = 'D';

  return {
    total,
    breakdown: {
      description: descriptionScore,
      quality: qualityScore,
      ownership: ownershipScore,
      freshness: freshnessScore,
    },
    grade,
    warnings,
  };
}
