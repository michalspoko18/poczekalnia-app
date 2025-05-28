'use client';

import { Center, Loader, Button, Text, Notification } from '@mantine/core';
import { modals } from '@mantine/modals';
import { useState, useEffect } from 'react';
import { DatePickerInput } from '@mantine/dates';
import '@mantine/dates/styles.css';
import dayjs from 'dayjs';

export default function Page() {
  const [selectedDate, setSelectedDate] = useState<string>(
    dayjs().format('YYYY-MM-DD')
  );
  const [visits, setVisits] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [showNotification, setShowNotification] = useState<null | string>(null);

  const lekarze = [
    { id: 1, imie: 'Dr. Polak', interval: 2 },
    { id: 2, imie: 'Dr. Niemiec', interval: 3 },
    { id: 3, imie: 'Dr. Europejski', interval: 2 },
  ];

  const godzinyBazowe = [8, 10, 12, 14, 16];

  // Ustaw patientId w localStorage jeśli go nie ma
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token && !localStorage.getItem('patientId')) {
      (async () => {
        try {
          const response = await fetch('http://localhost:8080/api/auth/me', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
          });

          if (response.ok) {
            const meData = await response.json();
            if (meData.patient?.id) {
              localStorage.setItem('patientId', meData.patient.id.toString());
            }
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
        }
      })();
    }
  }, []);

  const fetchVisits = async (date: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    try {
      const response = await fetch('http://localhost:8080/api/visits/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ date }),
      });

      if (response.status === 404) {
        setVisits([]);
        return;
      }

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      setVisits(data.visits || []);
    } catch (error) {
      setVisits([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVisits(selectedDate);
  }, [selectedDate]);

  const handleReservation = async (lekarzId: number, godzina: number) => {
    const token = localStorage.getItem('token');
    const patientId = localStorage.getItem('patientId');

    if (!token || !patientId) {
      setMessage('Brak danych pacjenta. Zaloguj się ponownie.');
      return;
    }

    try {
      const dateStart = dayjs(selectedDate)
        .hour(godzina)
        .minute(0)
        .second(0)
        .format('YYYY-MM-DD HH:mm:ss');

      const dateEnd = dayjs(selectedDate)
        .hour(godzina + 1)
        .minute(0)
        .second(0)
        .format('YYYY-MM-DD HH:mm:ss');

      const res = await fetch('http://localhost:8080/api/visits/reservation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          patientId,
          doctorId: lekarzId.toString(),
          dateStart,
          dateEnd,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.message || 'Reservation failed');
      }

      const result = await res.json();
      setShowNotification(`Zarezerwowano wizytę na: ${dayjs(result.dateStart).format('DD.MM.YYYY HH:mm')}`);
      setMessage('');
      fetchVisits(selectedDate);
    } catch (error) {
      setMessage('Błąd rezerwacji - ' + (error as Error).message);
    }
  };

  const openReservationModal = (lekarzId: number, godzina: number) => {
    modals.openConfirmModal({
      title: 'Potwierdź rezerwację',
      size: 'sm',
      radius: 'md',
      withCloseButton: false,
      centered: true, 
      zIndex: 5000,  
      children: (
        <Text size="sm">
          Czy na pewno chcesz zarezerwować wizytę u wybranego lekarza na godzinę {godzina}:00?
        </Text>
      ),
      labels: { confirm: 'Rezerwuj', cancel: 'Anuluj' },
      onCancel: () => {},
      onConfirm: () => handleReservation(lekarzId, godzina),
    });
  };

  const isPastHour = (date: string, hour: number) => {
    const now = dayjs();
    const selectedDateTime = dayjs(date).hour(hour);
    return selectedDateTime.isBefore(now);
  };

  return (
    <Center>
      <div className="max-w-2xl mx-auto p-6">
        {showNotification && (
          <div
            style={{
              position: 'fixed',
              right: 24,
              bottom: 24,
              zIndex: 6000,
              maxWidth: 360,
            }}
          >
            <Notification
              radius="xl"
              title="Rezerwacja potwierdzona"
              onClose={() => setShowNotification(null)}
              withCloseButton
              color="green"
            >
              {showNotification}
            </Notification>
          </div>
        )}

        <h1 className="text-3xl font-bold mb-6">Wolne terminy</h1>

        <div className="bg-gray-100 p-4 rounded mb-6">
          <h2 className="text-xl font-semibold mb-4">Wybierz datę</h2>
          <DatePickerInput
            label="Data"
            placeholder="Wybierz datę"
            value={dayjs(selectedDate).toDate()}
            onChange={(date) => {
              if (date) {
                const formattedDate = dayjs(date).format('YYYY-MM-DD');
                setSelectedDate(formattedDate);
              }
            }}
            minDate={new Date()}
          />
        </div>

        {message && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
            <p>{message}</p>
          </div>
        )}

        {loading ? (
          <Center className="py-8">
            <Loader />
          </Center>
        ) : (
          <div>
            <h2 className="text-xl font-semibold mb-4">Dostępne godziny</h2>
            {lekarze.map((lekarz) => (
              <div key={lekarz.id} className="mb-6 p-4 border rounded">
                <h3 className="text-lg font-bold mb-2">{lekarz.imie}</h3>
                <div className="flex flex-wrap gap-3">
                  {godzinyBazowe
                    .filter((h) => h % lekarz.interval === 0)
                    .map((godzina) => {
                      const visit = visits.find(
                        v => v.doctorId === lekarz.id && dayjs(v.dateStart).hour() === godzina
                      );
                      
                      const patientHasVisitAtThisHour = visits.some(
                        v =>
                          dayjs(v.dateStart).isSame(
                            dayjs(selectedDate).hour(godzina).minute(0).second(0),
                            'hour'
                          )
                      );

                      const isPast = isPastHour(selectedDate, godzina);

                      if (isPast) {
                        return null;
                      }

                      return (
                        <Button
                          key={godzina}
                          disabled={!!visit || loading || patientHasVisitAtThisHour}
                          onClick={() => openReservationModal(lekarz.id, godzina)}
                          color={visit || patientHasVisitAtThisHour ? 'gray' : 'green'}
                        >
                          {godzina}:00
                        </Button>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </Center>
  );
}
