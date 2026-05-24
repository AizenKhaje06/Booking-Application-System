import { PageHeader } from "@/components/shared/page-header";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BRANCHES } from "@/lib/constants";

export default function BranchesPage() {
  return (
    <>
      <PageHeader
        title="Our Branches"
        description="Three locations — Main Branch includes the Skyline Event Hall on the 2nd floor."
      />
      <div className="container grid gap-6 pb-16 md:grid-cols-3">
        {Object.values(BRANCHES).map((branch) => (
          <Card key={branch.slug}>
            <CardHeader>
              <CardTitle>{branch.label}</CardTitle>
              <CardDescription>{branch.tagline}</CardDescription>
            </CardHeader>
          </Card>
        ))}
      </div>
    </>
  );
}
