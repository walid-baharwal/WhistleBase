"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Eye,
  Calendar,
  User,
  FileText,
  AlertCircle,
  CheckCircle,
  XCircle,
  BarChart3,
  MessageSquare,
} from "lucide-react";
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

const DashboardOverview = () => {
  const { data: analytics, isLoading: analyticsLoading } =
    trpc.case.getDashboardAnalytics.useQuery();
  const { data: latestCases, isLoading: casesLoading } = trpc.case.getLatestCases.useQuery({
    limit: 6,
  });

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

  const analyticsCards = [
    {
      title: "Total Cases",
      value: analytics?.totalCases || 0,
      icon: <FileText className="h-6 w-6 text-blue-600" />,
      description: "All reported cases",
    },
    {
      title: "Total Channels",
      value: analytics?.totalChannels || 0,
      icon: <MessageSquare className="h-6 w-6 text-green-600" />,
      description: "Active reporting channels",
    },
    {
      title: "Open Cases",
      value: analytics?.openCases || 0,
      icon: <AlertCircle className="h-6 w-6 text-yellow-600" />,
      description: "Currently under review",
    },
    {
      title: "Closed Cases",
      value: analytics?.closedCases || 0,
      icon: <CheckCircle className="h-6 w-6 text-gray-600" />,
      description: "Resolved and closed",
    },
    {
      title: "Justified Cases",
      value: analytics?.justifiedCases || 0,
      icon: <CheckCircle className="h-6 w-6 text-green-600" />,
      description: "Confirmed valid reports",
    },
    {
      title: "Unjustified Cases",
      value: analytics?.unjustifiedCases || 0,
      icon: <XCircle className="h-6 w-6 text-red-600" />,
      description: "Reports deemed invalid",
    },
  ];

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 pt-0">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Overview</h1>
        <p className="text-muted-foreground mt-2">
          Monitor your organization&apos;s case management activity
        </p>
      </div>

      <div className="grid auto-rows-min gap-4 md:grid-cols-2 lg:grid-cols-3">
        {analyticsCards.map((card, index) => (
          <Card key={index} className="hover:shadow-lg transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{card.title}</CardTitle>
              {card.icon}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {analyticsLoading ? (
                  <div className="h-8 w-16 bg-muted animate-pulse rounded" />
                ) : (
                  card.value
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">{card.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Latest Cases</h2>
            <p className="text-muted-foreground">Recent case submissions</p>
          </div>
          <Button asChild variant="outline">
            <Link href="/dashboard/cases">
              <BarChart3 className="h-4 w-4 mr-2" />
              View All Cases
            </Link>
          </Button>
        </div>

        {casesLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <Card key={i} className="animate-pulse">
                <CardHeader>
                  <div className="h-4 bg-muted rounded w-3/4" />
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="h-3 bg-muted rounded w-1/2" />
                  <div className="h-3 bg-muted rounded w-2/3" />
                  <div className="h-8 bg-muted rounded w-full" />
                </CardContent>
              </Card>
            ))}
          </div>
        ) : !latestCases || latestCases.length === 0 ? (
          <Card className="flex items-center justify-center min-h-[200px]">
            <CardContent className="text-center">
              <FileText className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No cases yet</h3>
              <p className="text-muted-foreground mb-4">
                Cases will appear here when users submit reports through your channels.
              </p>
              <Button asChild>
                <Link href="/dashboard/channels">Manage Channels</Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {latestCases.map((caseItem: CaseData) => (
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
                    <Button asChild className="w-full" variant="outline" size="sm">
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
        )}
      </div>
    </div>
  );
};

export default DashboardOverview;
