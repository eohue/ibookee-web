# 🐘 Render 데이터베이스 생성 가이드

Neon을 대체할 **Render 전용 데이터베이스**를 만드는 방법입니다.

---

## 1단계: 데이터베이스 생성

1.  [Render 대시보드](https://dashboard.render.com/) 상단의 **[New +]** 버튼을 누르고 **[PostgreSQL]**을 선택합니다.
2.  설정값을 입력합니다:
    *   **Name**: `ibookee-db` (자유롭게 입력)
    *   **Database**: `ibookee_db` (자유롭게 입력)
    *   **User**: `admin` (자유롭게 입력)
    *   **Region**: `Singapore (Southeast Asia)` (웹 서비스와 가까운 곳 추천, 서울이 없다면 싱가포르)
    *   **PostgreSQL Version**: `16` (또는 최신 버전)
    *   **Plan**: **Free** (무료 플랜 선택)
        *   *주의: 무료 DB는 90일 후 만료되거나 중지될 수 있으므로, 안정적인 운영을 위해서는 나중에 유료($7)로 업그레이드하는 것이 좋습니다.*
3.  **[Create Database]** 버튼을 클릭합니다.

## 2단계: 연결 정보 복사 (중요!)

생성이 완료되면(`Available` 상태), **[Info]** 탭이나 화면 중간에 있는 **Connections** 섹션을 봅니다.

1.  **External Database URL** (외부 접속 주소)
    *   `postgres://admin:password@...` 처럼 생긴 긴 주소입니다.
    *   이 주소를 **복사**해 두세요. (데이터 이사용)

2.  **Internal Database URL** (내부 접속 주소)
    *   이것도 나중에 필요하니 확인해 두세요. (웹 서비스 연결용)

---

## 3단계: 준비 완료
여기까지 하셨으면 준비 끝입니다! 이제 제가 드리는 **마이그레이션 스크립트**를 실행하면 데이터가 자동으로 옮겨집니다.
