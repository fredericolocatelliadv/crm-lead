export interface News {
  id: string;
  title: string;
  content: string;
  category?: string;
  image_url?: string;
  created_at: string;
  published_at?: string | null;
  author?: string;
  slug?: string | null;
  excerpt?: string | null;
}
