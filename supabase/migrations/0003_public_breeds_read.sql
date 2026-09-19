-- 품종 정보는 로그인 없이도 조회 가능하도록 개방 (개인정보 없는 정적 참고 데이터)
drop policy if exists "breeds_read_all" on breeds;

create policy "breeds_read_all"
  on breeds for select
  to authenticated, anon
  using (true);
