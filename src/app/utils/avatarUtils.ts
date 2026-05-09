export function getAvatarUrl(name: string): string {
  const lowerName = name.toLowerCase();
  
  // Older Men (Chú, Ông, Bác trai)
  if (lowerName.includes('chú') || lowerName.includes('ông') || lowerName.includes('bác trai')) {
    return 'https://randomuser.me/api/portraits/men/78.jpg'; // Older man
  }
  
  // Older Women (Cô, Bà, Người lớn tuổi)
  if (lowerName.includes('cô') || lowerName.includes('bà') || lowerName.includes('bác gái') || lowerName.includes('người lớn tuổi')) {
    return 'https://randomuser.me/api/portraits/women/68.jpg'; // Older woman
  }
  
  // Specific Women (Chị, Lan, Trúc, Nữ)
  if (lowerName.includes('chị') || lowerName.includes('lan') || lowerName.includes('trúc') || lowerName.includes('nữ') || lowerName.includes('anh')) {
    if (lowerName.includes('trúc')) return 'https://randomuser.me/api/portraits/women/44.jpg'; // Young woman
    if (lowerName.includes('lan')) return 'https://randomuser.me/api/portraits/women/32.jpg'; // Woman
    return 'https://randomuser.me/api/portraits/women/24.jpg';
  }
  
  // Specific Men (Toàn, Hoàng, Nam, Anh trai)
  if (lowerName.includes('toàn') || lowerName.includes('hoàng') || lowerName.includes('nam') || lowerName.includes('anh trai')) {
    if (lowerName.includes('toàn')) return 'https://randomuser.me/api/portraits/men/32.jpg'; // Young man
    if (lowerName.includes('hoàng')) return 'https://randomuser.me/api/portraits/men/46.jpg'; // Man
    return 'https://randomuser.me/api/portraits/men/22.jpg';
  }
  
  // Tourists / General
  if (lowerName.includes('khách') || lowerName.includes('du lịch')) {
    return 'https://randomuser.me/api/portraits/men/86.jpg'; // Tourist vibe (man with hat/glasses ideally, or just a generic traveler)
  }
  
  // Deterministic fallback based on hash
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  const id = Math.abs(hash % 99); 
  const gender = hash % 2 === 0 ? 'men' : 'women';
  return `https://randomuser.me/api/portraits/${gender}/${id}.jpg`;
}
