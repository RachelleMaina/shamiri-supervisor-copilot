import { useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

interface LoginCredentials {
  email: string;
  password: string;
}

interface LoginResponse {
  token: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    created_at: string;
  };
}

const api = axios.create({
  baseURL: "/api",
});

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation<LoginResponse, Error, LoginCredentials>({
    mutationFn: async (credentials) => {
      const { data } = await api.post<LoginResponse>("/users/login", credentials);
      return data;
    },

    onSuccess: (data) => {
      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));
      queryClient.invalidateQueries({ queryKey: ["user"] });
    
    },

    onError: (error) => {
      console.error("Login failed:", error);
    },
  });
}