import { BlogPostForm } from "@/features/blog/components/blog-post-form";
import { getBlogPostFormData } from "@/features/blog/data/blog-content";
import { getPageAccess } from "@/server/auth/route-guards";
import { AccessDenied } from "@/shared/components/crm/access-denied";

export default async function NewBlogPostPage() {
  const access = await getPageAccess("blog:write");

  if (!access.allowed) {
    return <AccessDenied description="Seu perfil não possui permissão para criar publicações." />;
  }

  const data = await getBlogPostFormData();

  return <BlogPostForm data={data} />;
}
