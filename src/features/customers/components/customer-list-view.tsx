import type { CustomerListData } from "@/features/customers/data/customer-directory";
import { CustomerListFilters } from "@/features/customers/components/customer-list-filters";
import { CustomerListTable } from "@/features/customers/components/customer-list-table";
import { Badge } from "@/shared/components/ui/badge";

type CustomerListViewProps = {
  data: CustomerListData;
};

export function CustomerListView({ data }: CustomerListViewProps) {
  return (
    <div className="flex w-full flex-col gap-6">
      <section>
        <Badge variant="neutral" className="mb-3">
          Comercial
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Clientes convertidos
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          Consulte clientes originados do funil comercial, com vínculo ao lead e histórico preservado.
        </p>
      </section>

      <CustomerListFilters filters={data.filters} />
      <CustomerListTable customers={data.customers} />
    </div>
  );
}
