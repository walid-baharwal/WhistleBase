"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Eye, Calendar, User, FileText } from "lucide-react";
import { trpc } from "@/lib/trpc";
import Link from "next/link";

interface CaseData {
  _id: string;
  category: string;
  status: "OPEN" | "CLOSED";
  justification: "JUSTIFIED" | "UNJUSTIFIED" | "NONE";
  createdAt: string;
  updatedAt: string;
}

const CasesPage = () => {
  const { data: cases, isLoading, error } = trpc.case.getAllCasesByOrganization.useQuery();

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return (
      date.toLocaleDateString() +
      " " +
      date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    );
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "OPEN":
        return "default";
      case "CLOSED":
        return "secondary";
      default:
        return "default";
    }
  };

  const getJustificationVariant = (justification: string) => {
    switch (justification) {
      case "JUSTIFIED":
        return "default";
      case "UNJUSTIFIED":
        return "destructive";
      case "NONE":
        return "outline";
      default:
        return "outline";
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="bg-destructive/10 p-6 rounded-lg max-w-lg w-full text-center">
          <div className="text-destructive text-4xl mb-4">⚠️</div>
          <h2 className="text-xl font-semibold text-destructive mb-2">Error</h2>
          <p className="text-destructive mb-4">{error.message}</p>
        </div>
      </div>
    );
  }

  if (!cases || cases.length === 0) {
    return (
      <div className="container mx-auto py-8 px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Cases</h1>
          <p className="text-muted-foreground mt-2">
            Manage and view all cases reported to your organization
          </p>
        </div>

        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">No cases yet</h3>
            <p className="text-muted-foreground mb-4">
              Cases will appear here when users submit reports through your channels.
            </p>
            <Button asChild>
              <Link href="/dashboard/channels">Manage Channels</Link>
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Cases</h1>
        <p className="text-muted-foreground mt-2">
          Manage and view all cases reported to your organization ({cases.length} total)
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cases.map((caseItem: CaseData) => (
          <Card key={caseItem._id} className="hover:shadow-lg transition-shadow">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg">Case #{caseItem._id.substring(0, 8)}</CardTitle>
                <Badge variant={getStatusVariant(caseItem.status)} className="text-xs">
                  {caseItem.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <FileText className="h-4 w-4" />
                  Category
                </div>
                <p className="font-medium">{caseItem.category}</p>
              </div>

              {caseItem.justification !== "NONE" && (
                <div>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                    <User className="h-4 w-4" />
                    Justification
                  </div>
                  <Badge
                    variant={getJustificationVariant(caseItem.justification)}
                    className="text-xs"
                  >
                    {caseItem.justification}
                  </Badge>
                </div>
              )}

              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Calendar className="h-4 w-4" />
                  Created
                </div>
                <p className="text-sm">{formatDate(caseItem.createdAt)}</p>
              </div>

              <div className="pt-2">
                <Button asChild className="w-full" variant="outline">
                  <Link href={`/dashboard/cases/${caseItem._id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Case
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CasesPage;
