export const getVitals = (userId: number) => {
  const stored = localStorage.getItem(`health_vitals_${userId}`);
  if (stored) {
    return JSON.parse(stored);
  }
  // Default values
  return {
    heartRate: 72,
    spo2: 98,
    temp: 98.6
  };
};

export const updateVitals = (userId: number, vitals: any) => {
  localStorage.setItem(`health_vitals_${userId}`, JSON.stringify(vitals));
  window.dispatchEvent(new Event('vitals_updated'));
};
