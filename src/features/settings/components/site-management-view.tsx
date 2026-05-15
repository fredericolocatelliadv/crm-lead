import {
  BusinessHoursForm,
  LegalAreaDeleteButton,
  LegalAreaDialog,
  LegalAreaStatusButton,
  OperationalStatusBadge,
  QuickReplyDeleteButton,
  QuickReplyDialog,
  QuickReplyStatusButton,
} from "@/features/settings/components/operational-settings";
import {
  FaqDialog,
  TeamMemberDialog,
  TestimonialDialog,
} from "@/features/settings/components/site-content-dialogs";
import {
  SiteContentDeleteButton,
  SiteContentStatusButton,
} from "@/features/settings/components/site-content-actions";
import { LegalDocumentsSettingsForm } from "@/features/settings/components/legal-documents-settings-form";
import { MarketingSeoSettingsForm } from "@/features/settings/components/marketing-seo-settings-form";
import { SiteSettingsForm } from "@/features/settings/components/site-settings-form";
import type { SiteManagementData } from "@/features/settings/data/site-management";
import type { UserRole } from "@/features/users/types/roles";
import { hasPermission } from "@/server/auth/permissions";
import { EmptyState } from "@/shared/components/crm/page-state";
import { Badge } from "@/shared/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/shared/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";

export function SiteManagementView({
  data,
  role,
}: {
  data: SiteManagementData;
  role: UserRole;
}) {
  const canManageMarketing = hasPermission(role, "marketing:manage");
  const canManageSettings = hasPermission(role, "settings:manage");
  const defaultTab = canManageSettings ? "contato" : "marketing";

  return (
    <div className="flex w-full flex-col gap-6">
      <section>
        <Badge variant="neutral" className="mb-3">
          Configurações
        </Badge>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
          Configurações do CRM e site
        </h1>
        <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">
          Gerencie cada área no seu próprio lugar, sem misturar formulários com listas
          ou alterar a identidade visual do site sem pedido explícito.
        </p>
      </section>

      <Tabs defaultValue={defaultTab} className="w-full">
        <TabsList className="flex h-auto w-full flex-wrap justify-start gap-1 rounded-md border bg-card p-1">
          {canManageSettings ? <TabsTrigger value="contato">Contato e redes</TabsTrigger> : null}
          {canManageMarketing ? <TabsTrigger value="marketing">Marketing e SEO</TabsTrigger> : null}
          {canManageSettings ? <TabsTrigger value="documentos">Documentos legais</TabsTrigger> : null}
          {canManageSettings ? <TabsTrigger value="equipe">Equipe</TabsTrigger> : null}
          {canManageSettings ? <TabsTrigger value="depoimentos">Depoimentos</TabsTrigger> : null}
          {canManageSettings ? <TabsTrigger value="faq">FAQ</TabsTrigger> : null}
          {canManageSettings ? <TabsTrigger value="areas">Áreas jurídicas</TabsTrigger> : null}
          {canManageSettings ? <TabsTrigger value="respostas">Respostas rápidas</TabsTrigger> : null}
          {canManageSettings ? <TabsTrigger value="horarios">Horários</TabsTrigger> : null}
        </TabsList>

        {canManageSettings ? (
        <TabsContent value="contato" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Contato e redes sociais</CardTitle>
              <CardDescription>
                Informações usadas em botões, rodapé e contatos públicos.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <SiteSettingsForm settings={data.settings} />
            </CardContent>
          </Card>
        </TabsContent>
        ) : null}

        {canManageMarketing ? (
        <TabsContent value="marketing" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Marketing e SEO</CardTitle>
              <CardDescription>
                Configure mensuração, verificações e informações usadas por buscadores
                sem alterar o código do site.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MarketingSeoSettingsForm settings={data.settings} />
            </CardContent>
          </Card>
        </TabsContent>
        ) : null}

        {canManageSettings ? (
        <TabsContent value="documentos" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Documentos legais</CardTitle>
              <CardDescription>
                Edite os textos publicados no site e a versão registrada nos leads capturados.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <LegalDocumentsSettingsForm settings={data.settings} />
            </CardContent>
          </Card>
        </TabsContent>
        ) : null}

        {canManageSettings ? (
        <TabsContent value="equipe" className="mt-6">
          <ContentCard
            title="Equipe"
            description="Profissionais exibidos na seção de equipe."
            action={<TeamMemberDialog />}
          >
            {data.teamMembers.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Cargo</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.teamMembers.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell>
                        <p className="font-medium text-foreground">{member.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Posição {member.position}
                        </p>
                      </TableCell>
                      <TableCell>{member.role || "Não informado"}</TableCell>
                      <TableCell>
                        <StatusBadge active={member.active} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <TeamMemberDialog member={member} />
                          <SiteContentStatusButton
                            active={member.active}
                            id={member.id}
                            table="team_members"
                          />
                          <SiteContentDeleteButton id={member.id} table="team_members" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                title="Nenhum membro cadastrado"
                description="Cadastre os profissionais que devem aparecer no site."
              />
            )}
          </ContentCard>
        </TabsContent>
        ) : null}

        {canManageSettings ? (
          <>
        <TabsContent value="depoimentos" className="mt-6">
          <ContentCard
            title="Depoimentos"
            description="Depoimentos exibidos na seção de confiança."
            action={<TestimonialDialog />}
          >
            {data.testimonials.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.testimonials.map((testimonial) => (
                    <TableRow key={testimonial.id}>
                      <TableCell>{testimonial.name}</TableCell>
                      <TableCell>{testimonial.role || "Não informada"}</TableCell>
                      <TableCell>
                        <StatusBadge active={testimonial.active} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <TestimonialDialog testimonial={testimonial} />
                          <SiteContentStatusButton
                            active={testimonial.active}
                            id={testimonial.id}
                            table="testimonials"
                          />
                          <SiteContentDeleteButton id={testimonial.id} table="testimonials" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                title="Nenhum depoimento cadastrado"
                description="Cadastre depoimentos para exibição no site."
              />
            )}
          </ContentCard>
        </TabsContent>

        <TabsContent value="faq" className="mt-6">
          <ContentCard
            title="FAQ"
            description="Perguntas frequentes exibidas no site."
            action={<FaqDialog />}
          >
            {data.faqs.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Pergunta</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.faqs.map((faq) => (
                    <TableRow key={faq.id}>
                      <TableCell>
                        <p className="font-medium text-foreground">{faq.question}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Posição {faq.position}
                        </p>
                      </TableCell>
                      <TableCell>
                        <StatusBadge active={faq.active} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <FaqDialog faq={faq} />
                          <SiteContentStatusButton
                            active={faq.active}
                            id={faq.id}
                            table="faqs"
                          />
                          <SiteContentDeleteButton id={faq.id} table="faqs" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                title="Nenhuma pergunta cadastrada"
                description="Cadastre perguntas frequentes para a seção de FAQ."
              />
            )}
          </ContentCard>
        </TabsContent>

        <TabsContent value="areas" className="mt-6">
          <ContentCard
            title="Áreas jurídicas"
            description="Áreas usadas nos formulários do site, cadastro de leads, clientes e relatórios."
            action={<LegalAreaDialog />}
          >
            {data.legalAreas.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Área</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.legalAreas.map((area) => (
                    <TableRow key={area.id}>
                      <TableCell>
                        <p className="font-medium text-foreground">{area.name}</p>
                        <p className="mt-1 text-xs text-muted-foreground">
                          Posição {area.position}
                        </p>
                      </TableCell>
                      <TableCell className="max-w-lg">
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {area.description || "Sem descrição interna"}
                        </p>
                      </TableCell>
                      <TableCell>
                        <OperationalStatusBadge active={area.active} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <LegalAreaDialog area={area} />
                          <LegalAreaStatusButton active={area.active} id={area.id} />
                          <LegalAreaDeleteButton id={area.id} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                title="Nenhuma área jurídica cadastrada"
                description="Cadastre as áreas que devem aparecer nos formulários do site e do CRM."
              />
            )}
          </ContentCard>
        </TabsContent>

        <TabsContent value="respostas" className="mt-6">
          <ContentCard
            title="Respostas rápidas"
            description="Mensagens reutilizáveis para agilizar o atendimento nas conversas."
            action={<QuickReplyDialog />}
          >
            {data.quickReplies.length > 0 ? (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Título</TableHead>
                    <TableHead>Resposta</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.quickReplies.map((reply) => (
                    <TableRow key={reply.id}>
                      <TableCell className="font-medium text-foreground">{reply.title}</TableCell>
                      <TableCell className="max-w-2xl">
                        <p className="line-clamp-2 text-sm text-muted-foreground">
                          {reply.content}
                        </p>
                      </TableCell>
                      <TableCell>
                        <OperationalStatusBadge active={reply.active} />
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <QuickReplyDialog reply={reply} />
                          <QuickReplyStatusButton active={reply.active} id={reply.id} />
                          <QuickReplyDeleteButton id={reply.id} />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <EmptyState
                title="Nenhuma resposta rápida cadastrada"
                description="Cadastre mensagens reutilizáveis para a equipe usar nos atendimentos."
              />
            )}
          </ContentCard>
        </TabsContent>

        <TabsContent value="horarios" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Horários de atendimento</CardTitle>
              <CardDescription>
                Defina o expediente usado pelo atendimento, WhatsApp e IA para tratar
                contatos fora de horário.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <BusinessHoursForm hours={data.businessHours} />
            </CardContent>
          </Card>
        </TabsContent>
          </>
        ) : null}
      </Tabs>
    </div>
  );
}

function ContentCard({
  action,
  children,
  description,
  title,
}: {
  action: React.ReactNode;
  children: React.ReactNode;
  description: string;
  title: string;
}) {
  return (
    <Card>
      <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </div>
        {action}
      </CardHeader>
      <CardContent>{children}</CardContent>
    </Card>
  );
}

function StatusBadge({ active }: { active: boolean }) {
  return (
    <Badge variant={active ? "success" : "neutral"}>
      {active ? "Ativo" : "Inativo"}
    </Badge>
  );
}
