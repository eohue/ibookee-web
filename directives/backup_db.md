# Database Backup Directive

## Goal
Create a backup of the PostgreSQL database and upload it to the configured storage provider (S3 or Supabase).

## Tools
-   **Script**: `scripts/backup-db.ts`
-   **Command**: `npm run db:backup`

## Pre-requisites
-   `.env` file must be configured with:
    -   `DATABASE_URL`
    -   Storage credentials (AWS S3 or Supabase)

## Execution Steps
1.  Run the backup command:
    ```bash
    npm run db:backup
    ```
2.  Monitor the output for "Backup uploaded successfully" or "Backup process completed".

## Error Handling
-   If `DATABASE_URL` is missing, the script will exit with an error. Check `.env`.
-   If storage is not configured, the backup will be saved locally in `/tmp`.
