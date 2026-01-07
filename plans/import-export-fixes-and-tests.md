# Import/Export Fixes and Unit Tests Plan

## Current Issues Identified

### 1. Date Serialization Problem
- **Issue**: Date objects are serialized as ISO strings during export but not converted back to Date objects during import
- **Impact**: Type mismatches, potential runtime errors when code expects Date objects
- **Location**: [`Settings.tsx:19-39`](../src/features/settings/Settings.tsx:19) (export), [`Settings.tsx:41-93`](../src/features/settings/Settings.tsx:41) (import)

### 2. Weak Validation
- **Issue**: Import only checks if fields exist, not if they have correct structure or valid data
- **Impact**: Invalid data can be imported, causing application crashes
- **Location**: [`Settings.tsx:50-53`](../src/features/settings/Settings.tsx:50)

### 3. No Transaction Safety
- **Issue**: If import fails partway through, data could be in inconsistent state
- **Impact**: Some tables cleared, some not - data corruption
- **Location**: [`Settings.tsx:55-67`](../src/features/settings/Settings.tsx:55)

### 4. No Error Recovery
- **Issue**: If bulkAdd fails, data is already cleared and can't be restored
- **Impact**: Permanent data loss on import failure
- **Location**: [`Settings.tsx:55-67`](../src/features/settings/Settings.tsx:55)

### 5. Missing Version Compatibility
- **Issue**: No check to ensure export file version is compatible with current app version
- **Impact**: Importing incompatible data formats
- **Location**: [`Settings.tsx:51`](../src/features/settings/Settings.tsx:51)

### 6. No ID Conflict Handling
- **Issue**: If importing data with IDs that already exist, bulkAdd will fail
- **Impact**: Import failure when trying to restore from backup
- **Location**: [`Settings.tsx:63-67`](../src/features/settings/Settings.tsx:63)

### 7. No Data Integrity Checks
- **Issue**: No verification that foreign keys reference valid entities
- **Impact**: Orphaned records, broken relationships
- **Location**: [`Settings.tsx:63-67`](../src/features/settings/Settings.tsx:63)

### 8. No Rollback Mechanism
- **Issue**: If import fails, there's no way to restore previous state
- **Impact**: Permanent data loss on import failure
- **Location**: [`Settings.tsx:55-67`](../src/features/settings/Settings.tsx:55)

### 9. Poor Testability
- **Issue**: Import/export logic is embedded in React component
- **Impact**: Difficult to unit test, requires full component rendering
- **Location**: [`Settings.tsx:19-93`](../src/features/settings/Settings.tsx:19)

### 10. No Testing Framework
- **Issue**: No testing tools installed in the project
- **Impact**: Cannot verify import/export functionality

## Proposed Solution

### Phase 1: Refactor Import/Export Logic

#### 1.1 Create Import/Export Service
Create a new service file: [`src/lib/importExportService.ts`](../src/lib/importExportService.ts)

This service will:
- Handle all import/export logic separately from UI
- Provide pure functions for better testability
- Implement transaction safety with rollback
- Add comprehensive validation
- Handle date serialization/deserialization properly
- Support version compatibility checking

#### 1.2 Implement Date Handling
- Create helper functions to convert Date objects to/from ISO strings
- Ensure all Date fields are properly handled during export/import

#### 1.3 Add Comprehensive Validation
- Validate export data structure before import
- Check for required fields and correct types
- Validate foreign key relationships
- Verify data integrity

#### 1.4 Implement Transaction Safety
- Use Dexie transactions to ensure atomic operations
- Implement rollback mechanism on failure
- Backup existing data before import

#### 1.5 Add Version Compatibility
- Define supported export versions
- Add version migration logic if needed
- Reject incompatible export files

### Phase 2: Set Up Testing Framework

#### 2.1 Install Testing Dependencies
```bash
npm install -D vitest @vitest/ui @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
```

#### 2.2 Configure Vitest
Create [`vitest.config.ts`](../vitest.config.ts) with:
- Test environment setup
- Coverage configuration
- Path aliases

#### 2.3 Add Test Scripts to package.json
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage"
  }
}
```

### Phase 3: Create Unit Tests

#### 3.1 Test Structure
Create test files in `src/__tests__/` directory:
- `importExportService.test.ts` - Core import/export logic tests
- `dateHelpers.test.ts` - Date serialization tests
- `validation.test.ts` - Data validation tests

#### 3.2 Test Coverage Areas

**Export Tests:**
- Export creates valid ExportData structure
- Export includes all required fields
- Export serializes Date objects correctly
- Export handles empty data sets
- Export handles large data sets
- Export creates downloadable blob correctly

**Import Tests:**
- Import successfully loads valid data
- Import rejects invalid JSON
- Import rejects missing required fields
- Import rejects wrong data types
- Import handles date deserialization correctly
- Import validates foreign key relationships
- Import clears existing data before adding new data
- Import rolls back on failure
- Import handles ID conflicts gracefully
- Import checks version compatibility
- Import reports correct counts for each entity type
- Import handles partial data (optional fields missing)

**Date Handling Tests:**
- Date to ISO string conversion
- ISO string to Date conversion
- Handles null/undefined dates
- Handles invalid date strings

**Validation Tests:**
- Validates ExportData structure
- Validates Account objects
- Validates Category objects
- Validates Tag objects
- Validates Transaction objects
- Validates Budget objects
- Checks foreign key relationships
- Returns detailed error messages

**Integration Tests:**
- Export then import roundtrip preserves data
- Import with existing data replaces correctly
- Import failure doesn't corrupt existing data
- Multiple imports in sequence work correctly

#### 3.3 Test Utilities

Create [`src/__tests__/testHelpers.ts`](../src/__tests__/testHelpers.ts) with:
- Mock data generators for all entity types
- Helper functions for creating test databases
- Helper functions for creating test files

### Phase 4: Update Settings Component

#### 4.1 Refactor Settings.tsx
- Remove import/export logic from component
- Use the new importExportService
- Simplify component to focus on UI only
- Add better error handling and user feedback

### Phase 5: Manual Testing

#### 5.1 Test Scenarios
- Export data with various entity types
- Import exported data
- Import corrupted JSON file
- Import file with missing fields
- Import file with wrong data types
- Import file with invalid foreign keys
- Import file with wrong version
- Test with large datasets
- Test with empty datasets

## Implementation Steps

### Step 1: Create Import/Export Service
- Create [`src/lib/importExportService.ts`](../src/lib/importExportService.ts)
- Implement export function with date serialization
- Implement import function with validation and transaction safety
- Add rollback mechanism

### Step 2: Create Date Helper Functions
- Create [`src/lib/dateHelpers.ts`](../src/lib/dateHelpers.ts)
- Implement serializeDate function
- Implement deserializeDate function
- Handle edge cases (null, undefined, invalid strings)

### Step 3: Create Validation Functions
- Create [`src/lib/validation.ts`](../src/lib/validation.ts)
- Implement validateExportData function
- Implement validateAccount function
- Implement validateCategory function
- Implement validateTag function
- Implement validateTransaction function
- Implement validateBudget function
- Implement validateForeignKeys function

### Step 4: Install and Configure Testing Framework
- Install Vitest and related dependencies
- Create [`vitest.config.ts`](../vitest.config.ts)
- Update [`package.json`](../package.json) with test scripts
- Create test directory structure

### Step 5: Write Unit Tests
- Create [`src/__tests__/importExportService.test.ts`](../src/__tests__/importExportService.test.ts)
- Create [`src/__tests__/dateHelpers.test.ts`](../src/__tests__/dateHelpers.test.ts)
- Create [`src/__tests__/validation.test.ts`](../src/__tests__/validation.test.ts)
- Create [`src/__tests__/testHelpers.ts`](../src/__tests__/testHelpers.ts)

### Step 6: Update Settings Component
- Refactor [`Settings.tsx`](../src/features/settings/Settings.tsx) to use new service
- Remove inline import/export logic
- Improve error handling and user feedback

### Step 7: Manual Verification
- Test export functionality
- Test import functionality
- Test error scenarios
- Verify data integrity

## File Structure After Implementation

```
src/
├── __tests__/
│   ├── importExportService.test.ts
│   ├── dateHelpers.test.ts
│   ├── validation.test.ts
│   └── testHelpers.ts
├── lib/
│   ├── importExportService.ts (NEW)
│   ├── dateHelpers.ts (NEW)
│   └── validation.ts (NEW)
└── features/
    └── settings/
        └── Settings.tsx (REFACTORED)

vitest.config.ts (NEW)
```

## Success Criteria

1. All import/export logic is extracted from Settings component
2. Date serialization/deserialization works correctly
3. Comprehensive validation prevents invalid data import
4. Transaction safety prevents data corruption
5. Rollback mechanism preserves data on import failure
6. Version compatibility checks prevent incompatible imports
7. Unit tests cover all critical paths
8. Tests achieve >80% code coverage
9. Manual testing confirms functionality works as expected
10. No existing functionality is broken

## Risk Mitigation

1. **Data Loss Risk**: Always backup data before import operations
2. **Breaking Changes**: Maintain backward compatibility with existing export files
3. **Test Coverage**: Ensure comprehensive tests before refactoring
4. **Gradual Migration**: Can implement incrementally if needed
