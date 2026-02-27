# Padlet API 전체 분석 보고서

> 분석일: 2026-02-27
> API 문서: https://docs.padlet.dev/reference/introduction
> API Base URL: `https://api.padlet.dev/v1/`

---

## 1. 개요

Padlet API는 JSON:API 스펙을 따르는 RESTful API로, 사용자가 Padlet 보드와 게시물을 프로그래밍 방식으로 관리할 수 있게 해준다.

### 핵심 특징
- **JSON:API 스펙 준수** - 모든 요청/응답이 표준화되고 예측 가능
- **camelCase** 프로퍼티 명명 규칙
- **빈 문자열(`""`) 미지원** - null 사용 필요
- **유료 구독 필수** (Neon, Gold, Platinum 플랜)

---

## 2. 인증 (Authentication)

```
Header: x-api-key: <your_api_key>
```

### API 키 발급 방법
**방법 1:**
1. 대시보드 → 설정(톱니바퀴) 클릭
2. Personal account → Developer
3. 'API key' 옆 **Generate** 클릭 → 복사

**방법 2:**
1. 패들렛에서 더보기 메뉴(...) 클릭
2. Developer 버튼 클릭
3. 분홍색 박스에서 Generate 클릭

### 접근 제한
- **개인 계정** 전용 (Neon, Gold, Platinum)
- 그룹 계정은 API 접근은 가능하나, 쿼타는 개인 플랜 기준
- API 키로 수행한 모든 작업은 **개인 쿼타**에 카운트
- **관리자(Admin) 권한** 필요 - 본인이 만든 패들렛이거나, 관리자 권한으로 초대받은 패들렛만 접근 가능

---

## 3. 에러 처리 & Rate Limiting

### Rate Limit
- **250 요청/분** (IP 기준)
- 초과 시 `429 Too Many Requests` 응답

### 에러 응답 구조
```json
{
  "errors": [{
    "status": "HTTP 상태 코드",
    "title": "에러 일반 설명",
    "detail": "에러 상세 설명",
    "code": "에러 고유 코드 (상세 핸들링용)"
  }]
}
```

### 주요 HTTP 상태 코드
| 코드 | 의미 |
|------|------|
| 200 | 성공 |
| 201 | 생성 성공 |
| 400 | 잘못된 요청 |
| 401 | 인증 실패 |
| 403 | 권한 없음 |
| 404 | 리소스 없음 |
| 422 | 처리 불가 (예: 중복 리액션) |
| 429 | Rate limit 초과 |

---

## 4. API 엔드포인트 전체 목록

### 4.1 Board (보드) 관련

#### `GET /v1/boards/{board_id}` - 보드 조회
- **설명**: 지정된 ID의 보드 정보를 가져온다
- **권한**: Admin 접근 필요
- **쿼리 파라미터**: `?include=posts,sections,comments` (관련 데이터 포함)
- **board_id**: 패들렛 URL에 포함된 ID

```bash
curl -X GET "https://api.padlet.dev/v1/boards/{board_id}?include=posts,sections,comments" \
  -H "x-api-key: YOUR_API_KEY"
```

### 4.2 Post (게시물) 관련

#### `POST /v1/boards/{board_id}/posts` - 게시물 생성
- **설명**: 보드에 새 게시물을 만들고 post 객체를 반환
- **권한**: Admin 접근 필요
- **첨부파일**: 링크로 전송 가능 (직접 업로드는 향후 버전에서 지원 예정)

```bash
curl -X POST "https://api.padlet.dev/v1/boards/{board_id}/posts" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "type": "post",
      "attributes": {
        "content": {
          "subject": "제목",
          "bodyHtml": "<p>본문 내용</p>",
          "attachment": {
            "url": "https://example.com/image.jpg",
            "caption": "이미지 설명"
          }
        },
        "color": null
      }
    }
  }'
```

#### `GET /v1/posts/{post_id}/attachment-data` - 게시물 첨부 데이터 조회
- **설명**: post_id로 첨부파일 객체 반환
- **권한**: Admin 접근 필요

### 4.3 Reaction (리액션) 관련

#### `POST /v1/posts/{post_id}/reactions` - 리액션 생성
- **설명**: 인증된 사용자로 게시물에 리액션 생성, reaction 객체 반환
- **제약**: 사용자당 게시물당 **1개만** 가능
- **중복 시**: `422` 에러 반환 (기존 리액션 업데이트 안됨)

### 4.4 User (사용자) 관련

#### `GET /v1/me` - 현재 사용자 정보 조회
- **설명**: 인증된 사용자의 정보와 관계 데이터 반환
- **쿼리 파라미터**: `?include=boards,organizations`

```bash
curl -X GET "https://api.padlet.dev/v1/me?include=boards,organizations" \
  -H "x-api-key: YOUR_API_KEY"
```

### 4.5 AI Recipe Board (AI 레시피 보드) 관련

#### `POST /v1/ai-recipe-boards` - AI 레시피 보드 생성
- **설명**: 자연어 지시로 AI 생성 보드를 만든다
- **비동기 처리**: 즉시 status URL 반환 → 폴링으로 완료 확인
- **흐름**:
  1. POST 요청 → status URL 수신
  2. status URL 폴링 (주기적으로 GET)
  3. 보드 생성 완료 시 board 데이터 반환

```bash
curl -X POST "https://api.padlet.dev/v1/ai-recipe-boards" \
  -H "x-api-key: YOUR_API_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "data": {
      "type": "ai_recipe_board",
      "attributes": {
        "boardCreationInstructions": "Create a vocabulary board for 5th grade science terms about the solar system",
        "role": "teacher",
        "workspaceId": "abcd1234efgh5678"
      }
    }
  }'
```

**응답 예시:**
```json
{
  "data": {
    "type": "aiRecipeBoardStatusUrl",
    "attributes": {
      "statusUrl": "https://padlet.dev/api/public/v1/ai-recipe-boards/status/ai_recipe_board_7e3e243039"
    }
  }
}
```

---

## 5. 데이터 객체 (Object Types) 상세

### 5.1 Board Object

> **board_id 찾기**: 패들렛 URL 끝의 16자 문자열 또는 더보기(...) → Developer 버튼에서 확인

```json
{
  "data": {
    "id": "board_id",
    "type": "board",
    "attributes": {
      "title": "보드 제목",
      "description": "보드 설명",
      "builder": {
        "username": "사용자명",
        "shortName": "짧은 이름",
        "fullName": "전체 이름",
        "avatarUrl": "프로필 이미지 URL"
      },
      "iconUrl": "아이콘 URL",
      "wallpaper": "배경 이미지 정보",
      "webUrl": {
        "live": "https://padlet.com/...",
        "qrCode": "QR코드 URL",
        "slideshow": "슬라이드쇼 URL",
        "slideshowQrCode": "슬라이드쇼 QR코드 URL"
      },
      "domainName": "도메인명",
      "settings": {
        "font": "폰트 설정",
        "colorScheme": "색상 스킴"
      },
      "customFields": {},
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    },
    "relationships": {
      "posts": { "data": [...] },
      "sections": { "data": [...] },
      "comments": { "data": [...] }
    }
  }
}
```

### 5.2 Post Object
```json
{
  "data": {
    "id": "post_id",
    "type": "post",
    "attributes": {
      "author": {
        "username": "사용자명",
        "shortName": "짧은 이름",
        "fullName": "전체 이름",
        "avatarUrl": "프로필 이미지 URL"
      },
      "sortIndex": 0,
      "content": {
        "subject": "게시물 제목",
        "bodyHtml": "<p>HTML 본문</p>",
        "attachment": {
          "url": "첨부 URL",
          "caption": "캡션"
        },
        "updatedAt": "2025-01-01T00:00:00Z"
      },
      "color": null,
      "status": "approved",
      "mapProps": {
        "longitude": 0.0,
        "latitude": 0.0,
        "locationName": "위치명"
      },
      "canvasProps": {
        "left": 0,
        "top": 0,
        "width": 300
      },
      "webUrl": {
        "live": "https://padlet.com/..."
      },
      "createdAt": "2025-01-01T00:00:00Z",
      "updatedAt": "2025-01-01T00:00:00Z"
    },
    "relationships": {
      "board": { ... },
      "section": { ... },
      "attachmentData": { ... }
    }
  }
}
```

### 5.3 Comment Object
```json
{
  "data": {
    "id": "comment_id",
    "type": "comment",
    "attributes": {
      "htmlContent": "<p>댓글 내용</p>",
      "attachment": { ... },
      "status": "approved",
      "createdAt": "...",
      "updatedAt": "..."
    },
    "relationships": {
      "post": { ... },
      "author": { ... }
    }
  }
}
```
> **주의**: `htmlContent` 또는 `attachment` 중 최소 하나는 반드시 있어야 함

### 5.4 Section Object
```json
{
  "data": {
    "id": "section_id",
    "type": "section",
    "attributes": {
      "title": "섹션 제목",
      "sortIndex": 0,
      "createdAt": "...",
      "updatedAt": "..."
    },
    "relationships": {
      "board": { ... }
    }
  }
}
```

### 5.5 Reaction Object
```json
{
  "data": {
    "id": "reaction_abc123def456",
    "type": "reaction",
    "attributes": {
      "value": 1,
      "reactionType": "like",
      "createdAt": "...",
      "updatedAt": "..."
    },
    "relationships": {
      "post": { ... },
      "board": { ... }
    }
  }
}
```
> **참고**: 사용자 정보는 reaction 응답에 포함되지 않음

### 5.6 User Object
```json
{
  "data": {
    "id": "user_abcd1234efgh5678",
    "type": "user",
    "attributes": {
      "email": "user@example.com",
      "name": "이름",
      "username": "사용자명",
      "displayName": "표시 이름",
      "avatar": "아바타 URL",
      "bio": "자기소개"
    },
    "relationships": {
      "boards": { "data": [...] },
      "organizations": { "data": [...] }
    }
  }
}
```

### 5.7 AI Recipe Board Creation Status URL Object
- AI 레시피 보드 생성 상태를 폴링하기 위한 URL 객체
- 비동기 생성 프로세스의 상태 추적용

---

## 6. 실질적으로 할 수 있는 것들

### 6.1 핵심 기능 (API 직접 지원)

| 기능 | 엔드포인트 | 설명 |
|------|-----------|------|
| 보드 데이터 조회 | `GET /boards/{id}` | 보드 전체 정보 (게시물, 섹션, 댓글 포함) |
| 게시물 생성 | `POST /boards/{id}/posts` | 새 게시물 작성 (제목, 본문, 링크 첨부) |
| 리액션 추가 | `POST /posts/{id}/reactions` | 게시물에 좋아요/리액션 |
| 첨부 데이터 조회 | `GET /posts/{id}/attachment-data` | 게시물 첨부파일 상세 정보 |
| 내 정보 조회 | `GET /me` | 본인 계정, 보드 목록, 조직 정보 |
| AI 보드 생성 | `POST /ai-recipe-boards` | 자연어로 AI 보드 자동 생성 |

### 6.2 활용 시나리오

#### 자동화 (Automation)
- **폼 → 패들렛 연동**: Google Form/Typeform 응답을 자동으로 패들렛 게시물로 생성
- **일정 기반 게시**: 특정 시간에 자동으로 게시물 올리기
- **데이터 수집**: 보드 데이터를 주기적으로 가져와 분석/백업
- **알림 시스템**: 보드 변경사항 감지하여 이메일/슬랙 알림

#### 교육 (Education)
- **과제 자동 게시**: 학기 스케줄에 맞춰 과제를 자동 게시
- **학생 피드백 수집**: 수업 후 자동으로 피드백 보드 생성
- **출석/참여 추적**: 게시물/리액션 데이터로 학생 참여도 분석

#### 콘텐츠 관리
- **대량 게시물 생성**: CSV/Excel 데이터를 일괄 게시물로 변환
- **크로스 플랫폼 게시**: 블로그/SNS 콘텐츠를 패들렛에 동시 게시
- **콘텐츠 백업**: 보드 전체 데이터를 JSON으로 백업

#### AI 활용
- **AI 보드 자동 생성**: 자연어 프롬프트로 구조화된 보드 자동 생성
- **브레인스토밍 보드**: AI가 주제에 맞는 초기 콘텐츠 생성

### 6.3 외부 연동 (No-Code)
- **Zapier**: 8,000+ 앱과 연동 (트리거: 보드 업데이트, 게시물 삭제 / 액션: 보드/게시물 생성·수정, 섹션 삭제)
- **Make (Integromat)**: 비주얼 워크플로우 자동화

---

## 7. 제한사항 & 주의점

| 제한사항 | 설명 |
|----------|------|
| **유료 전용** | 무료 계정에서는 API 사용 불가 |
| **관리자 권한 필수** | 본인이 만든 보드 또는 관리자 권한이 있는 보드만 접근 |
| **Rate Limit** | 250 요청/분 (IP 기준) |
| **첨부파일 제한** | 직접 업로드 불가, URL 링크로만 첨부 (향후 개선 예정) |
| **리액션 제한** | 사용자당 게시물당 1개만 가능 |
| **빈 문자열 불가** | `""` 대신 `null` 사용 필요 |
| **개인 쿼타** | 그룹 계정이어도 개인 쿼타에 카운트 |
| **읽기 전용 제한** | 보드 생성/수정/삭제, 게시물 수정/삭제 API는 문서에서 확인 불가 (V1 한정적 지원) |
| **리액션 기능 필수** | 리액션 생성하려면 보드에서 Reaction 기능이 활성화되어 있어야 함 |
| **HTTPS 필수** | 모든 API 호출은 HTTPS로만 가능 |

---

## 8. Python SDK

PyPI에 `padlet-py` 패키지가 존재하며, async/await 래퍼로 보드 조회 및 게시물 생성을 지원한다.

```bash
pip install padlet-py
```

---

## 9. 이 프로젝트(Semester Schedule Generator)와의 연동 가능성

본 프로젝트는 학기 일정 생성기이므로, Padlet API와 다음과 같이 연동할 수 있다:

1. **학기 일정 → 패들렛 보드 자동 게시**
   - 생성된 일정을 패들렛 보드에 자동으로 게시물로 생성
   - 주차별/과목별 섹션으로 구분하여 시각화

2. **AI 레시피 보드로 학기 플랜 생성**
   - 자연어로 "16주 컴퓨터공학 수업 일정" 같은 프롬프트로 AI 보드 자동 생성

3. **학생 참여 데이터 수집**
   - 리액션/댓글 데이터로 학생들의 일정 확인 여부 추적

4. **보드 데이터 백업/내보내기**
   - 패들렛 보드의 일정 데이터를 JSON으로 가져와 다른 시스템에 활용

---

## 10. 참고 링크

- [Padlet API Introduction](https://docs.padlet.dev/reference/introduction)
- [Authentication](https://docs.padlet.dev/reference/authentication)
- [Board Object](https://docs.padlet.dev/reference/board-object)
- [Post Object](https://docs.padlet.dev/reference/post-object)
- [Comment Object](https://docs.padlet.dev/reference/comment-object)
- [Section Object](https://docs.padlet.dev/reference/section-object)
- [Reaction Object](https://docs.padlet.dev/reference/reaction-object)
- [User Object](https://docs.padlet.dev/reference/user-object)
- [Get Board by ID](https://docs.padlet.dev/reference/get-board-by-id)
- [Create a Post](https://docs.padlet.dev/reference/add-post)
- [Create a Reaction](https://docs.padlet.dev/reference/create-reaction)
- [Get Post Attachment Data](https://docs.padlet.dev/reference/get-post-attachment-data)
- [Create AI Recipe Board](https://docs.padlet.dev/reference/create-ai-recipe-board)
- [AI Recipe Board Status](https://docs.padlet.dev/reference/ai-recipe-board-creation-status-url-object)
- [Error Handling & Rate Limiting](https://docs.padlet.dev/reference/error-handling)
- [Padlet Blog - Public API V1](https://padlet.blog/public-api-v1/)
- [Padlet Zapier Integration](https://padlet.blog/zapier-integration/)
