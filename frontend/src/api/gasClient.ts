export const gasClient = async (action: string, payload: any = {}) => {
  const GAS_URL = import.meta.env.VITE_GAS_URL;
  if (!GAS_URL) {
    throw new Error('VITE_GAS_URL is not defined in .env');
  }

  try {
    const response = await fetch(GAS_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'text/plain;charset=utf-8', // Tránh lỗi preflight CORS của GAS
      },
      body: JSON.stringify({ action, payload }),
    });

    const result = await response.json();
    if (result.status === 'success') {
      return result.data;
    } else {
      throw new Error(result.message || 'Lỗi từ Google Apps Script');
    }
  } catch (error) {
    console.error(`Error calling GAS action [${action}]:`, error);
    throw error;
  }
};
