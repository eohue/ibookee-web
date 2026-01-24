# 🚀 Supabase + Vercel 설정 가이드

이 가이드에 따라 Supabase 프로젝트를 생성하고 Vercel에 배포하세요.

---

## Step 1: Supabase 프로젝트 생성

1. [supabase.com](https://supabase.com) 접속 → **Start your project**
2. GitHub로 로그인
3. **New Project** 클릭
4. 설정:
   - **Organization**: 본인 계정 선택
   - **Name**: `ibookee-production`
   - **Database Password**: 강력한 비밀번호 (⭐ **저장해두세요!**)
   - **Region**: `Northeast Asia (Seoul)` ✅
5. **Create new project** 클릭 (2~3분 대기)

---

## Step 2: 연결 정보 확인

프로젝트 생성 후:
1. 왼쪽 메뉴 **Project Settings** (⚙️ 아이콘)
2. **Database** 탭 클릭
3. **Connection string** 섹션에서 **URI** 복사

형식: `postgres://postgres:[PASSWORD]@db.[PROJECT_REF].supabase.co:5432/postgres`

> ⚠️ `[PASSWORD]`를 Step 1에서 설정한 비밀번호로 교체하세요!

---

## Step 3: 데이터 마이그레이션

### 3.1 현재 Render DB 백업
```bash
# Render DB 정보는 Render Dashboard > Database > Connection에서 확인
pg_dump "postgres://[USER]:[PASS]@[HOST]/[DB]" -F c -f ibookee_backup.dump
```

### 3.2 Supabase로 복원
```bash
pg_restore -h db.[PROJECT_REF].supabase.co -U postgres -d postgres ibookee_backup.dump
```
비밀번호 입력 시 Step 1에서 설정한 비밀번호 사용

---

## Step 4: Vercel 배포

1. [vercel.com](https://vercel.com) 접속 → GitHub 로그인
2. **Add New** → **Project**
3. GitHub 레포지토리 `Ibookee-Renew` 선택
4. **Environment Variables** 설정:

| Key | Value | 비고 |
|-----|-------|-----|
| `DATABASE_URL` | Supabase 연결 문자열 | |
| `SESSION_SECRET` | 랜덤 문자열 (32자 이상) | |
| `SUPABASE_URL` | `https://[ID].supabase.co` | **Storage 필수** |
| `SUPABASE_SERVICE_ROLE_KEY` | `service_role` secret (Settings > API) | **Storage 필수** |
| `AWS_ACCESS_KEY_ID` | (선택사항) S3 사용 시 | |
| `AWS_SECRET_ACCESS_KEY` | (선택사항) S3 사용 시 | |
| `AWS_BUCKET_NAME` | (선택사항) S3 사용 시 | |
| `AWS_REGION` | (선택사항) S3 사용 시 | |
| `NODE_ENV` | `production` | |

5. **Deploy** 클릭

---

## Step 4-1: Supabase Storage 설정 (이미지 문제 해결!) - NEW!

Vercel에서 이미지 업로드 및 유지(엑박, 수정 오류 해결)를 위해 **반드시 필요**합니다. (무료)

1. **Supabase 대시보드** 접속 > 왼쪽 메뉴 **Storage**
2. **New Bucket** 클릭
   - Name: `uploads` (**정확히 입력**)
   - **Public bucket**: ✅ **ON** (**필수!**)
   - Save
3. **Vercel 환경 변수 확인**:
   - 위 Step 4에서 `SUPABASE_URL`과 `SUPABASE_SERVICE_ROLE_KEY`를 넣었는지 확인하세요.
   - ‼️ `SUPABASE_SERVICE_ROLE_KEY`는 `anon` 키가 아니라 **`service_role`** 키여야 합니다. (Project Settings > API 메뉴에 있음)
4. **Redeploy**: 환경 변수를 추가했다면 Vercel의 **Deployments** 탭에서 최신 배포를 **Redeploy** 해야 적용됩니다.

---

## Step 5: 도메인 연결 (선택사항)

1. Vercel 프로젝트 > **Settings** > **Domains**
2. 기존 도메인 추가
3. DNS 레코드 설정 (A 또는 CNAME)

---

## ✅ 완료 후 확인사항

- [ ] 메인 페이지 로딩
- [ ] 로그인/로그아웃 작동
- [ ] Admin 페이지 접근
- [ ] 이미지 업로드 (S3)
- [ ] 데이터 CRUD 작동

문제 발생 시 Vercel Logs에서 에러 확인!
