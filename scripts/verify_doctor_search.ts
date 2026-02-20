
import { getDoctors } from '../app/[locale]/(mobile)/consult/actions';
import { prisma } from '../app/lib/prisma';

async function main() {
    const query = '한유석';
    const category = 'telemedicine';

    console.log(`Searching for '${query}' in category '${category}'...`);

    // Mocking the behavior of the server action
    // Note: We can't directly call server action here easily without Next.js context sometimes, 
    // but getDoctors is a standalone async function exporting from actions.ts, so it should work 
    // if it doesn't rely on headers/cookies internally (it doesn't seem to).

    const doctors = await getDoctors({ query, category });

    console.log(`Found ${doctors.length} doctors.`);

    if (doctors.length > 0) {
        doctors.forEach(doc => {
            console.log(`- ${doc.name} (${doc.specialty})`);
        });
        console.log('PASS: Doctor found.');
    } else {
        console.error('FAIL: No doctors found.');
    }
}

main()
    .catch((e) => console.error(e))
    .finally(async () => await prisma.$disconnect());
