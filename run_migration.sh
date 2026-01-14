#!/bin/bash

# Load Environment Variables from .env configuration
export $(grep -v '^#' .env | xargs)

echo "🚀 데이터베이스 이사(마이그레이션) 시작!"
echo "---------------------------------------------"

# Check if pg_dump and psql are installed
if ! command -v pg_dump &> /dev/null; then
    echo "❌ pg_dump가 설치되어 있지 않습니다. PostgreSQL을 설치해주세요."
    exit 1
fi

if [ -z "$DATABASE_URL" ]; then
    echo "❌ .env 파일에서 기존 데이터베이스 주소(DATABASE_URL)를 찾을 수 없습니다."
    exit 1
fi

NEW_DB_URL="postgresql://admin:CQb5rgk2VyGcWwJNR442O4wGTbONVVqr@dpg-d5j4urer433s738tpjig-a.singapore-postgres.render.com/ibookee_db"

echo "1️⃣  데이터 이사 시작 (백업과 복원을 동시에 진행합니다)..."
echo "   (PostgreSQL 17 도구를 사용합니다)"

PG_DUMP="/opt/homebrew/opt/postgresql@17/bin/pg_dump"
PSQL="/opt/homebrew/opt/postgresql@17/bin/psql"

# Check if binaries exist, otherwise fallback (though we know they should exist now)
if [ ! -f "$PG_DUMP" ]; then PG_DUMP="pg_dump"; fi
if [ ! -f "$PSQL" ]; then PSQL="psql"; fi

# Pipe with explicit binary paths
$PG_DUMP "$DATABASE_URL" --no-owner --no-privileges --no-sync | $PSQL "$NEW_DB_URL"

if [ ${PIPESTATUS[0]} -eq 0 ] && [ ${PIPESTATUS[1]} -eq 0 ]; then
    echo "✅ 🎉 이사 완료! 데이터가 성공적으로 옮겨졌습니다."
    echo "이제 .env 파일의 DATABASE_URL을 새로 만든 주소로 변경해주세요."
else
    echo "❌ 이사 실패. 위 에러 메시지를 확인해주세요."
fi
