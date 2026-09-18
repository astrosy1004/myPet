export function formatAge(birthDate: string | null): string {
  if (!birthDate) return "생일 미등록";

  const birth = new Date(birthDate);
  const now = new Date();

  let years = now.getFullYear() - birth.getFullYear();
  let months = now.getMonth() - birth.getMonth();

  if (now.getDate() < birth.getDate()) months--;
  if (months < 0) {
    years--;
    months += 12;
  }

  if (years <= 0) return `${months}개월`;
  return `${years}살 ${months}개월`;
}
