'use client';

import { useState, useEffect } from 'react';
import { Center, Loader, Card, Text, Group } from '@mantine/core';
import dayjs from 'dayjs';
import { useRouter } from 'next/navigation';

interface Doctor {
  id: number;
  jobIdNumber: string;
  userId: number;
  name: string;
  surname: string;
  phone: string;
}

interface Visit {
  visitId: number;
  doctorId: number;
  dateStart: string;
  dateEnd: string;
  doctor?: Doctor;
}

export default function MyVisitsPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    fetchUserAndVisits();
  }, []);

  const fetchDoctorInfo = async (doctorId: number): Promise<Doctor | null> => {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const response = await fetch(`http://localhost:8080/api/doctors/${doctorId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      return await response.json();
    } catch {
      return null;
    }
  };

  const sortVisits = (visits: Visit[]) => {
    return [...visits].sort((a, b) => {
      return new Date(a.dateStart).getTime() - new Date(b.dateStart).getTime();
    });
  };

  const fetchUserAndVisits = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }

    try {
      const userRes = await fetch('http://localhost:8080/api/auth/me', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });
      if (!userRes.ok) throw new Error('Brak autoryzacji');
      const user = await userRes.json();

      let endpoint = '';
      let id = '';

      if (user.roles.includes('ROLE_DOCTOR')) {
        id = user.doctor?.id?.toString() || '';
        endpoint = `http://localhost:8080/api/visits/list/doctor/${id}`;
      } else {
        id = user.patient?.id?.toString() || '';
        endpoint = `http://localhost:8080/api/visits/list/patient/${id}`;
      }

      if (!id) {
        setError('Brak ID użytkownika');
        setLoading(false);
        return;
      }

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      if (!data.visits) {
        throw new Error('Nieprawidłowy format danych');
      }

      const visitsWithDoctors = await Promise.all(
        data.visits.map(async (visit: Visit) => {
          const doctorInfo = await fetchDoctorInfo(visit.doctorId);
          return { ...visit, doctor: doctorInfo };
        })
      );
      const sortedVisits = sortVisits(visitsWithDoctors);
      setVisits(sortedVisits);
    } catch (error) {
      // setError('Nie udało się pobrać listy wizyt');
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortVisits = () => {
    const now = new Date();
    return sortVisits(visits.filter(visit => 
      new Date(visit.dateStart) >= now
    ));
  };

  if (loading) {
    return (
      <Center className="h-screen">
        <Loader size="xl" />
      </Center>
    );
  }

  return (
    <Center>
      <div className="w-[90%] p-6">
        <h1 className="text-3xl font-bold mb-6">Moje wizyty</h1>
        
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}

        {visits.length === 0 ? (
          <Text size="lg" className="text-center py-8">
            Nie masz żadnych umówionych wizyt
          </Text>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: '1.5rem',
            }}
          >
            {filterAndSortVisits().map((visit) => (
              <Card key={visit.visitId} shadow="sm" padding="lg" radius="md" withBorder>
                <Group position="apart" mb="xs">
                  <Text weight={500}>
                    {`Lekarz ID: ${visit.doctorId}`
                    }
                  </Text>
                  {visit.doctor && (
                    <Text size="sm" color="dimmed">
                      Nr. PWZ: {visit.doctor.jobIdNumber}
                    </Text>
                  )}
                </Group>

                <Text size="sm" color="dimmed" mb="md">
                  Data: {dayjs(visit.dateStart).format('DD.MM.YYYY')}
                </Text>
                <Text size="sm" color="dimmed" mb="md">
                  Godzina: {dayjs(visit.dateStart).format('HH:mm')} - {dayjs(visit.dateEnd).format('HH:mm')}
                </Text>
                {visit.doctor && (
                  <Text size="sm" color="dimmed" mb="md">
                    Telefon: {visit.doctor.phone}
                  </Text>
                )}
              </Card>
            ))}
          </div>
        )}
      </div>
    </Center>
  );
}