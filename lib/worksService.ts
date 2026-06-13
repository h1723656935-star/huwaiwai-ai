import { createClient, SupabaseClient } from '@supabase/supabase-js';

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
  created_at?: string;
  liked?: boolean;
  likes?: number;
  description?: string;
  views?: number;
  model?: string;
  dimensions?: string;
  prompt?: string;
  negativePrompt?: string;
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
  created_at?: string;
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

export async function getArtworks(): Promise<Artwork[]> {
  try {
    const { data, error } = await supabase
      .from('artworks')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching artworks:', error);
      const stored = localStorage.getItem('userArtworks');
      return stored ? JSON.parse(stored) : [];
    }
    
    return (data || []).map(item => ({
      ...item,
      tags: typeof item.tags === 'string' ? JSON.parse(item.tags) : (item.tags || []),
      categories: typeof item.categories === 'string' ? JSON.parse(item.categories) : (item.categories || (item.category ? [item.category] : []))
    }));
  } catch (error) {
    console.error('Error fetching artworks:', error);
    const stored = localStorage.getItem('userArtworks');
    return stored ? JSON.parse(stored) : [];
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
    
    // 只包含有值的字段，避免数据库缺少字段导致失败
    const artworkInsert: Record<string, any> = {
      title: artwork.title,
      image: imageUrl
    };
    if (artwork.category && artwork.category.trim()) artworkInsert.category = artwork.category;
    if (artwork.categories && artwork.categories.length > 0) artworkInsert.categories = JSON.stringify(artwork.categories);
    if (artwork.tags && artwork.tags.length > 0) artworkInsert.tags = JSON.stringify(artwork.tags);
    if (artwork.date) artworkInsert.date = artwork.date;
    if (artwork.prompt) artworkInsert.prompt = artwork.prompt;
    if (artwork.negativePrompt) artworkInsert.negativePrompt = artwork.negativePrompt;
    if (artwork.model) artworkInsert.model = artwork.model;
    if (artwork.dimensions) artworkInsert.dimensions = artwork.dimensions;
    if (artwork.description) artworkInsert.description = artwork.description;

    let { data, error } = await supabase
      .from('artworks')
      .insert([artworkInsert])
      .select()
      .single();

    // 如果是 categories / prompt / negativePrompt 等列不存在的错误，逐个降级重试
    const optionalFields = ['categories', 'prompt', 'negativePrompt', 'model', 'dimensions', 'description'];
    let fallbackInsert = { ...artworkInsert };
    for (const field of optionalFields) {
      if (error && (error.message?.includes(field) || error.code === 'PGRST204')) {
        console.warn(`${field} column missing, falling back`);
        delete fallbackInsert[field];
        const retry = await supabase
          .from('artworks')
          .insert([fallbackInsert])
          .select()
          .single();
        data = retry.data;
        error = retry.error;
      }
    }
    
    if (error) {
      console.error('Error creating artwork:', error);
      throw error;
    }
    
    return {
      ...data,
      tags: typeof data.tags === 'string' ? JSON.parse(data.tags) : (data.tags || []),
      categories: typeof data.categories === 'string' ? JSON.parse(data.categories) : (data.categories || (data.category ? [data.category] : []))
    };
  } catch (error) {
    console.error('Error creating artwork:', error);
    // localStorage 兜底 - 保存完整数据包括 prompt 等
    // 用 "local-" 前缀明确标识是本地作品（区别于 Supabase 真实 id）
    const fallbackArtwork: Artwork = {
      id: `local-${Date.now()}`,
      title: artwork.title,
      category: artwork.category,
      categories: artwork.categories || (artwork.category ? [artwork.category] : []),
      tags: artwork.tags,
      date: artwork.date,
      image: artwork.image.startsWith('data:') ? '' : artwork.image,
      prompt: artwork.prompt,
      negativePrompt: artwork.negativePrompt,
      model: artwork.model,
      dimensions: artwork.dimensions,
      description: artwork.description,
      created_at: new Date().toISOString(),
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
    if (artwork.category !== undefined) updateData.category = artwork.category;
    if (artwork.categories !== undefined) updateData.categories = JSON.stringify(artwork.categories);
    if (artwork.tags !== undefined) updateData.tags = JSON.stringify(artwork.tags);
    if (artwork.date !== undefined) updateData.date = artwork.date;
    if (artwork.image !== undefined) updateData.image = artwork.image;
    if (artwork.prompt !== undefined) updateData.prompt = artwork.prompt;
    if (artwork.negativePrompt !== undefined) updateData.negativePrompt = artwork.negativePrompt;
    if (artwork.model !== undefined) updateData.model = artwork.model;
    if (artwork.dimensions !== undefined) updateData.dimensions = artwork.dimensions;
    if (artwork.description !== undefined) updateData.description = artwork.description;

    let { data, error } = await supabase
      .from('artworks')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    // 如果是 categories / prompt 等列不存在的错误，逐个降级重试
    const optionalFields = ['categories', 'prompt', 'negativePrompt', 'model', 'dimensions', 'description'];
    let fallbackUpdate = { ...updateData };
    for (const field of optionalFields) {
      if (error && (error.message?.includes(field) || error.code === 'PGRST204')) {
        console.warn(`${field} column missing, falling back`);
        delete fallbackUpdate[field];
        const retry = await supabase
          .from('artworks')
          .update(fallbackUpdate)
          .eq('id', id)
          .select()
          .single();
        data = retry.data;
        error = retry.error;
      }
    }
    
    if (error) {
      console.error('Error updating artwork:', error);
      throw error;
    }
    
    return {
      ...data,
      tags: typeof data.tags === 'string' ? JSON.parse(data.tags) : (data.tags || []),
      categories: typeof data.categories === 'string' ? JSON.parse(data.categories) : (data.categories || (data.category ? [data.category] : []))
    };
  } catch (error) {
    console.error('Error updating artwork:', error);
    return null;
  }
}

export async function deleteArtwork(id: string): Promise<boolean> {
  try {
    const { data: artwork, error: fetchError } = await supabase
      .from('artworks')
      .select('image')
      .eq('id', id)
      .single();
    
    if (!fetchError && artwork) {
      const imageUrl = artwork.image;
      if (imageUrl.includes('/storage/v1/object/public/media/')) {
        const fileName = imageUrl.split('/media/')[1];
        await supabase.storage.from('media').remove([fileName]);
      }
    }
    
    const { error } = await supabase
      .from('artworks')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting artwork:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting artwork:', error);
    const stored = localStorage.getItem('userArtworks');
    if (stored) {
      const userArtworks: Artwork[] = JSON.parse(stored);
      const filtered = userArtworks.filter(artwork => artwork.id !== id);
      localStorage.setItem('userArtworks', JSON.stringify(filtered));
      return true;
    }
    return false;
  }
}

export async function getVideos(): Promise<Video[]> {
  try {
    const { data, error } = await supabase
      .from('videos')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (error) {
      console.error('Error fetching videos:', error);
      const stored = localStorage.getItem('userVideos');
      return stored ? JSON.parse(stored) : [];
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching videos:', error);
    const stored = localStorage.getItem('userVideos');
    return stored ? JSON.parse(stored) : [];
  }
}

export async function createVideo(video: Omit<Video, 'id' | 'created_at'>): Promise<Video | null> {
  try {
    let thumbnailUrl = video.thumbnail;
    let videoFileUrl = video.videoFile || '';
    
    if (video.thumbnail.startsWith('data:')) {
      const base64Data = video.thumbnail.split(',')[1];
      const blob = b64toBlob(base64Data, 'image/jpeg');
      const fileName = `thumbnails/${Date.now()}.jpg`;
      
      console.log('Uploading thumbnail:', fileName);
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, blob, {
          contentType: 'image/jpeg',
          upsert: false
        });
      
      if (uploadError) {
        console.error('Error uploading thumbnail:', uploadError);
        throw new Error(`上传缩略图失败: ${(uploadError as Error).message}`);
      }
      
      const { data: urlData } = await supabase.storage
        .from('media')
        .getPublicUrl(fileName);
      
      thumbnailUrl = urlData.publicUrl;
      console.log('Thumbnail uploaded:', thumbnailUrl);
    }
    
    if (video.videoFile && video.videoFile.startsWith('data:')) {
      const base64Data = video.videoFile.split(',')[1];
      const blob = b64toBlob(base64Data, 'video/mp4');
      const fileName = `videos/${Date.now()}.mp4`;
      
      console.log('Uploading video file:', fileName);
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, blob, {
          contentType: 'video/mp4',
          upsert: false,
          cacheControl: '3600'
        });
      
      if (uploadError) {
        console.error('Error uploading video:', uploadError);
        throw new Error(`上传视频文件失败: ${(uploadError as Error).message}`);
      }
      
      const { data: urlData } = await supabase.storage
        .from('media')
        .getPublicUrl(fileName);
      
      videoFileUrl = urlData.publicUrl;
      console.log('Video uploaded:', videoFileUrl);
    }
    
    console.log('Inserting video record...');

    // 策略1：先尝试完整插入（使用 url 字段存储视频地址，确保兼容旧表也能工作
    // 视频文件URL放到 url 字段（这是表中一定有的字段）
    const primaryVideoUrl = videoFileUrl || video.url || '';
    
    const videoInsert: Record<string, any> = {
      title: video.title,
      thumbnail: thumbnailUrl,
      url: primaryVideoUrl
    };
    if (video.description && video.description.trim()) videoInsert.description = video.description;
    if (video.duration) videoInsert.duration = video.duration;
    if (videoFileUrl) videoInsert.videoFile = videoFileUrl;
    if (video.category && video.category.trim()) videoInsert.category = video.category;

    let data: any = null;
    let insertError: any = null;

    // 第一次尝试：完整字段插入
    try {
      const result = await supabase
      .from('videos')
      .insert([videoInsert])
      .select()
      .single();
    data = result.data;
    insertError = result.error;
    } catch (e) {
    insertError = e;
    }

    // 如果第一次失败，尝试降级插入（只包含肯定存在的字段）
    if (insertError) {
      console.log('Full insert failed, trying minimal insert:', insertError);
      const minimalInsert: Record<string, any> = {
        title: video.title,
        thumbnail: thumbnailUrl,
        url: primaryVideoUrl
      };
      if (video.description && video.description.trim()) minimalInsert.description = video.description;
      if (video.duration) minimalInsert.duration = video.duration;

      const { data: minimalData, error: minimalError } = await supabase
        .from('videos')
        .insert([minimalInsert])
        .select()
        .single();

      if (minimalError) {
        console.error('Error creating video (minimal):', minimalError);
        throw new Error(`创建视频记录失败: ${(minimalError as Error).message}`);
      }
      data = minimalData;
    }
    
    console.log('Video created successfully:', data);
    return data;
  } catch (error) {
    console.error('Error creating video:', error);
    // localStorage 配额有限，不存储视频文件本身
    const fallbackVideo: Video = {
      id: Date.now().toString(),
      title: video.title,
      description: video.description,
      duration: video.duration,
      thumbnail: video.thumbnail.startsWith('data:') ? '' : video.thumbnail,
      url: video.url || '',
      videoFile: '',
      category: video.category,
      created_at: new Date().toISOString(),
    };
    try {
      const stored = localStorage.getItem('userVideos');
      const userVideos: Video[] = stored ? JSON.parse(stored) : [];
      userVideos.push(fallbackVideo);
      localStorage.setItem('userVideos', JSON.stringify(userVideos));
    } catch (storageError) {
      console.error('localStorage save failed:', storageError);
    }
    // 向上抛出原始错误，让前端知道 Supabase 上传失败了
    throw error;
  }
}

export async function updateVideo(id: string, video: Partial<Video>): Promise<Video | null> {
  try {
    const updateData: Record<string, any> = {};
    let thumbnailUrl = video.thumbnail || '';
    let videoFileUrl = video.videoFile || '';

    // 上传缩略图（如果是 base64）
    if (video.thumbnail && video.thumbnail.startsWith('data:')) {
      const base64Data = video.thumbnail.split(',')[1];
      const blob = b64toBlob(base64Data, 'image/jpeg');
      const fileName = `thumbnails/${Date.now()}_edit.jpg`;
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, blob, { contentType: 'image/jpeg', upsert: false });
      if (uploadError) throw new Error(`上传缩略图失败: ${uploadError.message}`);
      const { data: urlData } = await supabase.storage.from('media').getPublicUrl(fileName);
      thumbnailUrl = urlData.publicUrl;
    }

    // 上传视频文件（如果是 base64）
    if (video.videoFile && video.videoFile.startsWith('data:')) {
      const base64Data = video.videoFile.split(',')[1];
      const blob = b64toBlob(base64Data, 'video/mp4');
      const fileName = `videos/${Date.now()}_edit.mp4`;
      const { error: uploadError } = await supabase.storage
        .from('media')
        .upload(fileName, blob, { contentType: 'video/mp4', upsert: false, cacheControl: '3600' });
      if (uploadError) throw new Error(`上传视频文件失败: ${uploadError.message}`);
      const { data: urlData } = await supabase.storage.from('media').getPublicUrl(fileName);
      videoFileUrl = urlData.publicUrl;
    }

    if (video.title !== undefined) updateData.title = video.title;
    if (video.description !== undefined) updateData.description = video.description;
    if (video.duration !== undefined) updateData.duration = video.duration;
    if (video.url !== undefined) updateData.url = video.url;
    if (video.category !== undefined) updateData.category = video.category;
    if (thumbnailUrl) updateData.thumbnail = thumbnailUrl;
    if (videoFileUrl) {
      updateData.videoFile = videoFileUrl;
      // 视频文件URL也存到 url 字段作为兼容
      if (!updateData.url) updateData.url = videoFileUrl;
    }

    const { data, error } = await supabase
      .from('videos')
      .update(updateData)
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Error updating video:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating video:', error);
    throw error;
  }
}

export async function deleteVideo(id: string): Promise<boolean> {
  try {
    const { data: video, error: fetchError } = await supabase
      .from('videos')
      .select('thumbnail, videoFile')
      .eq('id', id)
      .single();
    
    if (!fetchError && video) {
      if (video.thumbnail && video.thumbnail.includes('/storage/v1/object/public/media/')) {
        const fileName = video.thumbnail.split('/media/')[1];
        await supabase.storage.from('media').remove([fileName]);
      }
      if (video.videoFile && video.videoFile.includes('/storage/v1/object/public/media/')) {
        const fileName = video.videoFile.split('/media/')[1];
        await supabase.storage.from('media').remove([fileName]);
      }
    }
    
    const { error } = await supabase
      .from('videos')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting video:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting video:', error);
    const stored = localStorage.getItem('userVideos');
    if (stored) {
      const userVideos: Video[] = JSON.parse(stored);
      const filtered = userVideos.filter(video => video.id !== id);
      localStorage.setItem('userVideos', JSON.stringify(filtered));
      return true;
    }
    return false;
  }
}

export async function getSkills(): Promise<Skill[]> {
  try {
    const { data, error } = await supabase
      .from('skills')
      .select('*')
      .order('level', { ascending: false });
    
    if (error) {
      console.error('Error fetching skills:', error);
      return getDefaultSkills();
    }
    
    return data || getDefaultSkills();
  } catch (error) {
    console.error('Error fetching skills:', error);
    return getDefaultSkills();
  }
}

export async function createSkill(skill: Omit<Skill, 'id'>): Promise<Skill | null> {
  try {
    const { data, error } = await supabase
      .from('skills')
      .insert([skill])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating skill:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error creating skill:', error);
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
    
    if (error) {
      console.error('Error updating skill:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error updating skill:', error);
    return null;
  }
}

export async function deleteSkill(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('skills')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting skill:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting skill:', error);
    return false;
  }
}

export async function getTimeline(): Promise<TimelineItem[]> {
  try {
    const { data, error } = await supabase
      .from('timeline')
      .select('*')
      .order('year', { ascending: true });
    
    if (error) {
      console.error('Error fetching timeline:', error);
      return getDefaultTimeline();
    }
    
    return data || getDefaultTimeline();
  } catch (error) {
    console.error('Error fetching timeline:', error);
    return getDefaultTimeline();
  }
}

export async function createTimelineItem(item: Omit<TimelineItem, 'id'>): Promise<TimelineItem | null> {
  try {
    const { data, error } = await supabase
      .from('timeline')
      .insert([item])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating timeline item:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error creating timeline item:', error);
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
    
    if (error) {
      console.error('Error updating timeline item:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error updating timeline item:', error);
    return null;
  }
}

export async function deleteTimelineItem(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('timeline')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting timeline item:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting timeline item:', error);
    return false;
  }
}

export async function getStats(): Promise<Stat[]> {
  try {
    const { data, error } = await supabase
      .from('stats')
      .select('*');
    
    if (error) {
      console.error('Error fetching stats:', error);
      return getDefaultStats();
    }
    
    return data || getDefaultStats();
  } catch (error) {
    console.error('Error fetching stats:', error);
    return getDefaultStats();
  }
}

export async function createStat(stat: Omit<Stat, 'id'>): Promise<Stat | null> {
  try {
    const { data, error } = await supabase
      .from('stats')
      .insert([stat])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating stat:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error creating stat:', error);
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
    
    if (error) {
      console.error('Error updating stat:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error updating stat:', error);
    return null;
  }
}

export async function deleteStat(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('stats')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting stat:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting stat:', error);
    return false;
  }
}

export async function getSocialLinks(): Promise<SocialLink[]> {
  try {
    const { data, error } = await supabase
      .from('social_links')
      .select('*');
    
    if (error) {
      console.error('Error fetching social links:', error);
      return getDefaultSocialLinks();
    }
    
    return data || getDefaultSocialLinks();
  } catch (error) {
    console.error('Error fetching social links:', error);
    return getDefaultSocialLinks();
  }
}

export async function createSocialLink(link: Omit<SocialLink, 'id'>): Promise<SocialLink | null> {
  try {
    const { data, error } = await supabase
      .from('social_links')
      .insert([link])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating social link:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error creating social link:', error);
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
    
    if (error) {
      console.error('Error updating social link:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error updating social link:', error);
    return null;
  }
}

export async function deleteSocialLink(id: string): Promise<boolean> {
  try {
    const { error } = await supabase
      .from('social_links')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting social link:', error);
      throw error;
    }
    
    return true;
  } catch (error) {
    console.error('Error deleting social link:', error);
    return false;
  }
}

export async function getSiteConfig(): Promise<SiteConfig> {
  try {
    const { data, error } = await supabase
      .from('site_config')
      .select('*')
      .single();
    
    if (error) {
      console.error('Error fetching site config:', error);
      return getDefaultSiteConfig();
    }
    
    return data || getDefaultSiteConfig();
  } catch (error) {
    console.error('Error fetching site config:', error);
    return getDefaultSiteConfig();
  }
}

export async function updateSiteConfig(config: Partial<SiteConfig>): Promise<SiteConfig | null> {
  try {
    let { data, error } = await supabase
      .from('site_config')
      .select('*')
      .single();
    
    if (error || !data) {
      const defaultConfig = getDefaultSiteConfig();
      const { data: newData, error: insertError } = await supabase
        .from('site_config')
        .insert([{ ...defaultConfig, ...config }])
        .select()
        .single();
      
      if (insertError) {
        console.error('Error creating site config:', insertError);
        throw insertError;
      }
      
      return newData;
    }
    
    ({ data, error } = await supabase
      .from('site_config')
      .update(config)
      .eq('id', data.id)
      .select()
      .single());
    
    if (error) {
      console.error('Error updating site config:', error);
      throw error;
    }
    
    return data;
  } catch (error) {
    console.error('Error updating site config:', error);
    return null;
  }
}

function getDefaultSkills(): Skill[] {
  return [
    { id: '1', name: 'Midjourney', level: 95 },
    { id: '2', name: 'Stable Diffusion', level: 90 },
    { id: '3', name: 'ComfyUI', level: 85 },
    { id: '4', name: 'Photoshop', level: 88 },
    { id: '5', name: 'Premiere', level: 80 },
    { id: '6', name: 'After Effects', level: 75 },
  ];
}

function getDefaultTimeline(): TimelineItem[] {
  return [
    { id: '1', year: '2023', title: '开始AI绘画', description: '接触Midjourney，开始探索AI艺术创作' },
    { id: '2', year: '2024', title: '开始AI视频创作', description: '拓展到AI视频领域，学习视频编辑技术' },
    { id: '3', year: '2025', title: '建立个人品牌', description: '成立胡歪歪AI Studio，专注二次元创作' },
  ];
}

function getDefaultStats(): Stat[] {
  return [
    { id: '1', value: 500, label: '作品数量', suffix: '+' },
    { id: '2', value: 1000, label: '累计创作时长', suffix: '小时' },
    { id: '3', value: 50, label: '视频数量', suffix: '+' },
    { id: '4', value: 10000, label: '粉丝数量', suffix: '+' },
  ];
}

function getDefaultSocialLinks(): SocialLink[] {
  return [
    { id: '1', name: '邮箱', icon: 'Mail', url: 'mailto:hello@huwaiwai.com' },
    { id: '2', name: '微信', icon: 'MessageCircle', url: '#' },
    { id: '3', name: 'B站', icon: 'Video', url: '#' },
    { id: '4', name: '抖音', icon: 'Music', url: '#' },
    { id: '5', name: '小红书', icon: 'BookOpen', url: '#' },
    { id: '6', name: 'GitHub', icon: 'Github', url: '#' },
  ];
}

function getDefaultSiteConfig(): SiteConfig {
  return {
    id: '1',
    heroTitle: '胡歪歪 AI Studio',
    heroSubtitle: '探索AI创作的无限可能',
    heroDescription: '用技术与艺术创造美好，让想象变为现实',
    avatarUrl: 'https://picsum.photos/seed/avatar/300/300',
    aboutTitle: '关于我',
    aboutName: '胡歪歪',
    aboutDescription: '热爱二次元文化的AI创作者，专注于AI绘画与视频创作领域。通过Midjourney、Stable Diffusion等工具，探索数字艺术的无限可能。相信技术与艺术的结合能够创造出令人惊叹的作品，致力于用AI技术将想象变为现实。',
    aboutTags: 'AI创作,二次元,数字艺术,视频制作',
  };
}

function b64toBlob(base64: string, contentType: string): Blob {
  const byteCharacters = atob(base64);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
}
