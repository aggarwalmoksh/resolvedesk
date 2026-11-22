export function countInProgressBy(complaints, field) {
  const counts = new Map();
  for (const complaint of complaints) {
    const id = complaint[field];
    if (complaint.status === 'in_progress' && id) {
      counts.set(id, (counts.get(id) ?? 0) + 1);
    }
  }
  return counts;
}
