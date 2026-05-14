import { PipelineBoard } from "@/features/pipeline/components/pipeline-board";
import { PipelineFilters } from "@/features/pipeline/components/pipeline-filters";
import { getPipelineBoard, parsePipelineFilters } from "@/features/pipeline/data/pipeline-board";
import { Badge } from "@/shared/components/ui/badge";

type PipelinePageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function PipelinePage({ searchParams }: PipelinePageProps) {
  const params = await searchParams;
  const filters = parsePipelineFilters(params);
  const data = await getPipelineBoard(filters);

  return (
    <div className="flex w-full flex-col gap-6">
      <section>
        <Badge variant="neutral" className="mb-3">
          Pipeline
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Pipeline comercial
        </h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-muted-foreground">
          Visualize os leads por etapa e movimente o atendimento comercial até a conversão.
        </p>
      </section>

      <PipelineFilters
        assignees={data.assignees}
        filters={data.filters}
        legalAreas={data.legalAreas}
      />

      <PipelineBoard data={data} />
    </div>
  );
}
