import { Ionicons } from '@expo/vector-icons';

export const getCategoryDisplayProps = (name: string): { icon: keyof typeof Ionicons.glyphMap, color: string } => {
  if (!name) return { icon: 'leaf', color: '#4CAF50' };
  const n = name.toLowerCase();
  
  if (n.includes('ganesh')) return { icon: 'star', color: '#FF6B35' };
  if (n.includes('shiv')) return { icon: 'flame', color: '#5D3FD3' };
  if (n.includes('vishnu') || n.includes('krishna') || n.includes('rama')) return { icon: 'water', color: '#0095D9' };
  if (n.includes('devi') || n.includes('durga') || n.includes('lakshmi') || n.includes('saraswati') || n.includes('mahavidya') || n.includes('vidya')) return { icon: 'sparkles', color: '#E91E8C' };
  if (n.includes('surya') || n.includes('navagraha')) return { icon: 'sunny', color: '#FFD700' };
  if (n.includes('vedic') || n.includes('brahma') || n.includes('indra')) return { icon: 'book', color: '#2ECC71' };
  if (n.includes('healing')) return { icon: 'medkit', color: '#00C9A7' };
  if (n.includes('hanuman')) return { icon: 'flash', color: '#FF5733' };
  if (n.includes('guru')) return { icon: 'school', color: '#A0522D' };
  if (n.includes('bhakti')) return { icon: 'heart', color: '#FF69B4' };
  if (n.includes('regional')) return { icon: 'map', color: '#8A2BE2' };
  if (n.includes('tantric')) return { icon: 'bonfire', color: '#DC143C' };

  return { icon: 'leaf', color: '#4CAF50' };
};
