import dayjs from "dayjs";
import { Calendar } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/src/components/ui/card";
import { DataTable } from "@/src/components/ui/data-table";
import {
  PageActions,
  PageContainer,
  PageContent,
  PageDescription,
  PageHeader,
  PageHeaderContent,
  PageTitle,
} from "@/src/components/ui/page-container";
import { getDashboard } from "@/src/data/get-dashboard";
import { auth } from "@/src/lib/auth";

import { appointmentsTableColumns } from "../appointments/_components/table-columns";
import AppointmentsChart from "./components/appointments-chart";
import { DatePicker } from "./components/date-picker";
import StatsCards from "./components/stats-cards";
import TopDoctors from "./components/top-doctors";
import TopSpecialties from "./components/top-specialties";

interface DashboardPageProps {
  searchParams: Promise<{
    from: string;
    to: string;
  }>;
}

const DashboardPage = async ({ searchParams }: DashboardPageProps) => {
  const session = await auth.api.getSession({
    headers: await headers(),
  });

  if (!session?.user) {
    redirect("/authentication");
  }
  if (!session.user.clinic) {
    redirect("/clinic-form");
  }
  const { from, to } = await searchParams;
  if (!from || !to) {
    redirect(
      `/dashboard?from=${dayjs().format("YYYY-MM-DD")}&to=${dayjs().add(1, "month").format("YYYY-MM-DD")}`
    );
  }
  const {
    totalRevenue,
    totalAppointments,
    totalPatients,
    totalDoctors,
    dailyAppointmentsData,
    topDoctors,
    topSpecialties,
    todayAppointments,
  } = await getDashboard({
    from,
    to,
    session: {
      user: {
        clinic: {
          id: session.user.clinic.id,
        },
      },
    },
  });

  return (
    <PageContainer>
      <PageHeader>
        <PageHeaderContent>
          <PageTitle>Dashboard</PageTitle>
          <PageDescription>
            Tenha uma visão geral da sua clínica.
          </PageDescription>
        </PageHeaderContent>
        <PageActions>
          <DatePicker />
        </PageActions>
      </PageHeader>
      <PageContent>
        <StatsCards
          totalRevenue={totalRevenue.total ? Number(totalRevenue.total) : null}
          totalAppointments={totalAppointments.total}
          totalPatients={totalPatients.total}
          totalDoctors={totalDoctors.total}
        />
        <div className="grid grid-cols-[2.25fr_1fr] gap-4">
          <AppointmentsChart dailyAppointmentsData={dailyAppointmentsData} />
          <TopDoctors doctors={topDoctors}></TopDoctors>
        </div>
        <div className="grid grid-cols-[2.25fr_1fr] gap-4">
          <Card>
            <CardHeader>
              <div className="flex items-center gap-3">
                <Calendar className="text-muted-foreground" />
                <CardTitle className="text-base">
                  Agendamentos de hoje
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <DataTable
                columns={appointmentsTableColumns}
                data={todayAppointments}
              />
            </CardContent>
          </Card>
          <TopSpecialties topSpecialties={topSpecialties} />
        </div>
      </PageContent>
    </PageContainer>
  );
};

export default DashboardPage;
