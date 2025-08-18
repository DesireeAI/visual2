import React, { useState, useEffect } from 'react';
import { Toggle } from '@/components/ui/toggle';
import { CustomButton } from '@/components/ui/CustomButton';
import { CustomInput } from '@/components/ui/CustomInput';
import { useApi } from '@/hooks/useApi';
import { OperatingHours as OperatingHoursType } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];

export const OperatingHours: React.FC = () => {
  const { fetchHours, updateHours, loading, error } = useApi();
  const [hours, setHours] = useState<OperatingHoursType>({});

  useEffect(() => {
    const fetchHoursData = async () => {
      try {
        const data = await fetchHours();
        setHours(data || {});
      } catch (err) {
        console.error('Error fetching operating hours:', err);
      }
    };
    fetchHoursData();
  }, [fetchHours]);

  const handleToggle = (day: string) => {
    setHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        enabled: !prev[day]?.enabled,
      },
    }));
  };

  const handleTimeChange = (day: string, field: 'start_time' | 'end_time', value: string) => {
    setHours((prev) => ({
      ...prev,
      [day]: {
        ...prev[day],
        [field]: value,
        enabled: prev[day]?.enabled ?? true,
      },
    }));
  };

  const handleSave = async () => {
    try {
      await updateHours(hours);
      alert('Operating hours saved successfully');
    } catch (err) {
      console.error('Error saving operating hours:', err);
      alert('Failed to save operating hours');
    }
  };

  if (loading) {
    return <div className="p-6">Loading...</div>;
  }

  if (error) {
    return <div className="p-6 text-red-600">Error: {error}</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-gray-900">Operating Hours</h2>
        <p className="text-gray-600">Configure your clinic's operating hours</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Weekly Schedule</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {DAYS.map((day) => (
              <div key={day} className="flex items-center space-x-4">
                <div className="w-32">
                  <Toggle
                    enabled={hours[day]?.enabled ?? false}
                    onChange={() => handleToggle(day)}
                    label={day.charAt(0).toUpperCase() + day.slice(1)}
                  />
                </div>
                <CustomInput
                  type="time"
                  value={hours[day]?.start_time || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTimeChange(day, 'start_time', e.target.value)}
                  disabled={!(hours[day]?.enabled ?? false)}
                />
                <span className="text-gray-600">to</span>
                <CustomInput
                  type="time"
                  value={hours[day]?.end_time || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleTimeChange(day, 'end_time', e.target.value)}
                  disabled={!(hours[day]?.enabled ?? false)}
                />
              </div>
            ))}
          </div>
          <div className="mt-6 flex justify-end">
            <CustomButton onClick={handleSave} disabled={loading}>
              Save Hours
            </CustomButton>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default OperatingHours;