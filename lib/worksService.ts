import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

export interface Artwork {
  id: string;
  title: string;
  category: string;
  categories: string[];
  tags: string[];
  date: string;
  image: string;
  description: string;
  model: string;
  dimensions: string;
  prompt: string;
  negativePrompt: string;
  createdAt?: string;
  created_at?: string;
  likes?: number;
  liked?: boolean;
  views?: number;
}

export interface Video {
  id: string;
  title: string;
  description: string;
  duration: string;
  thumbnail: string;
  url: string;
  videoFile?: string;
  category?: string;
  categories?: string[];
  created_at?: string;
  views?: number;
}

export interface Skill {
  id: string;
  name: string;
  level: number;
}

export interface TimelineItem {
  id: string;
  year: string;
  title: string;
  description: string;
}

export interface Stat {
  id: string;
  value: number;
  label: string;
  suffix: string;
}

export interface SocialLink {
  id: string;
  name: string;
  icon: string;
  url: string;
}

export interface SiteConfig {
  id: string;
  heroTitle: string;
  heroSubtitle: string;
  heroDescription: string;
  avatarUrl: string;
  aboutTitle: string;
  aboutName: string;
  aboutDescription: string;
  aboutTags: string;
}

function b64toBlob(b64Data: string, contentType: string = '', sliceSize: number = 512): Blob {
  const byteCharacters = atob(b64Data);
  const byteArrays: Uint8Array[] = [];

  for (let offset = 0; offset < byteCharacters.length; offset += sliceSize) {
    const slice = byteCharacters.slice(offset, offset + sliceSize);
    const byteNumbers = new Array(slice.length);
    for (let i = 0; i < slice.length; i++) {
      byteNumbers[i] = slice.charCodeAt(i);
    }
    const byteArray = new Uint8Array(byteNumbers);
    byteArrays.push(byteArray);
  }

  return new Blob(byteArrays as BlobPart[], { type: contentType });
}

export async function getAllArtworks(): Promise<Artwork[]> {
  try {
    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching artworks:', error);
      throw error;
    }

    return data.map(item => ({
      ...item,
      tags: typeof item.tags === 'string' ? JSON.parse(item.tags) : item.tags || [],
      categories: typeof item.categories === 'string' ? JSON.parse(item.categories) : item.categories || [],
      likes: item.likes || 0,
      views: item.views || 0,
    }));
  } catch (error) {
    console.error('Error fetching artworks:', error);
    try {
      const stored = localStorage.getItem('userArtworks');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
}

export async function getArtworkById(id: string): Promise<Artwork | null> {
  try {
    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching artwork:', error);
      throw error;
    }

    return {
      ...data,
      tags: typeof data.tags === 'string' ? JSON.parse(data.tags) : data.tags || [],
      categories: typeof data.categories === 'string' ? JSON.parse(data.categories) : data.categories || [],
      likes: data.likes || 0,
      views: data.views || 0,
    };
  } catch (error) {
    console.error('Error fetching artwork:', error);
    try {
      const stored = localStorage.getItem('userArtworks');
      if (stored) {
        const artworks: Artwork[] = JSON.parse(stored);
        return artworks.find(a => a.id === id) || null;
      }
    } catch {
      return null;
    }
    return null;
  }
}

export async function createArtwork(artwork: Omit<Artwork, 'id' | 'created_at'>): Promise<Artwork | null> {
  try {
    let imageUrl = artwork.image;
    
    if (artwork.image.startsWith('data:')) {
      const base64Data = artwork.image.split(',')[1];
      const blob = b64toBlob(base64Data, 'image/jpeg');
      const fileName = `artworks/${Date.now()}.jpg`;
      
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });
      
      if (uploadError) {
        console.error('Error uploading image:', uploadError);
        throw uploadError;
      }
      
      const { data: urlData } = await supabase.storage
        .from('media')
        .getPublicUrl(fileName);
      
      imageUrl = urlData.publicUrl;
    }
    
    const artworkInsert: Record<string, any> = {
      title: artwork.title,
      image: imageUrl,
      category: artwork.category || '未分类',
      categories: artwork.categories ? JSON.stringify(artwork.categories) : JSON.stringify(['未分类']),
      tags: artwork.tags && artwork.tags.length > 0 ? JSON.stringify(artwork.tags) : JSON.stringify([]),
      date: artwork.date || new Date().toISOString().split('T')[0],
      description: artwork.description || '',
      model: artwork.model || '',
      dimensions: artwork.dimensions || '',
      prompt: artwork.prompt || '',
      negativePrompt: artwork.negativePrompt || '',
      likes: 0,
      views: 0,
    };

    const { data, error } = await supabase
      .from('artworks')
      .insert([artworkInsert])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating artwork:', error);
      throw error;
    }
    
    return {
      ...data,
      tags: typeof data.tags === 'string' ? JSON.parse(data.tags) : data.tags,
      categories: typeof data.categories === 'string' ? JSON.parse(data.categories) : data.categories,
    };
  } catch (error) {
    console.error('Error creating artwork:', error);
    const fallbackArtwork: Artwork = {
      id: Date.now().toString(),
      title: artwork.title,
      category: artwork.category || '未分类',
      categories: artwork.categories || ['未分类'],
      tags: artwork.tags || [],
      date: artwork.date || new Date().toISOString().split('T')[0],
      image: artwork.image.startsWith('data:') ? '' : artwork.image,
      description: artwork.description || '',
      model: artwork.model || '',
      dimensions: artwork.dimensions || '',
      prompt: artwork.prompt || '',
      negativePrompt: artwork.negativePrompt || '',
      created_at: new Date().toISOString(),
      likes: 0,
      views: 0,
    };
    try {
      const stored = localStorage.getItem('userArtworks');
      const userArtworks: Artwork[] = stored ? JSON.parse(stored) : [];
      userArtworks.push(fallbackArtwork);
      localStorage.setItem('userArtworks', JSON.stringify(userArtworks));
    } catch (storageError) {
      console.error('localStorage save failed:', storageError);
    }
    throw error;
  }
}

export async function updateArtwork(id: string, artwork: Partial<Artwork>): Promise<Artwork | null> {
  try {
    const updateData: Record<string, any> = {};
    if (artwork.title !== undefined) updateData.title = artwork.title;
    if (artwork.image !== undefined) updateData.image = artwork.image;
    if (artwork.category !== undefined) updateData.category = artwork.category;
    if (artwork.categories !== undefined) updateData.categories = JSON.stringify(artwork.categories);
    if (artwork.tags !== undefined) updateData.tags = JSON.stringify(artwork.tags);
    if (artwork.date !== undefined) updateData.date = artwork.date;
    if (artwork.description !== undefined) updateData.description = artwork.description;
    if (artwork.model !== undefined) updateData.model = artwork.model;
    if (artwork.dimensions !== undefined) updateData.dimensions = artwork.dimensions;
    if (artwork.prompt !== undefined) updateData.prompt = artwork.prompt;
    if (artwork.negativePrompt !== undefined) updateData.negativePrompt = artwork.negativePrompt;
    if (artwork.likes !== undefined) updateData.likes = artwork.likes;

    const { data, error } = await supabase
      .from('artworks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating artwork:', error);
      throw error;
    }
    
    return {
      ...data,
      tags: typeof data.tags === 'string' ? JSON.parse(data.tags) : data.tags,
      categories: typeof data.categories === 'string' ? JSON.parse(data.categories) : data.categories,
    };
  } catch (error) {
    console.error('Error updating artwork:', error);
    throw error;
  }
}

export async function deleteArtwork(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('artworks')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting artwork:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error deleting artwork:', error);
    throw error;
  }
}

export async function getAllVideos(): Promise<Video[]> {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching videos:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error fetching videos:', error);
    try {
      const stored = localStorage.getItem('userVideos');
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }
}

export async function createVideo(video: Omit<Video, 'id' | 'created_at'>): Promise<Video | null> {
  try {
    let thumbnailUrl = video.thumbnail;
    
    if (video.thumbnail && video.thumbnail.startsWith('data:')) {
      const base64Data = video.thumbnail.split(',')[1];
      const blob = b64toBlob(base64Data, 'image/jpeg');
      const fileName = `thumbnails/${Date.now()}.jpg`;
      
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });
      
      if (uploadError) {
        console.error('Error uploading thumbnail:', uploadError);
        throw uploadError;
      }
      
      const { data: urlData } = await supabase.storage
        .from('media')
        .getPublicUrl(fileName);
      
      thumbnailUrl = urlData.publicUrl;
    }

    let videoUrl = video.url;
    
    if (video.videoFile && video.videoFile.startsWith('data:')) {
      const base64Data = video.videoFile.split(',')[1];
      const blob = b64toBlob(base64Data, 'video/mp4');
      const fileName = `videos/${Date.now()}.mp4`;
      
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, blob, {
          contentType: 'video/mp4',
          upsert: false
        });
      
      if (uploadError) {
        console.error('Error uploading video:', uploadError);
        throw uploadError;
      }
      
      const { data: urlData } = await supabase.storage
        .from('media')
        .getPublicUrl(fileName);
      
      videoUrl = urlData.publicUrl;
    }

    const { data, error } = await supabase
      .from('videos')
      .insert([{
        title: video.title,
        description: video.description,
        duration: video.duration,
        thumbnail: thumbnailUrl,
        url: videoUrl,
        category: video.category || '未分类',
      }])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating video:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error creating video:', error);
    throw error;
  }
}

export async function deleteVideo(id: string): Promise<void> {
  try {
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error deleting video:', error);
    throw error;
  }
}

export async function getArtworks(): Promise<Artwork[]> {
  return getAllArtworks();
}

export async function getVideos(): Promise<Video[]> {
  return getAllVideos();
}

export async function getSkills(): Promise<Skill[]> {
  try {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('level', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}

export async function createSkill(skill: Omit<Skill, 'id'>): Promise<Skill | null> {
  try {
    const { data, error } = await supabase
      .from('skills')
      .insert([skill])
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch {
    return null;
  }
}

export async function updateSkill(id: string, skill: Partial<Skill>): Promise<Skill | null> {
  try {
    const { data, error } = await supabase
      .from('skills')
      .update(skill)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch {
    return null;
  }
}

export async function deleteSkill(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('skills').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch {
    return false;
  }
}

export async function getTimeline(): Promise<TimelineItem[]> {
  try {
    const { data, error } = await supabase
      .from('timeline')
      .select('*')
      .order('year', { ascending: false });
    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}

export async function createTimelineItem(item: Omit<TimelineItem, 'id'>): Promise<TimelineItem | null> {
  try {
    const { data, error } = await supabase
      .from('timeline')
      .insert([item])
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch {
    return null;
  }
}

export async function updateTimelineItem(id: string, item: Partial<TimelineItem>): Promise<TimelineItem | null> {
  try {
    const { data, error } = await supabase
      .from('timeline')
      .update(item)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch {
    return null;
  }
}

export async function deleteTimelineItem(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('timeline').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch {
    return false;
  }
}

export async function getStats(): Promise<Stat[]> {
  try {
    const { data, error } = await supabase.from('stats').select('*');
    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}

export async function createStat(stat: Omit<Stat, 'id'>): Promise<Stat | null> {
  try {
    const { data, error } = await supabase
      .from('stats')
      .insert([stat])
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch {
    return null;
  }
}

export async function updateStat(id: string, stat: Partial<Stat>): Promise<Stat | null> {
  try {
    const { data, error } = await supabase
      .from('stats')
      .update(stat)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch {
    return null;
  }
}

export async function deleteStat(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('stats').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch {
    return false;
  }
}

export async function getSocialLinks(): Promise<SocialLink[]> {
  try {
    const { data, error } = await supabase.from('social_links').select('*');
    if (error) throw error;
    return data || [];
  } catch {
    return [];
  }
}

export async function createSocialLink(link: Omit<SocialLink, 'id'>): Promise<SocialLink | null> {
  try {
    const { data, error } = await supabase
      .from('social_links')
      .insert([link])
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch {
    return null;
  }
}

export async function updateSocialLink(id: string, link: Partial<SocialLink>): Promise<SocialLink | null> {
  try {
    const { data, error } = await supabase
      .from('social_links')
      .update(link)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch {
    return null;
  }
}

export async function deleteSocialLink(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('social_links').delete().eq('id', id);
    if (error) throw error;
    return true;
  } catch {
    return false;
  }
}

export async function getSiteConfig(): Promise<SiteConfig | null> {
  try {
    const { data, error } = await supabase.from('site_config').select('*').single();
    if (error) throw error;
    return data;
  } catch {
    return null;
  }
}

export async function updateSiteConfig(id: string, config: Partial<SiteConfig>): Promise<SiteConfig | null> {
  try {
    const { data, error } = await supabase
      .from('site_config')
      .update(config)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return data;
  } catch {
    return null;
  }
}

export const worksService = {
  getAllArtworks,
  getArtworkById,
  createArtwork,
  updateArtwork,
  deleteArtwork,
  getAllVideos,
  createVideo,
  deleteVideo,
  getArtworks,
  getVideos,
  getSkills,
  createSkill,
  updateSkill,
  deleteSkill,
  getTimeline,
  createTimelineItem,
  updateTimelineItem,
  deleteTimelineItem,
  getStats,
  createStat,
  updateStat,
  deleteStat,
  getSocialLinks,
  createSocialLink,
  updateSocialLink,
  deleteSocialLink,
  getSiteConfig,
  updateSiteConfig,
};

export default worksService;