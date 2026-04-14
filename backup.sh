#!/usr/bin/env bash
set -euo pipefail

SRC="/home/carmi/w/dev/extensions/"
DEST="/mnt/h/carmi/Infomanta/work/backup/extensions/"
ARCHIVE_DIR="${DEST}backups-archive"
ZIP_FILE="${ARCHIVE_DIR}/project-backup.zip"
LOG="$(dirname "$0")/backup.log"

mkdir -p "$DEST" "$ARCHIVE_DIR"

# 1. Detect changed files via rsync dry-run
RSYNC_ITEMIZED=$(rsync -a --dry-run --itemize-changes "$SRC" "$DEST" 2>&1)
CHANGED=$(echo "$RSYNC_ITEMIZED" | grep '^>f' | awk '{print $2}' | grep -v '^\.git/' || true)

if [ -z "$CHANGED" ]; then
  echo "[$(date +"%Y-%m-%d %H:%M:%S")] No changes detected" >> "$LOG"
  echo "No changes to back up."
  exit 0
fi

FILE_COUNT=$(echo "$CHANGED" | wc -l)

# 2. Update the project zip — -FS syncs the zip with the filesystem:
#    adds new files, updates changed files, removes deleted entries
(cd "$SRC" && zip -FS -r "$ZIP_FILE" .)

# 3. Rsync mirror (actual)
rsync -a --info=progress2 "$SRC" "$DEST"

# 4. Log entry
{
  echo "[$(date +"%Y-%m-%d %H:%M:%S")] Backup completed - ${FILE_COUNT} files changed"
  echo "$CHANGED" | sed 's/^/  /'
  echo ""
} >> "$LOG"

echo "Done. ${FILE_COUNT} files backed up and archived."
