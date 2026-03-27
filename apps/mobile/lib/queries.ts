import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from './api';
import { TransportTypeDto, CreateRouteDto } from '@transix/shared-types';

// ==== QUERY KEYS ====
export const transportKeys = {
  all: ['transport'] as const,
  routes: () => [...transportKeys.all, 'routes'] as const,
  fares: (routeId: string) => [...transportKeys.all, 'routes', routeId, 'fares'] as const,
};

export const userKeys = {
  me: ['user', 'me'] as const,
};

// ==== TRANSPORT HOOKS ====

export const useTransportRoutes = (params?: any) => {
  return useQuery({
    queryKey: [...transportKeys.routes(), params],
    queryFn: async () => {
      const response = await api.get('/transport/routes', { params });
      return response.data as TransportTypeDto[];
    },
  });
};

export const useRouteFares = (routeId: string) => {
  return useQuery({
    queryKey: transportKeys.fares(routeId),
    queryFn: async () => {
      const response = await api.get(`/transport/routes/${routeId}/fares`);
      return response.data;
    },
    enabled: !!routeId,
  });
};

// Transport Type Mutations
export const useCreateTransportType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { name: string; description?: string }) => {
      const response = await api.post('/transport/types', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transportKeys.routes() });
    },
  });
};

export const useUpdateTransportType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: { name: string; description?: string } }) => {
      const response = await api.patch(`/transport/types/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transportKeys.routes() });
    },
  });
};

export const useDeleteTransportType = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/transport/types/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transportKeys.routes() });
    },
  });
};

// Route Mutations
export const useCreateRoute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateRouteDto & { transportTypeId: string }) => {
      const response = await api.post('/transport/routes', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transportKeys.routes() });
    },
  });
};

export const useUpdateRoute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CreateRouteDto> & { transportTypeId?: string } }) => {
      const response = await api.patch(`/transport/routes/${id}`, data);
      return response.data;
    },
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: transportKeys.routes() });
      queryClient.invalidateQueries({ queryKey: transportKeys.fares(variables.id) });
    },
  });
};

export const useDeleteRoute = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      await api.delete(`/transport/routes/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: transportKeys.routes() });
    },
  });
};

// ==== USER / AUTH HOOKS ====

export const useLogin = () => {
  return useMutation({
    mutationFn: async (credentials: { email: string; password: string }) => {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    },
  });
};

export const useUpdateProfile = () => {
  return useMutation({
    mutationFn: async (data: { fullName: string; phone: string }) => {
      const response = await api.patch('/users/me', data);
      return response.data;
    },
  });
};

export const useChangePassword = () => {
  return useMutation({
    mutationFn: async (data: any) => {
      await api.patch('/users/me/password', data);
    },
  });
};

export const useDeleteAccount = () => {
  return useMutation({
    mutationFn: async () => {
      await api.delete('/users/me');
    },
  });
};
