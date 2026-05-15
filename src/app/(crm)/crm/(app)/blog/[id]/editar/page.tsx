import { BlogPostForm } from "@/features/blog/components/blog-post-form";
import { getBlogPostFormData } from "@/features/blog/data/blog-content";
import { getPageAccess } from "@/server/auth/route-guards";
import { AccessDenied } from "@/shared/components/crm/access-denied";

type EditBlogPostPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export default async function EditBlogPostPage({ params }: EditBlogPostPageProps) {
  const access = await getPageAccess("blog:write");

  if (!access.allowed) {
    return <AccessDenied description="Seu perfil não possui permissão para editar publicações." />;
  }

  const { id } = await params;
  const data = await getBlogPostFormData(id);

  return <BlogPostForm data={data} />;
}
