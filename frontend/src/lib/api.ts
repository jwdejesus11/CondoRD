const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:4000/api";

export async function fetchWithAuth(endpoint: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem("token") : null;
  const condoId = typeof window !== 'undefined' ? localStorage.getItem("condoId") : null;

  const headers: HeadersInit = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(condoId ? { "x-condo-id": condoId } : {}),
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(`${API_URL}${endpoint}`, {
      ...options,
      headers,
    });

    let data: any = null;
    try {
      if (response.status !== 204) {
        data = await response.json();
      }
    } catch {
      data = null;
    }

    if (!response.ok) {
      let errorMsg = `Error ${response.status}: ${response.statusText}`;
      
      if (data && data.message) {
        errorMsg = Array.isArray(data.message) 
          ? data.message.join(', ') 
          : data.message;
      }
      
      console.error(`[API FAIL] ${options.method || 'GET'} ${endpoint} -> ${errorMsg}`);

      if (response.status === 401) {
         localStorage.removeItem("token");
         if (typeof window !== 'undefined') window.location.href = "/login";
      }
      throw new Error(errorMsg);
    }

    return data;
  } catch (error: any) {
    // Si el error ya fue lanzado con un mensaje específico (ex: 400 del backend), lo relanzamos
    if (error.message && !error.message.includes('Failed to fetch') && !error.message.includes('NetworkError')) {
      throw error;
    }

    console.error(`[NETWORK FAIL] ${options.method || 'GET'} ${endpoint}`, error);

    throw new Error(
      "No se pudo conectar con el servidor. Verifica que el backend esté encendido y que la URL de la API sea correcta."
    );
  }
}
