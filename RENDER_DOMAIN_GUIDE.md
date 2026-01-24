# 🌐 Render 커스텀 도메인(기존 도메인) 연결 가이드

이미 보유하고 계신 도메인(예: `ibookee.kr`)을 Render 서비스에 연결하는 방법입니다.

---

## 1단계: Render 대시보드에서 도메인 추가

1.  [Render 대시보드](https://dashboard.render.com/)에 접속합니다.
2.  **`ibookee-web`** 서비스를 클릭합니다.
3.  왼쪽 메뉴에서 **[Settings]**를 클릭합니다.
4.  스크롤을 내려 **Custom Domains** 섹션을 찾습니다.
5.  **[Add Custom Domain]** 버튼을 클릭합니다.
6.  연결할 도메인 주소를 입력합니다. (예: `ibookee.kr`)
    *   `www.ibookee.kr` 처럼 `www`를 포함해서 입력하는 것이 좋습니다. Render가 알아서 루트 도메인까지 같이 설정해줍니다.
7.  **[Save]**를 누릅니다.

---

## 2단계: DNS 설정 (중요 ⭐️)

도메인을 구입한 곳(가비아, 후이즈, 호스팅어, Godaddy 등)의 관리 페이지에 접속해서 **DNS 설정(DNS 레코드 관리)** 메뉴로 이동해야 합니다.

다음 **두 가지 레코드**를 추가하세요. 이미 있다면 수정하세요.

### 1. 루트 도메인 (ibookee.kr) 연결
*   **유형 (Type)**: `A`
*   **호스트 (Host/Name)**: `@` (또는 빈칸)
*   **값 (Value/Data)**: `216.24.57.1`
    *   *(이 IP는 Render의 고정 로드밸런서 IP입니다)*

### 2. 서브 도메인 (www.ibookee.kr) 연결
*   **유형 (Type)**: `CNAME`
*   **호스트 (Host/Name)**: `www`
*   **값 (Value/Data)**: `ibookee-web.onrender.com`
    *   *(Render 대시보드 상단에 있는 본인의 서비스 주소입니다. 정확히 확인해주세요!)*

---

## 3단계: 연결 확인 (Verify)

1.  DNS 설정을 마쳤다면 다시 Render 대시보드의 **Custom Domains** 섹션으로 돌아옵니다.
2.  도메인 옆에 **Verify** 버튼이 있다면 누릅니다. (없으면 자동으로 확인 중인 것입니다)
3.  **DNS 반영 시간**:
    *   빠르면 5분, 늦으면 1~2시간 정도 소요될 수 있습니다.
    *   상태가 `Verified` 또는 `Certificate Issued`로 바뀌면 연결 성공입니다.

### ✅ 참고사항
*   연결이 완료되면 `http://` 주소로 접속해도 자동으로 안전한 `https://` (SSL 보안) 주소로 연결됩니다.
*   "Privacy Error" 등이 뜬다면, 아직 SSL 인증서가 발급 중인 것이니 10분 정도 기다려보세요.
