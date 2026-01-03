'use client';

import { NewPatient } from '@/components/new-patient';
import { completePatientOnboarding } from '../app/(protected)/patient/onboarding/completePatientOnboarding';
import { useRouter } from 'next/navigation';

interface Props {
  data: any;
  userId: string;
}

export const NewPatientClient = ({ data, userId }: Props) => {
  const router = useRouter();

  return (
    <NewPatient
      data={data}
      type={data ? 'update' : 'create'}
      onComplete={async () => {
        const result = await completePatientOnboarding(userId);
        if (result.success) {
          router.push('/patient/dashboard');
        }
      }}
    />
  );
};
