import React from 'react';
import { auth } from "@/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from '@/i18n/routing';
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import PersonalInfoForm from "@/components/profile/PersonalInfoForm";
import FamilyMemberList from "@/components/profile/FamilyMemberList";
import ProfileHeader from "@/components/profile/ProfileHeader";
import PharmacySelector from "@/components/profile/PharmacySelector";
import {
    updateProfile,
    updateName,
    updatePharmacy,
    addFamilyMember,
    removeFamilyMember
} from "./actions";

export default async function ProfilePage({
    params
}: {
    params: Promise<{ locale: string }>;
}) {
    const { locale } = await params;
    const session = await auth();
    const userEmail = session?.user?.email;

    if (!userEmail) {
        redirect({ href: '/login', locale });
    }

    const user = await prisma.user.findUnique({
        where: { email: userEmail as string },
        include: {
            pharmacy: true, // Include pharmacy
            familyMembers: true,
        },
    });

    if (!user) {
        return <div>User not found</div>;
    }

    return (
        <div className="bg-gray-50 min-h-screen pb-24">
            <Header />

            <ProfileHeader
                user={user}
                onUpdateName={updateName}
            />

            <div className="px-5 space-y-5">
                <PersonalInfoForm
                    user={user}
                    onUpdate={updateProfile}
                />

                <PharmacySelector
                    selectedPharmacy={user.pharmacy} // user.pharmacy is the relation
                    onSelect={updatePharmacy}
                />

                <FamilyMemberList
                    members={user.familyMembers}
                    onAdd={addFamilyMember}
                    onRemove={removeFamilyMember}
                />
            </div>

            <BottomNav />
        </div>
    );
}
