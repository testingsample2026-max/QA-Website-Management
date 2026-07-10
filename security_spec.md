# Security Specification: Enterprise QA Test Management System

## 1. Data Invariants
To maintain high integrity, the system must enforce strict data boundaries across all collections:
- **Projects**: Document ID must be a valid ID (`PRJ-N`). Properties must be non-empty strings.
- **Modules**: Must belong to an existing project (`projectId`). ID format `MOD-N`.
- **Requirements**: Must link to a project and module. ID format `REQ-N`.
- **Test Cases**: Title and steps are mandatory. Steps must be an array of objects. ID format `TC-N`.
- **Executions**: ID format `EXE-N`. Must reference a `testCaseId` and have a valid status (`passed`, `failed`, `blocked`, `retest`).
- **Bugs**: ID format `BUG-N`. Must reference a valid `projectId` and `moduleId`.
- **Developers**: ID format `DEV-N`. Email must match standard patterns.
- **QA Engineers**: ID format `QA-N`. Email must match standard patterns.
- **Releases**: ID format `REL-N`. Must reference a valid project.
- **Audit Logs**: ID format `LOG-N`. Timestamps must be valid ISO-8601 strings. No updates or deletes allowed.
- **App Notifications**: ID format `NTF-N`. Read field must be boolean.
- **Settings**: Single document with ID `global` in the settings collection. Must validate preferred configurations.

## 2. The "Dirty Dozen" Payloads
These payloads attempt to breach data integrity, bypass validation, or poison resources:
1. **Ghost Field Poisoning**: Inserting extra unauthorized fields (e.g., `isVerified: true` or `isAdmin: true` inside `projects` or `settings`).
2. **Document ID Poisoning**: Using a massive 1MB string or invalid character set as the document ID (e.g., `PRJ-$$$$$$$$...`).
3. **Invalid Email injection**: Setting a non-email string like `not_an_email` inside a developer profile.
4. **Out-of-Bounds Text**: Sending a 50MB string as a project description.
5. **State Skipping**: Updating a test execution directly to a non-existent state or status.
6. **Immutable Field Alteration**: Modifying the `createdAt` timestamp of a project or requirement after creation.
7. **Type Spoofing**: Sending an integer or a boolean for the `title` field of a `Requirement`.
8. **Audit Log Mutation**: Attempting to update or delete a chronologically logged audit document.
9. **Orphaned Module creation**: Creating a module with a malformed `projectId`.
10. **Shadow Settings Alteration**: Attempting to update settings using fields not defined in the schema.
11. **Negative Runtime Execution**: Sending a negative `runTimeMs` in a test execution.
12. **Malicious Notification Spam**: Injecting bulk notifications with empty message text or massive payload sizes.

## 3. Test Cases Configuration
The security rules inside `firestore.rules` will explicitly block all 12 of these malicious payload formats by validating document ID formats, verifying type safety, enforcing field bounds, and denying updates/deletes where appropriate.
