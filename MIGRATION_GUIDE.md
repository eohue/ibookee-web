# 🚨 긴급: 운영 서버(Production) 데이터베이스 업데이트 필요

현재 운영 사이트(`ibookee-web.onrender.com`)에서 **500 오류**가 발생하는 이유는 데이터베이스 구조가 최신 코드를 반영하지 못했기 때문입니다.
(최근 추가된 `pdfUrl` 컬럼이 실제 운영 DB에는 없습니다.)

이 문제를 해결하려면 **터미널에서 아래 명령어를 한 번 실행**해야 합니다.

## 실행 방법

1.  **Render 접속 정보 확인**
    *   [Render 대시보드](https://dashboard.render.com/) 접속 -> **PostgreSQL** (ibookee-db) 선택.
    *   **External Database URL**을 복사하세요. (예: `postgres://admin:password@...`)

2.  **명령어 실행 (터미널)**
    *   아래 명령어의 `[여기에_URL_붙여넣기]` 부분을 복사한 URL로 바꿔서 실행하세요.

```bash
DATABASE_URL="postgresql://admin:CQb5rgk2VyGcWwJNR442O4wGTbONVVqr@dpg-d5j4urer433s738tpjig-a.singapore-postgres.render.com/ibookee_db" npm run db:push
```

### 예시
```bash
DATABASE_URL="postgres://admin:AbCdEfG@dpg-c12345-a.singapore-postgres.render.com/ibookee_db" npm run db:push
```

3.  **확인**
    *   명령어가 성공적으로 실행되면 터미널에 `Apply` 또는 `Success` 메시지가 뜹니다.
    *   운영 사이트를 새로고침하면 정상적으로 보일 것입니다.
