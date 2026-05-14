import { BlogPostForm } from "@/features/blog/components/blog-post-form";
import { getBlogPostFormData } from "@/features/blog/data/blog-content";

type EditBlogPostPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const { id } = await params;
  const data = await getBlogPostFormData(id);

  return <BlogPostForm data={data} />;
}
