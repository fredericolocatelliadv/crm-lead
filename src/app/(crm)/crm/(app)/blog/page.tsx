import { BlogManagerView } from "@/features/blog/components/blog-manager-view";
import { getBlogManagerData } from "@/features/blog/data/blog-content";

export default async function BlogPage() {
  const data = await getBlogManagerData();

  return <BlogManagerView data={data} />;
}
