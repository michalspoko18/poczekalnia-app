'use client';

import { Center, Loader } from '@mantine/core';
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

  const lekarze = [
    { id: 1, imie: 'Dr. Polak', interval: 2 },
    { id: 2, imie: 'Dr. Niemiec', interval: 3 },
    { id: 3, imie: 'Dr. Europejski', interval: 2 },
  ];

  const godzinyBazowe = [8, 10, 12, 14, 16];

  const fetchVisits = async (date: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    setLoading(true);
    try {
      console.log('Fetching visits with:', {
        date,
        token: token.substring(0, 20) + '...',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const response = await fetch('http://localhost:8080/api/visit/list', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({ 
          date: date // Make sure date is in YYYY-MM-DD format
        }),
      });

      // If response is 404, it means no visits for that date
      if (response.status === 404) {
        console.log('No visits found for date:', date);
        setVisits([]);
        return;
      }

      if (!response.ok) {
        const errorText = await response.text();
        // console.error('Server response:', errorText);
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();
      console.log('Received visits:', data);
      setVisits(data.visits || []);
    } catch (error) {
      // console.error('Fetch error:', error);
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
    
    console.log('Reservation attempt with:', {
      token,
      patientId,
      lekarzId,
      godzina
    });

    if (!token || !patientId) {
      // console.error('Missing auth data:', { token: !!token, patientId: !!patientId });
      return;
    }

    try {
      // Create dateStart and dateEnd from selectedDate and godzina
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

      const res = await fetch('http://localhost:8080/api/visit/reservation', {
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
      setMessage(`Zarezerwowano wizytę na: ${dayjs(result.dateStart).format('DD.MM.YYYY HH:mm')}`);
      fetchVisits(selectedDate);
    } catch (error) {
      // console.error('Reservation error:', error);
      setMessage('Błąd rezerwacji - ' + (error as Error).message);
    }
  };

  const isPastHour = (date: string, hour: number) => {
    const now = dayjs();
    const selectedDateTime = dayjs(date).hour(hour);
    return selectedDateTime.isBefore(now);
  };

  return (
    <Center>
      <div className="max-w-2xl mx-auto p-6">
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
                        v => v.doctorId === lekarz.id && 
                        dayjs(v.dateStart).hour() === godzina
                      );
                      
                      const isPast = isPastHour(selectedDate, godzina);
                      
                      // Don't render the button if it's in the past
                      if (isPast) {
                        return null;
                      }

                      return (
                        <button
                          key={godzina}
                          disabled={!!visit || loading}
                          onClick={() => handleReservation(lekarz.id, godzina)}
                          className={`px-4 py-2 rounded text-white ${
                            visit ? 'bg-gray-400 cursor-not-allowed' : 'bg-green-500 hover:bg-green-600'
                          }`}
                        >
                          {godzina}:00
                        </button>
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
