import { BlogPostForm } from "@/features/blog/components/blog-post-form";
import { getBlogPostFormData } from "@/features/blog/data/blog-content";

export default async function NewBlogPostPage() {
  const data = await getBlogPostFormData();

  return <BlogPostForm data={data} />;
}
