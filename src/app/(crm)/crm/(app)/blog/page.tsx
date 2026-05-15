import { BlogManagerView } from "@/features/blog/components/blog-manager-view";
import { getBlogManagerData } from "@/features/blog/data/blog-content";
import { getPageAccess } from "@/server/auth/route-guards";
import { AccessDenied } from "@/shared/components/crm/access-denied";

export default async function BlogPage() {
  const access = await getPageAccess("blog:read");

  if (!access.allowed) {
    return <AccessDenied description="Seu perfil não possui permissão para acessar o blog." />;
  }

  const data = await getBlogManagerData();

  return <BlogManagerView data={data} />;
}
