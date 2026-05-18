Set-Location 'C:\dev\semester-schedule-generator'

$msg = @"
docs: UI 컴포넌트 작업 실패 기록 정리

날짜 입력, 드래그앤드롭, CSV 숫자보호, .next 캐시 등
개발 과정에서 겪은 실패와 교훈을 문서화

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
"@

git add LESSONS_LEARNED.md
git commit -m $msg
git push origin main
