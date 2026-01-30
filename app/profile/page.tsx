import React from 'react';
import { auth } from "@/auth";
import { prisma } from "@/app/lib/prisma";
import { redirect } from 'next/navigation';
import Header from "@/components/Header";
import BottomNav from "@/components/BottomNav";
import PersonalInfoForm from "@/components/profile/PersonalInfoForm";
import InsuranceCard from "@/components/profile/InsuranceCard";
import FamilyMemberList from "@/components/profile/FamilyMemberList";
import ProfileHeader from "@/components/profile/ProfileHeader";
import {
    updateProfile,
    updateName,
    updateInsurance,
    deleteInsurance,
    addFamilyMember,
    removeFamilyMember
} from "./actions";

export default async function ProfilePage() {
    const session = await auth();

    if (!session?.user) {
        redirect('/login');
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email! },
        include: {
            insurance: true,
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

                <InsuranceCard
                    insurance={user.insurance}
                    onUpdate={updateInsurance}
                    onDelete={deleteInsurance}
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
