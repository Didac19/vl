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

// ==== WALLET HOOKS ====

export const walletKeys = {
  all: ['wallet'] as const,
  mine: () => [...walletKeys.all, 'mine'] as const,
};

export const useMyWallet = () => {
  return useQuery({
    queryKey: walletKeys.mine(),
    queryFn: async () => {
      const response = await api.get('/wallet');
      return response.data;
    },
  });
};

export const useTopUpWallet = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (amountCents: number) => {
      const response = await api.post('/wallet/top-up', { amountCents });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.mine() });
    },
  });
};

// ==== TICKETING HOOKS ====

export const ticketKeys = {
  all: ['tickets'] as const,
  mine: () => [...ticketKeys.all, 'mine'] as const,
};

export const useMyTickets = () => {
  return useQuery({
    queryKey: ticketKeys.mine(),
    queryFn: async () => {
      const response = await api.get('/tickets/my-tickets');
      return response.data as any[];
    },
  });
};

export const busQrKeys = {
  all: ['bus-qrs'] as const,
  company: () => [...busQrKeys.all, 'company'] as const,
  payments: (id: string) => [...busQrKeys.all, id, 'payments'] as const,
};

export const useGenerateBusQr = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: any) => {
      const response = await api.post('/tickets/generate-bus-qr', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: busQrKeys.company() });
    },
  });
};

export const useCompanyBusQrs = () => {
  return useQuery({
    queryKey: busQrKeys.company(),
    queryFn: async () => {
      const response = await api.get('/tickets/company-bus-qrs');
      return response.data as any[];
    },
  });
};

export const useQrPayments = (busQrId: string, params?: any) => {
  return useQuery({
    queryKey: [...busQrKeys.payments(busQrId), params],
    queryFn: async () => {
      const response = await api.get(`/tickets/bus-qr/${busQrId}/payments`, { params });
      return response.data as { data: any[]; total: number; totalCollectedCents: number; busQr: any };
    },
    enabled: !!busQrId,
  });
};

export const usePayBusQr = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (payload: { token: string; quantity: number }) => {
      const response = await api.post('/tickets/pay-bus-qr', payload);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: walletKeys.mine() });
    },
  });
};
