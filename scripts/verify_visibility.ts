
import { getClinics, getDoctors } from '../app/[locale]/(mobile)/consult/actions';
import { prisma } from '../app/lib/prisma';

async function main() {
    console.log('Verifying visibility filters...');

    // 1. Verify getClinics
    console.log('Checking getClinics...');
    const clinics = await getClinics({});
    console.log(`Fetched ${clinics.length} clinics.`);

    const hiddenClinics = clinics.filter(c => !c.isVisible);
    if (hiddenClinics.length > 0) {
        console.error('FAIL: Found hidden clinics in getClinics result:', hiddenClinics.map(c => c.name));
    } else {
        console.log('PASS: All fetched clinics are visible.');
    }

    // 2. Verify getDoctors
    console.log('\nChecking getDoctors...');
    const doctors = await getDoctors({});
    console.log(`Fetched ${doctors.length} visible doctors.`);

    let doctorsFromHiddenClinics = 0;
    for (const doc of doctors) {
        if (doc.clinic && !doc.clinic.isVisible) {
            console.error(`FAIL: Doctor ${doc.name} belongs to hidden clinic ${doc.clinic.name}`);
            doctorsFromHiddenClinics++;
        }
    }

    if (doctorsFromHiddenClinics === 0) {
        console.log('PASS: All fetched doctors belong to visible clinics.');
    } else {
        console.error(`FAIL: Found ${doctorsFromHiddenClinics} doctors from hidden clinics.`);
    }

    // 3. Verify Database State (Control Check)
    const totalClinics = await prisma.clinic.count();
    const totalHiddenClinics = await prisma.clinic.count({ where: { isVisible: false } });
    const totalDoctors = await prisma.doctor.count();

    console.log(`\nControl Stats:`);
    console.log(`- Total Clinics: ${totalClinics}`);
    console.log(`- Hidden Clinics: ${totalHiddenClinics}`);
    console.log(`- Visible Clinics: ${totalClinics - totalHiddenClinics}`);
    console.log(`- Total Doctors: ${totalDoctors}`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    });
