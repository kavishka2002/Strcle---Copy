type SubjectOption = { en: string; si: string };

export function addMissingStarterSubjects(
  savedSubjects: SubjectOption[],
  starterSubjects: SubjectOption[]
): SubjectOption[] {
  const names = new Set(
    savedSubjects.flatMap(subject => [subject.en, subject.si])
      .map(name => name.trim().toLocaleLowerCase())
      .filter(Boolean)
  );
  const missingSubjects = starterSubjects.filter(subject =>
    ![subject.en, subject.si].some(name => names.has(name.trim().toLocaleLowerCase()))
  );
  return [...savedSubjects, ...missingSubjects];
}
