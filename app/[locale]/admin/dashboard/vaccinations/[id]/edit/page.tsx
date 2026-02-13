
import { prisma } from "@/app/lib/prisma";
import VaccinationForm from "@/components/admin/vaccinations/VaccinationForm";
import { notFound } from "next/navigation";

export default async function EditVaccinationPage({
    params
}: {
    params: Promise<{ id: string }>;
}) {
    const { id } = await params;
    const vaccination = await prisma.vaccination.findUnique({
        where: { id }
    });

    if (!vaccination) {
        notFound();
    }

    return <VaccinationForm initialData={vaccination} />;
}
