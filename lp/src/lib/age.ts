export function calculateAge(dateOfBirth: Date, today: Date = new Date()): number {
  let age = today.getFullYear() - dateOfBirth.getFullYear();
  const m = today.getMonth() - dateOfBirth.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < dateOfBirth.getDate())) {
    age--;
  }
  return age;
}

export function isAdult(dateOfBirth: Date, minAge: number = 20, today: Date = new Date()): boolean {
  if (dateOfBirth > today) return false;
  return calculateAge(dateOfBirth, today) >= minAge;
}

export function parseDateOfBirth(input: string): Date | null {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(input)) return null;
  const d = new Date(input + "T00:00:00");
  if (Number.isNaN(d.getTime())) return null;
  const [y, m, day] = input.split("-").map(Number);
  if (d.getFullYear() !== y || d.getMonth() + 1 !== m || d.getDate() !== day) return null;
  return d;
}
